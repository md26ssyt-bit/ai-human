// 場面の一覧と、場面を選ぶ仕組み。サーバー側だけで使う。
// 場面0 = 「雨の日の帰り道」（content.ts と text/ の元の内容）。場面1以降は、EXTRA_SCENES に足していく。

import { SCENE_1 } from '../content';
import type { Role, Turn } from '../content';
import { cafe } from './cafe';
import { matsuri } from './matsuri';
import { library } from './library';
import { park } from './park';
import { station } from './station';
import type { SceneDef } from './types';

export type { SceneDef } from './types';

// 新しい場面を足すときは、ここに1つ足す（順番を変えると、音声の名前と合わなくなるので、後ろに足すこと）
export const EXTRA_SCENES: SceneDef[] = [cafe, matsuri, library, park, station];
export const SCENE_COUNT = 1 + EXTRA_SCENES.length;

export type SceneLook = { id: string; bg: string; rain: boolean };

const RAIN_LOOK: SceneLook = {
  id: 'rain',
  bg: 'linear-gradient(#2a2058, #15102c 70%, #0d0a1c)',
  rain: true,
};

// 場面の見た目（背景と、雨の有無）
export function sceneLook(sc: number): SceneLook {
  const d = sc > 0 ? EXTRA_SCENES[sc - 1] : undefined;
  return d ? { id: d.id, bg: d.bg, rain: d.rain } : RAIN_LOOK;
}

// 日本語の1ターン（表情と、元の文章）
export function sceneTurn(sc: number, role: Role, turn: number): Turn {
  const d = sc > 0 ? EXTRA_SCENES[sc - 1] : undefined;
  return d ? d.ja[role][turn] : SCENE_1[role][turn];
}

// 場面をランダムに選ぶ（avoid と同じ場面は、選ばない）
export function pickScene(rng: () => number, avoid: number): number {
  if (SCENE_COUNT <= 1) return 0;
  const list: number[] = [];
  for (let i = 0; i < SCENE_COUNT; i++) if (i !== avoid) list.push(i);
  return list[Math.floor(rng() * list.length)];
}