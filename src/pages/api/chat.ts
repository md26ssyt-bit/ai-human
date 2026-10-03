import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
 
// 無料枠の回数制限を書き込むための管理者権限クライアント（RLSをバイパス）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
 
// mode ごとの「無料枠グループ」と1日の上限回数
const FREE_LIMITS: Record<string, { group: string; limit: number }> = {
  free: { group: 'free', limit: 5 },
  counseling: { group: 'counseling', limit: 10 },
  fortune: { group: 'fortune_travel', limit: 8 },
  travel: { group: 'fortune_travel', limit: 8 },
};
 
function getClientIp(req: NextApiRequest): string {
  // Cloudflare経由の場合は、利用者本来のIPがこのヘッダーに入る
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.length > 0) {
    return cfIp.trim();
  }
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
 
// キャラクターごとの基本人格（全モード共通で適用）
const CHARACTER_PERSONAS: Record<string, string> = {
  witch:
    'あなたは100年の歴史を持つ魔女です。口調はミステリアスかつ優しく、' +
    'ユーザーの悩みに深く共感して回答してください。',
  woman:
    'あなたは穏やかで思いやりのある女性です。優しく親しみやすい口調で話してください。',
  man:
    'あなたは落ち着きがあり頼りがいのある男性です。誠実で安心感のある口調で話してください。',
};
 
// 女性・男性キャラクター限定の「激辛モード」（辛口・ドSな説教口調）
const SPICY_PERSONAS: Record<string, string> = {
  woman:
    'あなたは辛口でドSな女性です。話の要所で腕組みをするような強気な態度をとり、' +
    '遠慮のないズバズバした物言いでユーザーにお説教してください。' +
    'ただし本当に傷つけるような言葉や人格否定は絶対に使わず、' +
    'ユーモアのある憎めない毒舌に留め、最後にはちゃんと相手を思う気持ちが伝わるようにしてください。',
  man:
    'あなたは辛口でドSな男性です。腕組みをして見下ろすような強気な態度をとり、' +
    '遠慮のないズバズバした物言いでユーザーにお説教してください。' +
    'ただし本当に傷つけるような言葉や人格否定は絶対に使わず、' +
    'ユーモアのある憎めない毒舌に留め、最後にはちゃんと相手を思う気持ちが伝わるようにしてください。',
};
 
// 「自由に話す」モード限定：話し相手タイプ（プレミアム会員向け）
const TALK_STYLE_PROMPTS: Record<string, string> = {
  companion:
    'あなたはユーザーにやさしく寄り添う伴走者です。急かさず、ユーザーのペースに合わせて温かく話してください。',
  friend:
    'あなたはユーザーの親しい友達です。タメ口混じりのフランクな口調で、気楽に楽しく話してください。',
  senior:
    'あなたはユーザーの頼れる先輩です。経験を踏まえた的確なアドバイスを、頼もしい口調でしてください。',
  boss:
    'あなたはユーザーの仕事のできる上司です。てきぱきと要点を整理しつつ、時々励ましの言葉もかけてください。',
  junior:
    'あなたはユーザーの元気な後輩です。明るく元気いっぱいに、リアクション良く話してください。',
  grandpa:
    'あなたはユーザーをそっと見守るおじいちゃんです。ゆったりとした穏やかな口調で、多くを語らず静かに寄り添ってください。',
  auntie:
    'あなたはユーザーの世話好きなおばちゃんです。おせっかいなくらい親身に、世話焼きな口調で話してください。',
  cool:
    'あなたはユーザーに対してややツンとした態度の他人です。素っ気ない口調ですが、時折さりげない優しさを見せてください。',
};
 
