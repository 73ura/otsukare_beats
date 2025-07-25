// pages/api/messages.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { line_user_id, input_text, generated_rap } = req.body
    if (!line_user_id || !input_text || !generated_rap) {
      return res.status(400).json({ error: 'Missing parameters' })
    }
    let user = await prisma.sqlusers.findUnique({ where: { line_user_id } })
    if (!user) {
      user = await prisma.sqlusers.create({ data: { line_user_id } })
    }
    const message = await prisma.messages.create({
      data: {
        user_id: user.id,
        input_text,
        generated_rap,
      },
    })
    return res.status(201).json(message)
  }
  else if (req.method === 'GET') {
    const { line_user_id } = req.query
    if (!line_user_id || typeof line_user_id !== 'string') {
      return res.status(400).json({ error: 'Missing line_user_id' })
    }
    const user = await prisma.sqlusers.findUnique({ where: { line_user_id } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const messages = await prisma.messages.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    })
    return res.status(200).json(messages)
  }
  else {
    res.setHeader('Allow', ['POST', 'GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
