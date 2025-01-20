import express, { Request, Response } from 'express'
import { Connect4 } from './connect4';
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5001
app.use(cors({
  origin: 'http://localhost:5173', // Frontend port needs to match
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())

const game = new Connect4()

app.get('/game-state', (req: Request, res: Response) => {
  const result = game.getGameState();
  res.json(result);
})

app.post('/clear-board', (req: Request, res: Response) => {
  const result = game.clearBoard();
  res.json(result);
})

app.post('/play-move', (req: Request, res: Response) => {
  const { col, ai } = req.body
  
  if (typeof col !== 'number' || col < 0 || col> 6) {
    res.status(400).json({ error: 'Invalid column index. Must be between 0 and 6.' });
  }

  let result;
  if (ai) {
    result = game.playWithAI(col);
  } else {
    result = game.playMove(col);
  }
  res.json(result);
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})