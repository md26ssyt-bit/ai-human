import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
 
// StripeのWebhook署名検証には「生のリクエストボディ」が必要なため、
// Next.jsの自動ボディパースを無効化する
export const config = {
  api: {
    bodyParser: false,
  },
};
 
// リクエストボディをそのままBufferとして読み込む（新規パッケージ不要）
function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
 
async function upsertSubscription(params: {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEnd: number | null;
}) {
  const { email, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd } = params;
 
  await supabaseAdmin
    .from('fortune_subscriptions')
    .upsert(
      {
        email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status,
        current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
}
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
 
  const sig = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);
 
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (err) {
    console.error('Webhook署名検証エラー:', err);
    return res.status(400).send('Webhook signature verification failed');
  }
 
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.customer && session.subscription) {
          const customer = await stripe.customers.retrieve(session.customer as string);
          const email = (customer as Stripe.Customer).email;
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          if (email) {
            await upsertSubscription({
              email,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              currentPeriodEnd: (subscription as any).current_period_end ?? null,
            });
          }
        }
        break;
      }
 
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as Stripe.Customer).email;
        if (email) {
          await upsertSubscription({
            email,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            status:
              event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status,
            currentPeriodEnd: (subscription as any).current_period_end ?? null,
          });
        }
        break;
      }
 
      default:
        // 対応不要なイベントは無視
        break;
    }
 
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    return res.status(500).json({ error: 'Webhook処理に失敗しました' });
  }
}