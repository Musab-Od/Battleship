const app = document.getElementById('app');

// Generic fade transition utility
function fadeTransition(callback, delay = 500) {
  const fadeElements = document.querySelectorAll(
    '.menu-description, button, input, label, .rules-content'
  );
  fadeElements.forEach((el) => el.classList.add('fade-out'));

  setTimeout(() => {
    callback();
    setTimeout(() => {
      const newElements = document.querySelectorAll(
        '.menu-description, button, input, label, .rules-content'
      );
      newElements.forEach((el) => el.classList.add('fade-in'));
    }, 50);
  }, delay);
}

// Generic menu renderer
function renderMenu(config) {
  const { title, description, content } = config;
  app.innerHTML = `
    <div class="menu">
      <h2 class="menu-title">${title}</h2>
      <p class="menu-description">${description}</p>
      ${content}
    </div>
  `;
}

// All menu configurations in one place
const MENUS = {
  start: {
    title: 'Welcome to BattleShip',
    description:
      "A classic game of strategy and luck. Place your ships, guess your opponent's positions, and sink their fleet!",
    content: `
      <button id="start-button">Start Game</button>
      <button id="game-rules">Game Rules</button>
    `,
  },

  playerSelect: {
    title: 'Welcome to BattleShip',
    description:
      'Choose your player type to start the game. You can play against a friend or challenge the computer.',
    content: `
      <button id="one-player">Challenge the computer</button>
      <button id="two-player">Play against a friend</button>
    `,
  },

  playerName: {
    title: 'Welcome to BattleShip',
    description:
      'Ahoy, Captain! ⚓ What shall we call you as you command your fleet?',
    content: `
      <div class="form">
        <label for="player-name">Enter your name:</label>
        <input type="text" id="player-name" value="Player 1" />
        <button id="continue">Next</button>
      </div>
    `,
  },

  difficulty: {
    title: 'Welcome to BattleShip',
    description: 'Set Sail, Captain! ⚓ Choose Your Challenge:',
    content: `
      <button id="easy">🌊 Ensign (Easy) – Calm seas, simple strikes.</button>
      <button id="hard">🌊 💥 Admiral (Hard) – All cannons blazing!</button>
    `,
  },

  player1Name: {
    title: 'Welcome to BattleShip',
    description: 'Prepare for battle! 🎯 Captain 1',
    content: `
      <div class="form">
        <label for="player-name">Enter your name:</label>
        <input type="text" id="player-name" value="Player 1" />
        <button id="continue">Next</button>
      </div>
    `,
  },

  player2Name: {
    title: 'Welcome to BattleShip',
    description: 'Prepare for battle! 🎯 Captain 2',
    content: `
      <div class="form">
        <label for="player-name">Enter your name:</label>
        <input type="text" id="player-name" value="Player 2" />
        <button id="start-game">To Battle!!!</button>
      </div>
    `,
  },
};

// Simple rendering functions
function showMenu(menuKey) {
  if (menuKey === 'playerSelect' || menuKey === 'start') {
    // Handle transitions from initial state or between major menus
    const existingElements = document.querySelectorAll(
      '.menu-description, button, input, label, .rules-content'
    );

    existingElements.forEach((el) => {
      if (el) el.classList.add('fade-out');
    });

    setTimeout(() => {
      renderMenu(MENUS[menuKey]);
      setTimeout(() => {
        const newElements = document.querySelectorAll(
          '.menu-description, button'
        );
        newElements.forEach((el) => el.classList.add('fade-in'));
      }, 50);
    }, 500);
  } else {
    fadeTransition(() => renderMenu(MENUS[menuKey]));
  }
}

export { showMenu };
