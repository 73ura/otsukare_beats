// LINEからのWebhook受信
import type { NextApiRequest, NextApiResponse } from "next";

// Webhookを受け取る関数。APIのエンドポイント。/api/line/webhookにPOSTリクエストが来たら、この関数が呼ばれる。
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    console.log("Received LINE webhook event:", req.body);
    // ここにLINEメッセージ処理を書く
    res.status(200).json({ message: "OK" });
  } else {
    res.status(405).end(); 
  }
}
