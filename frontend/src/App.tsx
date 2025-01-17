import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Board from './components/Board/Board'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Welcome to connect4!</h1>
      <Board />
    </>
  )
}

export default App
