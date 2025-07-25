import type { NextApiRequest, NextApiResponse } from "next";

import { Client, WebhookEvent } from "@line/bot-sdk";
import { generateRap, RAP_SYSTEM_PROMPT, RAP_GREETING_PROMPT } from "../../../lib/openai";
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

    // 学習用：テストユーザーIDの場合は署名検証スキップ
    const isTestUser = req.body.events?.[0]?.source?.userId === "test";

    if (isTestUser) {
      console.log("🔧 学習用テスト: 署名検証スキップ");
    } else if (
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
          const lineUserId = event.source?.userId || "test";
          console.log("ユーザーメッセージ:", userMessage);

          // 直近メッセージ取得
          let messages = [];
          let lastMessageTime = null;
          try {
            const res = await fetch(
              `http://localhost:3000/api/messages?line_user_id=${lineUserId}`
            );
            if (res.ok) {
              messages = await res.json();
              if (messages.length > 0) {
                lastMessageTime = new Date(messages[0].created_at);
              }
            }
          } catch (e) {
            console.error("メッセージ履歴取得失敗", e);
          }

          const now = new Date();
          let greeted = false;
          if (
            lastMessageTime &&
            now.getTime() - lastMessageTime.getTime() > 60 * 60 * 1000
          ) {
            // 1時間以上空いていた場合、過去対話履歴をAIに渡して挨拶ラップ生成
            const history = messages
              .slice(0, 3)
              .reverse()
              .map(
                (m: any, i: number) =>
                  `【${i + 1}回前】ユーザー: ${m.input_text}\nラップ: ${m.generated_rap}`
              )
              .join("\n");
            const greetingPrompt = RAP_GREETING_PROMPT.replace("(履歴をここに挿入)", history);
            const greetingRap = await generateRap(greetingPrompt, RAP_GREETING_PROMPT);
            if (greetingRap) {
              // 音声生成
              const fileName = await generateVoiceFile({
                text: greetingRap,
                speaker: 3,
              });
              const baseUrl =
                process.env.NGROK_URL || "https://98b574dfa87b.ngrok-free.app";
              // 音声で挨拶ラップ返信
              await client.replyMessage(event.replyToken, {
                type: "audio",
                originalContentUrl: `${baseUrl}/audio/${fileName}`,
                duration: 15000,
              });
              // DB保存
              try {
                await fetch(`http://localhost:3000/api/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    line_user_id: lineUserId,
                    input_text: "(システム挨拶)",
                    generated_rap: greetingRap,
                  }),
                });
              } catch (e) {}
              greeted = true;
              // 続けてテキストで促し
              await client.pushMessage(lineUserId, {
                type: "text",
                text: "ユーザーのつぶやきをラップに昇華させるYo！好きなことを送ってみてYo！",
              });
              // ここでreturnすると通常フローに進まないので、以降も続行
            }
          }

          // 通常のラップ生成フロー
          try {
            const rap = await generateRap(userMessage, RAP_SYSTEM_PROMPT);
            console.log("生成されたラップ:", rap);
            if (!rap) {
              await client.replyMessage(event.replyToken, {
                type: "text",
                text: "ラップの魔法が、迷子でバグってる！でも大丈夫、すぐに戻ってくる！ちょっと待てばノリノリ復活する！",
              });
              return;
            }
            const fileName = await generateVoiceFile({ text: rap, speaker: 3 });
            const baseUrl =
              process.env.NGROK_URL || "https://98b574dfa87b.ngrok-free.app";
            await client.replyMessage(event.replyToken, {
              type: "audio",
              originalContentUrl: `${baseUrl}/audio/${fileName}`,
              duration: 30000,  // 実際の音声長さ（19.157秒）
            });
            // DB保存
            try {
              await fetch(`http://localhost:3000/api/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  line_user_id: lineUserId,
                  input_text: userMessage,
                  generated_rap: rap,
                }),
              });
            } catch (e) {}
          } catch (replyError) {
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "音の魔法が、迷子でバグってる！でも大丈夫、すぐに戻ってくる！ちょっと待てばノリノリ復活する！",
            });
          }
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
