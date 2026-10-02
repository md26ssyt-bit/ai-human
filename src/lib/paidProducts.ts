// ============================================================
// 有料コンテンツの「本当の価格」と「生成プロンプト」を一元管理する
// サーバー専用モジュール（src/pages/api/ からのみ import すること）
//
// これまでは金額をブラウザ側から送らせていたため、開発者ツール等で
// 改ざんされる恐れがあった。ここで定義した価格・内容だけを信用する。
// ============================================================
 
export type ProductKey =
  | 'fortune_detail'
  | 'travel_detail'
  | 'astrology'
  | 'numerology'
  | 'four_pillars'
  | 'tarot'
  | 'personality_detail'
  | 'occult_yearly'
  | 'travel_plan'
  | 'trisetsu_darkside'
  | 'tarot_deep';
 
export const PDF_PRODUCTS: ProductKey[] = ['occult_yearly', 'travel_plan', 'trisetsu_darkside', 'tarot_deep'];
 
export const PRODUCT_PRICES: Record<ProductKey, { jpy: number; usd: number }> = {
  fortune_detail: { jpy: 300, usd: 299 },
  travel_detail: { jpy: 400, usd: 399 },
  astrology: { jpy: 100, usd: 100 },
  numerology: { jpy: 100, usd: 100 },
  four_pillars: { jpy: 100, usd: 100 },
  tarot: { jpy: 100, usd: 100 },
  personality_detail: { jpy: 100, usd: 100 },
  occult_yearly: { jpy: 3000, usd: 2000 },
  travel_plan: { jpy: 1000, usd: 700 },
  trisetsu_darkside: { jpy: 2000, usd: 1300 },
  tarot_deep: { jpy: 2000, usd: 1300 },
};
 
export const PRODUCT_LABELS: Record<ProductKey, string> = {
  fortune_detail: '占い詳細版',
  travel_detail: '観光詳細版',
  astrology: '西洋占星術',
  numerology: '数秘術',
  four_pillars: '四柱推命',
  tarot: 'タロット',
  personality_detail: '性格診断（詳細結果）',
  occult_yearly: '年間鑑定書',
  travel_plan: '観光プランシート',
  trisetsu_darkside: 'あなたの取扱説明書',
  tarot_deep: 'タロット本格鑑定書',
};
 
export const LANG_INSTRUCTIONS: Record<string, string> = {
  ja: '必ず日本語で答えてください。',
  en: 'Always respond in English.',
  zh: '请务必用中文回答。',
  id: 'Selalu jawab dalam Bahasa Indonesia.',
  es: 'Responde siempre en español.',
};
 
// チャット形式（1回の返答）で提供する商品のプロンプトを組み立てる
export function buildChatPrompt(productKey: ProductKey, payload: any): string {
  switch (productKey) {
    case 'fortune_detail':
      return (
        'あなたは経験豊かな占い師です。有料の詳細プランとして、これまでの会話を踏まえ、' +
        `直前の質問「${payload.question || ''}」について、より深く具体的に占ってください。` +
        '全体で8〜10文程度でまとめてください。'
      );
    case 'travel_detail':
      return (
        'あなたは日本の観光案内のプロです。有料の詳細プランとして、丸1日分の具体的な' +
        `観光プラン（希望：「${payload.question || ''}」）を、①午前②昼食③午後④夕方以降の順で、` +
        '移動手段や所要時間の目安も含めて具体的に案内してください。全体で10〜13文程度で提案してください。'
      );
    case 'astrology':
      return (
        'あなたは経験豊かな西洋占星術師です。ユーザーの生年月日' +
        `「${payload.birthdate}」から太陽星座を割り出し、その星座の性格的な特徴、今の時期の運勢、` +
        '恋愛面・仕事面でのアドバイスを、楽しく前向きな口調で鑑定してください。全体で8〜10文程度でまとめてください。' +
        'これはエンターテインメントとしての占いであり、断定しすぎない表現を使ってください。'
      );
    case 'numerology':
      return (
        'あなたは経験豊かな数秘術師です。ユーザーの生年月日' +
        `「${payload.birthdate}」から「ライフパスナンバー」を計算し（生年月日の数字をすべて足し、` +
        '2桁になったらさらに1桁になるまで足し合わせる。ただし11・22・33はマスターナンバーとしてそのまま使う）、' +
        'その数字が持つ意味、性格的な傾向、今後意識するとよいことを楽しく前向きな口調で鑑定してください。' +
        '計算過程は省略せず簡潔に示し、全体で8〜10文程度でまとめてください。'
      );
    case 'four_pillars':
      return (
        'あなたは経験豊かな四柱推命の占い師です。ユーザーの生年月日' +
        `「${payload.birthdate}」から、大まかな命式の傾向を読み取り、性格的な特徴、今の運気の流れ、` +
        'これから意識するとよいことを、楽しく前向きな口調で鑑定してください。全体で8〜10文程度でまとめてください。'
      );
    case 'tarot':
      return (
        'あなたは経験豊かなタロット占い師です。ユーザーが気にしていること' +
        `「${payload.concern || '（特になし。全体的な運勢について）'}」を踏まえたうえで、` +
        '大アルカナ22枚の中からランダムに2〜3枚のカードを選んだという設定で、カード名を明示し、' +
        'そのカードの意味を絡めながら、今伝えたいメッセージを鑑定してください。' +
        '楽しく前向きな口調で、全体で8〜10文程度でまとめてください。'
      );
    case 'personality_detail':
      return (
        'あなたは性格診断の専門家です。ユーザーのビッグファイブ性格診断のスコア' +
        `（${payload.scoresText}）をもとに、それぞれの数値から読み取れる性格の特徴を、` +
        '良い面を中心に前向きに解説してください。最後に「あなたの取扱説明書」として、' +
        '周りの人がこの人とどう接するとうまくいくかのアドバイスを1文加えてください。' +
        '全体で8〜10文程度、断定しすぎずエンタメとして楽しめる口調で書いてください。'
      );
    default:
      return '';
  }
}
 
