// ゲームの文章を、言語ごとに取り出す（サーバー側だけで使う）。
// 日本語は、content.ts の元の文章を使い、ほかの言語は、このフォルダの各ファイルを使う。
 
import { ARCHETYPE_LABEL, FRIEND_LINE, REACTIONS, REJECT_LINE, SCENE_1 } from '../content';
import type { Archetype, Role, Tone } from '../content';
import type { GameText, Lang } from './types';
import en from './en';
import zh from './zh';
import id from './id';
import es from './es';
 
export type { Lang } from './types';
export const LANGS: Lang[] = ['ja', 'en', 'zh', 'id', 'es'];
export const isLang = (x: unknown): x is Lang => LANGS.includes(x as Lang);
 
const TABLE: Partial<Record<Lang, GameText>> = { en, zh, id, es };
 
export function turnTextOf(role: Role, turn: number, lang: Lang): { line: string; choices: Record<Tone, string> } {
  const g = TABLE[lang];
  if (g) return g.turns[role][turn];
  const t = SCENE_1[role][turn];
  return { line: t.line, choices: t.choices };
}
 
export function reactionTextOf(role: Role, archetype: Archetype, bucket: 'good' | 'normal' | 'bad', lang: Lang): string {
  const g = TABLE[lang];
  if (g) return g.reactions[role][archetype][bucket];
  return REACTIONS[role][archetype][bucket].text;
}
 
export function endLineOf(kind: 'reject' | 'friend', lang: Lang): string {
  const g = TABLE[lang];
  if (g) return kind === 'reject' ? g.rejectLine : g.friendLine;
  return kind === 'reject' ? REJECT_LINE : FRIEND_LINE;
}
 
export function archetypeLabelOf(a: Archetype, lang: Lang): string {
  const g = TABLE[lang];
  return g ? g.archetype[a] : ARCHETYPE_LABEL[a];
}
 
// 音声ファイルの名前（言語に関係なく、同じ名前。フォルダが、言語ごとに分かれる）
export const audioIds = {
  line: (role: Role, turn: number) => `l-${role}-${turn}`,
  reaction: (role: Role, archetype: Archetype, bucket: 'good' | 'normal' | 'bad') => `r-${role}-${archetype}-${bucket}`,
  end: (kind: 'reject' | 'friend', role: Role) => `x-${kind}-${role}`,
};
 