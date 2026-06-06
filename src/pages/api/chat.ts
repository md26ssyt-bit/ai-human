import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { message, email } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    let systemPrompt = 'あなたは企業受付AIです。丁寧にお客様をご案内してください。挨拶は絶対にしないでください。質問に簡潔に答えてください。';
    let notifyEmail = process.env.NOTIFY_EMAIL;
    let companyName = '不明';
    let staffInfo = '';
    let customerId = '';

    if (email) {
      const { data } = await supabase
        .from('customers')
        .select('id, prompt, notify_email, company_name, greeting')
        .eq('email', email)
        .single();
      if (data?.prompt) systemPrompt = data.prompt;
      if (data?.notify_email) notifyEmail = data.notify_email;
      if (data?.company_name) companyName = data.company_name;
      if (data?.id) customerId = data.id;
     
      console.log("systemPrompt:", systemPrompt);
      console.log("greeting:", data?.greeting);

      if (customerId) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('name, email, phone')
          .eq('customer_id', customerId);
        if (staffData && staffData.length > 0) {
          staffInfo = staffData.map((s: any) => `${s.name}:${s.email}:${s.phone || ''}`).join(',');
        }
      }
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
               text: `${systemPrompt}
必ず自然な会話文だけを返してください。
必ず3文以内で簡潔に答えてください。
"reply:" や "回答:" などのラベルは絶対に出力しないでください。
担当者一覧：${staffInfo || 'なし'}
もしユーザーが「伝えてください」「連絡してください」「呼んでください」などの伝言を依頼した場合は、返答の最後に必ず「[NOTIFY:担当者名:伝言内容]」という形式で伝言を追加してください。
例：「承知しました。田中様にご連絡いたします。[NOTIFY:田中:田中様への来客があります]」
もしユーザーが担当者を呼びたい場合は、返答の最後に「[CALL:担当者名:電話番号]」という形式も追加してください。
例：「田中様をお呼びします。[NOTIFY:田中:来客があります][CALL:田中:090-0000-0000]」
ユーザー: ${message}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? '少しお待ちください';

    let reply = rawText
      .replace(/^reply[:：\s]*/i, '')
      .replace(/^回答[:：\s]*/i, '')
      .trim();

    const notifyMatch = reply.match(/\[NOTIFY:(.+?):(.+?)\]/);
    if (notifyMatch) {
      const staffName = notifyMatch[1];
      const notifyMessage = notifyMatch[2];
      reply = reply.replace(/\[NOTIFY:.+?\]/, '').trim();

      let targetEmail = notifyEmail;
      if (staffInfo) {
        const staffList = staffInfo.split(',');
        const found = staffList.find((s: string) => s.startsWith(staffName));
        if (found) targetEmail = found.split(':')[1];
      }

      try {
        const baseUrl = 'https://ai-human-eta.vercel.app';
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000';
        await fetch(`${baseUrl}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: notifyMessage,
            company: companyName,
            notifyEmail: targetEmail,
          }),
        });
      } catch (e) {
        console.error('通知エラー:', e);
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('APIエラー:', error);
    return res.status(500).json({ reply: '通信エラーが発生しました' });
  }
}