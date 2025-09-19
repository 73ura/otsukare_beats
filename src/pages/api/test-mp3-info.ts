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
    const testText = text || "短いテストです";

    console.log(`🔍 Testing MP3 info for: "${testText}" (${testText.length} chars)`);

    // 音声生成
    const { audioId, audioUrl, duration } = await generateVoiceWithGoogleTTS(testText, 'female');

    // 実際のMP3ファイルを取得
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioSize = audioBuffer.byteLength;

    // MP3の基本情報を推定
    const estimatedBitrate = 32; // kbps (Google TTS default)
    const estimatedActualDuration = (audioSize * 8) / (estimatedBitrate * 1000) * 1000; // ms

    console.log(`🎵 MP3 Analysis:
      - Text: "${testText}" (${testText.length} chars)
      - Calculated duration: ${duration}ms (${duration/1000}s)
      - File size: ${audioSize} bytes
      - Estimated actual duration: ${estimatedActualDuration.toFixed(0)}ms (${(estimatedActualDuration/1000).toFixed(1)}s)
      - Estimated bitrate: ${estimatedBitrate}kbps
    `);

    res.status(200).json({
      success: true,
      analysis: {
        text: testText,
        textLength: testText.length,
        calculatedDuration: duration,
        calculatedDurationSeconds: duration / 1000,
        fileSize: audioSize,
        estimatedActualDuration: Math.round(estimatedActualDuration),
        estimatedActualDurationSeconds: Math.round(estimatedActualDuration / 100) / 10,
        estimatedBitrate: estimatedBitrate,
        audioUrl: audioUrl,
        recommendations: {
          durationAccuracy: Math.abs(duration - estimatedActualDuration) < 1000 ? "Good" : "Needs adjustment",
          fileSizeOK: audioSize < 10 * 1024 * 1024 ? "OK" : "Too large",
          lineCompatible: audioSize < 10 * 1024 * 1024 && estimatedActualDuration < 60000 ? "Should work" : "May have issues"
        }
      }
    });

  } catch (error) {
    console.error("🚨 MP3 info test error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
