const fs = require('fs');
const path = require('path');
const SIZE = 19;
const ITERATIONS = 5;

class InputFileReader {
    static readInputFile(filePath) {
        return fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    }
}

class RenjuGame {
    constructor(board) {
        this.board = board;
    }

    static directions = [
        { x: 1, y: 0 },   // Horizontal
        { x: 0, y: 1 },   // Vertical
        { x: 1, y: 1 },   // Diagonal \
        { x: 1, y: -1 }   // Diagonal /
    ];

    checkWin(player) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (this.board[row][col] !== player) {
                    continue;
                }

                for (const { x, y } of RenjuGame.directions) {
                    let count = 0;

                    for (let i = 0; i < ITERATIONS; i++) {
                        const newRow = row + i * y;
                        const newCol = col + i * x;

                        if (!(newRow >= 0 && newRow < SIZE && newCol >= 0 && newCol < SIZE && this.board[newRow][newCol] === player)) {
                            break;
                        }

                        count++;
                    }

                    if (count === 5) {
                        // Check for overline
                        const prevRow = row - y;
                        const prevCol = col - x;
                        const nextRow = row + 5 * y;
                        const nextCol = col + 5 * x;

                        if ((prevRow < 0 || prevRow >= SIZE || prevCol < 0 || prevCol >= SIZE || this.board[prevRow][prevCol] !== player) &&
                            (nextRow < 0 || nextRow >= SIZE || nextCol < 0 || nextCol >= SIZE || this.board[nextRow][nextCol] !== player)) {
                            return { win: true, position: { row, col } };
                        }
                    }
                }
            }
        }
        return { win: false };
    }
}

class TestCaseProcessor {
    static processTestCase(board) {
        const game = new RenjuGame(board);
        const blackResult = game.checkWin(1);
        const whiteResult = game.checkWin(2);

        if (blackResult.win) {
            return `1\n${blackResult.position.row + 1} ${blackResult.position.col + 1}`;
        }
        
        if (whiteResult.win) {
            return `2\n${whiteResult.position.row + 1} ${whiteResult.position.col + 1}`;
        }

        return '0';
    }
}

class Main {
    static main() {
        const inputFilePath = path.join(__dirname, 'tests', 'test_main_diag.txt');
        const input = InputFileReader.readInputFile(inputFilePath);

        let index = 0;
        const testCases = parseInt(input[index++], 10);
        const results = [];

        for (let testCase = 0; testCase < testCases; testCase++) {
            let board = [];

            for (let i = 0; i < SIZE; i++) {
                board.push(input[index++]?.split('').map(Number));
            }

            board = board.filter(item => item);

            if (board.length !== SIZE) {
                return console.error('\x1b[31m%s\x1b[0m', `ERROR: Test case ${testCases} had an error because the board size was not equal to ${SIZE}`);
            }

            results.push(TestCaseProcessor.processTestCase(board));
        }

        results.forEach(result => console.log(result));
    }
}

Main.main();
