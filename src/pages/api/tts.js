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
// キャラクターごとの声設定（占い・観光ページ用、新規）
// 注意：
//   - Neural2 / Chirp3-HD は pitch（声の高さ）指定に対応していない
//   - pitch を使いたい場合は WaveNet 系の声にする必要がある
// ======================
const CHARACTER_VOICES = {
  woman: { name: "ja-JP-Neural2-B", rate: 1.05 },                 // 少し明るめのテンポ
  man: { name: "ja-JP-Neural2-C", rate: 0.95 },                   // 少し落ち着いたテンポ
  witch: { name: "ja-JP-Wavenet-A", rate: 0.9, pitch: -6.0 },     // 低めの声（WaveNetなのでpitch調整可）
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { text, email, character } = req.body;

    // お客様の声設定を取得
    let voiceName = "ja-JP-Neural2-B";
    let speakingRate = 1.0;
    let pitch; // 指定が無ければ undefined のまま（＝送らない）

    if (character && CHARACTER_VOICES[character]) {
      // 占い・観光ページから来た場合：キャラクターの声設定を使う
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

    const lang = detectLang(text);
    const voice = getVoice(lang, voiceName);

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