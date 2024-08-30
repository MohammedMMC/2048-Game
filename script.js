let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let grid = Array.from({ length: 4 }, () => Array(4).fill(0));
let size = canvas.width / 4;
let gameOver = false;
let startX, startY, endX, endY;
let timerElement = document.getElementById('timer');
let timerInterval;
let startTime = null;

function addNumber() {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = Math.random() > 0.1 ? 2 : 4;
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            drawCell(r, c, grid[r][c]);
        }
    }
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        clearInterval(timerInterval);
    }
}

function drawCell(row, col, value) {
    ctx.fillStyle = value === 0 ? '#cdc1b4' : getColor(value);
    ctx.fillRect(col * size, row * size, size, size);
    if (value) {
        ctx.fillStyle = value > 4 ? '#f9f6f2' : '#776e65';
        ctx.font = `${size / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, col * size + size / 2, row * size + size / 2);
    }
}

function getColor(value) {
    switch (value) {
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f65e3b';
        case 128: return '#edcf72';
        case 256: return '#edcc61';
        case 512: return '#edc850';
        case 1024: return '#edc53f';
        case 2048: return '#edc22e';
        default: return '#3c3a32';
    }
}

function move(row, col, dRow, dCol) {
    let moved = false;
    while (true) {
        let newRow = row + dRow;
        let newCol = col + dCol;
        if (newRow < 0 || newRow >= 4 || newCol < 0 || newCol >= 4 || grid[newRow][newCol] !== 0 && grid[newRow][newCol] !== grid[row][col]) break;
        if (grid[newRow][newCol] === 0) {
            grid[newRow][newCol] = grid[row][col];
            grid[row][col] = 0;
            row = newRow;
            col = newCol;
            moved = true;
        } else if (grid[newRow][newCol] === grid[row][col]) {
            grid[newRow][newCol] *= 2;
            grid[row][col] = 0;
            moved = true;
            break;
        }
    }
    return moved;
}

function handleMove(dRow, dCol) {
    if (gameOver) return;

    if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
    }

    let moved = false;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let row = dRow === 1 ? 3 - r : r;
            let col = dCol === 1 ? 3 - c : c;
            if (grid[row][col] !== 0) {
                moved = move(row, col, dRow, dCol) || moved;
            }
        }
    }
    if (moved) {
        addNumber();
        if (checkGameOver()) {
            gameOver = true;
        }
    }
    drawGrid();
}

function checkGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) return false;
            if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
            if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
        }
    }
    return true;
}

function updateTimer() {
    let elapsed = Date.now() - startTime;
    let minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
    let seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    let milliseconds = String(elapsed % 1000).padStart(3, '0');
    timerElement.textContent = `${minutes}:${seconds}:${milliseconds.slice(0, 2)}`;
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': handleMove(-1, 0); break;
        case 'ArrowDown': handleMove(1, 0); break;
        case 'ArrowLeft': handleMove(0, -1); break;
        case 'ArrowRight': handleMove(0, 1); break;
    }
});

canvas.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});
canvas.addEventListener('touchend', e => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    let dx = endX - startX;
    let dy = endY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) handleMove(0, 1);
        else handleMove(0, -1);
    } else {
        if (dy > 0) handleMove(1, 0);
        else handleMove(-1, 0);
    }
});


for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
    addNumber();
}
drawGrid();