import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { name, email, company, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `【お問い合わせ】${company} ${name}様より`,
      text: `
会社名：${company}
担当者名：${name}
電話番号：${phone}
メールアドレス：${email}

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