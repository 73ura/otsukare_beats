import type { NextApiRequest, NextApiResponse } from "next";

// メモリ内音声データストレージ（一時的）
const audioCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();

// 5分でキャッシュをクリア
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Invalid audio ID" });
    return;
  }

  // キャッシュから音声データを取得
  const audioData = audioCache.get(id);
  
  if (!audioData) {
    res.status(404).json({ error: "Audio not found" });
    return;
  }

  // 期限切れチェック
  if (Date.now() - audioData.timestamp > CACHE_DURATION) {
    audioCache.delete(id);
    res.status(404).json({ error: "Audio expired" });
    return;
  }

  // 音声データを返す
  res.setHeader('Content-Type', audioData.contentType);
  res.setHeader('Content-Length', audioData.data.length);
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5分間キャッシュ
  res.status(200).send(audioData.data);
}

// 音声データをキャッシュに保存する関数（他のAPIから呼び出し）
export function storeAudioInCache(audioBuffer: Buffer, contentType: string = 'audio/mpeg'): string {
  const id = generateAudioId();
  audioCache.set(id, {
    data: audioBuffer,
    contentType,
    timestamp: Date.now()
  });

  // 古いキャッシュを定期的にクリア
  cleanOldCache();

  return id;
}

// ランダムなオーディオIDを生成
function generateAudioId(): string {
  const timestamp = Date.now().toString(36);
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomId}`;
}

// 古いキャッシュをクリア
function cleanOldCache() {
  const now = Date.now();
  const entries = Array.from(audioCache.entries());
  for (const [id, data] of entries) {
    if (now - data.timestamp > CACHE_DURATION) {
      audioCache.delete(id);
    }
  }
}
