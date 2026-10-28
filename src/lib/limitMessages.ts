// 回数の上限に達したときなどの、お知らせの文章（5言語）。サーバー側で使う。

export type MsgLang = 'ja' | 'en' | 'zh' | 'id' | 'es';

// 無料の回数の上限に達したとき
export const LIMIT_FREE: Record<MsgLang, string> = {
  ja: '無料回数の上限に達しました。しばらくしてからまたお話ししましょう🌙 続きが気になる方はプレミアムプランもぜひ[EMOTION:neutral]',
  en: "You've reached today's free limit. Let's talk again a little later 🌙 If you'd like to keep going, please consider the Premium plan.[EMOTION:neutral]",
  zh: '今天的免费次数已用完。稍后再聊吧🌙 想继续聊的话，也欢迎试试高级会员计划。[EMOTION:neutral]',
  id: 'Batas gratis hari ini sudah tercapai. Mari ngobrol lagi sebentar lagi 🌙 Kalau ingin lanjut, silakan coba paket Premium.[EMOTION:neutral]',
  es: 'Has alcanzado el límite gratuito de hoy. Hablemos de nuevo un poco más tarde 🌙 Si quieres seguir, prueba el plan Premium.[EMOTION:neutral]',
};

// プレミアム会員が、1日の上限に達したとき
export const LIMIT_PREMIUM: Record<MsgLang, string> = {
  ja: '本日はたくさんお話しいただきました🌙 しばらくしてからまたお話ししましょう[EMOTION:neutral]',
  en: "We've talked a lot today 🌙 Let's chat again a little later.[EMOTION:neutral]",
  zh: '今天聊了很多呢🌙 稍后再聊吧。[EMOTION:neutral]',
  id: 'Hari ini kita sudah banyak mengobrol 🌙 Mari ngobrol lagi nanti.[EMOTION:neutral]',
  es: 'Hoy hemos hablado mucho 🌙 Sigamos hablando un poco más tarde.[EMOTION:neutral]',
};

// 全員の合計の上限（アクセスが集中しているとき）
export const BUSY_BY_LANG: Record<MsgLang, string> = {
  ja: '本日はアクセスが集中しています🌙 しばらくしてから、またお話ししましょう[EMOTION:neutral]',
  en: "It's very busy today 🌙 Please come back a little later.[EMOTION:neutral]",
  zh: '今天访问人数较多🌙 请稍后再来。[EMOTION:neutral]',
  id: 'Hari ini sedang sangat ramai 🌙 Silakan kembali sebentar lagi.[EMOTION:neutral]',
  es: 'Hoy hay mucha gente 🌙 Vuelve un poco más tarde.[EMOTION:neutral]',
};

// 言語に合う文章を返す（知らない言語のときは、日本語）
export function pick(map: Record<MsgLang, string>, lang: unknown): string {
  return typeof lang === 'string' && Object.prototype.hasOwnProperty.call(map, lang) ? map[lang as MsgLang] : map.ja;
}