import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { PRODUCT_PRICES, PRODUCT_LABELS, PDF_PRODUCTS, ProductKey } from '@/lib/paidProducts';
import { CONSENT_VERSION, DIGITAL_NOTICE, pickLang } from '@/lib/checkoutNotices';
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    const { productKey, payload, character, lang } = req.body as {
      productKey: ProductKey;
      payload: any;
      character?: string;
      lang?: string;
    };
 
    // 価格はここ（サーバー側の定義）だけを信用する。ブラウザから金額を受け取ることは絶対にしない。
    const price = PRODUCT_PRICES[productKey];
    if (!price) {
      return res.status(400).json({ error: '不正な商品です' });
    }
 
    const currency = lang === 'ja' ? 'jpy' : 'usd';
    const unitAmount = currency === 'jpy' ? price.jpy : price.usd;
 
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adikio.com';
    const returnParam = PDF_PRODUCTS.includes(productKey) ? 'pdf_unlocked' : 'paid_content';
 
    // ペイロード（生年月日・気にしていること等）は、改ざんされないようStripe側のセッションに
    // 保存しておく。決済完了後はここに保存した内容だけを信用して生成する。
    // あわせて、購入前の確認画面（即時提供・撤回権の確認）を経たことの記録も残す。
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: { name: PRODUCT_LABELS[productKey] || productKey },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/room?${returnParam}=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/room?${returnParam}=0`,
      custom_text: {
        submit: { message: DIGITAL_NOTICE[pickLang(lang)] },
      },
      metadata: {
        productKey,
        payload: JSON.stringify(payload || {}).slice(0, 480),
        character: character || 'woman',
        lang: lang || 'ja',
        consent_kind: 'digital_immediate_delivery',
        consent_version: CONSENT_VERSION,
        consent_at: new Date().toISOString(),
      },
    });
 
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('商品Checkout作成エラー:', error);
    return res.status(500).json({ error: '決済ページの作成に失敗しました' });
  }
}
 