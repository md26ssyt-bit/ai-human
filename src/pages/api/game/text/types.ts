import type { Archetype, Role, Tone } from '../content';
 
export type Lang = 'ja' | 'en' | 'zh' | 'id' | 'es';
 
export type TurnText = { line: string; choices: Record<Tone, string> };
 
export type GameText = {
  turns: Record<Role, TurnText[]>; // 各ターンの、相手のセリフと、6つの口調の選択肢
  reactions: Record<Role, Record<Archetype, { good: string; normal: string; bad: string }>>;
  rejectLine: string;
  friendLine: string;
  archetype: Record<Archetype, string>;
};
 
// 書きやすくするための道具：T(セリフ, 優しい, 積極的, 冗談, 誠実, そっけない, はぐらかす)
export const T = (line: string, gentle: string, bold: string, joke: string, sincere: string, curt: string, evasive: string): TurnText => ({
  line,
  choices: { '優しい': gentle, '積極的': bold, '冗談': joke, '誠実': sincere, 'そっけない': curt, 'はぐらかす': evasive },
});
 
export const R = (good: string, normal: string, bad: string) => ({ good, normal, bad });
 