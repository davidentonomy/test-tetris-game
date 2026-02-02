const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;
const COLORS = ['#00ff88', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a55eea', '#fd9644', '#26de81'];

let board = [];
let currentPiece = null;
let score = 0;
let gameLoop = null;

const PIECES = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]]
];

function init() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    scoreElement.textContent = score;
    spawnPiece();
}

function spawnPiece() {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    currentPiece = {
        shape: PIECES[pieceIndex],
        color: COLORS[pieceIndex],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
    if (collision()) {
        gameOver();
    }
}

function collision() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                if (newY >= 0 && board[newY][newX]) return true;
            }
        }
    }
    return false;
}

function merge() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let lines = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
            y++;
        }
    }
    if (lines > 0) {
        score += lines * 100;
        scoreElement.textContent = score;
    }
}

function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }

    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }
}

function drop() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        clearLines();
        spawnPiece();
    }
}

function move(dir) {
    currentPiece.x += dir;
    if (collision()) currentPiece.x -= dir;
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const prev = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collision()) currentPiece.shape = prev;
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    alert('Game Over! Score: ' + score);
}

function gameStep() {
    drop();
    draw();
}

startButton.addEventListener('click', () => {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    init();
    draw();
    gameLoop = setInterval(gameStep, 500);
});

document.addEventListener('keydown', e => {
    if (!gameLoop) return;
    switch(e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); break;
        case 'ArrowUp': rotate(); break;
    }
    draw();
});

draw();
