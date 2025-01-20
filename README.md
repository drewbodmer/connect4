# Setup
This project uses node `v22.12.0` and npm `11.0.0`

### Clone the repository
```
git clone git@github.com:drewbodmer/connect4.git
```

### Backend setup
```
cd connect4/backend
npm install
npx ts-node src/index.ts
```
You should see a message: "Server is running on http://localhost:5001"

### Frontend setup
Open up a new shell and go to the project root directory.
```
cd connect4/frontend
npm install
npm run dev
```
Open `http://localhost:5173/` on your browser to view the game.


# Connect 4 Planning Notes

## Overview and first thoughts
Represent the board as 2D array (or bitboard, but I have no clue how to do bitwise operations in TS)

RED player goes if the turn (or number of tokens) % 2 == 0
otherwise YELLOW 

6x7 board so max 7 options to play each turn (player must pick a valid column)

Once a player chooses a column to play their token:
1. Check if column is valid (not full)
2. Check if the player has won (i,j, i+1,j, i+2,j, etc...)
3. increment the number of pieces played
4. return the new board


frontend:
display board
pass new move to backend (maybe check if move is valid because it's so simple)

## Planning

Since connect 4 is a grid, it's simple to represent it using a 2D array. We need to be able to:
- determine invalid moves
- determine win conditions
- determine a draw

A 2D array will work fine for all of these- determining a win is sort of annoying because we need to check in every direction (left + right, up+down, up diag, down diag) but likely can be deduped a bunch in the code. Determining a valid move is pretty simple, just whether the top cell is empty on the board.

We'll also need to "drop" each token to the bottom available cell. The simplest way is to just iterate down a column until we reach a token, but we could also keep track of the "stacks" of tokens in each column to avoid iterating. Since the board is tiny, we can just iterate for now.

The players' turns could just be represented by a boolean (is RED turn) which flips each time. (edit: using an integer because then we can be more efficient checking win conditions e.g. if cell == player_turn)

We could save the game state to a file (board, player turn) if we want to maintain games across server runs and have game history. Out of scope.

Pseudocode for a player's turn: 
```
def play_move(col):
	if col_invalid(col):
		return 'INVALID MOVE'
	 row = find_row(col)
	 board[row][col] = player_num
	 result = check_win_or_draw(row, col) \[BLUE, YELLOW, DRAW, NONE]
	 return result
```

*I'm object-orienting the backend, while I don't generally love mutation the game is small enough its not worth passing parameters around everywhere to make it functional IMO and I'm less familiar with making a game using functional programming, so OOD will save me time.*

## Frontend thoughts:
Since the game state should be completely stored on the backend, the frontend's job will be to only display data and pass moves back and forth.

We'll need to fetch initial state from backend, and a polling setup so multiple tabs stay synced.

We can use the react useState hooks to pull the game information and then just display it, and a useEffect to poll.

Since the game is persistent, we'll need a button to clear the board as well.

We'll also want an indication of whose turn it is.

# AI Agent
I think the best option with more time would be an RL agent trained against itself, but there's no chance I could build that in an hour. I think a simple min-max agent would probably work fairly well since the heuristics aren't too complex. 

**Heuristics:**
1. Player win
2. Other player win
3. Creating a chain (longer is better) 
4. Playing where there more available spaces is better, but would require a new function to find availability. We could just have some heuristic to score higher if we're playing near the middle of the board

## Infra to enable agent
We'll need a toggle to tell us whether we're playing 2player or against the computer, and then a check after playMove that determines 1) should the computer play and 2) is it their move. Then the AI function can just call playMove once it has determined the move.

MinMax pseudocode:
```
def min_max(board, a, b, is_ai_turn, depth):
	if depth == 0:
		return evaluate(board)
	if is_ai_turn:
		maxScore = '-inf'
		for move in possible_moves(board):
			score = min_max(board+move, a, b, !is_ai_turn, depth-1)
			maxScore = max(maxScore, score)
			a = max(a, maxScore)
			if b <= a:
				break
		return maxScore
	else:
		minScore = 'inf'
		for move in possible_moves(board):
			score = min_max(board+move, a, b, !is_ai_turn, depth-1)
			minScore = min(score, minScore)
			b = min(b, minScore)
			if b <= a:
				break
		return minScore
```
# Future Optimizations
1. Bitboard! A 2D array is fine but if we wanted to run an RL agent or even the minmax algorithm it would make the win checking faster.
2. We don't need to iterate to "drop" the token on a move, could instead just keep track of the top token on each column.

# Disclaimer on code conventions and external resources
I'm not extremely comfortable with TS/React syntax, so I used Google, StackOverflow, and GPT to figure it out. I restricted the usage for all of these tools to be after I determined exactly what I wanted to do and how I wanted to do it, and the actual connect4 game code was written without resources. I apologize in advance for any grievous disregard for common Typescript & React conventions.

Examples include:
- How to write a polling function with react hooks
- How to send/receive API requests
- How to create a circle using CSS (lol)
- How to center the board on the screen (also lol)