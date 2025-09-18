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
export const RAP_WITH_HISTORY_PROMPT = `あなたは過去の会話を覚えている親しいラッパーです。ユーザーとの継続的な関係性を大切にして、過去の出来事と今回のメッセージを関連付けたラップを作ってください。

【過去の会話履歴】
{HISTORY}

【今回のメッセージ】
{CURRENT_MESSAGE}

【必須要件】
・150文字以内、4行構成で作成
・過去の会話で出てきた出来事や感情を必ず参照する
・「前回は〜だったけど、今回は〜」「あの時の〜から成長したね」のように過去と現在を対比させる
・過去の失敗→今回の成功、過去の悩み→今回の解決など、ストーリー性を持たせる
・温かく励ますトーンで、ユーザーとの絆を感じられるように
・韻を踏んで、ラップらしいリズム感を保つ

過去の内容を無視せず、必ず言及してユーザーが「覚えてくれている」と感じられるラップを作ってください。`;

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
    console.log("履歴の文字数:", history.length);
    
    const systemPrompt = RAP_WITH_HISTORY_PROMPT
      .replace("{HISTORY}", history)
      .replace("{CURRENT_MESSAGE}", currentMessage);
    
    console.log("=== 完成したプロンプト ===");
    console.log(systemPrompt);
    console.log("=== プロンプト終了 ===");
    
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


