import Ship from '../classes/Ship';

describe('Ship Class', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3); // Create a ship of length 3 before each test
  });

  test('Initializes a ship', () => {
    expect(ship.length).toBe(3);
    expect(ship.hits).toBe(0);
    expect(ship.isSunk).toBe(false);
  });

  test('hits increases each time the ship is hit', () => {
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(2);
  });

  test('the ship sinks when hits equal length', () => {
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk).toBe(true);
  });
});
