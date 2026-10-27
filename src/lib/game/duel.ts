// 早撃ち（じゃんけんのあとの幕間）の進行。3回勝負。反応時間は、サーバーで測る（ブラウザの時計は、信用しない）。

import type { RunState } from './engine';

export const DUEL_ENABLED = true; // false にすると、早撃ちは出ない
export const DUEL_ROUNDS = 3; // 何回勝負か
export const DUEL_NEED_WINS = 2; // これ以上勝てば、勝ち越し
export const DUEL_BONUS_PER_WIN = 50; // 1回勝つごとの、ボーナス点（倍率は、掛けない）
export const DUEL_MIN_MS = 100; // これより速い反応は、人間にはありえないので、フライング扱い
export const DUEL_TIMEOUT_MS = 2500; // これより遅いと、負け

export type DuelResult = 'win' | 'lose' | 'foul' | 'late';

const round1 = (x: number) => Math.round(x * 10) / 10;

// 開始：合図までの待ち時間を決めて、予定時刻を、状態に記録する（毎回、1回ごとに呼ぶ）
export function startDuel(s: RunState, rng: () => number): { delayMs: number; nextState: RunState } {
  const delayMs = Math.round(1500 + rng() * 2500); // 1.5〜4秒
  return { delayMs, nextState: { ...s, duelGo: Date.now() + delayMs } };
}

// 1回分の結果：押した時刻（サーバーが受け取った時刻）で、勝ち負けを決める
export function resolveDuel(
  s: RunState,
  action: 'shot' | 'foul' | 'timeout',
  rng: () => number
): {
  result: DuelResult;
  reactionMs: number | null;
  cpuMs: number;
  round: number;
  wins: number;
  finished: boolean;
  bonus: number;
  penalty: boolean;
  nextState: RunState;
} {
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

  const round = (s.duelRound ?? 0) + 1; // 終えた回数
  const wins = (s.duelWins ?? 0) + (result === 'win' ? 1 : 0);
  const finished = round >= DUEL_ROUNDS;

  // まだ続く：回数と勝ち数を記録して、次の勝負へ
  if (!finished) {
    const nextState: RunState = { ...s, duelRound: round, duelWins: wins };
    delete nextState.duelGo;
    return { result, reactionMs, cpuMs, round, wins, finished: false, bonus: 0, penalty: false, nextState };
  }

  // 3回終わり：ボーナスと、ペナルティを決める
  const bonus = wins * DUEL_BONUS_PER_WIN;
  const penalty = wins < DUEL_NEED_WINS;
  const nextState: RunState = {
    ...s,
    duel: false,
    lost: (s.lost ?? 0) + (penalty ? 1 : 0),
    total: round1(s.total + bonus),
  };
  delete nextState.duelGo;
  delete nextState.duelRound;
  delete nextState.duelWins;
  return { result, reactionMs, cpuMs, round, wins, finished: true, bonus, penalty, nextState };
}