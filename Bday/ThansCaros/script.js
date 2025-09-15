// Import các hàm cần thiết từ Firebase SDK v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, onValue, get, child, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Your web app's Firebase configuration (Đã lấy từ bạn)
const firebaseConfig = {
    apiKey: "AIzaSyD4ViyRqkMqiJBM7BGzBQu8ST66gsFhzWo",
    authDomain: "caro-online-137f3.firebaseapp.com",
    databaseURL: "https://caro-online-137f3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "caro-online-137f3",
    storageBucket: "caro-online-137f3.appspot.com",
    messagingSenderId: "344585803234",
    appId: "1:344585803234:web:b98b48d5e01f617f5215bb",
    measurementId: "G-TZP33SSJWF"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Lấy các phần tử HTML
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const currentPlayerSpan = document.getElementById('current-player');
const roomIdSpan = document.getElementById('room-id');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomInput = document.getElementById('room-input');
const resetBtn = document.getElementById('reset-btn');

const BOARD_SIZE = 15;
let boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
let currentPlayer = 'X';
let gameActive = false;
let currentRoomId = null; // Biến lưu ID phòng hiện tại
let playerSymbol = null; // 'X' hoặc 'O'

function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (!gameActive || playerSymbol !== currentPlayer || !currentRoomId) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (boardState[row][col] === null) {
        const roomRef = ref(database, 'rooms/' + currentRoomId);
        // Cập nhật nước đi và lượt chơi lên Firebase
        update(roomRef, {
            [`board/${row},${col}`]: currentPlayer,
            'turn': currentPlayer === 'X' ? 'O' : 'X'
        });
    }
}

function checkWinner() {
    const directions = [ [0, 1], [1, 0], [1, 1], [1, -1] ];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (boardState[r][c]) {
                const symbol = boardState[r][c];
                for (const [dr, dc] of directions) {
                    let count = 0;
                    for (let i = 0; i < 5; i++) {
                        const newR = r + i * dr;
                        const newC = c + i * dc;
                        if (newR >= 0 && newR < BOARD_SIZE && newC >= 0 && newC < BOARD_SIZE && boardState[newR][newC] === symbol) {
                            count++;
                        } else {
                            break;
                        }
                    }
                    if (count === 5) return symbol;
                }
            }
        }
    }
    return null;
}

createRoomBtn.addEventListener('click', () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    const roomRef = ref(database, 'rooms/' + roomId);
    const newGame = {
        board: {},
        turn: 'X',
        players: { playerX: true },
        winner: null
    };
    set(roomRef, newGame).then(() => {
        playerSymbol = 'X';
        joinRoom(roomId);
        alert(`Phòng đã được tạo! ID phòng của bạn là: ${roomId}. Hãy gửi nó cho bạn bè!`);
    });
});

joinRoomBtn.addEventListener('click', () => {
    const roomId = roomInput.value.trim();
    if (!roomId) return alert("Vui lòng nhập ID phòng.");

    const roomRef = ref(database, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
        if (snapshot.exists()) {
            const roomData = snapshot.val();
            if (!roomData.players.playerO) {
                update(child(roomRef, 'players'), { playerO: true });
                playerSymbol = 'O';
                joinRoom(roomId);
            } else {
                alert("Phòng đã đầy!");
            }
        } else {
            alert("Phòng không tồn tại!");
        }
    });
});

function joinRoom(roomId) {
    currentRoomId = roomId;
    const roomRef = ref(database, 'rooms/' + roomId);
    roomIdSpan.textContent = roomId;
    document.getElementById('controls').style.display = 'none';
    resetBtn.style.display = 'inline-block';

    // Lắng nghe thay đổi trong phòng (v9)
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        boardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        if (data.board) {
            Object.keys(data.board).forEach(key => {
                const [row, col] = key.split(',').map(Number);
                boardState[row][col] = data.board[key];
            });
        }
        updateBoardUI();

        currentPlayer = data.turn;
        currentPlayerSpan.textContent = currentPlayer;
        
        statusElement.textContent = (playerSymbol === currentPlayer) ? "Đến lượt bạn!" : "Đang chờ đối thủ...";

        const winner = checkWinner();
        if (winner) {
            gameActive = false;
            statusElement.textContent = `${winner} đã thắng!`;
            if(playerSymbol === currentPlayer) { // Chỉ người chơi thắng mới cập nhật
                 set(child(roomRef, 'winner'), winner);
            }
        } else if (data.winner) {
            gameActive = false;
            statusElement.textContent = `${data.winner} đã thắng!`;
        } else {
            gameActive = true;
        }
    });
}

function updateBoardUI() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = boardElement.children[r * BOARD_SIZE + c];
            const symbol = boardState[r][c];
            cell.textContent = symbol;
            cell.classList.remove('x', 'o');
            if (symbol) cell.classList.add(symbol.toLowerCase());
        }
    }
}

resetBtn.addEventListener('click', () => {
    if (currentRoomId) {
        const roomRef = ref(database, 'rooms/' + currentRoomId);
        set(roomRef, {
            board: {},
            turn: 'X',
            players: { playerX: true, playerO: true },
            winner: null
        });
    }
});

createBoard();
