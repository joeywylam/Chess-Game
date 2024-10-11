const chessboard = document.getElementById('chessboard');

// Initial chess board state
let board = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

// Images for chess pieces
const pieceImages = {
    '♚': 'images/king(b).png',
    '♛': 'images/queen(b).png',
    '♜': 'images/rook(b).png',
    '♞': 'images/knight(b).png',
    '♝': 'images/bishop(b).png',
    '♟': 'images/pawn(b).png',
    '♔': 'images/king(w).png',
    '♕': 'images/queen(w).png',
    '♖': 'images/rook(w).png',
    '♘': 'images/knight(w).png',
    '♗': 'images/bishop(w).png',
    '♙': 'images/pawn(w).png'
};

// Store selected piece and its position
let selectedPiece = null;
let selectedSquare = null;
let turn = 'white'; // Track whose turn it is

// Renders the chessboard based on the current state of the board
function renderBoard() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = (row + col) % 2 === 0 ? 'white' : 'black';
            square.setAttribute('data-row', row);
            square.setAttribute('data-col', col);

            const piece = board[row][col];
            if (piece) {
                square.style.backgroundImage = `url(${pieceImages[piece]})`;
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            chessboard.appendChild(square);
        }
    }
}

// Handles piece selection and movement logic
function handleSquareClick(row, col) {
    const clickedPiece = board[row][col];

    if (selectedPiece) {
        // Move piece if the move is valid
        if (isValidMove(selectedPiece, selectedSquare, row, col)) {
            board[row][col] = selectedPiece;
            board[selectedSquare.row][selectedSquare.col] = '';
            renderBoard();

            if (isCheckmate(turn === 'white' ? '♔' : '♚')) {
                alert(turn === 'white' ? "Black wins!" : "White wins!");
                restartGame();
            } else if (isCheck(turn === 'white' ? '♔' : '♚')) {
                alert(turn === 'white' ? "White is in check!" : "Black is in check!");
            }

            // Switch turns after a valid move
            turn = turn === 'white' ? 'black' : 'white';
        }
        selectedPiece = null;
        selectedSquare = null;
    } else if (clickedPiece && pieceColor(clickedPiece) === turn) {
        // Select the piece if it belongs to the player
        selectedPiece = clickedPiece;
        selectedSquare = { row, col };
    }
}

// Simple movement rules for each piece type (expand as needed)
function isValidMove(piece, from, toRow, toCol) {
    const diffRow = toRow - from.row;
    const diffCol = toCol - from.col;

    // Basic pawn movement (can be expanded to include capturing)
    if (piece === '♙' || piece === '♟') {
        const direction = piece === '♙' ? -1 : 1;
        return diffRow === direction && diffCol === 0 && !board[toRow][toCol];
    }

    // Rook movement: Moves in straight lines
    if (piece === '♖' || piece === '♜') {
        return (diffRow === 0 || diffCol === 0) && isPathClear(from, toRow, toCol);
    }

    // Bishop movement: Moves diagonally
    if (piece === '♗' || piece === '♝') {
        return Math.abs(diffRow) === Math.abs(diffCol) && isPathClear(from, toRow, toCol);
    }

    // Queen movement: Combination of rook and bishop
    if (piece === '♕' || piece === '♛') {
        return (Math.abs(diffRow) === Math.abs(diffCol) || diffRow === 0 || diffCol === 0) && isPathClear(from, toRow, toCol);
    }

    // Knight movement: Moves in an "L" shape
    if (piece === '♘' || piece === '♞') {
        return (Math.abs(diffRow) === 2 && Math.abs(diffCol) === 1) || (Math.abs(diffRow) === 1 && Math.abs(diffCol) === 2);
    }

    // King movement: Moves one square in any direction
    if (piece === '♔' || piece === '♚') {
        return Math.abs(diffRow) <= 1 && Math.abs(diffCol) <= 1;
    }

    return false;
}

// Check if the path is clear for pieces that move in straight lines (rooks, bishops, queens)
function isPathClear(from, toRow, toCol) {
    const rowStep = Math.sign(toRow - from.row);
    const colStep = Math.sign(toCol - from.col);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) {
            return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }

    return true;
}

// Determines the color of a piece
function pieceColor(piece) {
    return piece === piece.toUpperCase() ? 'white' : 'black';
}

// Checks if a king is in check
function isCheck(king) {
    const kingPos = findKing(king);

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && pieceColor(piece) !== pieceColor(king)) {
                if (isValidMove(piece, { row, col }, kingPos.row, kingPos.col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Checks if a king is in checkmate
function isCheckmate(king) {
    const kingPos = findKing(king);

    for (let row = kingPos.row - 1; row <= kingPos.row + 1; row++) {
        for (let col = kingPos.col - 1; col <= kingPos.col + 1; col++) {
            if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                if (!isCheckAfterMove(kingPos, { row, col })) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Simulates a move to check if it results in check
function isCheckAfterMove(from, to) {
    const originalTo = board[to.row][to.col];
    board[to.row][to.col] = board[from.row][from.col];
    board[from.row][from.col] = '';

    const checkStatus = isCheck(board[to.row][to.col]);

    board[from.row][from.col] = board[to.row][to.col];
    board[to.row][to.col] = originalTo;

    return checkStatus;
}

// Finds the position of the king on the board
function findKing(king) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === king) {
                return { row, col };
            }
        }
    }
}

// Restarts the game after a win
function restartGame() {
    board = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    turn = 'white';
    renderBoard();
}

// Initialize the game
renderBoard();
