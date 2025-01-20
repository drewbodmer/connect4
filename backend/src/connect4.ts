interface GameStateResponse {
    result: string;
    board: number[][];
    playerTurn: number;
}

interface Move {
    col: number;
    row: number;
}

interface EvaluatedMove {
    move: Move;
    score: number;
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
    private maxDepth: number = 6;

    constructor() { }

    private findRow(board: number[][], col: number): number {
        for (let row = 0; row < this.rows; row++) {
            if (board[col][row] > 0) {
                return row - 1
            }
        }
        return this.rows - 1;
    }

    private checkInDirection(turn: number, board: number[][], col: number, row: number, coldir: number, rowdir: number): number {
        let newRow: number = row + rowdir;
        let newCol: number = col + coldir;
        let score: number = 0;
        // turn is 0 for red and 1 for blue, so if the cell == 1, then cell - 1 == 0 means its + a point for red
        while (0 <= newRow && newRow < this.rows && 0 <= newCol && newCol < this.cols && board[newCol][newRow] - 1 == turn % 2) {
            newRow = newRow + rowdir;
            newCol = newCol + coldir;
            score++;
        }
        return score;
    }

    private determineWinner(turn: number) {
        if (turn % 2 == 0) {
            return RED_WIN;
        } else {
            return YELLOW_WIN;
        }
    }

    private checkWinOrDraw(col: number, row: number, board: number[][] = this.board, turn: number = this.turn, offset: number = 1): string {
        if (
            // up + down (pos row, neg row)
            offset + this.checkInDirection(turn, board, col, row, 0, 1) + this.checkInDirection(turn, board, col, row, 0, -1) >= 4 ||

            // left + right (pos col, neg col)
            offset + this.checkInDirection(turn, board, col, row, 1, 0) + this.checkInDirection(turn, board, col, row, -1, 0) >= 4 ||

            // downwards diagonal (pos row, pos col, neg row, neg col)
            offset + this.checkInDirection(turn, board, col, row, 1, 1) + this.checkInDirection(turn, board, col, row, -1, -1) >= 4 ||

            // upwards diagonal (pos row, neg col, neg row, pos col)
            offset + this.checkInDirection(turn, board, col, row, 1, -1) + this.checkInDirection(turn, board, col, row, -1, 1) >= 4) {
            return this.determineWinner(turn);
        } else if (this.turn === 41) {
            return GAME_DRAW
        } else {
            return CONTINUE
        }
    }

    private boardCopy(board?: number[][]): number[][] {
        if (board !== undefined) {
            return board.map(column => column.slice());
        }
        return this.board.map(column => column.slice());
    }

    public playWithAI(col: number): GameStateResponse {
        let oldTurn = this.turn;
        let response = this.playMove(col);
        if (oldTurn < this.turn) {
            let bestMove = this.minMax(this.boardCopy(), Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, this.maxDepth);
            col = bestMove.move.col;
            return this.playMove(col);
        } else {
            return response;
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

        const row: number = this.findRow(this.board, col);
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


    private evaluate(turn: number, board: number[][]): number {
        let score = 0;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (board[i][j] === turn % 2 + 1) {
                    const result = this.checkWinOrDraw(i, j, board, turn);
                    switch (result) {
                        case RED_WIN:
                            score -= 10;
                            break;
                        case YELLOW_WIN:
                            score += 10;
                            break;
                        case GAME_DRAW:
                            return 1;
                    }
                }
            }
        }
        return score;
    }

    private applyMove(board: number[][], move: Move, turn: number): number[][] {
        const newBoard = board.map(column => [...column]);
        if (newBoard[move.col][move.row] > 0) {
            throw Error(`Unable to update cell ${move.col}:${move.row} because it already is filled.`)
        }
        newBoard[move.col][move.row] = turn % 2 + 1;
        return newBoard;
    }

    private minMax(board: number[][], a: number, b: number, depth: number): EvaluatedMove {
        let turn = (this.turn + this.maxDepth - depth);
        let isAiTurn: boolean = turn % 2 === 1;
        if (depth === 0) {
            return { move: { col: -1, row: -1 }, score: this.evaluate(turn - 1, board) };
        }

        if (isAiTurn) {
            let maxScore = Number.NEGATIVE_INFINITY;
            let bestMove: Move = { col: -1, row: -1 };
            for (let col = 0; col < this.cols; col++) {
                let row = this.findRow(board, col);
                if (row > -1) {
                    let newBoard = this.applyMove(this.boardCopy(board), { col: col, row: row }, turn);
                    let { score } = this.minMax(newBoard, a, b, depth - 1);
                    if (score > maxScore) {
                        maxScore = score;
                        bestMove = { col: col, row: row };
                    }
                    a = Math.max(a, maxScore);
                    if (b <= a) {
                        break;
                    }
                }
            }
            return { move: bestMove, score: maxScore };
        } else {
            let minScore = Number.POSITIVE_INFINITY;
            let bestMove: Move = { col: -1, row: -1 };
            for (let col = 0; col < this.cols; col++) {
                let row = this.findRow(board, col);
                if (row > -1) {
                    let newBoard = this.applyMove(this.boardCopy(board), {col: col, row: row}, turn);
                    let { score } = this.minMax(newBoard, a, b, depth - 1)
                    if (score < minScore) {
                        minScore = score;
                        bestMove = { col: col, row: row };
                    }
                    b = Math.min(b, minScore);
                    if (b <= a) {
                        break;
                    }
                }
            }
            return { move: bestMove, score: minScore };
        }
    }
}