// 選択されている言語に応じて、AIに必ずその言語で返答するよう指示する
const LANG_INSTRUCTIONS: Record<string, string> = {
  ja: '必ず日本語で答えてください。',
  en: 'Always respond in English.',
  zh: '请务必用中文回答。',
  id: 'Selalu jawab dalam Bahasa Indonesia.',
  es: 'Responde siempre en español.',
};
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
 
   try {
      const { message, email, mode, character, talkStyle, lang, characterMode, deviceId } = req.body;
 
    // 占術・性格診断詳細・占い/観光の詳細版は有料コンテンツなので、
    // 決済確認を行わないこのエンドポイントからの直接生成は許可しない
    // （正しい入口は /api/create-product-checkout → 決済 → /api/fulfill-purchase）
    const PAID_ONLY_MODES = new Set([
      'fortune_detail', 'travel_detail', 'astrology', 'numerology', 'four_pillars', 'tarot', 'personality_detail',
    ]);
    if (PAID_ONLY_MODES.has(mode)) {
      return res.status(403).json({ error: 'この内容は決済が必要です' });
    }
    const apiKey = process.env.GEMINI_API_KEY;
 
    // ====== 占い・観光・雑談・心の相談モード（新規）======
    // mode が送られてきた場合のみここで処理して返す。
    // mode が無い場合（＝今まで通りのキオスクからのリクエスト）は、
    // この if 文の中を通らず、下の既存ロジックへそのまま進む。
    if (mode) {
      const modePrompts: Record<string, string> = {
        fortune:
          'あなたは親しみやすい占い師兼性格診断士です。エンタメとして楽しく、' +
          '断定的すぎない優しい表現で診断してください。',
        fortune_detail:  
          'あなたは経験豊かな占い師兼性格診断士です。有料の詳細鑑定として、以下の構成で' +
          '踏み込んだ内容を鑑定してください。' +
          '①総合運（2文）②恋愛運（2文）③仕事運（2文）④健康運（1文）' +
          '⑤今週意識すると良い具体的な行動アドバイス（2文）。' +
          '全体で10〜13文程度、丁寧かつ前向きな言葉で伝えてください。',
        travel_detail:
           'あなたは日本の観光案内のプロです。有料の詳細プランとして、丸1日分の具体的な' +
          '観光プランを、①午前②昼食③午後④夕方以降の順で、移動手段や所要時間の目安も含めて' +
          '具体的に案内してください。全体で10〜13文程度で提案してください。',
        travel:
          'あなたは親しみやすい日本の観光案内ガイドです。ユーザーの興味や現在地に合わせて、' +
          'おすすめのスポットや過ごし方を気さくに提案してください。',
        free: 'あなたは気さくな会話相手です。自由に楽しく雑談してください。',
        personality_detail:
          'あなたは性格診断の専門家です。ユーザーのビッグファイブ性格診断のスコア（外向性・協調性・誠実性・情緒安定性・開放性、それぞれ%）が渡されます。' +
          'それぞれの数値から読み取れる性格の特徴を、良い面を中心に前向きに解説してください。' +
          '最後に「あなたの取扱説明書」として、周りの人がこの人とどう接するとうまくいくかのアドバイスを1文加えてください。' +
          '全体で8〜10文程度、断定しすぎずエンタメとして楽しめる口調で書いてください。',
        astrology:
          'あなたは経験豊かな西洋占星術師です。ユーザーの生年月日から太陽星座を割り出し、' +
          'その星座の性格的な特徴、今の時期の運勢、恋愛面・仕事面でのアドバイスを、' +
          '楽しく前向きな口調で鑑定してください。全体で8〜10文程度でまとめてください。' +
          'これはエンターテインメントとしての占いであり、科学的な予言ではないという前提で、断定しすぎない表現を使ってください。',
        numerology:
          'あなたは経験豊かな数秘術師です。ユーザーの生年月日から「ライフパスナンバー」を' +
          '計算し（生年月日の数字をすべて足し、2桁になったらさらに1桁になるまで足し合わせる。' +
          'ただし11・22・33はマスターナンバーとしてそのまま使う）、その数字が持つ意味、' +
          '性格的な傾向、今後意識するとよいことを楽しく前向きな口調で鑑定してください。' +
          '計算過程は省略せず簡潔に示し、全体で8〜10文程度でまとめてください。',
        four_pillars:
          'あなたは経験豊かな四柱推命の占い師です。ユーザーの生年月日（可能なら生まれた時間も）' +
          'から、大まかな命式の傾向を読み取り、性格的な特徴、今の運気の流れ、これから意識すると' +
          'よいことを、楽しく前向きな口調で鑑定してください。生まれた時間が分からない場合は、' +
          '日柱までの情報で分かる範囲の傾向として鑑定してください。全体で8〜10文程度でまとめてください。',
        tarot:
          'あなたは経験豊かなタロット占い師です。ユーザーが気にしていることを聞いたうえで、' +
          '大アルカナ22枚の中からランダムに2〜3枚のカードを選んだという設定で、カード名を明示し、' +
          'そのカードの意味を絡めながら、今伝えたいメッセージを鑑定してください。' +
          '楽しく前向きな口調で、全体で8〜10文程度でまとめてください。',
        counseling:
          'あなたは優しく話を聞く相談相手です。相手の気持ちを否定せず、' +
          '共感的に耳を傾けてください。ただし、あなたは医師でも臨床心理士でもないため、' +
          '診断や治療的な助言は行わないでください。深刻な悩みや長期化している問題については、' +
          '専門機関（心療内科、公認心理師など）への相談を自然な形で勧めてください。',
      };
      const modeSystemPrompt = modePrompts[mode] || modePrompts.free;
      const personaPrompt =
        characterMode === 'spicy' && SPICY_PERSONAS[character as string]
          ? SPICY_PERSONAS[character as string]
          : CHARACTER_PERSONAS[character as string] || '';
      const talkStylePrompt = mode === 'free' && talkStyle ? (TALK_STYLE_PROMPTS[talkStyle as string] || '') : '';
      const langInstruction = LANG_INSTRUCTIONS[lang as string] || LANG_INSTRUCTIONS.ja;
      const combinedSystemPrompt = [langInstruction, personaPrompt, talkStylePrompt, modeSystemPrompt].filter(Boolean).join(' ');
 
      // ====== サブスク会員かどうかを確認（会員なら無料枠チェックをスキップ）======
      let isPremiumMember = false;
      // メールは小文字に統一して照合する（大文字小文字の違いで会員と認識されない事故を防ぐ）
      const memberEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (memberEmail) {
        const { data: subData } = await supabaseAdmin
          .from('fortune_subscriptions')
          .select('status')
          .eq('email', memberEmail)
          .maybeSingle();
        if (subData?.status === 'active') {
          isPremiumMember = true;
        }
      }
 
      // ====== 無料枠 / プレミアム会員 それぞれの回数制限チェック ======
      // 詳細版（fortune_detail/travel_detail）は購入済み扱いなので対象外
            const limitConfig = FREE_LIMITS[mode];
      if (limitConfig) {
        // 1回分の利用を記録し、許可されたかを返す（チェック自体が失敗した場合は安全側に倒して許可）
        const checkUsage = async (identifier: string, groupName: string, limitCount: number): Promise<boolean> => {
          const { data: usageData, error: usageError } = await supabaseAdmin.rpc(
            'increment_fortune_usage',
            {
              p_identifier: identifier,
              p_mode_group: groupName,
              p_limit: limitCount,
            }
          );
          if (usageError) {
            console.error('利用回数チェックエラー:', usageError);
            return true;
          }
          return usageData?.[0]?.allowed !== false;
        };

        let allowed = true;
        let blockedGroup = limitConfig.group;

        if (isPremiumMember && memberEmail) {
          // プレミアム会員はメールアドレス単位で1日200回
          blockedGroup = 'premium_daily';
          allowed = await checkUsage(`premium:${memberEmail}`, 'premium_daily', 200);
        } else {
          const ip = getClientIp(req);
          const validDeviceId = typeof deviceId === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(deviceId);
          if (validDeviceId) {
            // 端末ごとにモード別の回数を数え、IPには大きめの上限（5倍）を別枠でかける
            allowed = await checkUsage(`device:${deviceId}`, limitConfig.group, limitConfig.limit);
            if (allowed) {
              allowed = await checkUsage(ip, `${limitConfig.group}_ip`, limitConfig.limit * 5);
            }
          } else {
            // 端末IDが無い場合は、従来どおりIPで厳しく数える
            allowed = await checkUsage(ip, limitConfig.group, limitConfig.limit);
          }
        }

        if (!allowed) {
          return res.status(200).json({
            reply: isPremiumMember
              ? '本日はたくさんお話しいただきました🌙 しばらくしてからまたお話ししましょう[EMOTION:neutral]'
              : '無料回数の上限に達しました。しばらくしてからまたお話ししましょう🌙 続きが気になる方はプレミアムプランもぜひ[EMOTION:neutral]',
            limitReached: true,
            modeGroup: blockedGroup,
          });
        }
      }
      // ====== ここまで ======
 
      const modeApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const modeResponse = await fetch(modeApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${combinedSystemPrompt}
必ず自然な会話文だけを返してください。
必ず3文以内で簡潔に答えてください。
返答の文章の最後に必ず[EMOTION:happy]か[EMOTION:sad]か[EMOTION:angry]か[EMOTION:surprised]か[EMOTION:neutral]のどれか1つだけを、文末に1回だけ付けてください（2つ以上付けないでください）。これは絶対に省略しないでください。
"reply:" や "回答:" などのラベルは絶対に出力しないでください。
ユーザー: ${message}`,
                },
              ],
            },
          ],
        }),
      });
 
      const modeData = await modeResponse.json();
      const modeRawText =
        modeData.candidates?.[0]?.content?.parts?.[0]?.text ?? '少しお待ちください';
      const modeReply = modeRawText
        .replace(/^reply[:：\s]*/i, '')
        .replace(/^回答[:：\s]*/i, '')
        .trim();
 
      return res.status(200).json({ reply: modeReply });
    }
    // ====== ここまで新規追加 ======
    let systemPrompt = 'あなたは企業受付AIです。丁寧にお客様をご案内してください。ユーザーが挨拶してきても挨拶を返さず、すぐに用件を聞いてください。例：「ご用件をお聞かせください」';
    let notifyEmail = process.env.NOTIFY_EMAIL;
    let companyName = '不明';
    let staffInfo = '';
    let customerId = '';
 
    if (email) {
      const { data } = await supabase
        .from('customers')
        .select('id, prompt, notify_email, company_name, greeting')
        .eq('email', email)
        .single();
      if (data?.prompt) systemPrompt = data.prompt;
      if (data?.notify_email) notifyEmail = data.notify_email;
      if (data?.company_name) companyName = data.company_name;
      if (data?.id) customerId = data.id;
     
      console.log("systemPrompt:", systemPrompt);
      console.log("greeting:", data?.greeting);
 
      if (customerId) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('name, email, phone')
          .eq('customer_id', customerId);
        if (staffData && staffData.length > 0) {
          staffInfo = staffData.map((s: any) => `${s.name}:${s.email}:${s.phone || ''}`).join(',');
        }
      }
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
必ず3文以内で簡潔に答えてください。
返答の文章の最後に必ず[EMOTION:happy]か[EMOTION:sad]か[EMOTION:angry]か[EMOTION:surprised]か[EMOTION:neutral]のどれか1つだけを、文末に1回だけ付けてください（2つ以上付けないでください）。これは絶対に省略しないでください。
"reply:" や "回答:" などのラベルは絶対に出力しないでください。
担当者一覧：${staffInfo || 'なし'}
もしユーザーが「伝えてください」「連絡してください」「呼んでください」などの伝言を依頼した場合は、返答の最後に必ず「[NOTIFY:担当者名:伝言内容]」という形式で伝言を追加してください。
例：「承知しました。田中様にご連絡いたします。[NOTIFY:田中:田中様への来客があります]」
もしユーザーが担当者を呼びたい場合は、返答の最後に「[CALL:担当者名:電話番号]」という形式も追加してください。
例：「田中様をお呼びします。[NOTIFY:田中:来客があります][CALL:田中:090-0000-0000]」
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
console.log("rawText:", rawText);  // ← 追加
    let reply = rawText
      .replace(/^reply[:：\s]*/i, '')
      .replace(/^回答[:：\s]*/i, '')
      .trim();
 
    const notifyMatch = reply.match(/\[NOTIFY:(.+?):(.+?)\]/);
    if (notifyMatch) {
      const staffName = notifyMatch[1];
      const notifyMessage = notifyMatch[2];
      reply = reply.replace(/\[NOTIFY:.+?\]/, '').trim();
 
      let targetEmail = notifyEmail;
      if (staffInfo) {
        const staffList = staffInfo.split(',');
        const found = staffList.find((s: string) => s.startsWith(staffName));
        if (found) targetEmail = found.split(':')[1];
      }
 
      try {
       const baseUrl = 'https://ai-human-eta.vercel.app';
  await fetch(`${baseUrl}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: notifyMessage,
      company: companyName,
      notifyEmail: targetEmail,
    }),
  });
} catch (e) {
  console.error('通知エラー:', e);
      }
    }
 
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('APIエラー:', error);
    return res.status(500).json({ reply: '通信エラーが発生しました' });
  }
}