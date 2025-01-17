import React, { useState, useEffect } from 'react'
import './Board.css'
const ENDPOINT = 'http://localhost:5001';

type BoardState = number[][]

interface GameStateResponse {
  result: string
  board: BoardState
  playerTurn: number
}


async function fetchFromEndpoint(endpoint: string, method: string, body?: string): Promise<GameStateResponse> {
  const response = await fetch(`${ENDPOINT}/${endpoint}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? body : undefined,
  })

  const data: GameStateResponse = await response.json();
  return data;
}

const Board: React.FC = () => {
  const [board, setBoard] = useState<BoardState>([])
  const [gameStatus, setGameStatus] = useState<string>('');
  const [playerTurn, setPlayerTurn] = useState<number>(0);

  function assignState(data: GameStateResponse): void {
    setBoard(data.board);
    setGameStatus(data.result);
    setPlayerTurn(data.playerTurn);
  }

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const data = await fetchFromEndpoint('game-state', 'GET')
        assignState(data);
      } catch (error) {
        console.error('Error fetching game state:', error)
      } 
    }

    fetchGameState()
    const interval = setInterval(fetchGameState, 500)
    return () => clearInterval(interval)
  }, [])

  async function clearBoard() {
    try {
      const data: GameStateResponse = await fetchFromEndpoint('clear-board', 'POST');
      assignState(data);
    } catch (error) {
      console.error('Error clearing board:', error)
    }
  }

  async function handlePlayMove(column: number) {
    try {
      const data: GameStateResponse = await fetchFromEndpoint('play-move', 'POST', JSON.stringify({ column }));
      assignState(data);
    } catch (error) {
      console.error('Error making move:', error)
    }
  }

  return (
    <>
      <div className='player-turn'>
        To play:
        <div className={`cell player${playerTurn % 2 + 1}`}></div>
      </div>
      <div className="board-container">
          <>
            <div className="game-board">
              {board.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="column"
                  onClick={() => handlePlayMove(colIndex)}
                >
                  {column.map((cell, rowIndex) => (
                    <div
                      key={`${colIndex}-${rowIndex}`}
                      className={`cell player${cell}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            {gameStatus && <div className="game-status">{gameStatus}</div>}
            <button className="clear-button" onClick={() => clearBoard()}>Clear Board</button>
          </>
      </div>
    </>
  )
}

export default Board