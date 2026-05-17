import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { customer_id, name, email } = req.body;
    const { error } = await supabase.from('staff').insert({
      customer_id,
      name,
      email,
      created_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { customer_id } = req.query;
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('customer_id', customer_id);
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ success: true });
  }

  return res.status(405).send('Method Not Allowed');
}