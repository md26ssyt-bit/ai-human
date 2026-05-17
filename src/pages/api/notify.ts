import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { message, company, notifyEmail } = req.body;
    // Gmailの設定
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // メール送信
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
     to: notifyEmail || process.env.NOTIFY_EMAIL,
      subject: `【AIコンシェルジュ】${company}からの伝言`,
      text: `
会社名：${company}
伝言内容：${message}
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('メール送信エラー:', error);
    return res.status(500).json({ success: false });
  }
}