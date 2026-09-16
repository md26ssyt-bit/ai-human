import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
// プレミアムプランの価格ID（Stripeダッシュボードで取得したもの）
const PREMIUM_PRICE_ID = 'price_1UER7DEsNDv0spdDiD6CpmiY';
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    const { email, lang } = req.body;
 
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'メールアドレスが必要です' });
    }
 
    // すでにこのメールでStripe顧客が存在するか確認し、いなければ新規作成
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existingCustomers.data[0] ||
      (await stripe.customers.create({ email }));
 
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://adikio.com';
 
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/fortune?subscribed=1`,
      cancel_url: `${baseUrl}/fortune?subscribed=0`,
      locale: lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : lang === 'id' ? 'id' : 'ja',
    });
 
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout Session作成エラー:', error);
    return res.status(500).json({ error: 'サブスク決済ページの作成に失敗しました' });
  }
}
 