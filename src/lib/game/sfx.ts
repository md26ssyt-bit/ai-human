// 効果音（ファイルは使わず、ブラウザの音の合成機能で、その場で鳴らす）。ブラウザだけで使う。

let ctx: AudioContext | null = null;
let petalGain: GainNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const C = W.AudioContext || W.webkitAudioContext;
    if (!C) return null;
    if (!ctx) ctx = new C();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// 1つの音（高さが、f0 から f1 へ、変わる）
function tone(c: AudioContext, dest: AudioNode, t0: number, dur: number, f0: number, f1: number, type: OscillatorType, vol: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

// ザッという、雑音の短い音
function noise(c: AudioContext, dest: AudioNode, t0: number, dur: number, vol: number, freq: number) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f);
  f.connect(g);
  g.connect(dest);
  s.start(t0);
  s.stop(t0 + dur + 0.02);
}

// 最初のクリックのときに、呼ぶ（ブラウザの制限で、音を出せる状態にする）
export function sfxUnlock() {
  ac();
}

// 花びらが落ちる間（ms）、小さな音が、ひらひらと、続く
export function sfxPetal(ms: number) {
  const c = ac();
  if (!c) return;
  sfxStopPetal();
  const master = c.createGain();
  master.gain.value = 1;
  master.connect(c.destination);
  petalGain = master;
  const total = ms / 1000;
  const t0 = c.currentTime + 0.05;
  let t = 0;
  while (t < total - 0.1) {
    const k = t / total;
    const f = 1700 - 900 * k + Math.random() * 120; // だんだん、低くなる（落ちていく感じ）
    tone(c, master, t0 + t, 0.14, f, f * 0.92, "sine", 0.035);
    t += 0.22 + Math.random() * 0.28;
  }
}

export function sfxStopPetal() {
  const c = ctx;
  if (!c || !petalGain) return;
  try {
    petalGain.gain.cancelScheduledValues(c.currentTime);
    petalGain.gain.setValueAtTime(petalGain.gain.value, c.currentTime);
    petalGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.05);
  } catch {
    /* 何もしない */
  }
  petalGain = null;
}

// 合図（花びらが、地面に落ちた瞬間）：ポーン
export function sfxGo() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.01;
  tone(c, c.destination, t, 0.4, 1320, 1320, "sine", 0.12);
  tone(c, c.destination, t, 0.3, 1980, 1980, "sine", 0.05);
}

// ボタンを押したとき：パンッ（手を叩くような音）
export function sfxShot() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.005;
  noise(c, c.destination, t, 0.09, 0.5, 1800);
  tone(c, c.destination, t, 0.12, 220, 60, "triangle", 0.25);
}

// フライング：低いブザー
export function sfxFoul() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.005;
  tone(c, c.destination, t, 0.3, 160, 120, "sawtooth", 0.08);
}

// 勝ち：上がる3音
export function sfxWin() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.01;
  [523, 659, 784].forEach((f, i) => tone(c, c.destination, t + i * 0.09, 0.28, f, f, "triangle", 0.1));
}

// 負け：下がる2音
export function sfxLose() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.01;
  tone(c, c.destination, t, 0.3, 330, 330, "sine", 0.09);
  tone(c, c.destination, t + 0.15, 0.4, 247, 220, "sine", 0.09);
}