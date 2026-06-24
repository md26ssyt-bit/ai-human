import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, description, companyName } = req.body;

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: description || `${companyName}様 ご請求`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
    });

    return res.status(200).json({ url: paymentLink.url });
  } catch (error) {
    console.error('Stripe決済リンク作成エラー:', error);
    return res.status(500).json({ error: '決済リンクの作成に失敗しました' });
  }
}