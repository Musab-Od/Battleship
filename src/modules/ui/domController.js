// domController.js - Central game flow management
import { showMenu } from './screens/startMenus.js';
import { renderGameRules } from './screens/gameRules.js';
import Player from '../classes/Player.js';
import GameController from '../classes/GameController.js';
import {
  renderShipPlacementScreen,
  resetPlacementState,
} from './screens/shipPlacement.js';
import { renderGameScreen } from './screens/gameScreen.js';

// Game state
let gameController = null;
let Player1 = null;
let gameMode = null;

// Initialize event delegation
function setupEvents() {
  document.addEventListener('click', handleClick);
  document.addEventListener('keypress', handleKeyPress);
}

// Reset all game state variables
function resetGameState() {
  gameController = null;
  Player1 = null;
  gameMode = null;
}

// Main click handler
function handleClick(event) {
  const { id } = event.target;

  switch (id) {
    // Menu navigation
    case 'start-button':
      showMenu('playerSelect');
      break;
    case 'game-rules':
      renderGameRules();
      break;
    case 'one-player':
      gameMode = '1p';
      showMenu('playerName');
      break;
    case 'two-player':
      gameMode = '2p';
      showMenu('player1Name');
      break;
    case 'continue':
      handleContinue();
      break;
    case 'easy':
      setDifficulty('easy');
      break;
    case 'hard':
      setDifficulty('hard');
      break;
    case 'start-game':
      handleGameStart();
      break;

    // Ship placement phase
    case 'confirm-placements':
      handleConfirmPlacements();
      break;

    // Game phase buttons
    case 'restart-game':
      handleRestartGame();
      break;
  }
}

// Handle Enter key presses
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    const input = event.target;
    if (input.id === 'player-name') {
      const continueBtn = document.getElementById('continue');
      const startBtn = document.getElementById('start-game');
      if (continueBtn) continueBtn.click();
      if (startBtn) startBtn.click();
    }
  }
}

// Handle continue button based on current context
function handleContinue() {
  const nameInput = document.getElementById('player-name');
  const playerName = nameInput.value.trim() || 'Player 1';

  if (gameMode === '1p') {
    Player1 = new Player(playerName);
    showMenu('difficulty');
  } else if (gameMode === '2p') {
    if (!Player1) {
      Player1 = new Player(playerName);
      showMenu('player2Name');
    }
  }
}

// Set difficulty and create GameController for single player
function setDifficulty(level) {
  const player2 = new Player('Admiral AI', true);
  gameController = new GameController(Player1, player2, gameMode);
  gameController.difficulty = level;

  // Start ship placement phase
  setTimeout(() => {
    renderShipPlacementScreen(
      gameController.player1.gameboard,
      gameController.player1.name
    );
  }, 100);
}

// Handle two-player game start
function handleGameStart() {
  const nameInput = document.getElementById('player-name');
  const playerName =
    nameInput.value.trim() || nameInput.placeholder || 'Player 2';
  const player2 = new Player(playerName);
  gameController = new GameController(Player1, player2, gameMode);

  // Start ship placement phase
  setTimeout(() => {
    renderShipPlacementScreen(
      gameController.player1.gameboard,
      gameController.player1.name
    );
  }, 100);
}

// Handle confirm placements button - This is the core game flow logic
function handleConfirmPlacements() {
  if (gameController.placementPhase) return; // Can't confirm if not all ships are placed

  // Check if we need to switch to player 2 placement
  if (
    gameController.gameMode === '2p' &&
    gameController.currentPlayer === gameController.player1
  ) {
    // Switch to player 2 placement
    switchToPlayer2Placement();
  } else {
    // All players have placed ships, start the actual game
    startGamePhase();
  }
}

// Switch to player 2 ship placement
function switchToPlayer2Placement() {
  gameController.currentPlayer = gameController.player2;
  gameController.opponent = gameController.player1;
  gameController.placementPhase = true;
  gameController.currentShipIndex = 0;

  // Reset placement state for new player
  resetPlacementState();

  // Render ship placement screen for player 2
  renderShipPlacementScreen(
    gameController.currentPlayer.gameboard,
    gameController.currentPlayer.name
  );
}

// Start the main game phase
function startGamePhase() {
  // Reset current player to player 1 for game start
  gameController.currentPlayer = gameController.player1;
  gameController.opponent = gameController.player2;

  // If player 2 is AI, place their ships automatically
  if (gameController.player2.isAI) {
    gameController.player2.gameboard.placeRandomly();
  }

  // Render the main game screen
  renderGameScreen();
}

// Game management functions
function handleRestartGame() {
  if (gameController) {
    gameController.resetGame();
  }

  // Reset all state variables to fresh start
  resetGameState();

  // Return to start menu instead of player selection
  showMenu('start');
}

// Initialize the game with dynamic start menu
function startGame() {
  setupEvents();
  // Show the start menu instead of relying on hardcoded HTML
  showMenu('start');
}

// Export game functions and controller
export {
  startGame,
  gameController, // Export so other modules can access the game controller
  handleRestartGame,
};