// PDF形式で提供する商品のプロンプトを組み立てる（generate-report-pdf.tsから利用）
export function buildPdfPrompt(productKey: ProductKey, payload: any): string {
  switch (productKey) {
    case 'occult_yearly':
      return `あなたは経験豊かな占い師です。生年月日「${payload.birthdate}」の方について、西洋占星術・数秘術・四柱推命の3つの観点を踏まえ、今日から向こう1年間の運勢を鑑定してください。
以下の見出しをそのまま使い、各見出しの後に4〜6文程度で書いてください（見出しは「### 」で始めてください）。
### 全体運
### 恋愛運
### 仕事運
### 金運
### ラッキーアイテム・ラッキーカラー
断定しすぎず、前向きで楽しい口調で、エンターテインメントとしての占いとして書いてください。`;
    case 'travel_plan':
      return `あなたは日本の観光案内のプロです。ユーザーが伝えた希望「${payload.request || '特になし。おすすめで'}」をもとに、1日分の具体的な観光プランを作成してください。
以下の見出しをそのまま使ってください（見出しは「### 」で始めてください）。
### 午前
### 昼食
### 午後
### 夕方以降
### 移動のヒント
各見出しごとに、具体的なスポット名・目安の滞在時間・移動手段や所要時間の目安を含めて4〜6文程度でまとめてください。`;
    case 'trisetsu_darkside':
      return `あなたは性格診断の専門家です。ビッグファイブ性格診断のスコア（${payload.scoresText}）をもとに、以下の見出しをそのまま使ってまとめてください（見出しは「### 」で始めてください）。
### あなたの取扱説明書
（周りの人がこの人とどう接するとうまくいくか、具体的なアドバイスを5〜7文で）
### 性格の光の面
（強み・長所を前向きに4〜6文で）
### 性格の闇（ダークサイド）
（ストレスがかかったときに出やすい行動傾向や気をつけたい点を、傷つけないやわらかい表現で4〜6文で。断定しすぎず、あくまでエンターテインメントとしての診断であることが伝わる書き方にしてください）
### 相性の良いタイプ・気をつけたいタイプ
（4〜6文で）`;
    case 'tarot_deep':
      return `あなたは経験豊かなタロット占い師です。ユーザーが気にしていること「${payload.concern || '（特になし。全体的な運勢について）'}」について、大アルカナ22枚の中から3枚（①現状②障害・課題③今後の展開）を引いたという設定で、本格的な鑑定書を作成してください。
以下の見出しをそのまま使ってください（見出しは「### 」で始めてください）。
### 1枚目：現状（カード名を明記）
### 2枚目：障害・課題（カード名を明記）
### 3枚目：今後の展開（カード名を明記）
### 総合メッセージ
各見出しごとに、カードの意味を絡めながら4〜6文程度で、楽しく前向きな口調でまとめてください。「総合メッセージ」は3枚のつながりを踏まえた締めくくりにしてください。`;
    default:
      return '';
  }
}
 
export async function callGeminiText(prompt: string, lang: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.ja;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: `${langInstruction}\n${prompt}` }] }] }),
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
 