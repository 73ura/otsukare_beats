// src/pages/api/test-openai-comment.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generateCommentRap } from "../../lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Invalid message" });
    return;
  }

  try {
    const rap = await generateCommentRap(message);
    res.status(200).json({ rap });
  } catch (error) {
    console.error("ラップ生成エラー:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
