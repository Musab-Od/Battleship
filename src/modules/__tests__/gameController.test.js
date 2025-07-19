import GameController from '../classes/GameController.js';
import Player from '../classes/Player.js';

describe('GameController', () => {
  let gamecontroller;
  let player1;
  let player2;

  beforeEach(() => {
    player1 = new Player('John', false);
    player2 = new Player('AI', true);
    gamecontroller = new GameController(player1, player2, '1P');
  });

  describe('Constructor', () => {
    test('should initialize with correct default values', () => {
      expect(gamecontroller.player1).toBe(player1);
      expect(gamecontroller.player2).toBe(player2);
      expect(gamecontroller.currentPlayer).toBe(player1);
      expect(gamecontroller.opponent).toBe(player2);
      expect(gamecontroller.gameMode).toBe('1P');
      expect(gamecontroller.difficulty).toBe('normal');
      expect(gamecontroller.shipsToPlace).toEqual([5, 4, 3, 3, 2]);
      expect(gamecontroller.currentShipIndex).toBe(0);
      expect(gamecontroller.placementPhase).toBe(true);
      expect(gamecontroller.isGameOver).toBe(false);
      expect(gamecontroller.winner).toBeNull();
    });
  });

  describe('shipPlacement', () => {
    test('should place ships for human player and increment ship index', () => {
      const result = gamecontroller.shipPlacement(player1, 0, 0, false);
      expect(gamecontroller.currentShipIndex).toBe(1);
      expect(gamecontroller.placementPhase).toBe(true);
    });

    test('should exit placement phase after placing all ships', () => {
      // Place all 5 ships
      gamecontroller.shipPlacement(player1, 0, 0, false);
      gamecontroller.shipPlacement(player1, 2, 0, false);
      gamecontroller.shipPlacement(player1, 4, 0, false);
      gamecontroller.shipPlacement(player1, 6, 0, false);
      const result = gamecontroller.shipPlacement(player1, 8, 0, false);

      expect(result).toBe(true);
      expect(gamecontroller.placementPhase).toBe(false);
      expect(gamecontroller.currentShipIndex).toBe(0);
    });

    test('should return false when ship placement fails', () => {
      // Try to place a ship in an invalid position (assuming this would fail in gameboard.placeShip)
      // Mock the placeShip method to return false for invalid placement
      jest.spyOn(player1.gameboard, 'placeShip').mockReturnValue(false);

      const result = gamecontroller.shipPlacement(player1, 0, 0, false);
      expect(result).toBe(false);
      expect(gamecontroller.currentShipIndex).toBe(0); // Should not increment
    });

    test('should handle AI ship placement', () => {
      jest.spyOn(player2.gameboard, 'placeRandomly').mockReturnValue(true);
      const result = gamecontroller.shipPlacement(player2);

      expect(result).toBe(true);
      expect(player2.gameboard.placeRandomly).toHaveBeenCalled();
    });
  });

  describe('handleTurn', () => {
    beforeEach(() => {
      // Set up ships for both players
      gamecontroller.shipPlacement(player1, 0, 0, false);
      gamecontroller.shipPlacement(player1, 2, 0, false);
      gamecontroller.shipPlacement(player1, 4, 0, false);
      gamecontroller.shipPlacement(player1, 6, 0, false);
      gamecontroller.shipPlacement(player1, 8, 0, false);
      gamecontroller.shipPlacement(player2);
      gamecontroller.placementPhase = false;
    });

    test('should handle human player attack', () => {
      jest.spyOn(player1, 'attack').mockReturnValue('hit');
      jest.spyOn(player2.gameboard, 'checkWin').mockReturnValue(false);

      const result = gamecontroller.handleTurn(0, 0);

      expect(player1.attack).toHaveBeenCalledWith(0, 0, player2);
      expect(result).toBe('hit');
      expect(gamecontroller.currentPlayer).toBe(player2); // Should swap turns
      expect(gamecontroller.opponent).toBe(player1);
    });

    test('should handle AI player attack with normal difficulty', () => {
      gamecontroller.swapTurns(); // Make AI the current player
      jest.spyOn(player2, 'randomAttack').mockReturnValue('miss');
      jest.spyOn(player1.gameboard, 'checkWin').mockReturnValue(false);

      const result = gamecontroller.handleTurn();

      expect(player2.randomAttack).toHaveBeenCalledWith(player1);
      expect(result).toBe('miss');
      expect(gamecontroller.currentPlayer).toBe(player1); // Should swap back
    });

    test('should handle AI player attack with hard difficulty', () => {
      gamecontroller.difficulty = 'hard';
      gamecontroller.swapTurns(); // Make AI the current player
      jest.spyOn(player2, 'smartAttack').mockReturnValue('hit');
      jest.spyOn(player1.gameboard, 'checkWin').mockReturnValue(false);

      const result = gamecontroller.handleTurn();

      expect(player2.smartAttack).toHaveBeenCalledWith(player1);
      expect(result).toBe('hit');
    });

    test('should end game when win condition is met', () => {
      jest.spyOn(player1, 'attack').mockReturnValue('hit');
      jest.spyOn(player2.gameboard, 'checkWin').mockReturnValue(true);

      gamecontroller.handleTurn(0, 0);

      expect(gamecontroller.isGameOver).toBe(true);
      expect(gamecontroller.winner).toBe('John');
    });

    test('should end game when AI wins', () => {
      gamecontroller.swapTurns(); // Make AI the current player
      jest.spyOn(player2, 'randomAttack').mockReturnValue('hit');
      jest.spyOn(player1.gameboard, 'checkWin').mockReturnValue(true);

      gamecontroller.handleTurn();

      expect(gamecontroller.isGameOver).toBe(true);
      expect(gamecontroller.winner).toBe('AI');
    });
  });

  describe('swapTurns', () => {
    test('should swap current player and opponent', () => {
      expect(gamecontroller.currentPlayer).toBe(player1);
      expect(gamecontroller.opponent).toBe(player2);

      gamecontroller.swapTurns();

      expect(gamecontroller.currentPlayer).toBe(player2);
      expect(gamecontroller.opponent).toBe(player1);
    });

    test('should swap back to original players', () => {
      gamecontroller.swapTurns();
      gamecontroller.swapTurns();

      expect(gamecontroller.currentPlayer).toBe(player1);
      expect(gamecontroller.opponent).toBe(player2);
    });
  });

  describe('resetGame', () => {
    test('should reset all game state to initial values', () => {
      // Modify game state
      gamecontroller.currentPlayer = player2;
      gamecontroller.opponent = player1;
      gamecontroller.currentShipIndex = 3;
      gamecontroller.placementPhase = false;
      gamecontroller.isGameOver = true;
      gamecontroller.winner = 'John';

      jest.spyOn(player1.gameboard, 'reset');
      jest.spyOn(player2.gameboard, 'reset');

      gamecontroller.resetGame();

      expect(player1.gameboard.reset).toHaveBeenCalled();
      expect(player2.gameboard.reset).toHaveBeenCalled();
      expect(gamecontroller.currentPlayer).toBe(player1);
      expect(gamecontroller.opponent).toBe(player2);
      expect(gamecontroller.currentShipIndex).toBe(0);
      expect(gamecontroller.placementPhase).toBe(true);
      expect(gamecontroller.isGameOver).toBe(false);
      expect(gamecontroller.winner).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete game flow', () => {
      // Ship placement phase
      expect(gamecontroller.placementPhase).toBe(true);

      // Place all ships for player1
      gamecontroller.shipPlacement(player1, 0, 0, false);
      gamecontroller.shipPlacement(player1, 2, 0, false);
      gamecontroller.shipPlacement(player1, 4, 0, false);
      gamecontroller.shipPlacement(player1, 6, 0, false);
      gamecontroller.shipPlacement(player1, 8, 0, false);

      expect(gamecontroller.placementPhase).toBe(false);

      // Place ships for AI
      gamecontroller.shipPlacement(player2);

      // Mock attacks and win condition
      jest.spyOn(player1, 'attack').mockReturnValue('hit');
      jest.spyOn(player2.gameboard, 'checkWin').mockReturnValue(true);

      // Execute turn
      gamecontroller.handleTurn(0, 0);

      expect(gamecontroller.isGameOver).toBe(true);
      expect(gamecontroller.winner).toBe('John');
    });
  });
});

