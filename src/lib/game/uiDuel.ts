// 早撃ち（3回勝負）の画面の文字（5言語）。ブラウザで使う（秘密の情報は、入っていない）。

import type { UiLang } from './ui';

export type DuelText = {
  title: string;
  rule: string;
  ready: string;
  start: string;
  nextRound: string;
  wait: string;
  go: string;
  you: string;
  cpu: string;
  ms: string;
  win: string;
  lose: string;
  foul: string;
  late: string;
  foulNote: string;
  lateNote: string;
  round: (n: number, total: number) => string;
  score: (w: number, total: number) => string;
  finalWin: string;
  finalLose: string;
  winNote: (bonus: number) => string;
  loseNote: string;
  next: string;
};

export const UI_DUEL: Record<UiLang, DuelText> = {
  ja: {
    title: '早撃ち！',
    rule: '3回勝負です。花びらが地面に落ちた瞬間に、ボタンを押します。早すぎると、フライングで負け。相手より早く押せたら、その回は勝ちです。2回以上勝てば、勝ち越しです。',
    ready: '準備はいい？ 「はじめる」を押すと、花びらが落ちはじめます。',
    start: 'はじめる',
    nextRound: '次の勝負へ',
    wait: '……まだ……',
    go: 'いま！',
    you: 'あなた',
    cpu: '相手',
    ms: 'ミリ秒',
    win: '勝ち！',
    lose: '負け……',
    foul: 'フライング！',
    late: '遅すぎ……',
    foulNote: '合図より前、または、速すぎる反応でした。',
    lateNote: '押すのが、遅すぎました。',
    round: (n, total) => `第${n}回 / ${total}`,
    score: (w, total) => `${w}勝 / ${total}回`,
    finalWin: '勝ち越し！',
    finalLose: '惜しい……',
    winNote: (b) => `ボーナス +${b} 点`,
    loseNote: '連続の倍率が、0.25 下がりました。（1.00 より下には、なりません）',
    next: '次の相手へ',
  },
  en: {
    title: 'Quick Draw!',
    rule: "Best of three rounds. Press the button the moment the petal touches the ground. Press too early and you foul out. Beat your partner's time to win the round. Win two or more to take the match.",
    ready: 'Ready? Press Start and a petal will begin to fall.',
    start: 'Start',
    nextRound: 'Next round',
    wait: '...Not yet...',
    go: 'Now!',
    you: 'You',
    cpu: 'Partner',
    ms: 'ms',
    win: 'You win!',
    lose: 'You lose...',
    foul: 'False start!',
    late: 'Too slow...',
    foulNote: 'You pressed before the signal, or impossibly fast.',
    lateNote: 'You pressed too late.',
    round: (n, total) => `Round ${n} / ${total}`,
    score: (w, total) => `${w} wins out of ${total}`,
    finalWin: 'You took the match!',
    finalLose: 'So close...',
    winNote: (b) => `Bonus +${b} pts`,
    loseNote: 'Your streak multiplier dropped by 0.25. (It never goes below 1.00)',
    next: 'Next partner',
  },
  zh: {
    title: '快速出手！',
    rule: '三局两胜制。花瓣落到地面的瞬间，立刻按下按钮。按得太早就算抢跑，判负。比对方更快按下就赢下这一局。赢两局以上即获胜。',
    ready: '准备好了吗？按“开始”后，花瓣就会开始飘落。',
    start: '开始',
    nextRound: '下一局',
    wait: '……还没到……',
    go: '现在！',
    you: '你',
    cpu: '对方',
    ms: '毫秒',
    win: '你赢了！',
    lose: '你输了……',
    foul: '抢跑！',
    late: '太慢了……',
    foulNote: '你在信号出现前就按了，或者反应快得不可能。',
    lateNote: '你按得太晚了。',
    round: (n, total) => `第${n}局 / ${total}`,
    score: (w, total) => `${total}局${w}胜`,
    finalWin: '获胜！',
    finalLose: '可惜……',
    winNote: (b) => `奖励 +${b} 分`,
    loseNote: '连胜倍率下降了0.25。（不会低于1.00）',
    next: '下一位',
  },
  id: {
    title: 'Tembak Cepat!',
    rule: 'Tiga ronde. Tekan tombol tepat saat kelopak menyentuh tanah. Kalau terlalu cepat, kamu kena pelanggaran dan kalah. Tekan lebih cepat dari lawan untuk memenangkan ronde. Menang dua ronde atau lebih berarti kamu menang pertandingan.',
    ready: 'Siap? Tekan Mulai dan kelopak akan mulai jatuh.',
    start: 'Mulai',
    nextRound: 'Ronde berikutnya',
    wait: '...Belum...',
    go: 'Sekarang!',
    you: 'Kamu',
    cpu: 'Lawan bicara',
    ms: 'ms',
    win: 'Kamu menang!',
    lose: 'Kamu kalah...',
    foul: 'Terlalu cepat!',
    late: 'Terlalu lambat...',
    foulNote: 'Kamu menekan sebelum sinyal, atau terlalu cepat untuk manusia.',
    lateNote: 'Kamu menekan terlalu lambat.',
    round: (n, total) => `Ronde ${n} / ${total}`,
    score: (w, total) => `${w} menang dari ${total}`,
    finalWin: 'Kamu menang pertandingan!',
    finalLose: 'Hampir saja...',
    winNote: (b) => `Bonus +${b} poin`,
    loseNote: 'Pengali beruntun turun 0,25. (Tidak akan di bawah 1,00)',
    next: 'Pasangan berikutnya',
  },
  es: {
    title: '¡Duelo rápido!',
    rule: 'Tres rondas. Pulsa el botón en el instante en que el pétalo toque el suelo. Si lo haces demasiado pronto, pierdes por salida en falso. Si pulsas antes que tu pareja, ganas la ronda. Con dos victorias o más, ganas el duelo.',
    ready: '¿Listo? Pulsa Empezar y un pétalo empezará a caer.',
    start: 'Empezar',
    nextRound: 'Siguiente ronda',
    wait: '...Todavía no...',
    go: '¡Ahora!',
    you: 'Tú',
    cpu: 'Pareja',
    ms: 'ms',
    win: '¡Ganaste!',
    lose: 'Perdiste...',
    foul: '¡Salida en falso!',
    late: 'Demasiado lento...',
    foulNote: 'Pulsaste antes de la señal, o con una rapidez imposible.',
    lateNote: 'Pulsaste demasiado tarde.',
    round: (n, total) => `Ronda ${n} / ${total}`,
    score: (w, total) => `${w} victorias de ${total}`,
    finalWin: '¡Ganaste el duelo!',
    finalLose: 'Casi...',
    winNote: (b) => `Bonificación +${b} pts`,
    loseNote: 'El multiplicador de racha bajó 0,25. (Nunca baja de 1,00)',
    next: 'Siguiente pareja',
  },
};