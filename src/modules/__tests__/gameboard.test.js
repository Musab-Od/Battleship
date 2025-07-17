import Gameboard from '../classes/Gameboard.js';
import Ship from '../classes/Ship.js';

describe('Placing a ship on the board', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard(); // Create a new gameboard before each test
  });

  test('Ship is placed horizontally', () => {
    const ship = new Ship(3);
    const result = gameboard.placeShip(ship, 0, 0, false);
    expect(result).toBe(true);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
    expect(gameboard.ships).toContain(ship);
  });

  test('Ship is placed vertically', () => {
    const ship = new Ship(3);
    const result = gameboard.placeShip(ship, 0, 0, true);
    expect(result).toBe(true);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[1][0]).toBe(ship);
    expect(gameboard.board[2][0]).toBe(ship);
    expect(gameboard.ships).toContain(ship);
  });

  test('Ship placement fails if it goes out of bounds', () => {
    const ship = new Ship(3);
    const horizontalResult = gameboard.placeShip(ship, 0, 8, false); // Out horizontally
    const verticalResult = gameboard.placeShip(ship, 8, 0, true); // Out vertically

    expect(horizontalResult).toBe(false);
    expect(verticalResult).toBe(false);
  });

  test('Ship placement fails if it overlaps with another ship', () => {
    const ship1 = new Ship(3);
    const ship2 = new Ship(2);
    gameboard.placeShip(ship1, 0, 0, false);

    const result = gameboard.placeShip(ship2, 0, 1, false); // Overlapping
    expect(result).toBe(false);
  });

  test('Ship placement fails due to adjacent ships', () => {
    const ship1 = new Ship(3);
    const ship2 = new Ship(2);
    gameboard.placeShip(ship1, 0, 0, false);

    const result = gameboard.placeShip(ship2, 1, 0, true); // Adjacent
    expect(result).toBe(false);
  });
});

describe('Receiving attacks', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('Attack misses and save coorinates', () => {
    const ship = new Ship(3);
    gameboard.placeShip(ship, 0, 0, false);
    const result = gameboard.receiveAttack(5, 5);
    gameboard.receiveAttack(5, 6);
    gameboard.receiveAttack(5, 7);
    expect(result).toBe(false);
    expect(gameboard.missedAttacks).toContain('5,5');
    expect(gameboard.missedAttacks).toContain('5,6');
    expect(gameboard.missedAttacks).toContain('5,7');
  });

  test('Attack hits and sinks a ship', () => {
    const ship = new Ship(3);
    gameboard.placeShip(ship, 0, 0, false);
    const result = gameboard.receiveAttack(0, 0);
    expect(result).toBe(true);
    expect(ship.isSunk).toBe(false); // Ship should not be sunk yet
    gameboard.receiveAttack(0, 1);
    gameboard.receiveAttack(0, 2);
    expect(ship.isSunk).toBe(true); // Ship should be sunk now
    expect(gameboard.successfulAttacks).toContain('0,0');
    expect(gameboard.successfulAttacks).toContain('0,1');
    expect(gameboard.successfulAttacks).toContain('0,2');
    expect(gameboard.ships[0].isSunk).toBe(true);
  });
});

describe('Placing ships randomly and check win condition', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('Randomly place 5 ships', () => {
    gameboard.placeRandomly();
    expect(gameboard.getEmptyCells()).toBe(83);
    expect(gameboard.ships.length).toBe(5);
  });

  test('Check if all ships are sunk', () => {
    const ship1 = new Ship(3);
    const ship2 = new Ship(2);
    gameboard.placeShip(ship1, 0, 0, false);
    gameboard.placeShip(ship2, 2, 0, true);

    // Sink the ships
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(0, 1);
    gameboard.receiveAttack(0, 2);
    gameboard.receiveAttack(2, 0);
    gameboard.receiveAttack(3, 0);

    expect(gameboard.checkWin()).toBe(true);
    for (let ship of gameboard.ships) {
      expect(ship.isSunk).toBe(true);
    }
  });
});
