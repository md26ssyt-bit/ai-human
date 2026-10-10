// 決済ページ（Stripe）に表示する、デジタルコンテンツ・サブスクの案内文と、同意記録のバージョン。
// 購入前の確認画面（room.tsx）の文言と、内容を合わせてあります。
 
export const CONSENT_VERSION = 'eu-withdrawal-v1';
 
type L = 'ja' | 'en' | 'zh' | 'id' | 'es';
 
export const DIGITAL_NOTICE: Record<L, string> = {
  ja: 'このコンテンツは、決済の確認後すぐに提供されるデジタルコンテンツです。お支払いにより、すぐの提供を希望され、提供が始まった時点でEU域内の消費者に認められる14日間の撤回権を失うことに同意されたものとします。',
  en: 'This is digital content delivered immediately after payment is confirmed. By paying, you request immediate delivery and acknowledge that you lose the 14-day right of withdrawal available to consumers in the EU once delivery begins.',
  zh: '本内容是在支付确认后立即提供的数字内容。付款即表示您希望立即获得内容，并确认一旦开始提供，欧盟境内消费者享有的14天撤回权将不再适用。',
  id: 'Ini adalah konten digital yang dikirim segera setelah pembayaran dikonfirmasi. Dengan membayar, Anda meminta pengiriman segera dan mengakui bahwa Anda kehilangan hak penarikan 14 hari bagi konsumen di UE begitu pengiriman dimulai.',
  es: 'Este es contenido digital que se entrega inmediatamente después de confirmarse el pago. Al pagar, solicitas la entrega inmediata y reconoces que, una vez iniciada la entrega, pierdes el derecho de desistimiento de 14 días que corresponde a los consumidores de la UE.',
};
 
export const SUBSCRIPTION_NOTICE: Record<L, string> = {
  ja: 'お申し込みにより、サービスのすぐの開始を希望されたものとします。EU域内の消費者の方が14日以内に撤回される場合は、すでに利用した分の料金をお支払いいただきます。毎月自動で更新され、いつでも解約できます。',
  en: 'By subscribing, you request that the service start immediately. If you are a consumer in the EU and withdraw within 14 days, you will pay for the part of the service already used. The plan renews automatically every month and you can cancel at any time.',
  zh: '申请即表示您希望立即开始使用服务。如果您是欧盟境内的消费者并在14天内撤回，需支付已使用部分的费用。每月自动续订，可随时取消。',
  id: 'Dengan berlangganan, Anda meminta layanan dimulai segera. Jika Anda konsumen di UE dan menarik diri dalam 14 hari, Anda akan membayar bagian layanan yang sudah digunakan. Paket diperpanjang otomatis setiap bulan dan dapat dibatalkan kapan saja.',
  es: 'Al suscribirte, solicitas que el servicio comience de inmediato. Si eres consumidor de la UE y desistes en un plazo de 14 días, pagarás la parte del servicio ya utilizada. El plan se renueva automáticamente cada mes y puedes cancelarlo en cualquier momento.',
};
 
export function pickLang(lang: unknown): L {
  return lang === 'en' || lang === 'zh' || lang === 'id' || lang === 'es' ? lang : 'ja';
}
 