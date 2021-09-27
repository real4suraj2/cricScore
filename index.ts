import express, { Request, Response } from 'express'
import cors from 'cors'

import { getMatches, getScoreCard, Message } from './scrape'

const app = express()
app.use(cors())
app.use(express.json())
const PORT = 3005

app.get('/get-matches', async (_, res: Response) => {
  const data = [...(await getMatches())]
  res.status(200).send(JSON.stringify(data))
})

app.post('/live-score', async (req: Request, res: Response) => {
  const { uri }: { uri: string } = req.body
  const resp: Message = await getScoreCard(uri)
  res.status(200).send(resp)
})

app.post('/score-card', async (req: Request, res: Response) => {
  const { uri }: { uri: string } = req.body
  const resp: Message = await getScoreCard(uri, true)
  res.status(200).send(resp)
})

app.listen(PORT, () => {
  console.log(`Running on port : ${PORT}`)
})
