interface GameStateResponse {
    result: string;
    board: number[][];
    playerTurn: number;
}

const CONTINUE = 'Click on a column to play a token';
const RED_WIN = 'Red wins!';
const YELLOW_WIN = 'Yellow wins!';
const GAME_DRAW = 'Game is a draw!';
const INVALID_MOVE = 'Invalid move; play a token in an empty column';

export class Connect4 {
    private rows: number = 6;
    private cols: number = 7;
    // fill the board with 0's, 1's represent a filled token
    // cols first because of invalid move checking
    // 0 = empty, 1 = red, 2 = blue
    private board: number[][] = Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
    private turn: number = 0; // red goes first
    private result: string = CONTINUE; // so we can retrieve the board state if requested

    constructor() { }

    private findRow(col: number): number {
        for (let row = 0; row < this.cols; row++) {
            console.log(`row: ${row}, filled: ${this.board[col][row]}`)
            if (this.board[col][row] > 0) {
                return row - 1
            }
        }
        return this.rows - 1;
    }

    private checkInDirection(col: number, row: number, coldir: number, rowdir: number): number {
        let newRow: number = row + rowdir;
        let newCol: number = col + coldir;
        let score: number = 0;
        // turn is 0 for red and 1 for blue, so if the cell == 1, then cell - 1 == 0 means its + a point for red
        while (0 <= newRow && newRow < this.rows && 0 <= newCol && newCol < this.cols && this.board[newCol][newRow] - 1 == this.turn % 2) {
            newRow = newRow + rowdir;
            newCol = newCol + coldir;
            score++;
        }
        return score;
    }

    private determineWinner() {
        if (this.turn % 2 == 0) {
            return RED_WIN;
        } else {
            return YELLOW_WIN;
        }
    }

    private checkWinOrDraw(col: number, row: number): string {
        if (
            // up + down (pos row, neg row)
            1 + this.checkInDirection(col, row, 0, 1) + this.checkInDirection(col, row, 0, -1) >= 4 ||

            // left + right (pos col, neg col)
            1 + this.checkInDirection(col, row, 1, 0) + this.checkInDirection(col, row, -1, 0) >= 4 ||

            // downwards diagonal (pos row, pos col, neg row, neg col)
            1 + this.checkInDirection(col, row, 1, 1) + this.checkInDirection(col, row, -1, -1) >= 4 ||

            // upwards diagonal (pos row, neg col, neg row, pos col)
            1 + this.checkInDirection(col, row, 1, -1) + this.checkInDirection(col, row, -1, 1) >= 4) {
            return this.determineWinner();
        } else if (this.turn === 41) {
            return GAME_DRAW
        } else {
            return CONTINUE
        }
    }


    public playMove(col: number): GameStateResponse {
        const VALID_CONTINUATIONS = [CONTINUE, INVALID_MOVE]
        if (!VALID_CONTINUATIONS.includes(this.result)) {
            return this.getGameState();
        }

        if (this.board[col][0] > 0) {
            this.result = INVALID_MOVE;
            return this.getGameState();
        }

        const row: number = this.findRow(col);
        console.log(`found coordinates: col: ${col}, row: ${row}`)
        this.board[col][row] = this.turn % 2 + 1;

        this.result = this.checkWinOrDraw(col, row);
        const VALID_WIN_STATES = [RED_WIN, YELLOW_WIN]
        if (!VALID_WIN_STATES.includes(this.result)) {
            this.turn++;
        }
        return this.getGameState();
    }

    public clearBoard(): GameStateResponse {
        this.board = Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
        this.turn = 0;
        this.result = CONTINUE;
        return this.getGameState();
    }

    public getGameState(): GameStateResponse {
        return { result: this.result, board: this.board, playerTurn: this.turn }
    }
}