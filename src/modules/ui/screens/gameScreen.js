import { gameController } from '../domController.js';

const app = document.getElementById('app');

// Configuration for different game modes
const GAME_CONFIG = {
  '1p': {
    aiDelay: 100, // Very fast AI in 1P mode
    showTransition: false, // No need for transitions in 1P
  },
  '2p': {
    aiDelay: 0, // No AI in 2P
    showTransition: true, // Show transitions for player swapping
    transitionDelay: 1000, // Time for players to swap positions
  },
};

// Generic fade transition utility
function fadeTransition(callback, delay = 500) {
  const config = GAME_CONFIG[gameController.gameMode];

  if (!config.showTransition) {
    callback();
    return;
  }

  const fadeElements = document.querySelectorAll(
    '.menu, .menu-title, .menu-description, button, input, label, .ship-placement'
  );
  fadeElements.forEach((el) => el.classList.add('fade-out'));

  setTimeout(() => {
    callback();
    setTimeout(() => {
      const newElements = document.querySelectorAll(
        '.game-container, .boards-container, .game-info, button'
      );
      newElements.forEach((el) => el.classList.add('fade-in'));
    }, 50);
  }, delay);
}

function renderGameScreen() {
  fadeTransition(() => {
    const currentPlayerName = gameController.currentPlayer.name;
    const isGameOver = gameController.isGameOver;

    app.innerHTML = `
      <div class="game-container">
        <div class="game-info">
          <h2>${isGameOver ? `Game Over! Winner: ${gameController.winner}` : `Current Turn: ${currentPlayerName}`}</h2>
          ${isGameOver ? '<button id="restart-game">Restart Game</button>' : ''}
        </div>
        <div class="boards-container">
          ${renderBoards()}
        </div>
      </div>
    `;

    // Setup event listeners after rendering
    setupGameEvents();
  });
}

function renderBoards() {
  if (gameController.gameMode === '1p') {
    // In 1P mode, always show human player's board on left, AI on right
    const humanPlayer = gameController.player1.isAI
      ? gameController.player2
      : gameController.player1;
    const aiPlayer = gameController.player1.isAI
      ? gameController.player1
      : gameController.player2;

    return `
      <div class="player-board">
        <h3>${humanPlayer.name}'s Board</h3>
        ${renderBoard(humanPlayer, 'own-board', false)}
      </div>
      <div class="opponent-board">
        <h3>${aiPlayer.name}'s Board</h3>
        ${renderBoard(aiPlayer, 'enemy-board', true)}
      </div>
    `;
  } else {
    // In 2P mode, boards in fixed positions
    // Player 1 always on left, Player 2 always on right
    // Attackable cells will be determined by whose turn it is
    return `
      <div class="player-board">
        <h3>${gameController.player1.name}'s Board</h3>
        ${renderBoard(gameController.player1, getBoardClass(gameController.player1), isEnemyBoard(gameController.player1))}
      </div>
      <div class="opponent-board">
        <h3>${gameController.player2.name}'s Board</h3>
        ${renderBoard(gameController.player2, getBoardClass(gameController.player2), isEnemyBoard(gameController.player2))}
      </div>
    `;
  }
}

function renderBoard(player, boardClass, isEnemyBoard) {
  const boardContainer = document.createElement('div');
  boardContainer.className = `board-container ${boardClass}`;

  // Get ship coordinates and attack data
  const shipCoordinates = player.gameboard.getShipCoordinates();
  const missedAttacks = player.gameboard.missedAttacks;
  const successfulAttacks = player.gameboard.successfulAttacks;

  // Determine if ships should be visible
  const showShips = shouldShowShips(player, isEnemyBoard);

  player.gameboard.board.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'grid-row';

    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement('div');
      cellElement.className = `grid-cell ${boardClass}-cell`;
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;
      cellElement.dataset.player = getPlayerIdentifier(player);

      const coordinate = `${rowIndex},${colIndex}`;

      // Check if current cell has a ship
      const isShipCell = shipCoordinates.some(
        (coord) => coord[0] === rowIndex && coord[1] === colIndex
      );

      // Add ship class if ships should be visible and cell has ship
      if (isShipCell && showShips) {
        cellElement.classList.add('ship');
      }

      // Add attack result classes
      if (missedAttacks.has(coordinate)) {
        cellElement.classList.add('missed');
      }

      if (successfulAttacks.has(coordinate)) {
        cellElement.classList.add('hit');
      }

      // Make enemy board cells attackable if it's player's turn and game isn't over
      if (isEnemyBoard && canPlayerAttack()) {
        cellElement.classList.add('attackable');
      }

      rowElement.appendChild(cellElement);
    });

    boardContainer.appendChild(rowElement);
  });

  return boardContainer.outerHTML;
}

