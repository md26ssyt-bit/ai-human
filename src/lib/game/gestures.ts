// 口調・相手の反応に合わせた、アバターの身振りと表情の対応表。
// ※ サーバー側（API）で、選ばれた口調と相手のタイプから決め、ブラウザには、結果（身振りの名前）だけを返す。
 
import type { Archetype, Expr, Tone } from './content';
 
export type Gesture = 'idle' | 'nod' | 'tilt' | 'look_away' | 'lean_in' | 'arms_crossed' | 'wave';
 
// プレイヤー役の身振り・表情（選んだ口調で決まる）
export const TONE_GESTURE: Record<Tone, Gesture> = {
  '優しい': 'nod',
  '積極的': 'lean_in',
  '冗談': 'tilt',
  '誠実': 'nod',
  'そっけない': 'look_away',
  'はぐらかす': 'look_away',
};
export const TONE_EXPR: Record<Tone, Expr> = {
  '優しい': 'happy',
  '積極的': 'happy',
  '冗談': 'happy',
  '誠実': 'neutral',
  'そっけない': 'neutral',
  'はぐらかす': 'neutral',
};
 
// 相手の身振り（性格タイプ × 反応の良し悪し）
export const PARTNER_GESTURE: Record<Archetype, { good: Gesture; normal: Gesture; bad: Gesture }> = {
  tsundere: { good: 'look_away', normal: 'tilt', bad: 'arms_crossed' },
  cool:     { good: 'nod', normal: 'nod', bad: 'look_away' },
  tennen:   { good: 'lean_in', normal: 'tilt', bad: 'tilt' },
  senpai:   { good: 'nod', normal: 'nod', bad: 'look_away' },
  genki:    { good: 'wave', normal: 'nod', bad: 'look_away' },
  shy:      { good: 'look_away', normal: 'look_away', bad: 'look_away' },
};
 