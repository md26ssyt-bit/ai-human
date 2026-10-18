// ゲーム画面の文字（ボタン、見出しなど）。ブラウザで使う（秘密の情報は、入っていない）。
 
export type UiLang = 'ja' | 'en' | 'zh' | 'id' | 'es';
export const UI_LANGS: UiLang[] = ['ja', 'en', 'zh', 'id', 'es'];
export const LANG_NAME: Record<UiLang, string> = { ja: '日本語', en: 'English', zh: '中文', id: 'Indonesia', es: 'Español' };
 
export type UiText = {
  title: string;
  ageIntro: string;
  ageNote: string;
  ageButton: string;
  backTop: string;
  roleTitle: string;
  roleW: string;
  roleM: string;
  roleNote: string;
  nth: (n: number) => string;
  combo: string;
  points: string;
  spark: string;
  trust: string;
  wary: string;
  hint: string;
  partnerWho: (turn: number, max: number) => string;
  moodGood: string;
  moodNormal: string;
  moodBad: string;
  clearTitle: (type: string) => string;
  feeling: string;
  balance: string;
  speed: string;
  low: string;
  subtotal: string;
  partnerTypeWas: (type: string) => string;
  next: string;
  nextPartner: string;
  seeResult: string;
  endTitle: string;
  endRejected: string;
  endFriend: string;
  clearedCount: string;
  again: string;
  rankLater: string;
  soundOn: string;
  soundOff: string;
  startFail: string;
  commFail: string;
};
 
