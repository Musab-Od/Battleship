import Ship from './Ship.js';
class Gameboard {
  constructor() {
    this.board = Array.from({ length: 10 }, () => Array(10).fill(null)); // 10x10 grid
    this.ships = [];
    this.missedAttacks = new Set();
    this.successfulAttacks = new Set();
  }

  placeShip(ship, row, col, isVertical = false) {
    const shipLength = ship.length;

    // Check bounds
    if (isVertical) {
      if (row + shipLength > 10) return false;
    } else {
      if (col + shipLength > 10) return false;
    }

    // Check for overlap and adjacency
    for (let i = 0; i < shipLength; i++) {
      const r = isVertical ? row + i : row;
      const c = isVertical ? col : col + i;

      if (this.board[r][c] !== null) return false;

      const surroundingCells = this.getSurroundingCells(r, c);

      for (const [adjRow, adjCol] of surroundingCells) {
        if (this.board[adjRow][adjCol] !== null) return false;
      }
    }

    // Place the ship
    for (let i = 0; i < shipLength; i++) {
      const r = isVertical ? row + i : row;
      const c = isVertical ? col : col + i;
      this.board[r][c] = ship;
    }

    this.ships.push(ship);
    return true;
  }

  receiveAttack(row, col) {
    const coordinate = `${row},${col}`;
    if (
      this.missedAttacks.has(coordinate) ||
      this.successfulAttacks.has(coordinate)
    ) {
      return null; // Already attacked this coordinate - return null to indicate invalid move
    }

    const target = this.board[row][col];
    if (target instanceof Ship) {
      target.hit();
      this.successfulAttacks.add(coordinate);
      return true; // Successful hit
    } else {
      this.missedAttacks.add(coordinate);
      return false; // Missed attack
    }
  }

  placeRandomly() {
    const shipLengths = [5, 4, 3, 3, 2]; // Example ship lengths
    for (const length of shipLengths) {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isVertical = Math.random() < 0.5; // Randomly choose orientation
        const ship = new Ship(length);
        placed = this.placeShip(ship, row, col, isVertical);
      }
    }
  }

  getEmptyCells() {
    let emptyCells = 0;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.board[i][j] === null) emptyCells++;
      }
    }
    return emptyCells;
  }

  checkWin() {
    return this.ships.every((ship) => ship.isSunk);
  }

  getShipCoordinates() {
    const shipCoords = [];

    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[row][col] instanceof Ship) {
          shipCoords.push([row, col]);
        }
      }
    }

    return shipCoords;
  }

  getAdjacent(row, col) {
    const adjacent = [];

    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 }, // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }, // Right
    ];

    for (const dir of directions) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;

      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        adjacent.push([newRow, newCol]);
      }
    }

    return adjacent;
  }

  getSurroundingCells(row, col) {
    const surrounding = [];

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (
          r >= 0 &&
          r < 10 &&
          c >= 0 &&
          c < 10 &&
          !(r === row && c === col) // exclude the center cell itself
        ) {
          surrounding.push([r, c]);
        }
      }
    }

    return surrounding;
  }

  reset() {
    this.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.missedAttacks.clear();
    this.successfulAttacks.clear();
  }
}

export default Gameboard;