function getPlayerIdentifier(player) {
  return player === gameController.player1 ? 'player1' : 'player2';
}

// Helper functions for 2P mode board classification
function getBoardClass(player) {
  if (gameController.gameMode === '1p') {
    return player.isAI ? 'enemy-board' : 'own-board';
  }

  // In 2P mode, determine if this board belongs to current player
  return player === gameController.currentPlayer ? 'own-board' : 'enemy-board';
}

function isEnemyBoard(player) {
  if (gameController.gameMode === '1p') {
    return player.isAI;
  }

  // In 2P mode, enemy board is the one that doesn't belong to current player
  return player !== gameController.currentPlayer;
}

function shouldShowShips(player, isEnemyBoard) {
  // In 1-player mode, never show AI ships
  if (gameController.gameMode === '1p' && player.isAI) {
    return false;
  }

  // Never show enemy ships (they should be hidden until hit)
  return !isEnemyBoard;
}

function canPlayerAttack() {
  if (gameController.isGameOver) return false;

  // In 1P mode, only human player can click
  if (gameController.gameMode === '1p') {
    return !gameController.currentPlayer.isAI;
  }

  // In 2P mode, current player can always attack
  return true;
}

function setupGameEvents() {
  // Add click listeners to attackable cells (enemy board)
  const attackableCells = document.querySelectorAll('.attackable');
  attackableCells.forEach((cell) => {
    cell.addEventListener('click', handleCellAttack);
  });

  // Add hover effects for attackable cells
  attackableCells.forEach((cell) => {
    cell.addEventListener('mouseenter', handleCellHover);
    cell.addEventListener('mouseleave', handleCellLeave);
  });
}

function handleCellHover(event) {
  if (gameController.isGameOver || !canPlayerAttack()) return;

  const cell = event.target;
  const coordinate = `${cell.dataset.row},${cell.dataset.col}`;

  // Check if cell is already attacked
  const targetPlayer = getTargetPlayer(cell.dataset.player);
  const isAlreadyAttacked =
    targetPlayer.gameboard.missedAttacks.has(coordinate) ||
    targetPlayer.gameboard.successfulAttacks.has(coordinate);

  if (!isAlreadyAttacked) {
    cell.classList.add('hover-target');
  }
}

function handleCellLeave(event) {
  event.target.classList.remove('hover-target');
}

function handleCellAttack(event) {
  if (gameController.isGameOver || !canPlayerAttack()) return;

  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const coordinate = `${row},${col}`;

  // Check if cell is already attacked
  const targetPlayer = getTargetPlayer(cell.dataset.player);
  const isAlreadyAttacked =
    targetPlayer.gameboard.missedAttacks.has(coordinate) ||
    targetPlayer.gameboard.successfulAttacks.has(coordinate);

  if (isAlreadyAttacked) {
    return; // Can't attack the same cell twice
  }

  // Execute the attack through game controller
  const attackResult = gameController.handleTurn(row, col);

  // Update the visual board after attack
  updateBoardVisuals();

  // Handle AI turn in 1P mode
  if (
    gameController.gameMode === '1p' &&
    gameController.currentPlayer.isAI &&
    !gameController.isGameOver
  ) {
    const config = GAME_CONFIG[gameController.gameMode];
    setTimeout(() => {
      executeAITurn();
    }, config.aiDelay);
  }

  // Handle turn transition in 2P mode
  if (gameController.gameMode === '2p' && !gameController.isGameOver) {
    const config = GAME_CONFIG[gameController.gameMode];
    setTimeout(() => {
      updateBoardVisuals();
    }, config.transitionDelay);
  }

  // Check if game is over
  if (gameController.isGameOver) {
    handleGameEnd();
  }
}

function getTargetPlayer(playerDataset) {
  return playerDataset === 'player1'
    ? gameController.player1
    : gameController.player2;
}

function executeAITurn() {
  if (!gameController.currentPlayer.isAI || gameController.isGameOver) {
    return;
  }

  // AI makes its move
  const attackResult = gameController.handleTurn();

  // Update visuals immediately in 1P mode
  updateBoardVisuals();

  // Check if game is over after AI turn
  if (gameController.isGameOver) {
    handleGameEnd();
  }
}

function updateBoardVisuals() {
  // Re-render the entire game screen to reflect new state
  renderGameScreen();
}

function handleGameEnd() {
  // Game is over, remove all click listeners and show game over state
  const attackableCells = document.querySelectorAll('.attackable');
  attackableCells.forEach((cell) => {
    cell.classList.remove('attackable');
  });
}

// Export functions for DOM controller to use
export { renderGameScreen };
