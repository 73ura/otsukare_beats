import type { NextApiRequest, NextApiResponse } from "next";
import { generateVoiceFile } from "../../lib/voicevox";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  try {
    const { text, speaker, speed, pitch, volume } = req.body;

    // バリデーション
    if (!text || typeof text !== "string") {
      res.status(400).json({ 
        success: false, 
        message: "Text is required and must be a string" 
      });
      return;
    }

    if (!speaker || typeof speaker !== "number" || speaker < 1 || speaker > 109) {
      res.status(400).json({ 
        success: false, 
        message: "Speaker must be a number between 1 and 109" 
      });
      return;
    }

    if (text.length > 500) {
      res.status(400).json({ 
        success: false, 
        message: "Text must be 500 characters or less" 
      });
      return;
    }

    // VOICEVOX音声生成
    const fileName = await generateVoiceFile({
      text,
      speaker,
      speed: speed || 1.0,
      pitch: pitch || 0.0,
      volume: volume || 1.0,
    });

    res.status(200).json({
      success: true,
      audioUrl: `/audio/${fileName}`,
      fileName: fileName,
      message: "Voice generated successfully"
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
