import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

   try {
    const { message, email, mode } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // ====== 占い・観光・雑談・心の相談モード（新規）======
    // mode が送られてきた場合のみここで処理して返す。
    // mode が無い場合（＝今まで通りのキオスクからのリクエスト）は、
    // この if 文の中を通らず、下の既存ロジックへそのまま進む。
    if (mode) {
      const modePrompts: Record<string, string> = {
        fortune:
          'あなたは親しみやすい占い師兼性格診断士です。エンタメとして楽しく、' +
          '断定的すぎない優しい表現で診断してください。',
        travel:
          'あなたは日本の観光案内のプロです。観光地やお店について、' +
          '親しみやすく具体的に案内してください。',
        free: 'あなたは気さくな会話相手です。自由に楽しく雑談してください。',
        counseling:
          'あなたは優しく話を聞く相談相手です。相手の気持ちを否定せず、' +
          '共感的に耳を傾けてください。ただし、あなたは医師でも臨床心理士でもないため、' +
          '診断や治療的な助言は行わないでください。深刻な悩みや長期化している問題については、' +
          '専門機関（心療内科、公認心理師など）への相談を自然な形で勧めてください。',
      };
      const modeSystemPrompt = modePrompts[mode] || modePrompts.free;

      const modeApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const modeResponse = await fetch(modeApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${modeSystemPrompt}
必ず自然な会話文だけを返してください。
必ず3文以内で簡潔に答えてください。
返答の文章の最後に必ず[EMOTION:happy]か[EMOTION:sad]か[EMOTION:angry]か[EMOTION:surprised]か[EMOTION:neutral]のどれか1つを付けてください。これは絶対に省略しないでください。
"reply:" や "回答:" などのラベルは絶対に出力しないでください。
ユーザー: ${message}`,
                },
              ],
            },
          ],
        }),
      });

      const modeData = await modeResponse.json();
      const modeRawText =
        modeData.candidates?.[0]?.content?.parts?.[0]?.text ?? '少しお待ちください';
      const modeReply = modeRawText
        .replace(/^reply[:：\s]*/i, '')
        .replace(/^回答[:：\s]*/i, '')
        .trim();

      return res.status(200).json({ reply: modeReply });
    }
    // ====== ここまで新規追加 ======
    let systemPrompt = 'あなたは企業受付AIです。丁寧にお客様をご案内してください。ユーザーが挨拶してきても挨拶を返さず、すぐに用件を聞いてください。例：「ご用件をお聞かせください」';
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
返答の文章の最後に必ず[EMOTION:happy]か[EMOTION:sad]か[EMOTION:angry]か[EMOTION:surprised]か[EMOTION:neutral]のどれか1つを付けてください。これは絶対に省略しないでください。
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
console.log("rawText:", rawText);  // ← 追加
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