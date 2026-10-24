// じゃんけんの画面の文字（5言語）。ブラウザで使う（秘密の情報は、入っていない）。
// 手の番号：0 = グー、1 = チョキ、2 = パー（サーバー側の rps.ts と同じ）

import type { UiLang } from './ui';

export const RPS_ICONS = ['✊', '✌️', '✋'];

export type RpsText = {
  title: string;
  rule: string;
  pick: string;
  hands: [string, string, string];
  you: string;
  cpu: string;
  draw: string;
  win: string;
  lose: string;
  winNote: string;
  loseNote: string;
  next: string;
};

export const UI_RPS: Record<UiLang, RpsText> = {
  ja: {
    title: 'じゃんけん！',
    rule: '✊グー は ✌️チョキ に勝ち、✌️チョキ は ✋パー に勝ち、✋パー は ✊グー に勝ちます。',
    pick: '手を選んでください',
    hands: ['グー', 'チョキ', 'パー'],
    you: 'あなた',
    cpu: '相手',
    draw: 'あいこ！もう一度',
    win: '勝ち！',
    lose: '負け……',
    winNote: '相手が、一歩、近づいてくれました。',
    loseNote: '連続の倍率が、0.25 下がりました。（1.00 より下には、なりません）',
    next: '次の相手へ',
  },
  en: {
    title: 'Rock-Paper-Scissors!',
    rule: '✊ Rock beats ✌️ Scissors, ✌️ Scissors beats ✋ Paper, and ✋ Paper beats ✊ Rock.',
    pick: 'Choose your hand',
    hands: ['Rock', 'Scissors', 'Paper'],
    you: 'You',
    cpu: 'Partner',
    draw: "It's a tie! Try again",
    win: 'You win!',
    lose: 'You lose...',
    winNote: 'Your partner stepped a little closer.',
    loseNote: 'Your streak multiplier dropped by 0.25. (It never goes below 1.00)',
    next: 'Next partner',
  },
  zh: {
    title: '猜拳！',
    rule: '✊石头胜✌️剪刀，✌️剪刀胜✋布，✋布胜✊石头。',
    pick: '请选择出拳',
    hands: ['石头', '剪刀', '布'],
    you: '你',
    cpu: '对方',
    draw: '平局！再来一次',
    win: '你赢了！',
    lose: '你输了……',
    winNote: '对方向你走近了一步。',
    loseNote: '连胜倍率下降了0.25。（不会低于1.00）',
    next: '下一位',
  },
  id: {
    title: 'Suit!',
    rule: '✊Batu mengalahkan ✌️Gunting, ✌️Gunting mengalahkan ✋Kertas, ✋Kertas mengalahkan ✊Batu.',
    pick: 'Pilih tanganmu',
    hands: ['Batu', 'Gunting', 'Kertas'],
    you: 'Kamu',
    cpu: 'Lawan bicara',
    draw: 'Seri! Coba lagi',
    win: 'Kamu menang!',
    lose: 'Kamu kalah...',
    winNote: 'Pasanganmu melangkah sedikit lebih dekat.',
    loseNote: 'Pengali beruntun turun 0,25. (Tidak akan di bawah 1,00)',
    next: 'Pasangan berikutnya',
  },
  es: {
    title: '¡Piedra, papel o tijera!',
    rule: '✊Piedra gana a ✌️Tijera, ✌️Tijera gana a ✋Papel y ✋Papel gana a ✊Piedra.',
    pick: 'Elige tu mano',
    hands: ['Piedra', 'Tijera', 'Papel'],
    you: 'Tú',
    cpu: 'Pareja',
    draw: '¡Empate! Otra vez',
    win: '¡Ganaste!',
    lose: 'Perdiste...',
    winNote: 'Tu pareja se acercó un paso.',
    loseNote: 'El multiplicador de racha bajó 0,25. (Nunca baja de 1,00)',
    next: 'Siguiente pareja',
  },
};