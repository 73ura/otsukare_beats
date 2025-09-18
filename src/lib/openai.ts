// OpenAIラップ生成処理
import { logger } from "../lib/logger";

// 通常ラップ用プロンプト
export const RAP_SYSTEM_PROMPT = `あなたは韻を踏むラップを得意とするラッパーです。
                   
【必須ルール】
・4行構成で出力してください（句読点OK、行頭スペース不要）  
・1行の文字数は適度に揃え、リズム感を意識してください  
・各行末は必ず同じ韻（最後の1〜2文字の響き）で終わらせること。韻候補は以下を必ず使用：
  たい／かい／ない／さい／みらい  
・励ましだけでなく、ユーモアや笑える要素も入れてください
・親しい友達のような気軽さと温かさで作成してください  
・古語・人名・入力メッセージ中のキーワードは使わない  
・文字数は合計150文字以内（韻優先で多少超えてもOK）  

【例】
今日もがんばる君にエールを送りたい  
不安な気持ちも吹き飛ばしてやるかい  
道はまだ続くけど諦めはしないない  
一歩ずつ前進だ、輝くみらい
`;

// 履歴を踏まえたラップ用プロンプト
export const RAP_WITH_HISTORY_PROMPT = `あなたは過去の会話を覚えている親しいラッパーです。ユーザーとの継続的な関係性を大切にして、過去の出来事と今回のメッセージを関連付けたラップを作ってください。

【過去の会話履歴】
{HISTORY}

【今回のメッセージ】
{CURRENT_MESSAGE}

【必須ルール】
・4行構成で出力（句読点OK、行頭スペース不要）  
・1行の文字数は適度に揃え、リズム感を意識  
・各行末は必ず同じ韻（最後の1〜2文字の響き）で終わらせること  
  韻候補: たい／かい／ない／さい／みらい  
・過去の会話で出てきた出来事や感情を必ず参照
・「あの時の〜から成長したね」のように過去と現在を対比
・過去の失敗→今回の成功、過去の悩み→今回の解決など、ストーリー性を持たせる  

【トーンのバランス】
・励ましだけでなく、ユーモアや笑える要素も入れる
・時にはツッコミや軽いいじりも交える
・親しい友達のような気軽さと温かさ
・真面目すぎず、でも心は込める
・状況に応じて面白おかしく表現する

・古語・人名・入力メッセージ中のキーワードは使わない  
・文字数は合計150文字以内（韻優先で多少超えてもOK）

【例：励まし系】
今日もがんばる君にエールを送りたい  
不安な気持ちも吹き飛ばしてやるかい  
道はまだ続くけど諦めはしないない  
一歩ずつ前進だ、輝くみらい

【例：ユーモア系】
また失敗？君のパターン読めちゃうかい  
でもそこが愛嬌で憎めないない  
次はきっと上手くいくはずだい  
笑顔で挑戦、それが君らしい

過去の内容を無視せず、必ず言及してユーザーが「覚えてくれている」と感じられ、かつ笑顔になれるラップを作ってください。
`;

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


