import { showMenu } from './startMenus.js';
import welcomeImage from '../../../assets/welcome.png';
import placeShipsImage from '../../../assets/place-ships.png';
import attackImage from '../../../assets/attack.png';
import strategyImage from '../../../assets/strategy.png';
import vicrotyImage from '../../../assets/victory.png';

const app = document.getElementById('app');

// Define rule steps with engaging content
const rules = [
  {
    title: 'Welcome to BattleShip! ⚓',
    description:
      'Before you command the seas, let us show you how to win the war! Get ready to learn the art of naval warfare.',
    image: welcomeImage,
    buttonText: 'Show me how! 🚢',
  },
  {
    title: 'Step 1: Deploy Your Fleet',
    description:
      'Strategically place your ships on the grid. click on the game board to place your ships horizontally or vertically. Choose their positions wisely — your survival depends on it!',
    image: placeShipsImage,
    buttonText: 'Next ➡️',
  },
  {
    title: 'Step 2: Take Your Shot',
    description:
      'Click on the enemy grid to fire! Choose your targets carefully. A successful hit will be marked in red, while misses show as white. Listen for the satisfying sound of impact!',
    image: attackImage,
    buttonText: 'Next ➡️',
  },
  {
    title: 'Step 3: Strategy Matters',
    description:
      'Every move reveals valuable intelligence. When you hit a ship, search adjacent cells to find the rest of it. Think ahead and outsmart your opponent!',
    image: strategyImage,
    buttonText: 'Next ➡️',
  },
  {
    title: 'Victory or Defeat?',
    description:
      'Sink all enemy ships before they sink yours to claim victory! Each fleet has 5 ships of different sizes. May the best admiral win the battle!',
    image: vicrotyImage,
    buttonText: "Got it! Let's Battle! ⚔️",
  },
];

let currentRuleIndex = 0;

// Render the current rule step
function renderRuleStep(stepIndex) {
  const rule = rules[stepIndex];

  app.innerHTML = `
    <div class="rules-container">
      <div class="rules-content">
        <div class="rule-step">
          <span class="step-counter">${stepIndex + 1} / ${rules.length}</span>
          <h2 class="rule-title">${rule.title}</h2>
          <div class="rule-image-container">
            <img src="${rule.image}" alt="${rule.title}" class="rule-image" />
          </div>
          <p class="rule-description">${rule.description}</p>
          <div class="rule-navigation">
            ${stepIndex > 0 ? '<button id="prev-rule" class="nav-button secondary">← Previous</button>' : ''}
            <button id="next-rule" class="nav-button primary">${rule.buttonText}</button>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${((stepIndex + 1) / rules.length) * 100}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners for navigation
  setupRuleNavigation();
}

// Setup event listeners for rule navigation
function setupRuleNavigation() {
  const nextButton = document.getElementById('next-rule');
  const prevButton = document.getElementById('prev-rule');

  if (nextButton) {
    nextButton.addEventListener('click', handleNextRule);
  }

  if (prevButton) {
    prevButton.addEventListener('click', handlePrevRule);
  }
}

// Handle next rule button
function handleNextRule() {
  if (currentRuleIndex < rules.length - 1) {
    currentRuleIndex++;
    fadeTransitionToStep(currentRuleIndex);
  } else {
    // Finished all rules, return to main menu
    returnToMainMenu();
  }
}

// Handle previous rule button
function handlePrevRule() {
  if (currentRuleIndex > 0) {
    currentRuleIndex--;
    fadeTransitionToStep(currentRuleIndex);
  }
}

// Smooth transition between rule steps
function fadeTransitionToStep(stepIndex) {
  const content = document.querySelector('.rules-content');
  if (content) {
    content.classList.add('fade-out');

    setTimeout(() => {
      renderRuleStep(stepIndex);

      setTimeout(() => {
        const newContent = document.querySelector('.rules-content');
        if (newContent) {
          newContent.classList.add('fade-in');
        }
      }, 50);
    }, 300);
  }
}

// Return to main menu with transition
function returnToMainMenu() {
  const content = document.querySelector('.rules-content');
  if (content) {
    content.classList.add('fade-out');

    setTimeout(() => {
      // Reset rule index for next time
      currentRuleIndex = 0;
      // Return to start menu
      showMenu('start');
    }, 300);
  }
}

// Initialize and render the game rules screen
function renderGameRules() {
  currentRuleIndex = 0;
  renderRuleStep(0);
}

export { renderGameRules };
