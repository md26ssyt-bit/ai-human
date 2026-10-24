// じゃんけんの進行（サーバー側だけで使う）。勝ち負けは、ここで決める。

import type { RunState } from './engine';
import type { Role } from './content';
import type { Lang } from './text';

export type RpsResult = 'win' | 'lose' | 'draw';

// 手：0 = グー、1 = チョキ、2 = パー
export function playRps(
  s: RunState,
  hand: number,
  rng: () => number
): { result: RpsResult; cpuHand: number; nextState: RunState } {
  const cpuHand = Math.floor(rng() * 3);
  if (hand === cpuHand) return { result: 'draw', cpuHand, nextState: s }; // あいこ：やり直し
  const result: RpsResult = (hand - cpuHand + 3) % 3 === 2 ? 'win' : 'lose';
  const nextState: RunState = {
    ...s,
    rps: false,
    lost: (s.lost ?? 0) + (result === 'lose' ? 1 : 0),
  };
  return { result, cpuHand, nextState };
}

// 勝ったときの、相手のひとこと（role は、プレイヤーが選んだ役。W：女性役、M：男性役）
const WIN_LINE: Record<Lang, Record<Role, string>> = {
  ja: { W: '……きれいだね。', M: '……すてき。' },
  en: { W: 'You look beautiful.', M: 'You look great.' },
  zh: { W: '你真漂亮。', M: '你真帅。' },
  id: { W: 'Kamu cantik sekali.', M: 'Kamu keren sekali.' },
  es: { W: 'Qué guapa estás.', M: 'Qué guapo estás.' },
};

export const rpsWinLineOf = (role: Role, lang: Lang): string => WIN_LINE[lang][role];

// 音声ファイルの名前（フォルダは、言語ごと）
export const rpsWinAudioId = (role: Role): string => `p-win-${role}`;