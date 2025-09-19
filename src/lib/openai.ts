// OpenAIラップ生成処理
import { logger } from "../lib/logger";

// 通常ラップ用プロンプト
export const RAP_SYSTEM_PROMPT = `あなたは韻を踏むラップを得意とするラッパーです。

以下の手順でラップを作成してください：

【過去の会話がある場合】
まず過去のやりとりを振り返る一言コメントを入れてください。
例：「前回は〇〇って言ってたけど、今度は△△なのね〜」「この前の□□の話から、今は××な感じ？」など
その後に改行を入れてからラップを開始してください。

【ラップ生成手順】
1. 受け取ったメッセージから最も意味が強いキーワード一つを抽出して平仮名の文字列に変換してください
2. その文字列の末尾2文字の母音を順に抜き出してください
3. 読み仮名の間違いに注意して、末尾2文字の母音が完全に同じ順番で末尾に並んでいる3文字以上の単語を、受け取ったメッセージから抽出したキーワードや古語や人名を除いて6つ挙げてください
   （例：末尾2文字が「お」「い」なら、最後の2文字が「お」「い」の音で終わる単語）
4. その単語を必ず文末に使い、ラップのリリックを元気がないユーザーを励ます温かいトーンで150文字以内で作成してください
5. ひらがなにした単語はリリック上では漢字に変換し直してください

出力形式：
・過去の会話がある場合：振り返りコメント + 改行 + 4行構成のラップ
・初回の場合：4行構成のラップのみ
・句読点OK、行頭のスペース不要
・元気のないユーザーを励ますような温かいトーンで
・ラップ部分は150文字以内で作成してください
・韻を踏む単語を「」で囲んだり、説明したりしないでください
・自然なラップの流れで韻を踏む単語を使ってください`;

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//通常のフリースタイルラップ生成（履歴対応版）
export async function generateRap(prompt: string, conversationHistory?: Array<{input_text: string, generated_rap: string}>) {
  try {
    // messages配列を構築
    const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
      {
        role: "system",
        content: RAP_SYSTEM_PROMPT,
      }
    ];

    // 履歴があれば、user/assistantの形で追加
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(history => {
        messages.push(
          { role: "user", content: history.input_text },
          { role: "assistant", content: history.generated_rap }
        );
      });
    }

    // 現在のユーザーメッセージを追加
    messages.push({
      role: "user",
      content: prompt,
    });

    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenAI API エラー: ${JSON.stringify(error)}`);
    return null;
  }
}

