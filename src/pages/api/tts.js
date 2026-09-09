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
// キャラクターごとの声設定（占い・観光ページ用）
// 注意：
//   - Neural2 / Chirp3-HD は pitch（声の高さ）指定に対応していない
//   - pitch を使いたい場合は WaveNet 系の声にする必要がある
//   - これらは日本語専用の声です（英語・中国語・インドネシア語では使われません）
// ======================
const CHARACTER_VOICES = {
  woman: { name: "ja-JP-Neural2-B", rate: 1.05 },                 // 少し明るめのテンポ
  man: { name: "ja-JP-Neural2-C", rate: 0.95 },                   // 少し落ち着いたテンポ
  witch: { name: "ja-JP-Wavenet-A", rate: 0.9, pitch: -6.0 },     // 低めの声（WaveNetなのでpitch調整可）
};

// ======================
// 占い・観光ページから明示的に送られてくる言語（lang）ごとの声設定（新規）
// 正しい言語コードに注意：中国語（普通話）は "zh-CN" ではなく "cmn-CN" が正式なコードです
// ======================
const LANG_VOICE_MAP = {
  en: { languageCode: "en-US", name: "en-US-Neural2-F" },
  zh: { languageCode: "cmn-CN", name: "cmn-CN-Standard-D" },
  id: { languageCode: "id-ID", name: "id-ID-Wavenet-A" },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { text, email, character, lang } = req.body; // ← lang を新規で受け取る

    // お客様の声設定を取得
    let voiceName = "ja-JP-Neural2-B";
    let speakingRate = 1.0;
    let pitch; // 指定が無ければ undefined のまま（＝送らない）

    if (character && CHARACTER_VOICES[character]) {
      // 占い・観光ページから来た場合：キャラクターの声設定を使う（日本語向け）
      const cv = CHARACTER_VOICES[character];
      voiceName = cv.name;
      speakingRate = cv.rate ?? 1.0;
      pitch = cv.pitch;
    } else if (email) {
      // キオスクから来た場合：今まで通り店舗ごとの声設定を使う
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: customer } = await supabase
        .from('customers')
        .select('voice_name')
        .eq('email', email)
        .single();
      if (customer?.voice_name) voiceName = customer.voice_name;
    }

    let voice;
    if (lang && lang !== 'ja' && LANG_VOICE_MAP[lang]) {
      // 占い・観光ページから、日本語以外の言語が明示的に指定された場合はこちらを優先
      // （文章の文字種だけでは英語とインドネシア語を区別できないため、明示的な指定が必要）
      voice = LANG_VOICE_MAP[lang];
    } else {
      // それ以外（キオスク、または占い・観光ページで日本語の場合）は、今まで通りの判定
      const detected = detectLang(text);
      voice = getVoice(detected, voiceName);
    }

    // audioConfig を組み立てる。
    // pitch は WaveNet 系の声にのみ付与する（Neural2 / Chirp3-HD はエラーになるため）
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
