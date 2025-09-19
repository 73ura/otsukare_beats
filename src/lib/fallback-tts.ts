/**
 * Google Cloud Text-to-Speech API を使用した音声生成
 * 無料枠: 月400万文字
 * Vercel対応：ファイル保存なしで直接音声データを返す
 */
export async function generateVoiceWithGoogleTTS(
  text: string,
  voiceType: 'male' | 'female' = 'female'
): Promise<{ audioId: string; audioUrl: string; duration: number }> {
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
        effectsProfileId: ['telephony-class-application'], // LINE音声通話品質
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: -2.0 // 少し音量を下げる（LINE推奨）
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

    // Base64デコードして音声バッファを作成（MP3形式）
    const audioBuffer = Buffer.from(audioContent, 'base64');
    
    // 音声の長さを推定（日本語の読み上げ速度を考慮）
    // 日本語：約5文字/秒 = 200ms/文字、Google TTSは少し早めなので150ms/文字
    const estimatedDuration = Math.max(2000, text.length * 150); // 最低2秒、文字数×150ms
    
    // Vercelの/tmpディレクトリにMP3ファイルを保存
    const audioId = generateAudioId();
    const audioUrl = await saveAudioToTemp(audioBuffer, audioId);

    return { audioId, audioUrl, duration: estimatedDuration };
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

// VOICEVOXと同じ形式でファイル名を生成して保存
async function saveAudioToTemp(audioBuffer: Buffer, audioId: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // VOICEVOXと同じファイル名形式を使用
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const randomId = Math.random().toString(36).substring(2, 8);
  const fileName = `voice_${timestamp}_${randomId}.mp3`;  // VOICEVOXと同じパターン
  
  // /tmpディレクトリに保存
  const filePath = path.join('/tmp', fileName);
  await fs.writeFile(filePath, audioBuffer);
  
  // 音声URLを生成（VOICEVOXと同じパス形式）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  return `${baseUrl}/api/audio-file/${fileName}`;
}

// WAVヘッダーを追加する関数（LINE互換性重視）
function addWavHeader(audioBuffer: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const dataSize = audioBuffer.length;
  const fileSize = 36 + dataSize;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0, 4, 'ascii');
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8, 4, 'ascii');
  
  // fmt chunk
  header.write('fmt ', 12, 4, 'ascii');
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  header.write('data', 36, 4, 'ascii');
  header.writeUInt32LE(dataSize, 40);
  
  console.log(`🎵 WAV created: ${dataSize} bytes data, ${fileSize} bytes total`);
  
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
