import Player from './Player.js';
import Ship from './Ship.js';

class GameController {
  constructor(player1, player2, gameMode) {
    this.player1 = player1;
    this.player2 = player2;
    this.currentPlayer = player1;
    this.opponent = player2;
    this.gameMode = gameMode;
    this.difficulty = 'normal';
    this.shipsToPlace = [5, 4, 3, 3, 2]; // Lengths of ships to place
    this.currentShipIndex = 0;
    this.placementPhase = true; // Flag to indicate if we are in the ship placement phase
    this.isGameOver = false;
    this.winner = null; // To store the winner of the game
  }

  shipPlacement(player, row = null, col = null, isVertical = false) {
    if (player.isAI) {
      // AI logic to place ships randomly
      player.gameboard.placeRandomly();
      return true;
    }

    const shipLength = this.shipsToPlace[this.currentShipIndex];
    const ship = new Ship(shipLength);
    const placed = player.gameboard.placeShip(ship, row, col, isVertical);

    if (placed) {
      this.currentShipIndex++;
      if (this.currentShipIndex >= this.shipsToPlace.length) {
        this.placementPhase = false; // All ships placed, exit placement phase
        this.currentShipIndex = 0; // Reset for next player
        return true;
      }
    }
    return false; // Ship placement failed
  }

  handleTurn(row, col) {
    const attacker = this.currentPlayer;
    const opponent = this.opponent;
    let result;

    if (attacker.isAI) {
      // AI logic for attacking (Depending on difficulty)
      result =
        this.difficulty === 'hard'
          ? attacker.smartAttack(opponent)
          : attacker.randomAttack(opponent);
    } else {
      // Human player attacking
      result = attacker.attack(row, col, opponent);
    }

    // Check win condition
    if (opponent.gameboard.checkWin()) {
      this.isGameOver = true;
      this.winner = attacker.name; // Set the winner
    }

    this.swapTurns();
    return result; // Return the result of the attack
  }

  swapTurns() {
    [this.currentPlayer, this.opponent] = [this.opponent, this.currentPlayer];
  }

  resetGame() {
    this.player1.gameboard.reset();
    this.player2.gameboard.reset();
    this.currentPlayer = this.player1;
    this.opponent = this.player2;
    this.currentShipIndex = 0;
    this.placementPhase = true;
    this.isGameOver = false;
    this.winner = null;
  }
}

export default GameController;
