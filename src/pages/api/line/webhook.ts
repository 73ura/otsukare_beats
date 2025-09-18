import type { NextApiRequest, NextApiResponse } from "next";

import { Client, WebhookEvent } from "@line/bot-sdk";
import { generateRap, RAP_SYSTEM_PROMPT } from "../../../lib/openai";
import { validateSignature } from "@line/bot-sdk";
import { generateVoiceFile } from "../../../lib/voicevox";
import { prisma } from "../../../lib/prisma";

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

          // 直近メッセージ取得（Prismaで直接データベースから取得）
          let messages: any[] = [];
          let lastMessageTime: Date | null = null;
          try {
            // ユーザーを取得または作成
            const user = await prisma.sqlusers.upsert({
              where: { line_user_id: lineUserId },
              update: {},
              create: { line_user_id: lineUserId },
            });

            // メッセージ履歴を取得
            messages = await prisma.messages.findMany({
              where: { user_id: user.id },
              orderBy: { created_at: 'desc' },
              take: 5, // 最新5件
            });

            if (messages.length > 0) {
              lastMessageTime = new Date(messages[0].created_at);
            }
            console.log(`履歴取得成功: ${messages.length}件`);
          } catch (e) {
            console.error("メッセージ履歴取得失敗", e);
          }

          const now = new Date();
          let greeted = false;
          
          // 通常のラップ生成フロー（履歴を考慮）
          try {
            // 履歴情報をプロンプトに追加
            let contextPrompt = RAP_SYSTEM_PROMPT;
            if (messages.length > 0) {
              const history = messages
                .slice(0, 3) // 最新3件
                .reverse()
                .map((m: any, i: number) => 
                  `【${i + 1}回前】ユーザー: ${m.input_text}\nラップ: ${m.generated_rap}`
                )
                .join("\n");
              contextPrompt = `${RAP_SYSTEM_PROMPT}\n\n## 過去の対話履歴\n${history}\n\n上記の過去のやりとりを踏まえて、今回のメッセージとの関連性や継続性を意識し、まるで友達との会話が続いているような自然な流れでラップを生成してください。過去の話題や感情の変化も考慮してください。`;
            }
            
            const rap = await generateRap(userMessage, contextPrompt);
            console.log("生成されたラップ:", rap);
            if (!rap) {
              await client.replyMessage(event.replyToken, {
                type: "text",
                text: "ラップの魔法が、迷子でバグってる！でも大丈夫、すぐに戻ってくる！ちょっと待てばノリノリ復活する！",
              });
              return;
            }
            // 音声生成は一時的に無効化して、テキストのみで返信
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: `🎤 ラップできたYo！\n\n${rap}`,
            });
            // DB保存（Prismaで直接保存）
            try {
              const user = await prisma.sqlusers.upsert({
                where: { line_user_id: lineUserId },
                update: {},
                create: { line_user_id: lineUserId },
              });

              await prisma.messages.create({
                data: {
                  user_id: user.id,
                  input_text: userMessage,
                  generated_rap: rap,
                },
              });
              console.log("メッセージ保存成功");
            } catch (e) {
              console.error("DB保存エラー:", e);
            }
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
