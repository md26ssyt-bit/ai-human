// 場面のデータの形。サーバー側だけで使う。

import type { Role, Turn } from '../content';
import type { Lang, TurnText } from '../text/types';

export type TrLang = Exclude<Lang, 'ja'>;

export type SceneDef = {
  id: string; // 場面の名前（音声やログの目印）
  bg: string; // 背景の色（CSSのグラデーション）
  rain: boolean; // true のとき、雨の演出を出す
  ja: Record<Role, Turn[]>; // 日本語（8ターン）
  tr: Record<TrLang, Record<Role, TurnText[]>>; // 英語・中国語・インドネシア語・スペイン語（8ターン）
};