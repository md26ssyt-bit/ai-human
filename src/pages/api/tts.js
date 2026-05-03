function detectLang(text) {
  if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
  if (/[a-zA-Z]/.test(text)) return "en-US";
  return "ja-JP";
}
function getVoice(lang) {
  if (lang === "en-US") return { languageCode: "en-US", name: "en-US-Neural2-F" };
  if (lang === "zh-CN") return { languageCode: "zh-CN", name: "zh-CN-Standard-D" };
  // 日本語（デフォルト）
  return { languageCode: "ja-JP", name: "ja-JP-Neural2-B" };
}
export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const lang = detectLang(text);
    const voice = getVoice(lang);

    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: voice,
          audioConfig: {
            audioEncoding: "MP3"
          }
        }),
      }
    );

    const data = await ttsRes.json();

    console.log("TTS:", data);
    if (data.audioContent) {
    // base64 = バイナリ (Buffer) 変換
    const buffer = Buffer.from(data.audioContent, "base64");
    res.setHeader("Content-Type", "audio/mp3");
    return res.status(200).send(buffer);
    } else {
    // 失敗したらエラーを返す
    return res.status(500).json({ error: "No audioContent"});
    }
   

  } catch (error) {
    console.error("TTSエラー:", error);
    return res.status(500).json({ audioContent: null });
  }
}
