import type { NextApiRequest, NextApiResponse } from 'next';
import { viewOf } from '@/lib/game/engine';
import type { RunState } from '@/lib/game/engine';
import { resolveDuel, startDuel } from '@/lib/game/duel';
import { isLang } from '@/lib/game/text';
import { open, seal } from '@/lib/game/token';

// 早撃ち（じゃんけんのあとの幕間）。反応時間の測定と、勝ち負けは、すべて、ここ（サーバー）で行う。
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { token, action } = req.body || {};
    if (typeof token !== 'string' || !['start', 'shot', 'foul', 'timeout'].includes(action)) {
      return res.status(400).json({ error: '入力が不正です' });
    }
    const lang = isLang(req.body?.lang) ? req.body.lang : 'ja';
    const state = open<RunState>(token);
    if (!state || state.v !== 1 || state.exp < Date.now()) {
      return res.status(400).json({ error: 'ゲームの状態が見つかりません。最初からやり直してください' });
    }
    if (!state.duel) return res.status(400).json({ error: 'いまは、早撃ちの時間ではありません' });

    // 開始：待ち時間を決めて、予定時刻を記録する
    if (action === 'start') {
      const r = startDuel(state, Math.random);
      return res.status(200).json({ delayMs: r.delayMs, token: seal(r.nextState) });
    }

    // 結果：開始の前に、押すことはできない
    if (typeof state.duelGo !== 'number') return res.status(400).json({ error: '先に、開始してください' });
    const r = resolveDuel(state, action, Math.random);
    return res.status(200).json({
      result: r.result,
      reactionMs: r.reactionMs,
      cpuMs: r.cpuMs,
      bonus: r.bonus,
      token: seal(r.nextState),
      view: viewOf(r.nextState, lang),
    });
  } catch (e) {
    console.error('game/duel エラー:', e);
    return res.status(500).json({ error: '処理に失敗しました' });
  }
}