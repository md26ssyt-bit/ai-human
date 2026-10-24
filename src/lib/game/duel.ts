// 早撃ち（じゃんけんのあとの幕間）の進行。反応時間は、サーバーで測る（ブラウザの時計は、信用しない）。

import type { RunState } from './engine';

export const DUEL_ENABLED = false; // 画面ができるまでは false。true にすると、じゃんけんのあとに、早撃ちが入る
export const DUEL_BONUS = 100; // 勝ったときの、ボーナス点（倍率は、掛けない）
export const DUEL_MIN_MS = 100; // これより速い反応は、人間にはありえないので、フライング扱い
export const DUEL_TIMEOUT_MS = 2500; // これより遅いと、負け

export type DuelAction = 'start' | 'shot' | 'foul' | 'timeout';
export type DuelResult = 'win' | 'lose' | 'foul' | 'late';

const round1 = (x: number) => Math.round(x * 10) / 10;

// 開始：合図までの待ち時間を決めて、予定時刻を、状態に記録する
export function startDuel(s: RunState, rng: () => number): { delayMs: number; nextState: RunState } {
  const delayMs = Math.round(1500 + rng() * 2500); // 1.5〜4秒
  return { delayMs, nextState: { ...s, duelGo: Date.now() + delayMs } };
}

// 結果：押した時刻（サーバーが受け取った時刻）で、勝ち負けを決める
export function resolveDuel(
  s: RunState,
  action: 'shot' | 'foul' | 'timeout',
  rng: () => number
): { result: DuelResult; reactionMs: number | null; cpuMs: number; bonus: number; nextState: RunState } {
  // 相手の反応時間：人数が進むほど速い（下限 300ms）
  const cpuMs = Math.max(300, Math.round(450 + rng() * 300 - Math.min(150, 10 * (s.n - 1))));

  let result: DuelResult;
  let reactionMs: number | null = null;
  if (action === 'foul') {
    result = 'foul';
  } else if (action === 'timeout') {
    result = 'late';
  } else {
    reactionMs = Date.now() - (s.duelGo ?? Date.now());
    if (reactionMs < DUEL_MIN_MS) result = 'foul'; // 合図の前、または、速すぎる
    else if (reactionMs > DUEL_TIMEOUT_MS) result = 'late';
    else result = reactionMs <= cpuMs ? 'win' : 'lose';
  }

  const won = result === 'win';
  const bonus = won ? DUEL_BONUS : 0;
  const nextState: RunState = {
    ...s,
    duel: false,
    lost: (s.lost ?? 0) + (won ? 0 : 1),
    total: round1(s.total + bonus),
  };
  delete nextState.duelGo;
  return { result, reactionMs, cpuMs, bonus, nextState };
}