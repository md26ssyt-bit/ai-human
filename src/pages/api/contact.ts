import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
 
// 件名や宛先などのヘッダーに改行を入れさせないため、改行を除いて1行にする
const oneLine = (v: unknown, max: number) =>
  String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
 
// 本文は改行を残し、長さだけ制限する
const multiLine = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
 
  try {
    const name = oneLine(req.body?.name, 100);
    const email = oneLine(req.body?.email, 200);
    const company = oneLine(req.body?.company, 200);
    const phone = oneLine(req.body?.phone, 50);
    const message = multiLine(req.body?.message, 5000);
 
    // 内容が空のものは送らない
    if (!message) return res.status(400).json({ success: false });
 
    const gmailUser = process.env.GMAIL_USER;
    if (!gmailUser || !process.env.GMAIL_APP_PASSWORD) {
      console.error('メール送信の設定（GMAIL_USER / GMAIL_APP_PASSWORD）がありません');
      return res.status(500).json({ success: false });
    }
 
    // 受け取るアドレス。環境変数 CONTACT_TO があればそれを使い、なければ contact@adikio.com
    const contactTo = process.env.CONTACT_TO || 'contact@adikio.com';
 
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
 
    await transporter.sendMail({
      from: `ADIKIO お問い合わせ <${gmailUser}>`, // Gmailでは、認証したアドレスから送る必要があります
      to: contactTo,
      // 返信ボタンを押すと、お問い合わせをくれた方に返信できるようにする
      ...(email.includes('@') ? { replyTo: email } : {}),
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