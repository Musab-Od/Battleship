import Gameboard from './Gameboard.js';

class Player {
  constructor(name, isAI = false) {
    this.name = name;
    this.gameboard = new Gameboard();
    this.isAI = isAI;
    this.targetQueue = [];
    this.firstHit = null;
    this.direction = null;
  }

  attack(row, col, opponent) {
    return opponent.gameboard.receiveAttack(row, col);
  }

  randomAttack(opponent) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
    } while (
      opponent.gameboard.missedAttacks.has(`${row},${col}`) ||
      opponent.gameboard.successfulAttacks.has(`${row},${col}`)
    );

    // Return both the result and the coordinates
    const result = this.attack(row, col, opponent);
    return { result, row, col };
  }

  smartAttack(opponent) {
    const board = opponent.gameboard;

    // Step 1: If we have targets in queue, attack the first one
    if (this.targetQueue.length > 0) {
      const [row, col] = this.targetQueue.shift();
      const hit = this.attack(row, col, opponent);

      if (hit === true) {
        // We hit! Check if ship is sunk
        const hitShip = board.board[row][col];
        if (hitShip.isSunk) {
          // Ship is sunk, clear everything and go back to random
          this.targetQueue = [];
          this.firstHit = null;
          this.direction = null;
          return hit;
        }

        // Ship not sunk, continue hunting
        if (!this.firstHit) {
          // This is our first hit in this hunt
          this.firstHit = [row, col];
          // Add adjacent cells to target queue
          this.addAdjacentTargets(row, col, board);
        } else {
          // We already had a first hit, so this is our second hit
          // Determine direction
          this.direction = this.getDirection(this.firstHit, [row, col]);
          // Clear queue and add directional targets
          this.targetQueue = [];
          this.addDirectionalTargets(this.firstHit, this.direction, board);
          this.addDirectionalTargets([row, col], this.direction, board);
        }
      }
      // If we missed, just continue with next target in queue
      return hit;
    }

    // Step 2: Check if there are existing hits that we haven't processed
    // This handles the case where a hit was made outside of smartAttack
    const unprocessedHits = this.findUnprocessedHits(board);
    if (unprocessedHits.length > 0) {
      // Process the first unprocessed hit
      const [row, col] = unprocessedHits[0];
      const hitShip = board.board[row][col];

      if (!hitShip.isSunk) {
        // Ship not sunk, start hunting from this position
        this.firstHit = [row, col];
        this.addAdjacentTargets(row, col, board);
        // Now attack the first target in queue
        if (this.targetQueue.length > 0) {
          return this.smartAttack(opponent); // Recursive call to process the queue
        }
      }
    }

    // Step 3: No targets in queue and no unprocessed hits, make random attack
    const attackResult = this.randomAttack(opponent);
    const hit = attackResult.result;

    if (hit === true) {
      const row = attackResult.row;
      const col = attackResult.col;

      // Check if ship is sunk
      const hitShip = board.board[row][col];
      if (!hitShip.isSunk) {
        // Ship not sunk, start hunting
        this.firstHit = [row, col];
        this.addAdjacentTargets(row, col, board);
      }
      // If ship is sunk, we don't need to hunt
    }

    return hit;
  }

  // Find hits that haven't been processed yet (no adjacent targets queued)
  findUnprocessedHits(board) {
    const unprocessedHits = [];

    for (const hitCoord of board.successfulAttacks) {
      const [row, col] = hitCoord.split(',').map(Number);
      const hitShip = board.board[row][col];

      // If ship is not sunk and this hit hasn't been processed
      if (!hitShip.isSunk && !this.isHitProcessed(row, col, board)) {
        unprocessedHits.push([row, col]);
      }
    }

    return unprocessedHits;
  }

  // Check if a hit has been processed (has adjacent targets or is part of current hunt)
  isHitProcessed(row, col, board) {
    // If this is our current first hit, it's being processed
    if (this.firstHit && this.firstHit[0] === row && this.firstHit[1] === col) {
      return true;
    }

    // Check if any adjacent cells are in our target queue
    const adjacent = board.getAdjacent(row, col);
    for (const [r, c] of adjacent) {
      if (this.targetQueue.some(([tr, tc]) => tr === r && tc === c)) {
        return true;
      }
    }

    return false;
  }

  addAdjacentTargets(row, col, board) {
    const adjacent = board.getAdjacent(row, col);

    for (const [r, c] of adjacent) {
      const key = `${r},${c}`;
      // Only add if not already attacked and not already in queue
      if (
        !board.missedAttacks.has(key) &&
        !board.successfulAttacks.has(key) &&
        !this.targetQueue.some(([tr, tc]) => tr === r && tc === c)
      ) {
        this.targetQueue.push([r, c]);
      }
    }
  }

  getDirection(first, second) {
    if (first[0] === second[0]) return 'horizontal'; // Same row
    if (first[1] === second[1]) return 'vertical'; // Same column
    return null;
  }

  addDirectionalTargets(origin, direction, board) {
    const [row, col] = origin;

    if (direction === 'horizontal') {
      // Add left and right
      this.addTargetIfValid(row, col - 1, board);
      this.addTargetIfValid(row, col + 1, board);
    } else if (direction === 'vertical') {
      // Add up and down
      this.addTargetIfValid(row - 1, col, board);
      this.addTargetIfValid(row + 1, col, board);
    }
  }

  addTargetIfValid(row, col, board) {
    const key = `${row},${col}`;
    if (
      row >= 0 &&
      row < 10 &&
      col >= 0 &&
      col < 10 &&
      !board.missedAttacks.has(key) &&
      !board.successfulAttacks.has(key) &&
      !this.targetQueue.some(([tr, tc]) => tr === row && tc === col)
    ) {
      this.targetQueue.push([row, col]);
    }
  }
}

export default Player;
