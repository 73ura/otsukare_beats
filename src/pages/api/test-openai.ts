// src/pages/api/test-openai.ts
import { NextApiRequest, NextApiResponse } from "next";
import { generateRap } from "../../lib/openai"; // もしくは相対パスで調整

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "メッセージが空です" });
  }

  const rap = await generateRap(message);

  if (!rap) {
    return res.status(500).json({ error: "ラップ生成に失敗しました" });
  }

  return res.status(200).json({ rap });
}
