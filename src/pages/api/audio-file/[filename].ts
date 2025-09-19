import type { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs/promises';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { filename } = req.query;

  if (!filename || typeof filename !== "string") {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  // ファイル名のバリデーション（セキュリティ）
  // VOICEVOXファイル名形式: voice_2025-09-19T02-06-34-228Z_randomid.mp3
  if (!/^[a-z0-9_-]+\.(wav|mp3)$/i.test(filename)) {
    res.status(400).json({ error: "Invalid filename format" });
    return;
  }

  try {
    const filePath = path.join('/tmp', filename);
    
    // ファイルの存在確認
    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({ error: "Audio file not found" });
      return;
    }

    // ファイルを読み込み
    const audioBuffer = await fs.readFile(filePath);

    // ファイル拡張子からContent-Typeを決定
    const contentType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
    
    // LINE音声メッセージ用のヘッダー設定
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', audioBuffer.length.toString());
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Rangeリクエストに対応（LINE音声再生で重要）
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : audioBuffer.length - 1;
      const chunksize = (end - start) + 1;
      const chunk = audioBuffer.slice(start, end + 1);
      
      res.setHeader('Content-Range', `bytes ${start}-${end}/${audioBuffer.length}`);
      res.setHeader('Content-Length', chunksize.toString());
      res.status(206).send(chunk);
    } else {
      res.status(200).send(audioBuffer);
    }

    // ファイルを削除（クリーンアップ）
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
        console.log(`🗑️ Cleaned up temp file: ${filename}`);
      } catch (error) {
        console.log(`⚠️ Failed to cleanup temp file: ${filename}`);
      }
    }, 300000); // 5分後に削除

  } catch (error) {
    console.error("Audio file serve error:", error);
    res.status(500).json({ 
      error: "Failed to serve audio file",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
