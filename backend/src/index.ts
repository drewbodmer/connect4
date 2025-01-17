import express, { Request, Response } from 'express'
import { Connect4 } from './connect4';

const app = express()
const PORT = process.env.PORT || 5001
app.use(express.json())
const game = new Connect4()

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!')
})

app.get('/game-state', (req: Request, res: Response) => {
  const result = game.getGameState();
  res.json(result);
})

app.post('/clear-board', (req: Request, res: Response) => {
  const result = game.clearBoard();
  res.json(result);
})

app.post('/play-move', (req: Request, res: Response) => {
  const { column } = req.body
  console.log(`received play move with column: ${column}`)
  
  if (typeof column !== 'number' || column < 0 || column > 6) {
    res.status(400).json({ error: 'Invalid column index. Must be between 0 and 6.' });
  }

  const result = game.playMove(column);
  res.json(result);
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})