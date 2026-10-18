import type { NextApiRequest, NextApiResponse } from 'next';
import { step, viewOf } from '@/lib/game/engine';
import type { RunState } from '@/lib/game/engine';
import { PARTNER_GESTURE, TONE_EXPR, TONE_GESTURE } from '@/lib/game/gestures';
import { archetypeLabelOf, audioIds, endLineOf, isLang, reactionTextOf } from '@/lib/game/text';
import { open, seal } from '@/lib/game/token';
 
// 選択肢を1つ選ぶ。結果の計算は、すべて、ここ（サーバー）で行う。
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { token, choice } = req.body || {};
    if (typeof token !== 'string' || typeof choice !== 'number') {
      return res.status(400).json({ error: '入力が不正です' });
    }
    const lang = isLang(req.body?.lang) ? req.body.lang : 'ja';
    const state = open<RunState>(token);
    if (!state || state.v !== 1 || state.exp < Date.now()) {
      return res.status(400).json({ error: 'ゲームの状態が見つかりません。最初からやり直してください' });
    }
 
    const result = step(state, Math.floor(choice), Math.random);
    if (!result) return res.status(400).json({ error: '選択肢が不正です' });
 
    // 相手の反応の文章は、選ばれた言語で作る（表情は、言語に関係なく、同じ）
    const reaction = {
      text: reactionTextOf(state.role, state.archetype, result.bucket, lang),
      expr: result.reaction.expr,
    };
 
    const base = {
      bucket: result.bucket,
      reaction,
      reactionAudio: audioIds.reaction(state.role, state.archetype, result.bucket),
      outcome: result.outcome,
      animation: result.animation ?? null,
      partnerType: result.archetype ? archetypeLabelOf(result.archetype, lang) : null,
      breakdown: result.breakdown ?? null,
      partnerPoints: result.partnerPoints ?? null,
      playerGesture: TONE_GESTURE[result.tone],
      playerExpr: TONE_EXPR[result.tone],
      partnerGesture: PARTNER_GESTURE[state.archetype][result.bucket],
    };
 
    if (result.outcome === 'rejected' || result.outcome === 'friend') {
      const kind = result.outcome === 'rejected' ? 'reject' : 'friend';
      // ランの終了。点数は、ここまでの合計
      return res.status(200).json({
        ...base,
        endLine: endLineOf(kind, lang),
        endAudio: audioIds.end(kind, state.role),
        final: { total: Math.round(state.total), cleared: state.cleared },
        token: null,
        view: null,
      });
    }
 
    const ns = result.nextState as RunState;
    return res.status(200).json({ ...base, endLine: null, endAudio: null, final: null, token: seal(ns), view: viewOf(ns, lang) });
  } catch (e) {
    console.error('game/choose エラー:', e);
    return res.status(500).json({ error: '処理に失敗しました' });
  }
}
 