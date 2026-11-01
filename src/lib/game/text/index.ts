// ゲームの文章を、言語ごとに取り出す（サーバー側だけで使う）。
// 日本語は、content.ts の元の文章を使い、ほかの言語は、このフォルダの各ファイルを使う。
// 場面1以降（EXTRA_SCENES）は、場面のファイルの中に、全言語がまとまっている。
 
import { ARCHETYPE_LABEL, FRIEND_LINE, REACTIONS, REJECT_LINE, SCENE_1 } from '../content';
import type { Archetype, Role, Tone } from '../content';
import { EXTRA_SCENES } from '../scenes';
import type { GameText, Lang } from './types';
import en from './en';
import zh from './zh';
import id from './id';
import es from './es';
 
export type { Lang } from './types';
export const LANGS: Lang[] = ['ja', 'en', 'zh', 'id', 'es'];
export const isLang = (x: unknown): x is Lang => LANGS.includes(x as Lang);
 
const TABLE: Partial<Record<Lang, GameText>> = { en, zh, id, es };
 
export function turnTextOf(role: Role, turn: number, lang: Lang, sc = 0): { line: string; choices: Record<Tone, string> } {
  const sd = sc > 0 ? EXTRA_SCENES[sc - 1] : undefined;
  if (sd) {
    if (lang === 'ja') {
      const t = sd.ja[role][turn];
      return { line: t.line, choices: t.choices };
    }
    return sd.tr[lang][role][turn];
  }
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
// 場面0（雨の日）は、これまでの名前のまま。場面1以降は、l-s場面番号-役-ターン
export const audioIds = {
  line: (role: Role, turn: number, sc = 0) => (sc > 0 ? `l-s${sc}-${role}-${turn}` : `l-${role}-${turn}`),
  reaction: (role: Role, archetype: Archetype, bucket: 'good' | 'normal' | 'bad') => `r-${role}-${archetype}-${bucket}`,
  end: (kind: 'reject' | 'friend', role: Role) => `x-${kind}-${role}`,
};