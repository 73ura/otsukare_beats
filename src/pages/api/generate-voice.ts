import { NextApiRequest, NextApiResponse } from "next";
import {
  VoiceGenerationRequest,
  VoiceGenerationResponse,
} from "../../types/voice";
import { generateVoiceFile } from "../../lib/voicevox";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VoiceGenerationResponse>
) {
  // POSTメソッドのみ許可
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use POST.",
    });
  }

  try {
    // リクエストボディの検証
    const { text, speaker, speed, pitch, volume }: VoiceGenerationRequest =
      req.body;

    // バリデーション
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text is required and must be a string.",
      });
    }

    if (!speaker || typeof speaker !== "number") {
      return res.status(400).json({
        success: false,
        message: "Speaker ID is required and must be a number.",
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Text must be 500 characters or less.",
      });
    }

    // 音声ファイル生成
    const fileName = await generateVoiceFile({
      text,
      speaker,
      speed: speed || 1.0,
      pitch: pitch || 0.0,
      volume: volume || 1.0,
    });

    // 成功レスポンス
    return res.status(200).json({
      success: true,
      audioUrl: `/audio/${fileName}`,
      audioPath: `public/audio/${fileName}`,
      fileName,
      message: "Voice generated successfully",
    });
  } catch (error) {
    console.error("Error in generate-voice API:", error);

    // エラーレスポンス
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
