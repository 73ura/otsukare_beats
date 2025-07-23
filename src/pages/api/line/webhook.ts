import type { NextApiRequest, NextApiResponse } from "next";
import { WebhookEvent } from "@line/bot-sdk";
import { generateRap } from "../../../lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    const events: WebhookEvent[] = req.body.events;
    console.log("Webhook受信! リクエストボディ:", req.body);

    await Promise.all(
      events.map(async event => {
        if (event.type === "message" && event.message.type === "text") {
          const rap = await generateRap(event.message.text);

          // ローカル環境では返信せずログに出力
          console.log("🎤 ラップ生成結果:", rap);
        }
      })
    );

    res.status(200).json({ message: "受信・生成完了" });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ error: "サーバーエラー" });
  }
}
