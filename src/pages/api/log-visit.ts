import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { sheetId, messages, companyName, email } = req.body;
　　console.log("sheetId:", sheetId);  // ← 追加
    console.log("messages:", messages);  // ← 追加
    if (!sheetId) return res.status(400).json({ error: 'sheetIdが必要です' });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const visitTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    const rows = messages.map((msg: any) => [
      visitTime,
      companyName,
      email,
      msg.role === 'user' ? 'お客様' : 'AI',
      msg.text,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'シート1!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('ログ記録エラー:', error);
    return res.status(500).json({ error: 'ログの記録に失敗しました' });
  }
}
