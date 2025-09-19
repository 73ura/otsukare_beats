import type { NextApiRequest, NextApiResponse } from "next";
import { generateVoiceWithGoogleTTS } from "../../lib/fallback-tts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text } = req.body;
    const testText = text || "これはLINE音声テストです。正常に再生されますか？";

    console.log(`🎵 Debug audio generation: "${testText}"`);

    // 音声生成
    const { audioId, audioUrl } = await generateVoiceWithGoogleTTS(testText, 'female');

    // 音声データの詳細情報を取得
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioSize = audioBuffer.byteLength;

    console.log(`🔍 Audio debug info:
      - Audio ID: ${audioId}
      - Audio URL: ${audioUrl}
      - Audio Size: ${audioSize} bytes
      - Content-Type: ${audioResponse.headers.get('content-type')}
      - Status: ${audioResponse.status}
    `);

    res.status(200).json({
      success: true,
      debug: {
        audioId,
        audioUrl,
        audioSize,
        contentType: audioResponse.headers.get('content-type'),
        responseStatus: audioResponse.status,
        headers: Object.fromEntries(audioResponse.headers.entries())
      },
      message: "Audio debug info generated",
      testInstructions: [
        "1. Copy the audioUrl and test in browser",
        "2. Check if audio plays correctly",
        "3. Verify Content-Type and headers",
        "4. Test with LINE Bot if browser playback works"
      ]
    });

  } catch (error) {
    console.error("🚨 Debug audio error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Audio debug failed"
    });
  }
}
