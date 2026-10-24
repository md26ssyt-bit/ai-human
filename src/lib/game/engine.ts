// ゲームの進行と点数の計算（サーバー側だけで使う）。
 
import { ARCHETYPES, MATRIX, REACTIONS, SCENE_1, TONES } from './content';
import type { Archetype, Expr, Role, Tone } from './content';
import { audioIds, turnTextOf } from './text';
import type { Lang } from './text';
 
// ===== 調整用の定数（遊んで、数字を整える） =====
export const START = { spark: 30, trust: 30, wary: 10 };
export const MAX_TURNS = SCENE_1.W.length; // 8
export const EARLY_FROM_TURN = 4; // この手番から、早期クリアを判定
export const EARLY_MARGIN = 10; // しきい値より、これだけ高ければ、早期クリア
 
export const thresholdFor = (n: number) => Math.min(60, 40 + 2 * (n - 1)); // 落とすために必要な値
export const wariLimitFor = (n: number) => Math.max(18, 28 - 1 * (n - 1)); // 警戒度の上限（人数が進むほど、低くなる）
export const WARY_UP = 1.8; // 警戒度が上がる量の倍率（失敗の代償を、重くして、フラれる演出が、出やすくする）
export const multiplierFor = (n: number, lost = 0) => Math.max(1, 1 + 0.25 * (n - 1) - 0.25 * lost);
 
export type Offsets = Record<Tone, [number, number, number]>;
 
export type RunState = {
  v: 1;
  role: Role;
  n: number; // 何人目の相手か（1から）
  archetype: Archetype;
  offsets: Offsets;
  turn: number; // 次に答えるターン（0から）
  spark: number;
  trust: number;
  wary: number;
  total: number; // ランの合計点
  cleared: number; // 落とした人数
  tones: Tone[]; // 今のターンで、出している口調（並び順がそのまま選択肢の番号）
   exp: number;
  rps?: boolean; // true のとき、次はじゃんけん（選択肢は送れない）
  lost?: number; // じゃんけんに負けた回数（連続倍率が、1回につき 0.25 下がる）
  duel?: boolean; // true のとき、次は早撃ち（選択肢は送れない）
  duelGo?: number; // 早撃ちの、合図の予定時刻（サーバーの時計）
};
 
type Rng = () => number;
const round1 = (x: number) => Math.round(x * 10) / 10;
const clamp = (x: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, x));
const rand = (rng: Rng, lo: number, hi: number) => lo + (hi - lo) * rng();
const shuffle = <T,>(arr: T[], rng: Rng): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
 
export function pickTones(rng: Rng): Tone[] {
  const count = rng() < 0.5 ? 3 : 4;
  return shuffle(TONES, rng).slice(0, count);
}
 
export function newPartner(n: number, rng: Rng): { archetype: Archetype; offsets: Offsets } {
  const archetype = ARCHETYPES[Math.floor(rng() * ARCHETYPES.length)];
  const offsets = {} as Offsets;
  for (const t of TONES) {
    offsets[t] = [round1(rand(rng, -1, 1)), round1(rand(rng, -1, 1)), round1(rand(rng, -0.5, 0.5))];
  }
  return { archetype, offsets };
}
 
export function newRun(role: Role, rng: Rng): RunState {
  const p = newPartner(1, rng);
  return {
    v: 1, role, n: 1, archetype: p.archetype, offsets: p.offsets, turn: 0,
    spark: START.spark, trust: START.trust, wary: START.wary,
    total: 0, cleared: 0, tones: pickTones(rng), exp: Date.now() + 1000 * 60 * 60 * 24,
  };
}
 
export type TurnView = {
  partnerIndex: number;
  turn: number; // 1から
  maxTurns: number;
  partnerLine: string;
  partnerExpr: Expr;
  partnerAudio: string; // 相手のセリフの音声ファイル名（フォルダは、言語ごと）
  choices: { id: number; text: string }[];
  stats: { spark: number; trust: number; wary: number };
  threshold: number;
  wariLimit: number;
  multiplier: number;
  rps: boolean; // true のとき、画面は、じゃんけんを出す
  duel: boolean; // true のとき、画面は、早撃ちを出す
  total: number;
  cleared: number;
};
 
export function viewOf(s: RunState, lang: Lang = 'ja'): TurnView {
  const t = SCENE_1[s.role][s.turn]; // 表情は、言語に関係なく、同じ
  const tx = turnTextOf(s.role, s.turn, lang); // 文章は、言語ごと
  return {
    partnerIndex: s.n,
    turn: s.turn + 1,
    maxTurns: MAX_TURNS,
    partnerLine: tx.line,
    partnerExpr: t.expr,
    partnerAudio: audioIds.line(s.role, s.turn),
    choices: s.tones.map((tone, i) => ({ id: i, text: tx.choices[tone] })),
    stats: { spark: round1(s.spark), trust: round1(s.trust), wary: round1(s.wary) },
    threshold: thresholdFor(s.n),
    wariLimit: wariLimitFor(s.n),
    multiplier: multiplierFor(s.n, s.lost ?? 0),
    rps: !!s.rps,
    duel: !!s.duel,
    total: Math.round(s.total),
    cleared: s.cleared,
  };
}
 
