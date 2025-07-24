// src/pages/api/line/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";

import { Client, WebhookEvent } from "@line/bot-sdk";
import { generateRap } from "../../../lib/openai";
import { validateSignature } from "@line/bot-sdk";
import { generateVoiceFile } from "../../../lib/voicevox";


const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const client = new Client(config);

// Next.jsのデフォルトのbody-parserを有効化（署名検証用に調整）
export const config_api = {
  api: {
    bodyParser: {

      sizeLimit: "1mb",

    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("=== Webhook処理開始 ===");

  if (req.method !== "POST") {
    console.log("POST以外のメソッド:", req.method);
    res.status(405).end();
    return;
  }

  try {
    // 署名検証（body-parser有効の場合）

    const signature = req.headers["x-line-signature"];
    console.log("署名:", signature ? "存在" : "なし");

    // bodyを文字列化して署名検証
    const bodyString = JSON.stringify(req.body);
    const bodyBuffer = Buffer.from(bodyString);

    if (
      typeof signature !== "string" ||
      !validateSignature(bodyBuffer, config.channelSecret, signature)
    ) {
      console.log("署名検証失敗");
      res.status(401).end("署名検証失敗");

      return;
    }
    console.log("署名検証成功");

    const events: WebhookEvent[] = req.body.events;
    console.log("Webhook受信! リクエストボディ:", req.body);

    await Promise.all(

      events.map(async event => {
        if (event.type === "message" && event.message.type === "text") {
          const userMessage = event.message.text;
          console.log("ユーザーメッセージ:", userMessage);

          try {
            //ラップ生成
            const rap = await generateRap(userMessage);
            console.log("生成されたラップ:", rap);

            // 音声生成
            const fileName = await generateVoiceFile({
              text: rap,
              speaker: 3,
            });
            console.log("音声ファイル生成完了:", fileName);

            // LINEに音声メッセージを送信
            await client.replyMessage(event.replyToken, {
              type: "audio",
              originalContentUrl: `https://7ebc311b75c1.ngrok-free.app/audio/${fileName}`,
              duration: 10000, // 10秒（推定）
            });

            console.log("音声メッセージ送信成功");
            //throw new Error("テスト用エラー");
          } catch (replyError) {
            console.error("メッセージ送信エラー:", replyError);

            // 音声生成失敗時はテキストで返信
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "音の魔法が、迷子でバグってる！でも大丈夫、すぐに戻ってくる！ちょっと待てばノリノリ復活する！",
            });
            return;
          }

          // 予期しない例外時もテキストで返信
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "ちょっとトラブル、でも大丈夫！もう一回 Try、君ならゼッタイできる!",
          });
        }
      })
    );


    console.log("=== Webhook処理完了 ===");
    res.status(200).end();
  } catch (error) {
    console.error("エラーの詳細:", error);
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      console.error("エラースタック:", error.stack);
    }
    res.status(500).end();
  }
}
