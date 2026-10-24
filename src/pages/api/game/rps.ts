import type { NextApiRequest, NextApiResponse } from 'next';
import { viewOf } from '@/lib/game/engine';
import type { RunState } from '@/lib/game/engine';
import { playRps, rpsWinAudioId, rpsWinLineOf } from '@/lib/game/rps';
import { isLang } from '@/lib/game/text';
import { open, seal } from '@/lib/game/token';

// じゃんけん（3人落とすごとの幕間）。勝ち負けは、すべて、ここ（サーバー）で決める。
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { token, hand } = req.body || {};
    if (typeof token !== 'string' || typeof hand !== 'number' || ![0, 1, 2].includes(hand)) {
      return res.status(400).json({ error: '入力が不正です' });
    }
    const lang = isLang(req.body?.lang) ? req.body.lang : 'ja';
    const state = open<RunState>(token);
    if (!state || state.v !== 1 || state.exp < Date.now()) {
      return res.status(400).json({ error: 'ゲームの状態が見つかりません。最初からやり直してください' });
    }
    if (!state.rps) return res.status(400).json({ error: 'いまは、じゃんけんの時間ではありません' });

    const r = playRps(state, hand, Math.random);
    const won = r.result === 'win';
    return res.status(200).json({
      result: r.result,
      cpuHand: r.cpuHand,
      winLine: won ? rpsWinLineOf(state.role, lang) : null,
      winAudio: won ? rpsWinAudioId(state.role) : null,
      token: seal(r.nextState),
      view: viewOf(r.nextState, lang),
    });
  } catch (e) {
    console.error('game/rps エラー:', e);
    return res.status(500).json({ error: '処理に失敗しました' });
  }
}