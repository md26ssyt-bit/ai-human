import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { buildPdfPrompt, callGeminiText, ProductKey } from '@/lib/paidProducts';
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
const REPORT_TITLES: Record<string, Record<string, string>> = {
  occult_yearly: { ja: '年間鑑定書', en: 'Yearly Fortune Report', zh: '年度运势鉴定书', id: 'Laporan Ramalan Tahunan', es: 'Informe de Fortuna Anual' },
  travel_plan: { ja: '観光プランシート', en: 'Travel Plan Sheet', zh: '观光行程方案', id: 'Rencana Perjalanan Wisata', es: 'Plan de Viaje' },
  trisetsu_darkside: { ja: 'あなたの取扱説明書', en: 'Your Instruction Manual', zh: '你的使用说明书', id: 'Buku Panduan Dirimu', es: 'Tu Manual de Instrucciones' },
  tarot_deep: { ja: 'タロット本格鑑定書', en: 'In-Depth Tarot Reading', zh: '深度塔罗鉴定书', id: 'Pembacaan Tarot Mendalam', es: 'Lectura Profunda de Tarot' },
};
 
function parseSections(text: string): { heading: string; body: string }[] {
  const parts = text.split(/^###\s*/m).filter((p) => p.trim());
  return parts.map((p) => {
    const lines = p.split('\n');
    const heading = lines[0].trim();
    const body = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim();
    return { heading, body };
  });
}
 
function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const tokens = text.includes(' ') ? text.split(/(\s+)/) : text.split('');
  const lines: string[] = [];
  let current = '';
  for (const tok of tokens) {
    const test = current + tok;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current.trimEnd());
      current = tok.trimStart();
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionIdが必要です' });
    }
 
    // Stripe自身に支払い済みかどうかを必ず確認する
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'お支払いが確認できませんでした' });
    }
 
    const reportType = session.metadata?.productKey as ProductKey | undefined;
    if (!reportType || !REPORT_TITLES[reportType]) {
      return res.status(400).json({ error: '商品情報が見つかりません' });
    }
    const payload = JSON.parse(session.metadata?.payload || '{}');
    const lang = session.metadata?.lang || 'ja';
 
    const prompt = buildPdfPrompt(reportType, payload);
    const rawText = await callGeminiText(prompt, lang);
    const sections = parseSections(rawText);
    const title = REPORT_TITLES[reportType][lang] || REPORT_TITLES[reportType].ja;
 
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');
    const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Bold.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const boldFontBytes = fs.readFileSync(boldFontPath);
 
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);
 
    const PAGE_W = 595, PAGE_H = 842;
    const MARGIN = 55;
    const CONTENT_W = PAGE_W - MARGIN * 2;
 
    // ---- 表紙 ----
    const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);
    cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(0.09, 0.04, 0.16) });
    cover.drawRectangle({ x: 0, y: PAGE_H * 0.55, width: PAGE_W, height: PAGE_H * 0.45, color: rgb(0.2, 0.11, 0.35), opacity: 0.6 });
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * PAGE_W;
      const y = PAGE_H * 0.3 + Math.random() * PAGE_H * 0.65;
      cover.drawCircle({ x, y, size: 1 + Math.random() * 2, color: rgb(0.85, 0.75, 1), opacity: 0.5 + Math.random() * 0.4 });
    }
    cover.drawText('ADIKIO', { x: MARGIN, y: PAGE_H - 100, size: 16, font: boldFont, color: rgb(0.85, 0.8, 1) });
    const titleLines = wrapText(title, boldFont, 34, CONTENT_W);
    let ty = PAGE_H - 260;
    for (const line of titleLines) {
      cover.drawText(line, { x: MARGIN, y: ty, size: 34, font: boldFont, color: rgb(1, 1, 1) });
      ty -= 44;
    }
    const dateStr = new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US');
    cover.drawText(dateStr, { x: MARGIN, y: 90, size: 12, font, color: rgb(0.8, 0.75, 0.9) });
    cover.drawText('adikio.com/room', { x: MARGIN, y: 70, size: 11, font, color: rgb(0.7, 0.65, 0.85) });
 
    // ---- トリセツ・ダークサイドのみ：スコアのバー図解ページ ----
    if (reportType === 'trisetsu_darkside' && payload?.bars) {
      const barsPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
      barsPage.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(0.98, 0.97, 1) });
      barsPage.drawText('性格診断スコア', { x: MARGIN, y: PAGE_H - 80, size: 22, font: boldFont, color: rgb(0.2, 0.1, 0.35) });
      let by = PAGE_H - 140;
      const bars = payload.bars as { label: string; value: number }[];
      for (const b of bars) {
        barsPage.drawText(b.label, { x: MARGIN, y: by, size: 14, font: boldFont, color: rgb(0.15, 0.1, 0.25) });
        barsPage.drawText(`${b.value}%`, { x: PAGE_W - MARGIN - 40, y: by, size: 14, font: boldFont, color: rgb(0.15, 0.1, 0.25) });
        const trackY = by - 22;
        barsPage.drawRectangle({ x: MARGIN, y: trackY, width: CONTENT_W, height: 16, color: rgb(0.88, 0.85, 0.95) });
        const fillW = Math.max(16, (CONTENT_W * b.value) / 100);
        barsPage.drawRectangle({ x: MARGIN, y: trackY, width: fillW, height: 16, color: rgb(0.62, 0.42, 0.95) });
        by -= 80;
      }
    }
 
    // ---- 本文ページ ----
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(1, 1, 1) });
    let y = PAGE_H - 80;
    const bodySize = 11.5;
    const headingSize = 17;
    const lineHeight = 18;
 
    const ensureSpace = (needed: number) => {
      if (y - needed < 60) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(1, 1, 1) });
        y = PAGE_H - 80;
      }
    };
 
    for (const sec of sections) {
      ensureSpace(60);
      page.drawRectangle({ x: MARGIN, y: y - 6, width: 5, height: headingSize, color: rgb(0.55, 0.35, 0.9) });
      page.drawText(sec.heading, { x: MARGIN + 14, y: y - headingSize + 4, size: headingSize, font: boldFont, color: rgb(0.15, 0.08, 0.3) });
      y -= headingSize + 16;
 
      const lines = wrapText(sec.body, font, bodySize, CONTENT_W);
      for (const line of lines) {
        ensureSpace(lineHeight);
        page.drawText(line, { x: MARGIN, y, size: bodySize, font, color: rgb(0.2, 0.2, 0.2) });
        y -= lineHeight;
      }
      y -= 22;
    }
 
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="adikio-${reportType}.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('PDF生成エラー:', error);
    res.status(500).json({ error: 'PDFの生成に失敗しました' });
  }
}