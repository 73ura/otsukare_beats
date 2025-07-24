// APIルートの例
import type { NextApiRequest, NextApiResponse } from "next";
import { generateRap } from "../..//lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rap = await generateRap("人生をテーマにラップを作ってください");
  res.status(200).json({ rap });
}
