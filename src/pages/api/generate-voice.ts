import type { NextApiRequest, NextApiResponse } from "next";
import { generateVoiceWithGoogleTTS } from "../../lib/fallback-tts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  try {
    const { text, voiceType } = req.body;

    // バリデーション
    if (!text || typeof text !== "string") {
      res.status(400).json({ 
        success: false, 
        message: "Text is required and must be a string" 
      });
      return;
    }

    // Google TTSは長文も対応可能（制限緩和）
    if (text.length > 5000) {
      res.status(400).json({ 
        success: false, 
        message: "Text must be 5000 characters or less" 
      });
      return;
    }

    // 音声タイプのバリデーション
    const voice = voiceType === 'male' ? 'male' : 'female';

    // Google TTS で音声生成（Vercel対応）
    const { audioId, audioUrl } = await generateVoiceWithGoogleTTS(text, voice);

    res.status(200).json({
      success: true,
      audioUrl: audioUrl,
      audioId: audioId,
      message: "Voice generated successfully with Google TTS",
      voiceType: voice
    });

  } catch (error) {
    console.error("Voice generation error:", error);
    res.status(500).json({
      success: false,
      message: "Voice generation failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
