/**
 * Google Cloud Text-to-Speech API を使用した音声生成
 * 無料枠: 月400万文字
 * Vercel対応：ファイル保存なしで直接音声データを返す
 */
export async function generateVoiceWithGoogleTTS(
  text: string,
  voiceType: 'male' | 'female' = 'female'
): Promise<{ audioId: string; audioUrl: string }> {
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

    // Base64デコードして音声バッファを作成
    const audioBuffer = Buffer.from(audioContent, 'base64');
    
    // メモリキャッシュに保存してIDを取得
    const { storeAudioInCache } = await import('../pages/api/audio/[id]');
    const audioId = storeAudioInCache(audioBuffer, 'audio/mpeg');
    
    // 音声URLを生成
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const audioUrl = `${baseUrl}/api/audio/${audioId}`;

    return { audioId, audioUrl };
  } catch (error) {
    console.error("Google TTS error:", error);
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
