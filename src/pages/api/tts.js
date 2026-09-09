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
};
 
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
 
  try {
    const { text, email, character, lang } = req.body;
 
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
      // キオスクから来た場合：今まで通り店舗ごとの声設定を使う（一切変更なし）
      let voiceName = "ja-JP-Neural2-B";
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