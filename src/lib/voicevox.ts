import fs from "fs";
import path from "path";
import { VoicevoxAudioQuery, VoiceGenerationRequest } from "../types/voice";

// VOICEVOX API のベースURL（環境変数から取得、デフォルトはlocalhost:50021）
const VOICEVOX_BASE_URL = process.env.VOICEVOX_BASE_URL || "http://localhost:50021";

/**
 * VOICEVOX APIでテキストから音声クエリを生成
 */
export async function generateAudioQuery(
  text: string,
  speaker: number
): Promise<VoicevoxAudioQuery> {
  try {
    const response = await fetch(
      `${VOICEVOX_BASE_URL}/audio_query?text=${encodeURIComponent(
        text
      )}&speaker=${speaker}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`VOICEVOX audio_query failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating audio query:", error);
    throw error;
  }
}

/**
 * VOICEVOX APIで音声ファイルを合成
 */
export async function synthesizeVoice(
  audioQuery: VoicevoxAudioQuery,
  speaker: number
): Promise<Buffer> {
  try {
    const response = await fetch(
      `${VOICEVOX_BASE_URL}/synthesis?speaker=${speaker}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(audioQuery),
      }
    );

    if (!response.ok) {
      throw new Error(`VOICEVOX synthesis failed: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("Error synthesizing voice:", error);
    throw error;
  }
}

/**
 * 音声ファイルを保存
 */
export async function saveAudioFile(audioBuffer: Buffer): Promise<string> {
  try {
    // ファイル名生成（タイムスタンプ + ランダム）
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `voice_${timestamp}_${randomId}.wav`;

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
    console.error("Error saving audio file:", error);
    throw error;
  }
}

/**
 * テキストから音声ファイルを生成（メイン関数）
 */
export async function generateVoiceFile(
  request: VoiceGenerationRequest
): Promise<string> {
  try {
    console.log(
      `Generating voice for text: "${request.text}" with speaker: ${request.speaker}`
    );

    // Step 1: 音声クエリ生成
    const audioQuery = await generateAudioQuery(request.text, request.speaker);

    // オプションパラメータを適用
    if (request.speed) audioQuery.speedScale = request.speed;
    if (request.pitch) audioQuery.pitchScale = request.pitch;
    if (request.volume) audioQuery.volumeScale = request.volume;

    // Step 2: 音声合成
    const audioBuffer = await synthesizeVoice(audioQuery, request.speaker);

    // Step 3: ファイル保存
    const fileName = await saveAudioFile(audioBuffer);

    console.log(`Voice file generated successfully: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error("Error in generateVoiceFile:", error);
    throw error;
  }
}

/**
 * 利用可能なスピーカー一覧を取得
 */
export async function getSpeakers() {
  try {
    const response = await fetch(`${VOICEVOX_BASE_URL}/speakers`);

    if (!response.ok) {
      throw new Error(`Failed to get speakers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting speakers:", error);
    throw error;
  }
}
