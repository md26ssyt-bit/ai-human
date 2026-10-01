import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buildChatPrompt, callGeminiText, ProductKey } from '@/lib/paidProducts';
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionIdが必要です' });
    }
 
    // Stripe自身に「本当に支払われたか」を必ず確認する（ここをブラウザからの自己申告にしない）
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'お支払いが確認できませんでした' });
    }
 
    const productKey = session.metadata?.productKey as ProductKey | undefined;
    if (!productKey) {
      return res.status(400).json({ error: '商品情報が見つかりません' });
    }
 
    // 生成に使う内容（生年月日・気にしていること等）も、Stripeに保存したものだけを信用する
    const payload = JSON.parse(session.metadata?.payload || '{}');
    const lang = session.metadata?.lang || 'ja';
    const character = session.metadata?.character || 'woman';
 
    const prompt = buildChatPrompt(productKey, payload);
    const reply = await callGeminiText(prompt, lang);
 
    return res.status(200).json({ reply, productKey, character, lang });
  } catch (error) {
    console.error('購入内容の確認・生成エラー:', error);
    return res.status(500).json({ error: '生成に失敗しました' });
  }
}