import Ship from '../classes/Ship.js';
import Player from '../classes/Player.js';

describe('Player Attacking:', () => {
  let player1, player2;

  beforeEach(() => {
    player1 = new Player('John');
    player2 = new Player('AI', true);
  });

  test('Attacking specific coordinates no ship', () => {
    player1.attack(0, 0, player2);
    expect(player2.gameboard.missedAttacks.has('0,0')).toBe(true);
  });

  test('Attacking specific coordinates with ship', () => {
    const ship = new Ship(4);
    player2.gameboard.placeShip(ship, 0, 0, false);
    player1.attack(0, 0, player2);
    expect(player2.gameboard.successfulAttacks.has('0,0')).toBe(true);
    expect(ship.isSunk).toBe(false);
  });

  test('AI attacking randomly', () => {
    player2.randomAttack(player1);
    expect(player1.gameboard.missedAttacks.size).toBeGreaterThan(0);
  });

  test('AI smart attack', () => {
    const ship = new Ship(5);
    player1.gameboard.placeShip(ship, 0, 0, false);
    player2.attack(0, 0, player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    expect(player1.gameboard.successfulAttacks.size).toBeGreaterThan(3);
    expect(ship.hits).toBeGreaterThan(3);
  });

  test('AI smart attack sunk ship and chase another', () => {
    const ship1 = new Ship(2);
    const ship2 = new Ship(3);
    player1.gameboard.placeShip(ship1, 1, 2, false);
    player1.gameboard.placeShip(ship2, 5, 0, true);
    player2.attack(1, 2, player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    expect(ship1.isSunk).toBe(true);
    player2.attack(5, 0, player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    player2.smartAttack(player1);
    expect(ship2.isSunk).toBe(true);
    expect(player1.gameboard.checkWin()).toBe(true);
  });
});
