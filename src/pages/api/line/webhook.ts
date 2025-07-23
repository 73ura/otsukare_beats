// src/pages/api/line/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Client, WebhookEvent } from "@line/bot-sdk";
import { generateRap } from "../../../lib/openai";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    // 署名検証を一時的にコメントアウト
    // await runMiddleware(req, res, middleware(config));

    const events: WebhookEvent[] = req.body.events;
    console.log("Webhook受信! リクエストボディ:", req.body);

    await Promise.all(
      events.map(async event => {
        if (event.type === "message" && event.message.type === "text") {
          const rap = await generateRap(event.message.text);
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: rap || "ラップ生成に失敗しました💦",
          });
        }
      })
    );
    res.status(200).end();
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).end();
  }
}
