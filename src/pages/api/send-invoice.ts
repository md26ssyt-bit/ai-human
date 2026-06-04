import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log("req.body:", JSON.stringify(req.body));
  const { invoiceId } = req.body;

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  console.log("invoice:", invoice, "error:", error);
  if (error || !invoice) return res.status(404).json({ error: '請求書が見つかりません' });

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');
  const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'PhillySans.otf');
  const fontBytes = fs.readFileSync(fontPath);
  const boldFontBytes = fs.readFileSync(boldFontPath);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  page.drawText('請求書', {
    x: 50, y: height - 80,
    size: 28, font, color: rgb(0.1, 0.1, 0.1)
  });

  page.drawText(process.env.SENDER_COMPANY_NAME || '', {
    x: 350, y: height - 60,
    size: 11, font
  });
  page.drawText(process.env.SENDER_ADDRESS || '', {
    x: 350, y: height - 78,
    size: 11, font
  });
  page.drawText(process.env.SENDER_PHONE || '', {
    x: 350, y: height - 96,
    size: 11, font
  });

  const stampX = 455;
  const stampY = height - 50;
  const stampSize = 75;
  const stampFontSize = 50;

  page.drawRectangle({
    x: stampX, y: stampY - stampSize,
    width: stampSize, height: stampSize,
    borderColor: rgb(0.85, 0, 0),
    borderWidth: 3,
    opacity: 0
  });

  const texts = ['DIG', 'KIO', 'LAB'];
  const lineHeight = stampSize / 3.5
  ;

  for (let i = 0; i < texts.length; i++) {
    const textWidth = boldFont.widthOfTextAtSize(texts[i], stampFontSize);
    const textX = stampX + (stampSize - textWidth) / 2;
    const offset = i === 1 ? 1 : 0;  // 真ん中だけ下げる
    const textY = stampY - lineHeight * (i + 1) -10+ offset;
    page.drawText(texts[i], {
      x: textX, y: textY,
      size: stampFontSize, font: boldFont, color: rgb(0.85, 0, 0)
    });
  }
  page.drawText(`宛先: ${invoice.company_name} 様`, {
    x: 50, y: height - 130,
    size: 26, font
  });
  page.drawText(`メール: ${invoice.customer_email}`, {
    x: 50, y: height - 150,
    size: 12, font
  });

  page.drawText(`発行日: ${invoice.issue_date}`, {
    x: 350, y: height - 130,
    size: 12, font
  });
  page.drawText(`支払期限: ${invoice.due_date}`, {
    x: 350, y: height - 150,
    size: 12, font
  });

  page.drawLine({
    start: { x: 50, y: height - 170 },
    end: { x: width - 50, y: height - 170 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8)
  });

  page.drawText('品目', { x: 50, y: height - 200, size: 11, font });
  page.drawText('数量', { x: 300, y: height - 200, size: 11, font });
  page.drawText('単価', { x: 380, y: height - 200, size: 11, font });
  page.drawText('金額', { x: 460, y: height - 200, size: 11, font });

  const items = invoice.items as { name: string; quantity: number; price: number }[];
  let y = height - 225;
  for (const item of items) {
    const amount = item.quantity * item.price;
    page.drawText(item.name, { x: 50, y, size: 11, font });
    page.drawText(String(item.quantity), { x: 300, y, size: 11, font });
    page.drawText(`¥${item.price.toLocaleString()}`, { x: 380, y, size: 11, font });
    page.drawText(`¥${amount.toLocaleString()}`, { x: 460, y, size: 11, font });
    y -= 25;
  }

  page.drawLine({
    start: { x: 350, y: y - 10 },
    end: { x: width - 50, y: y - 10 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8)
  });

  const tax = Math.floor(invoice.total * 0.1);
  const totalWithTax = invoice.total + tax;
  page.drawText('小計:', { x: 370, y: y - 30, size: 11, font });
  page.drawText(`¥${invoice.total.toLocaleString()}`, { x: 460, y: y - 30, size: 11, font });
  page.drawText('消費税(10%):', { x: 340, y: y - 50, size: 11, font });
  page.drawText(`¥${tax.toLocaleString()}`, { x: 460, y: y - 50, size: 11, font });
  page.drawText('合計:', { x: 370, y: y - 75, size: 12, font });
  page.drawText(`¥${totalWithTax.toLocaleString()}`, { x: 460, y: y - 75, size: 12, font });
// 振込先
  page.drawLine({
    start: { x: 50, y: y - 100 },
    end: { x: width - 50, y: y - 100 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8)
  });
  page.drawText('【振込先】', { x: 50, y: y - 120, size: 12, font });
  page.drawText('ゆうちょ銀行', { x: 50, y: y - 140, size: 11, font });
  page.drawText('店番号：後日記入', { x: 50, y: y - 158, size: 11, font });
  page.drawText('口座番号：後日記入', { x: 50, y: y - 176, size: 11, font });
  page.drawText('口座名義：Digkio Lab. 坂内宏之', { x: 50, y: y - 194, size: 11, font });

  const pdfBytes = await pdfDoc.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: invoice.customer_email,
    subject: `【請求書】${invoice.company_name} 様`,
    text: `${invoice.company_name} 様\n\n請求書を添付にてお送りします。\nご確認のほどよろしくお願いいたします。`,
    attachments: [{
      filename: `invoice_${invoice.id}.pdf`,
      content: Buffer.from(pdfBytes)
    }]
  });

  res.status(200).json({ success: true });
}