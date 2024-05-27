const fs = require('fs');
const path = require('path');
const SIZE = 19;
const ITERATIONS = 5;

// Function to read the input file and parse it
function readInputFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8').trim().split('\n');
}

// Function to check if a player has won
function checkWin(board, player) {
    const directions = [
        { x: 1, y: 0 },   // Horizontal
        { x: 0, y: 1 },   // Vertical
        { x: 1, y: 1 },   // Diagonal \
        { x: 1, y: -1 }   // Diagonal /
    ];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] !== player) {
                continue;
            }

            for (const { x, y } of directions) {
                let count = 0;

                for (let i = 0; i < ITERATIONS; i++) {
                    const newRow = row + i * y;
                    const newCol = col + i * x;

                    if (!(newRow >= 0 && newRow < SIZE && newCol >= 0 && newCol < SIZE && board[newRow][newCol] === player)) {
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

                    if ((prevRow < 0 || prevRow >= SIZE || prevCol < 0 || prevCol >= SIZE || board[prevRow][prevCol] !== player) &&
                        (nextRow < 0 || nextRow >= SIZE || nextCol < 0 || nextCol >= SIZE || board[nextRow][nextCol] !== player)) {
                        return { win: true, position: { row, col } };
                    }
                }
            }
        }
    }

    return { win: false };
}

// Function to process each test case
function processTestCase(board) {
    const blackResult = checkWin(board, 1);
    const whiteResult = checkWin(board, 2);

    if (blackResult.win) {
        return `1\n${blackResult.position.row + 1} ${blackResult.position.col + 1}`;
    }
    
    if (whiteResult.win) {
        return `2\n${whiteResult.position.row + 1} ${whiteResult.position.col + 1}`;
    }

    return '0';
}

// Main function to run the Renju game checker
function main() {
    const inputFilePath = path.join(__dirname, 'tests', 'test_main_diag.txt');
    const input = readInputFile(inputFilePath);

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

        results.push(processTestCase(board));
    }

    results.forEach(result => console.log(result));
}

main();
