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

    // お客様のプロンプトをデータベースから取得
    let systemPrompt = 'あなたは企業受付AIです。丁寧にお客様をご案内してください。';
    if (email) {
      const { data } = await supabase
        .from('customers')
        .select('prompt')
        .eq('email', email)
        .single();
      if (data?.prompt) systemPrompt = data.prompt;
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
"reply:" や "回答:" などのラベルは絶対に出力しないでください。
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

    const reply = rawText
      .replace(/^reply[:：\s]*/i, '')
      .replace(/^回答[:：\s]*/i, '')
      .trim();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('APIエラー:', error);
    return res.status(500).json({ reply: '通信エラーが発生しました' });
  }
}