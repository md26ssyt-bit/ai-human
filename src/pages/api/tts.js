import { createClient } from '@supabase/supabase-js';

// 費用の上限（環境変数で変えられる。設定がなければ、下の数字を使う）
//   TTS_MAX_CHARS：1回で読み上げる、最大の文字数
//   TTS_DAILY_LIMIT_PER_IP：1つのIPからの、1日の上限回数
//   TTS_DAILY_LIMIT_GLOBAL：全員の合計の、1日の上限回数（いちばん大事な天井）
const MAX_CHARS = Number(process.env.TTS_MAX_CHARS) || 250;
const LIMIT_PER_IP = Number(process.env.TTS_DAILY_LIMIT_PER_IP) || 300;
const LIMIT_GLOBAL = Number(process.env.TTS_DAILY_LIMIT_GLOBAL) || 600;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.length > 0) return cfIp.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// 1回分を数えて、許可されたかを返す。確認に失敗したときは、費用を守るため、許可しない（音声だけが止まる）
async function underLimit(identifier, group, limit) {
  try {
    const { data, error } = await admin().rpc('increment_fortune_usage', {
      p_identifier: identifier,
      p_mode_group: group,
      p_limit: limit,
    });
    if (error) {
      console.error('TTS回数チェックエラー:', error);
      return false;
    }
    return data?.[0]?.allowed !== false;
  } catch (e) {
    console.error('TTS回数チェック例外:', e);
    return false;
  }
}

function detectLang(text) {
  if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
  if (/[a-zA-Z]/.test(text)) return "en-US";
  return "ja-JP";
}

function getVoice(lang, voiceName) {
  if (lang === "en-US") return { languageCode: "en-US", name: "en-US-Neural2-F" };
  if (lang === "zh-CN") return { languageCode: "zh-CN", name: "zh-CN-Standard-D" };
  // 日本語：カスタム声があれば使う
  return { languageCode: "ja-JP", name: voiceName || "ja-JP-Neural2-B" };
}

// ======================
// 言語×キャラクターごとの声設定（占い・観光ページ用）
// 注意：
//   - Neural2 は pitch（声の高さ）指定に対応していない
//   - pitch を使いたい場合は WaveNet 系の声にする必要がある（魔女はどの言語もWaveNet）
//   - 中国語（普通話）の正式な言語コードは "zh-CN" ではなく "cmn-CN"
// ======================
const CHARACTER_VOICES = {
  ja: {
    woman: { languageCode: "ja-JP", name: "ja-JP-Neural2-B", rate: 1.05 },
    man: { languageCode: "ja-JP", name: "ja-JP-Neural2-C", rate: 0.95 },
    witch: { languageCode: "ja-JP", name: "ja-JP-Wavenet-A", rate: 0.9, pitch: -6.0 },
  },
  en: {
    woman: { languageCode: "en-US", name: "en-US-Neural2-F", rate: 1.05 },
    man: { languageCode: "en-US", name: "en-US-Neural2-D", rate: 0.95 },
    witch: { languageCode: "en-US", name: "en-US-Wavenet-C", rate: 0.9, pitch: -6.0 },
  },
  zh: {
    woman: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A", rate: 1.05 },
    man: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-B", rate: 0.95 },
    witch: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-D", rate: 0.9, pitch: -6.0 },
  },
  id: {
    woman: { languageCode: "id-ID", name: "id-ID-Wavenet-A", rate: 1.05 },
    man: { languageCode: "id-ID", name: "id-ID-Wavenet-B", rate: 0.95 },
    witch: { languageCode: "id-ID", name: "id-ID-Wavenet-D", rate: 0.9, pitch: -6.0 },
  },
  es: {
    woman: { languageCode: "es-ES", name: "es-ES-Neural2-A", rate: 1.05 },
    man: { languageCode: "es-ES", name: "es-ES-Neural2-B", rate: 0.95 },
    witch: { languageCode: "es-ES", name: "es-ES-Wavenet-C", rate: 0.9, pitch: -2.0 },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { text, email, character, lang } = req.body || {};

    // 入力の確認：文字がなければ、または、長すぎれば、断る（費用を守る）
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }
    if (text.length > MAX_CHARS) {
      return res.status(400).json({ error: 'text is too long' });
    }

    // 本番だけ、回数の上限をかける（手元の開発では、音声ファイルのまとめ作成のため、かけない）
    if (process.env.NODE_ENV === 'production') {
      const ip = getClientIp(req);
      const okIp = await underLimit(`tts:${ip}`, 'tts_ip', LIMIT_PER_IP);
      const okAll = okIp && (await underLimit('tts:global', 'tts_global', LIMIT_GLOBAL));
      if (!okIp || !okAll) {
        return res.status(429).json({ error: 'tts limit reached' });
      }
    }

    let voice;
    let speakingRate = 1.0;
    let pitch; // 指定が無ければ undefined のまま（＝送らない）

    // lang が日本語以外で送られてきて、対応表にあればそちらを使う。
    // それ以外（lang未指定、または"ja"）は今まで通り日本語のキャラクター音声を使う。
    const effectiveLang = (lang && CHARACTER_VOICES[lang]) ? lang : 'ja';

    if (character && CHARACTER_VOICES[effectiveLang][character]) {
      // 占い・観光ページから来た場合：キャラクター＋言語に応じた声を使う
      const cv = CHARACTER_VOICES[effectiveLang][character];
      voice = { languageCode: cv.languageCode, name: cv.name };
      speakingRate = cv.rate ?? 1.0;
      pitch = cv.pitch;
    } else if (email) {
      // キオスクから来た場合：今まで通り店舗ごとの声設定を使う
      let voiceName = "ja-JP-Neural2-B";
      const { data: customer } = await admin()
        .from('customers')
        .select('voice_name')
        .eq('email', email)
        .single();
      if (customer?.voice_name) voiceName = customer.voice_name;

      const detected = detectLang(text);
      voice = getVoice(detected, voiceName);
    } else {
      // それ以外（character・emailどちらも無い場合）
      const detected = detectLang(text);
      voice = getVoice(detected, "ja-JP-Neural2-B");
    }

    // audioConfig を組み立てる。
    // pitch は WaveNet 系の声にのみ付与する（Neural2 はエラーになるため）
    const audioConfig = { audioEncoding: "MP3", speakingRate };
    if (pitch !== undefined && voice.name.includes("Wavenet")) {
      audioConfig.pitch = pitch;
    }

    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: voice,
          audioConfig: audioConfig,
        }),
      }
    );

    const data = await ttsRes.json();

    if (data.audioContent) {
      const buffer = Buffer.from(data.audioContent, "base64");
      res.setHeader("Content-Type", "audio/mp3");
      return res.status(200).send(buffer);
    } else {
      console.error("TTS詳細エラー:", JSON.stringify(data));
      return res.status(500).json({ error: "No audioContent", details: data });
    }

  } catch (error) {
    console.error("TTSエラー:", error);
    return res.status(500).json({ audioContent: null });
  }
}