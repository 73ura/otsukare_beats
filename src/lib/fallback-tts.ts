import fs from "fs";
import path from "path";

/**
 * Google Cloud Text-to-Speech API を使用した音声生成
 * 無料枠: 月400万文字
 */
export async function generateVoiceWithGoogleTTS(
  text: string,
  voiceType: 'male' | 'female' = 'female'
): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      throw new Error("Google TTS API key not found");
    }

    // 日本語音声の設定
    const voiceConfig = voiceType === 'female' 
      ? { languageCode: 'ja-JP', name: 'ja-JP-Wavenet-A', ssmlGender: 'FEMALE' }
      : { languageCode: 'ja-JP', name: 'ja-JP-Wavenet-C', ssmlGender: 'MALE' };

    const requestBody = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    // Base64デコードしてファイル保存
    const audioBuffer = Buffer.from(audioContent, 'base64');
    const fileName = await saveGoogleTTSAudioFile(audioBuffer);

    return fileName;
  } catch (error) {
    console.error("Google TTS error:", error);
    throw error;
  }
}

/**
 * Google TTSで生成された音声ファイルを保存
 */
async function saveGoogleTTSAudioFile(audioBuffer: Buffer): Promise<string> {
  try {
    // ファイル名生成（タイムスタンプ + ランダム）
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `google_tts_${timestamp}_${randomId}.mp3`;

    // 保存パス
    const audioDir = path.join(process.cwd(), "public", "audio");
    const filePath = path.join(audioDir, fileName);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // ファイル保存
    fs.writeFileSync(filePath, audioBuffer);

    return fileName;
  } catch (error) {
    console.error("Error saving Google TTS audio file:", error);
    throw error;
  }
}

/**
 * 利用可能な日本語音声一覧を取得
 */
export async function getGoogleTTSVoices() {
  try {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      throw new Error("Google TTS API key not found");
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}&languageCode=ja-JP`
    );

    if (!response.ok) {
      throw new Error(`Failed to get voices: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Google TTS voices:", error);
    throw error;
  }
}
