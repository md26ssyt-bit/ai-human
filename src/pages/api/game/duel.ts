import type { NextApiRequest, NextApiResponse } from 'next';
import { viewOf } from '@/lib/game/engine';
import { DUEL_ROUNDS, resolveDuel, startDuel } from '@/lib/game/duel';
import { isLang } from '@/lib/game/text';
import { loadRun, saveRun } from '@/lib/game/store';

// 早撃ち（じゃんけんのあとの幕間、3回勝負）。反応時間の測定と、勝ち負けは、すべて、ここ（サーバー）で行う。
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { token, action } = req.body || {};
    if (typeof token !== 'string' || !['start', 'shot', 'foul', 'timeout'].includes(action)) {
      return res.status(400).json({ error: '入力が不正です' });
    }
    const lang = isLang(req.body?.lang) ? req.body.lang : 'ja';
    const loaded = await loadRun(token);
    const state = loaded?.state;
    if (!loaded || !state || state.v !== 1 || state.exp < Date.now()) {
      return res.status(400).json({ error: 'ゲームの状態が見つかりません。最初からやり直してください' });
    }
    if (!state.duel) return res.status(400).json({ error: 'いまは、早撃ちの時間ではありません' });

    const conflict = { error: '操作が重なったか、古い状態です。最初からやり直してください' };

    // 開始：待ち時間を決めて、予定時刻を記録する（1回ごとに、呼ぶ）
    if (action === 'start') {
      const r = startDuel(state, Math.random);
      const t = await saveRun(loaded.ref, r.nextState);
      if (t === null) return res.status(409).json(conflict);
      return res.status(200).json({ delayMs: r.delayMs, token: t });
    }

    // 結果：開始の前に、押すことはできない
    if (typeof state.duelGo !== 'number') return res.status(400).json({ error: '先に、開始してください' });
    const r = resolveDuel(state, action, Math.random);
    const t = await saveRun(loaded.ref, r.nextState);
    if (t === null) return res.status(409).json(conflict);
    return res.status(200).json({
      result: r.result,
      reactionMs: r.reactionMs,
      cpuMs: r.cpuMs,
      round: r.round,
      wins: r.wins,
      rounds: DUEL_ROUNDS,
      finished: r.finished,
      bonus: r.bonus,
      penalty: r.penalty,
      token: t,
      view: viewOf(r.nextState, lang),
    });
  } catch (e) {
    console.error('game/duel エラー:', e);
    return res.status(500).json({ error: '処理に失敗しました' });
  }
}