export const UI: Record<UiLang, UiText> = {
  ja: {
    title: '恋愛ランゲーム（試作）',
    ageIntro: 'このゲームは、18歳以上の方向けの、フィクションです。性的な内容は含みません。',
    ageNote: '試作版のため、ランキングやギフトは、まだありません。',
    ageButton: '18歳以上です',
    backTop: '← トップへ',
    roleTitle: 'どちらの役で遊びますか？',
    roleW: '女性役（口説かれる側）',
    roleM: '男性役（口説く側）',
    roleNote: '本人の性別は、問いません。どちらの役でも、遊べます。',
    nth: (n) => `${n}人目`,
    combo: '連続',
    points: '点',
    spark: 'ときめき',
    trust: '安心',
    wary: '警戒度',
    hint: 'ときめきと安心を、線（目標）まで、伸ばしましょう。警戒度が、いっぱいになると、フラれます。',
    partnerWho: (t, m) => `相手 ・ ターン ${t} / ${m}`,
    moodGood: 'いい感じ！',
    moodNormal: 'まずまず',
    moodBad: 'うーん……',
    clearTitle: (ty) => `🎉 ${ty}を、落としました！`,
    feeling: '気持ちの高まり',
    balance: 'バランス',
    speed: 'スピード',
    low: '警戒度の低さ',
    subtotal: '小計 × 倍率',
    partnerTypeWas: (ty) => `相手のタイプは「${ty}」でした。`,
    next: '次へ',
    nextPartner: '次の相手へ',
    seeResult: '結果を見る',
    endTitle: 'ラン終了',
    endRejected: 'フラれてしまいました……',
    endFriend: '友達止まりでした',
    clearedCount: '落とした人数',
    again: 'もう一度',
    rankLater: 'ランキングは、のちほど、追加します。',
    soundOn: '🔊 音声あり',
    soundOff: '🔇 音声なし',
    startFail: 'ゲームを始められませんでした。もう一度お試しください。',
    commFail: '通信に失敗しました。もう一度、選んでください。',
  },
  en: {
    title: 'Romance Run Game (Prototype)',
    ageIntro: 'This game is a work of fiction for ages 18 and over. It contains no sexual content.',
    ageNote: 'This is a prototype. Rankings and gifts are not available yet.',
    ageButton: "I'm 18 or older",
    backTop: '← Back to top',
    roleTitle: 'Which role will you play?',
    roleW: 'Play as the woman (being courted)',
    roleM: 'Play as the man (courting)',
    roleNote: 'Your own gender does not matter. You can play either role.',
    nth: (n) => `Partner #${n}`,
    combo: 'Streak',
    points: 'pts',
    spark: 'Spark',
    trust: 'Trust',
    wary: 'Wariness',
    hint: 'Raise Spark and Trust up to the line (the goal). If Wariness fills up, you get turned down.',
    partnerWho: (t, m) => `Partner · Turn ${t} / ${m}`,
    moodGood: 'Feeling good!',
    moodNormal: 'Not bad',
    moodBad: 'Hmm...',
    clearTitle: (ty) => `🎉 You won over the ${ty}!`,
    feeling: 'Feelings',
    balance: 'Balance',
    speed: 'Speed',
    low: 'Low wariness',
    subtotal: 'Subtotal × multiplier',
    partnerTypeWas: (ty) => `Your partner was the "${ty}".`,
    next: 'Next',
    nextPartner: 'Next partner',
    seeResult: 'See result',
    endTitle: 'Run over',
    endRejected: 'You got turned down...',
    endFriend: 'You stayed friends.',
    clearedCount: 'Partners won over',
    again: 'Play again',
    rankLater: 'Rankings will be added later.',
    soundOn: '🔊 Sound on',
    soundOff: '🔇 Sound off',
    startFail: 'Could not start the game. Please try again.',
    commFail: 'Connection failed. Please choose again.',
  },
  zh: {
    title: '恋爱闯关游戏（试玩版）',
    ageIntro: '本游戏为面向18岁以上玩家的虚构作品，不含性相关内容。',
    ageNote: '这是试玩版，排行榜和礼物功能暂未开放。',
    ageButton: '我已满18岁',
    backTop: '← 返回首页',
    roleTitle: '你想扮演哪个角色？',
    roleW: '扮演女性（被追求的一方）',
    roleM: '扮演男性（追求的一方）',
    roleNote: '与你本人的性别无关，两个角色都可以玩。',
    nth: (n) => `第${n}位`,
    combo: '连胜',
    points: '分',
    spark: '心动',
    trust: '安心',
    wary: '戒备度',
    hint: '把心动和安心提升到线（目标）的位置。戒备度满了就会被拒绝。',
    partnerWho: (t, m) => `对方 · 第 ${t} / ${m} 回合`,
    moodGood: '感觉不错！',
    moodNormal: '还不错',
    moodBad: '嗯……',
    clearTitle: (ty) => `🎉 你攻略了${ty}！`,
    feeling: '心情高涨度',
    balance: '平衡',
    speed: '速度',
    low: '戒备度低',
    subtotal: '小计 × 倍率',
    partnerTypeWas: (ty) => `对方的类型是「${ty}」。`,
    next: '下一步',
    nextPartner: '下一位',
    seeResult: '查看结果',
    endTitle: '本局结束',
    endRejected: '被拒绝了……',
    endFriend: '只能做朋友了',
    clearedCount: '攻略人数',
    again: '再来一次',
    rankLater: '排行榜将于稍后推出。',
    soundOn: '🔊 有声音',
    soundOff: '🔇 静音',
    startFail: '无法开始游戏，请重试。',
    commFail: '通信失败，请重新选择。',
  },
  id: {
    title: 'Game Romansa Berantai (Prototipe)',
    ageIntro: 'Game ini adalah karya fiksi untuk usia 18 tahun ke atas. Tidak ada konten seksual.',
    ageNote: 'Ini versi prototipe. Peringkat dan hadiah belum tersedia.',
    ageButton: 'Saya berusia 18 tahun ke atas',
    backTop: '← Kembali ke beranda',
    roleTitle: 'Mau memainkan peran yang mana?',
    roleW: 'Main sebagai wanita (yang didekati)',
    roleM: 'Main sebagai pria (yang mendekati)',
    roleNote: 'Jenis kelamin aslimu tidak masalah. Kamu bisa memainkan kedua peran.',
    nth: (n) => `Pasangan ke-${n}`,
    combo: 'Beruntun',
    points: 'poin',
    spark: 'Debar',
    trust: 'Rasa aman',
    wary: 'Kewaspadaan',
    hint: 'Naikkan Debar dan Rasa aman sampai garis (target). Kalau Kewaspadaan penuh, kamu ditolak.',
    partnerWho: (t, m) => `Lawan bicara · Giliran ${t} / ${m}`,
    moodGood: 'Bagus!',
    moodNormal: 'Lumayan',
    moodBad: 'Hmm...',
    clearTitle: (ty) => `🎉 Kamu berhasil meluluhkan ${ty}!`,
    feeling: 'Perasaan',
    balance: 'Keseimbangan',
    speed: 'Kecepatan',
    low: 'Kewaspadaan rendah',
    subtotal: 'Subtotal × pengali',
    partnerTypeWas: (ty) => `Tipe pasanganmu adalah "${ty}".`,
    next: 'Lanjut',
    nextPartner: 'Pasangan berikutnya',
    seeResult: 'Lihat hasil',
    endTitle: 'Permainan selesai',
    endRejected: 'Kamu ditolak...',
    endFriend: 'Hanya jadi teman.',
    clearedCount: 'Jumlah yang diluluhkan',
    again: 'Main lagi',
    rankLater: 'Peringkat akan ditambahkan nanti.',
    soundOn: '🔊 Suara aktif',
    soundOff: '🔇 Suara mati',
    startFail: 'Game tidak bisa dimulai. Silakan coba lagi.',
    commFail: 'Koneksi gagal. Silakan pilih lagi.',
  },
  es: {
    title: 'Juego de Romance en Racha (Prototipo)',
    ageIntro: 'Este juego es una obra de ficción para mayores de 18 años. No contiene contenido sexual.',
    ageNote: 'Es un prototipo. Aún no hay clasificaciones ni regalos.',
    ageButton: 'Tengo 18 años o más',
    backTop: '← Volver al inicio',
    roleTitle: '¿Qué papel quieres jugar?',
    roleW: 'Jugar como la mujer (a quien cortejan)',
    roleM: 'Jugar como el hombre (quien corteja)',
    roleNote: 'Tu género real no importa. Puedes jugar cualquiera de los dos papeles.',
    nth: (n) => `Pareja n.º ${n}`,
    combo: 'Racha',
    points: 'pts',
    spark: 'Chispa',
    trust: 'Confianza',
    wary: 'Recelo',
    hint: 'Sube la Chispa y la Confianza hasta la línea (la meta). Si el Recelo se llena, te rechazan.',
    partnerWho: (t, m) => `Pareja · Turno ${t} / ${m}`,
    moodGood: '¡Buen ambiente!',
    moodNormal: 'No está mal',
    moodBad: 'Mmm...',
    clearTitle: (ty) => `🎉 ¡Conquistaste al ${ty}!`,
    feeling: 'Sentimientos',
    balance: 'Equilibrio',
    speed: 'Rapidez',
    low: 'Poco recelo',
    subtotal: 'Subtotal × multiplicador',
    partnerTypeWas: (ty) => `Tu pareja era del tipo "${ty}".`,
    next: 'Siguiente',
    nextPartner: 'Siguiente pareja',
    seeResult: 'Ver resultado',
    endTitle: 'Fin de la partida',
    endRejected: 'Te rechazaron...',
    endFriend: 'Os quedasteis como amigos.',
    clearedCount: 'Conquistas',
    again: 'Jugar otra vez',
    rankLater: 'Las clasificaciones se añadirán más adelante.',
    soundOn: '🔊 Con sonido',
    soundOff: '🔇 Sin sonido',
    startFail: 'No se pudo iniciar el juego. Inténtalo de nuevo.',
    commFail: 'Falló la conexión. Elige otra vez.',
  },
};
 