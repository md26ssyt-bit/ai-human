import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
 
const LANG_INSTRUCTIONS: Record<string, string> = {
  ja: '必ず日本語で書いてください。',
  en: 'Write everything in English.',
  zh: '请务必用中文书写。',
  id: 'Tulis semuanya dalam Bahasa Indonesia.',
  es: 'Escribe todo en español.',
};
 
type ReportType = 'occult_yearly' | 'travel_plan' | 'trisetsu_darkside' | 'tarot_deep';
 
const REPORT_TITLES: Record<ReportType, Record<string, string>> = {
  occult_yearly: { ja: '年間鑑定書', en: 'Yearly Fortune Report', zh: '年度运势鉴定书', id: 'Laporan Ramalan Tahunan', es: 'Informe de Fortuna Anual' },
  travel_plan: { ja: '観光プランシート', en: 'Travel Plan Sheet', zh: '观光行程方案', id: 'Rencana Perjalanan Wisata', es: 'Plan de Viaje' },
  trisetsu_darkside: { ja: 'あなたの取扱説明書', en: 'Your Instruction Manual', zh: '你的使用说明书', id: 'Buku Panduan Dirimu', es: 'Tu Manual de Instrucciones' },
  tarot_deep: { ja: 'タロット本格鑑定書', en: 'In-Depth Tarot Reading', zh: '深度塔罗鉴定书', id: 'Pembacaan Tarot Mendalam', es: 'Lectura Profunda de Tarot' },
};
 
function buildPrompt(reportType: ReportType, payload: any): string {
  if (reportType === 'occult_yearly') {
    return `あなたは経験豊かな占い師です。生年月日「${payload.birthdate}」の方について、西洋占星術・数秘術・四柱推命の3つの観点を踏まえ、今日から向こう1年間の運勢を鑑定してください。
以下の見出しをそのまま使い、各見出しの後に4〜6文程度で書いてください（見出しは「### 」で始めてください）。
### 全体運
### 恋愛運
### 仕事運
### 金運
### ラッキーアイテム・ラッキーカラー
断定しすぎず、前向きで楽しい口調で、エンターテインメントとしての占いとして書いてください。`;
  }
  if (reportType === 'travel_plan') {
    return `あなたは日本の観光案内のプロです。ユーザーが伝えた希望「${payload.request || '特になし。おすすめで'}」をもとに、1日分の具体的な観光プランを作成してください。
以下の見出しをそのまま使ってください（見出しは「### 」で始めてください）。
### 午前
### 昼食
### 午後
### 夕方以降
### 移動のヒント
各見出しごとに、具体的なスポット名・目安の滞在時間・移動手段や所要時間の目安を含めて4〜6文程度でまとめてください。`;
  }
  if (reportType === 'trisetsu_darkside') {
    return `あなたは性格診断の専門家です。ビッグファイブ性格診断のスコア（${payload.scoresText}）をもとに、以下の見出しをそのまま使ってまとめてください（見出しは「### 」で始めてください）。
### あなたの取扱説明書
（周りの人がこの人とどう接するとうまくいくか、具体的なアドバイスを5〜7文で）
### 性格の光の面
（強み・長所を前向きに4〜6文で）
### 性格の闇（ダークサイド）
（ストレスがかかったときに出やすい行動傾向や気をつけたい点を、傷つけないやわらかい表現で4〜6文で。断定しすぎず、あくまでエンターテインメントとしての診断であることが伝わる書き方にしてください）
### 相性の良いタイプ・気をつけたいタイプ
（4〜6文で）`;
  }
  return `あなたは経験豊かなタロット占い師です。ユーザーが気にしていること「${payload.concern || '（特になし。全体的な運勢について）'}」について、大アルカナ22枚の中から3枚（①現状②障害・課題③今後の展開）を引いたという設定で、本格的な鑑定書を作成してください。
以下の見出しをそのまま使ってください（見出しは「### 」で始めてください）。
### 1枚目：現状（カード名を明記）
### 2枚目：障害・課題（カード名を明記）
### 3枚目：今後の展開（カード名を明記）
### 総合メッセージ
各見出しごとに、カードの意味を絡めながら4〜6文程度で、楽しく前向きな口調でまとめてください。「総合メッセージ」は3枚のつながりを踏まえた締めくくりにしてください。`;
}
 
async function callGemini(prompt: string, lang: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.ja;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${langInstruction}\n${prompt}` }] }],
    }),
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
 
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
    const { reportType, payload, lang } = req.body as { reportType: ReportType; payload: any; lang: string };
    if (!reportType || !REPORT_TITLES[reportType]) {
      return res.status(400).json({ error: 'reportTypeが不正です' });
    }
 
    const prompt = buildPrompt(reportType, payload || {});
    const rawText = await callGemini(prompt, lang || 'ja');
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
    // 光の粒（装飾）
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * PAGE_W;
      const y = PAGE_H * 0.3 + Math.random() * PAGE_H * 0.65;
      cover.drawCircle({ x, y, size: 1 + Math.random() * 2, color: rgb(0.85, 0.75, 1), opacity: 0.5 + Math.random() * 0.4 });
    }
    cover.drawText('ADIKIO', {
      x: MARGIN, y: PAGE_H - 100, size: 16, font: boldFont, color: rgb(0.85, 0.8, 1),
    });
    const titleLines = wrapText(title, boldFont, 34, CONTENT_W);
    let ty = PAGE_H - 260;
    for (const line of titleLines) {
      cover.drawText(line, { x: MARGIN, y: ty, size: 34, font: boldFont, color: rgb(1, 1, 1) });
      ty -= 44;
    }
    const dateStr = new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US');
    cover.drawText(dateStr, { x: MARGIN, y: 90, size: 12, font, color: rgb(0.8, 0.75, 0.9) });
    cover.drawText('adikio.com/fortune', { x: MARGIN, y: 70, size: 11, font, color: rgb(0.7, 0.65, 0.85) });
 
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
 