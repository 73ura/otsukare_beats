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
        audioEncoding: 'LINEAR16', // WAVフォーマット（LINEでより互換性が高い）
        sampleRateHertz: 16000, // 16kHz（LINE推奨）
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
    
    // 一時的な解決策：Base64データURLとして直接返す（テスト用）
    const base64Audio = `data:audio/mpeg;base64,${audioContent}`;
    
    // Cloudinary等の外部ストレージを使用する場合はここで実装
    // const audioUrl = await uploadToCloudinary(audioBuffer);
    
    // 現在は一時的にVercelのtmpディレクトリを使用（テスト用）
    const audioId = generateAudioId();
    const audioUrl = await createTemporaryAudioUrl(audioBuffer, audioId);

    return { audioId, audioUrl };
  } catch (error) {
    console.error("Google TTS error:", error);
    throw error;
  }
}


// 一時的な音声ID生成
function generateAudioId(): string {
  const timestamp = Date.now().toString(36);
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomId}`;
}

// 一時的な音声URL生成（Vercelの/tmpディレクトリ使用）
async function createTemporaryAudioUrl(audioBuffer: Buffer, audioId: string): Promise<string> {
  // WAVヘッダーを追加してWAVファイルを作成
  const wavBuffer = addWavHeader(audioBuffer, 16000, 1, 16);
  
  // メモリキャッシュに保存してIDを取得
  const { storeAudioInCache } = await import('../pages/api/audio/[id]');
  storeAudioInCache(wavBuffer, 'audio/wav');
  
  // 音声URLを生成
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  return `${baseUrl}/api/audio/${audioId}`;
}

// WAVヘッダーを追加する関数
function addWavHeader(audioBuffer: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const dataSize = audioBuffer.length;
  const fileSize = 36 + dataSize;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  
  return Buffer.concat([header, audioBuffer]);
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
