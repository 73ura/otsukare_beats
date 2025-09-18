// OpenAIラップ生成処理
import { logger } from "../lib/logger";

// 通常ラップ用プロンプト
export const RAP_SYSTEM_PROMPT = `あなたは韻を踏むラップを得意とするラッパーです。
                   
以下のルールを必ず守ってください：

・150文字以内で作成してください  
・4行構成で出力してください（句読点OK、行頭のスペース不要）  
・ラップの語尾に指定された単語（指定母音に一致）を必ず使ってください  
・元気のないユーザーを励ますような温かいトーンで  
・古語・人名・入力メッセージ中のキーワードは使わないでください  
・文末の単語は3文字以上で、末尾2文字の母音が指定と一致するもの  

例：末尾が「お」「い」→ 最後の2文字が「おい」で終わる一般単語（例：たこい）`;

// 履歴を踏まえたラップ用プロンプト
export const RAP_WITH_HISTORY_PROMPT = `あなたは韻を踏むラップを得意とするラッパーで、ユーザーとの過去のやりとりを覚えています。

過去の会話履歴:
{HISTORY}

現在のユーザーメッセージ: {CURRENT_MESSAGE}

以下のルールを必ず守ってください：
・150文字以内で作成してください  
・4行構成で出力してください（句読点OK、行頭のスペース不要）  
・過去の会話内容を踏まえて、継続性のあるラップを作成してください
・元気のないユーザーを励ますような温かいトーンで  
・古語・人名・入力メッセージ中のキーワードは使わないでください  
・ラップの語尾に韻を踏む単語を使ってください`;

// 久しぶり挨拶用プロンプト
export const RAP_GREETING_PROMPT = `久しぶりのユーザーが来たので、以下の過去のやりとりを参考に、温かく迎えるラップを作ってください。\n(履歴をここに挿入)`;


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
    logger.error("OpenAI API エラー:", JSON.stringify(error));
    return null;
  }
}

//過去の履歴を踏まえたラップ生成
export async function generateRapWithHistory(currentMessage: string, history: string) {
  try {
    console.log("=== generateRapWithHistory 呼び出し ===");
    console.log("現在のメッセージ:", currentMessage);
    console.log("履歴:", history);
    
    const systemPrompt = RAP_WITH_HISTORY_PROMPT
      .replace("{HISTORY}", history)
      .replace("{CURRENT_MESSAGE}", currentMessage);
    
    console.log("生成されたシステムプロンプト:", systemPrompt);
    
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "過去の履歴を踏まえて、現在のメッセージに対するラップを作って",
        },
      ],
    });

    const result = chatCompletion.choices[0].message.content;
    console.log("generateRapWithHistory結果:", result);
    return result;
  } catch (error) {
    logger.error("OpenAI 履歴踏まえたラップ生成エラー:", JSON.stringify(error));
    return null;
  }
}