describe('Human VS AI', () => {
  let gamecontroller;
  let player1;
  let player2;

  beforeEach(() => {
    player1 = new Player('John', false);
    player2 = new Player('AI', true);
    gamecontroller = new GameController(player1, player2, '1P');
  });

  test('Ship Place Phase', () => {
    gamecontroller.shipPlacement(player1, 0, 0, false);
    gamecontroller.shipPlacement(player1, 2, 0, false);
    gamecontroller.shipPlacement(player1, 4, 0, false);
    gamecontroller.shipPlacement(player1, 6, 0, false);
    gamecontroller.shipPlacement(player1, 8, 0, false);
    gamecontroller.shipPlacement(player2);

    expect(player1.gameboard.getEmptyCells()).toBe(83);
    expect(player2.gameboard.getEmptyCells()).toBe(83);
  });
});

describe('Human VS Human', () => {
  let gamecontroller;
  let player1;
  let player2;

  beforeEach(() => {
    player1 = new Player('John', false);
    player2 = new Player('Doe', false);
    gamecontroller = new GameController(player1, player2, '2P');
  });

  test('Ship placement phase', () => {
    gamecontroller.shipPlacement(player1, 0, 0, false);
    gamecontroller.shipPlacement(player1, 2, 0, false);
    gamecontroller.shipPlacement(player1, 4, 0, false);
    gamecontroller.shipPlacement(player1, 6, 0, false);
    gamecontroller.shipPlacement(player1, 8, 0, false);
    gamecontroller.shipPlacement(player2, 0, 0, false);
    gamecontroller.shipPlacement(player2, 2, 0, false);
    gamecontroller.shipPlacement(player2, 4, 0, false);
    gamecontroller.shipPlacement(player2, 6, 0, false);
    gamecontroller.shipPlacement(player2, 8, 0, false);

    expect(player1.gameboard.getEmptyCells()).toBe(83);
    expect(player2.gameboard.getEmptyCells()).toBe(83);
  });

  test('should handle both players placing ships correctly', () => {
    // Player 1 places all ships
    for (let i = 0; i < 5; i++) {
      gamecontroller.shipPlacement(player1, i * 2, 0, false);
    }
    expect(gamecontroller.placementPhase).toBe(false);
    expect(gamecontroller.currentShipIndex).toBe(0);

    // Player 2 places all ships
    for (let i = 0; i < 5; i++) {
      gamecontroller.shipPlacement(player2, i * 2, 2, false);
    }
    expect(gamecontroller.placementPhase).toBe(false);
  });
});
