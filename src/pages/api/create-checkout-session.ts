import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { CONSENT_VERSION, SUBSCRIPTION_NOTICE, pickLang } from '@/lib/checkoutNotices';
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
// プレミアムプランの価格ID。テスト用と本番用で値が違うため、コードには直接書かず、
// Vercelの環境変数 PREMIUM_PRICE_ID から読み込む
const PREMIUM_PRICE_ID = process.env.PREMIUM_PRICE_ID;
 
// 「すでに契約中」とみなすサブスクの状態（支払い遅延中も契約は続いているので含める）
const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];
 
const CHECKOUT_LOCALES: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = {
  ja: 'ja',
  en: 'en',
  zh: 'zh',
  id: 'id',
  es: 'es',
};
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    if (!PREMIUM_PRICE_ID || !PREMIUM_PRICE_ID.startsWith('price_') || PREMIUM_PRICE_ID === 'price_') {
      console.error('PREMIUM_PRICE_ID が設定されていないか、不正な値です');
      return res.status(500).json({ error: 'サブスク決済の設定が完了していません' });
    }
 
    const { email: rawEmail, lang } = req.body;
 
    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({ error: 'メールアドレスが必要です' });
    }
 
    // 大文字小文字の違いで別人扱いにならないよう、メールは小文字に統一する
    const email = rawEmail.trim().toLowerCase();
 
    // 同じメールでStripe顧客が複数できている場合もあるため、全て調べる
    const existingCustomers = await stripe.customers.list({ email, limit: 10 });
 
    // すでに有効なサブスクがあれば、新しい申し込みは受け付けない（二重課金の防止）
    for (const c of existingCustomers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 20 });
      if (subs.data.some((s) => ACTIVE_STATUSES.includes(s.status))) {
        return res.status(409).json({ error: 'already_subscribed' });
      }
    }
 
    const customer =
      existingCustomers.data[0] ||
      (await stripe.customers.create({ email }));
 
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adikio.com';
 
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/room?subscribed=1`,
      cancel_url: `${baseUrl}/room?subscribed=0`,
      locale: CHECKOUT_LOCALES[lang as string] || 'ja',
      custom_text: {
        submit: { message: SUBSCRIPTION_NOTICE[pickLang(lang)] },
      },
      // 購入前の確認画面（即時開始・撤回権の確認）を経たことの記録
      metadata: {
        consent_kind: 'subscription_immediate_start',
        consent_version: CONSENT_VERSION,
        consent_at: new Date().toISOString(),
        lang: typeof lang === 'string' ? lang : 'ja',
      },
    });
 
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout Session作成エラー:', error);
    return res.status(500).json({ error: 'サブスク決済ページの作成に失敗しました' });
  }
}
 