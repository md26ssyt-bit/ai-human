import type { NextApiRequest, NextApiResponse } from 'next';
import { newRun, viewOf } from '@/lib/game/engine';
import { seal } from '@/lib/game/token';
 
// ゲームを始める。女性役（W）か男性役（M）を選ぶ。
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const role = req.body?.role;
    if (role !== 'W' && role !== 'M') return res.status(400).json({ error: 'role が不正です' });
    const state = newRun(role, Math.random);
    return res.status(200).json({ token: seal(state), view: viewOf(state) });
  } catch (e) {
    console.error('game/start エラー:', e);
    return res.status(500).json({ error: 'ゲームを始められませんでした' });
  }
}