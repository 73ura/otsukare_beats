// OpenAIラップ生成処理

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//通常のフリースタイルラップ生成
export async function generateRap(prompt: string) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは韻を踏むラップを得意とするラッパーです。
                   
          以下のルールを必ず守ってください：

・150文字以内で作成してください  
・4行構成で出力してください（句読点OK、行頭のスペース不要）  
・ラップの語尾に指定された単語（指定母音に一致）を必ず使ってください  
・元気のないユーザーを励ますような温かいトーンで  
・古語・人名・入力メッセージ中のキーワードは使わないでください  
・文末の単語は3文字以上で、末尾2文字の母音が指定と一致するもの  

例：末尾が「お」「い」→ 最後の2文字が「おい」で終わる一般単語（例：たこい）`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API エラー:", error);
    return null;
  }
}

//前回のコメント履歴から一言ラップを生成
export async function generateCommentRap(message: string) {
  const chatCompletion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `あなたはユーザーの状態に寄り添うラップを作るラッパーです。
        ・受け取ったメッセージの調子を見て、
        励ます一言ラップを30〜50文字で作成してください。
        ・語尾やトーンを柔らかく、親しみやすく。`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return chatCompletion.choices[0].message.content;
}
