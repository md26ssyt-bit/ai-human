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

export default async function handler(req, res) {
  try {
        const { text, email, character } = req.body;  // ← character を追加

        // キャラクターごとの声（新規：占い・観光ページ用）
    const CHARACTER_VOICES = {
      woman: { name: "ja-JP-Neural2-B", pitch: 2.0, rate: 1.05 },   // 少し高め・明るめ
      man:   { name: "ja-JP-Chirp3-HD-Enceladus", pitch: -3.0, rate: 0.95 },  // 少し低め・落ち着いた感じ
      witch: { name: "ja-JP-Chirp3-HD-Gacrux", pitch: -5.0, rate: 0.9},   // 低めでゆっくり、個性を強調
    };

    // お客様の声設定を取得
    let voiceName = "ja-JP-Neural2-B";
    let pitch = 0;
    let speakingRate = 1.0;

    if (character && CHARACTER_VOICES[character]) {
      // 占い・観光ページから来た場合：キャラクターの声・音程・速さを使う
      voiceName = CHARACTER_VOICES[character].name;
      pitch = CHARACTER_VOICES[character].pitch;
      speakingRate = CHARACTER_VOICES[character].rate;
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

    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: voice,
          audioConfig: { audioEncoding: "MP3", pitch: pitch, speakingRate: speakingRate }
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
      return res.status(500).json({ error: "No audioContent", details: data });  // ← detailsを追加
    }

  } catch (error) {
    console.error("TTSエラー:", error);
    return res.status(500).json({ audioContent: null });
  }
}