export type Breakdown = { feeling: number; balance: number; speed: number; event: number; low: number; subtotal: number };
 
export function partnerScore(s: RunState, turnsUsed: number): Breakdown {
  const feeling = Math.min(400, (s.spark + s.trust) * 2);
  const balance = Math.max(0, 200 - Math.abs(s.spark - s.trust) * 2);
  const speed = Math.round((150 * (MAX_TURNS - turnsUsed)) / MAX_TURNS * 10) / 10;
  const event = 0; // 隠しイベントは、まだ未実装
  const low = Math.max(0, 100 - s.wary);
  const subtotal = round1(feeling + balance + speed + event + low);
  return { feeling: round1(feeling), balance: round1(balance), speed, event, low: round1(low), subtotal };
}
 
export type StepResult = {
  bucket: 'good' | 'normal' | 'bad';
  tone: Tone; // 選ばれた口調（ブラウザには、身振りに変えて、返す）
  reaction: { text: string; expr: Expr };
  outcome: 'continue' | 'cleared' | 'rejected' | 'friend';
  animation?: 'fall' | 'smoke';
  archetype?: Archetype; // 相手が終わるときに、正体を見せる
  breakdown?: Breakdown;
  partnerPoints?: number; // 倍率を掛けたあとの点数
  nextState: RunState | null;
};
 
export function step(s: RunState, choiceIndex: number, rng: Rng): StepResult | null {
  const tone = s.tones[choiceIndex];
  if (!tone) return null;
  const base = MATRIX[s.archetype][tone];
  const off = s.offsets[tone];
  const d0 = round1(base[0] + off[0] + rand(rng, -0.5, 0.5));
  const d1 = round1(base[1] + off[1] + rand(rng, -0.5, 0.5));
  const raw2 = base[2] + off[2] + rand(rng, -0.5, 0.5);
  const d2 = round1(raw2 > 0 ? raw2 * WARY_UP : raw2);
 
  const next: RunState = { ...s };
  next.spark = clamp(s.spark + d0);
  next.trust = clamp(s.trust + d1);
  next.wary = clamp(s.wary + d2);
 
  const sum = d0 + d1;
  const bucket: 'good' | 'normal' | 'bad' = sum >= 6 && d2 <= 0 ? 'good' : d2 >= 3 || sum <= 0 ? 'bad' : 'normal';
  const rs = REACTIONS[s.role][s.archetype];
  const rx = bucket === 'good' ? rs.good : bucket === 'bad' ? rs.bad : rs.normal;
 
  const turnsUsed = s.turn + 1;
  const T = thresholdFor(s.n);
  const W = wariLimitFor(s.n);
 
  // 1) フラれる（警戒度が、上限に達した）
  if (next.wary >= W) {
    return { bucket, tone, reaction: rx, outcome: 'rejected', animation: rng() < 0.5 ? 'fall' : 'smoke', archetype: s.archetype, nextState: null };
  }
 
  // 2) 早期クリア、または、最終ターンでの判定
  const early = turnsUsed >= EARLY_FROM_TURN && next.spark >= T + EARLY_MARGIN && next.trust >= T + EARLY_MARGIN;
  const last = turnsUsed >= MAX_TURNS;
  if (early || last) {
    if (next.spark >= T && next.trust >= T) {
      const bd = partnerScore(next, turnsUsed);
      const pts = round1(bd.subtotal * multiplierFor(s.n, s.lost ?? 0));
      const p = newPartner(s.n + 1, rng);
      const ns: RunState = {
        ...next, n: s.n + 1, archetype: p.archetype, offsets: p.offsets, turn: 0,
        spark: START.spark, trust: START.trust, wary: START.wary,
        total: round1(s.total + pts), cleared: s.cleared + 1, tones: pickTones(rng),
        rps: (s.cleared + 1) % 3 === 0,
      };
      return { bucket, tone, reaction: rx, outcome: 'cleared', archetype: s.archetype, breakdown: bd, partnerPoints: pts, nextState: ns };
    }
    return { bucket, tone, reaction: rx, outcome: 'friend', archetype: s.archetype, nextState: null };
  }
 
  next.turn = s.turn + 1;
  next.tones = pickTones(rng);
  return { bucket, tone, reaction: rx, outcome: 'continue', nextState: next };
}
 