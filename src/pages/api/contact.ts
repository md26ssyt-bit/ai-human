import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { name, email, company, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `【お問い合わせ】${company} ${name}様より`,
      text: `
お名前：${name}
メールアドレス：${email}
会社名：${company}
お問い合わせ内容：
${message}
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('メール送信エラー:', error);
    return res.status(500).json({ success: false });
  }
}