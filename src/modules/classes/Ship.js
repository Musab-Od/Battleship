class Ship {
  constructor(length) {
    this.length = length; // Length of the ship
    this.hits = 0; // Number of hits the ship has taken
    this.isSunk = false; // Whether the ship is sunk or not
  }

  hit() {
    this.hits += 1; // Increment the hit count
    if (this.hits === this.length) this.isSunk = true;
  }
}

export default Ship;
