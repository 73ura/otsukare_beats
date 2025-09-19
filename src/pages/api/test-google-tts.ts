import type { NextApiRequest, NextApiResponse } from "next";
import { generateVoiceWithGoogleTTS, getGoogleTTSVoices } from "../../lib/fallback-tts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // 利用可能な音声一覧を取得
    try {
      const voices = await getGoogleTTSVoices();
      res.status(200).json({
        success: true,
        voices: voices,
        message: "Available Google TTS voices"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get voices",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  if (req.method === "POST") {
    // テスト音声生成
    try {
      const { text, voiceType } = req.body;
      
      const testText = text || "こんにちは！Google Text-to-Speech のテストです。ラップも歌えますよ！";
      const voice = voiceType === 'male' ? 'male' : 'female';

      console.log(`Testing Google TTS with text: "${testText}" and voice: ${voice}`);

      const fileName = await generateVoiceWithGoogleTTS(testText, voice);

      res.status(200).json({
        success: true,
        audioUrl: `/audio/${fileName}`,
        fileName: fileName,
        message: "Google TTS test successful",
        voiceType: voice,
        textLength: testText.length
      });

    } catch (error) {
      console.error("Google TTS test error:", error);
      res.status(500).json({
        success: false,
        message: "Google TTS test failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  res.status(405).json({ success: false, message: "Method not allowed" });
}
