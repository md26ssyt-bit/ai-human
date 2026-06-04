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
    const { text, email } = req.body;  // ← emailを受け取る

    // お客様の声設定を取得
    let voiceName = "ja-JP-Neural2-B";
    if (email) {
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
          audioConfig: { audioEncoding: "MP3" }
        }),
      }
    );

    const data = await ttsRes.json();

    if (data.audioContent) {
      const buffer = Buffer.from(data.audioContent, "base64");
      res.setHeader("Content-Type", "audio/mp3");
      return res.status(200).send(buffer);
    } else {
      return res.status(500).json({ error: "No audioContent" });
    }

  } catch (error) {
    console.error("TTSエラー:", error);
    return res.status(500).json({ audioContent: null });
  }
}