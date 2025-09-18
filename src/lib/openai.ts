// OpenAIラップ生成処理
import { logger } from "../lib/logger";

// 通常ラップ用プロンプト
export const RAP_SYSTEM_PROMPT = `あなたは韻を踏むラップを得意とするラッパーです。

以下の手順でラップを作成してください：

1. 受け取ったメッセージから最も意味が強いキーワード一つを抽出して平仮名の文字列に変換してください
2. その文字列の末尾2文字の母音を順に抜き出してください
3. 読み仮名の間違いに注意して、末尾2文字の母音が完全に同じ順番で末尾に並んでいる3文字以上の単語を、受け取ったメッセージから抽出したキーワードや古語や人名を除いて6つ挙げてください
   （例：末尾2文字が「お」「い」なら、最後の2文字が「お」「い」の音で終わる単語）
4. その単語を必ず文末に使い、ラップのリリックを元気がないユーザーを励ます温かいトーンで150文字以内で作成してください
5. ひらがなにした単語はリリック上では漢字に変換し直してください

出力形式：
・4行構成で出力してください（句読点OK、行頭のスペース不要）
・元気のないユーザーを励ますような温かいトーンで
・150文字以内で作成してください`;

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//通常のフリースタイルラップ生成
export async function generateRap(prompt: string, systemPrompt?: string) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt || RAP_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenAI API エラー: ${JSON.stringify(error)}`);
    return null;
  }
}

