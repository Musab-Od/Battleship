import { gameController } from '../domController.js';

const app = document.getElementById('app');
let isVertical = false;
let currentPreviewCells = [];

// Generic fade transition utility
function fadeTransition(callback, delay = 500) {
  const fadeElements = document.querySelectorAll(
    '.menu, .menu-title, .menu-description, button, input, label'
  );
  fadeElements.forEach((el) => el.classList.add('fade-out'));

  setTimeout(() => {
    callback();
    setTimeout(() => {
      const newElements = document.querySelectorAll(
        '.ship-placement, .menu-title, .grid-container, .controls, button'
      );
      newElements.forEach((el) => el.classList.add('fade-in'));
    }, 50);
  }, delay);
}

function renderShipPlacementScreen(gameboard, playerName = null) {
  fadeTransition(() => {
    app.innerHTML = `
      <div class="ship-placement">
        <h2 class="menu-title">Place Your Ships ${playerName}</h2>
        <div class="ship-info">
          <p>Current Ship: Length <span>${gameController.shipsToPlace[gameController.currentShipIndex]}</span></p>
          <p>Ships Remaining: <span>${gameController.shipsToPlace.length - gameController.currentShipIndex}</span></p>
        </div>
        ${renderGrid(gameboard)}
        <div class="controls">
          <button id="random-placement">Place Random</button>
          <button id="rotate-ship">Rotate Ship (${isVertical ? 'Vertical' : 'Horizontal'})</button>
          <button id="confirm-placements" class="${gameController.placementPhase ? 'disabled' : ''}">Confirm Placements</button>
        </div>
      </div>
    `;

    // Setup event listeners after rendering
    setupShipPlacementEvents();
  });
}

function renderGrid(gameboard) {
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  gameboard.board.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'grid-row';

    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement('div');
      cellElement.className = 'grid-cell';
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;

      // Show placed ships - check if gameboard has ship at this position
      if (gameboard.board[rowIndex][colIndex] !== null) {
        cellElement.classList.add('ship-placed');
      }

      rowElement.appendChild(cellElement);
    });

    gridContainer.appendChild(rowElement);
  });

  return gridContainer.outerHTML;
}

function setupShipPlacementEvents() {
  // Grid cell events
  const gridCells = document.querySelectorAll('.grid-cell');
  gridCells.forEach((cell) => {
    cell.addEventListener('mouseenter', handleCellHover);
    cell.addEventListener('mouseleave', clearPreview);
    cell.addEventListener('click', handleCellClick);
  });

  // Button events - Note: confirm-placements will be handled in domController
  document
    .getElementById('random-placement')
    .addEventListener('click', handleRandomPlacement);
  document
    .getElementById('rotate-ship')
    .addEventListener('click', handleRotateShip);
  // Confirm button will be handled by domController via event delegation
}

function handleCellHover(event) {
  if (!gameController.placementPhase) return;

  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  const shipLength =
    gameController.shipsToPlace[gameController.currentShipIndex];

  clearPreview();

  const previewPositions = calculateShipPositions(
    row,
    col,
    shipLength,
    isVertical
  );

  if (previewPositions.length === shipLength) {
    currentPreviewCells = previewPositions;
    previewPositions.forEach((pos) => {
      const cell = document.querySelector(
        `[data-row="${pos.row}"][data-col="${pos.col}"]`
      );
      if (cell) {
        cell.classList.add('ship-preview');
      }
    });
  }
}

function clearPreview() {
  currentPreviewCells.forEach((pos) => {
    const cell = document.querySelector(
      `[data-row="${pos.row}"][data-col="${pos.col}"]`
    );
    if (cell) {
      cell.classList.remove('ship-preview');
    }
  });
  currentPreviewCells = [];
}

function calculateShipPositions(row, col, shipLength, vertical) {
  const positions = [];
  const boardSize = 10; // Assuming 10x10 board

  if (vertical) {
    // Check if ship fits vertically
    if (row + shipLength <= boardSize) {
      // Place from top to bottom
      for (let i = 0; i < shipLength; i++) {
        positions.push({ row: row + i, col });
      }
    } else if (row - shipLength + 1 >= 0) {
      // Place from bottom to top
      for (let i = 0; i < shipLength; i++) {
        positions.push({ row: row - i, col });
      }
    }
  } else {
    // Check if ship fits horizontally
    if (col + shipLength <= boardSize) {
      // Place from left to right
      for (let i = 0; i < shipLength; i++) {
        positions.push({ row, col: col + i });
      }
    } else if (col - shipLength + 1 >= 0) {
      // Place from right to left
      for (let i = 0; i < shipLength; i++) {
        positions.push({ row, col: col - i });
      }
    }
  }

  return positions;
}

function handleCellClick(event) {
  if (!gameController.placementPhase) return;

  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  // Use GameController's shipPlacement method
  const placed = gameController.shipPlacement(
    gameController.currentPlayer,
    row,
    col,
    isVertical
  );

  if (placed) {
    // Clear preview first
    clearPreview();

    // Update visual representation
    updateGridVisuals();
    updateShipInfo();

    // Check if all ships are placed
    if (!gameController.placementPhase) {
      // All ships placed, enable confirm button
      const confirmBtn = document.getElementById('confirm-placements');
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('disabled');
    }
  }
}

function handleRandomPlacement() {
  // Clear current ships and reset game controller state
  gameController.currentPlayer.gameboard.reset();
  gameController.currentShipIndex = 0;
  gameController.placementPhase = true;

  // Use the gameboard's placeRandomly method
  gameController.currentPlayer.gameboard.placeRandomly();

  // Update game controller state - all ships are now placed
  gameController.placementPhase = false;
  gameController.currentShipIndex = 0;

  // Update visuals
  updateGridVisuals();
  updateShipInfo();

  // Enable confirm button
  const confirmBtn = document.getElementById('confirm-placements');
  confirmBtn.disabled = false;
  confirmBtn.classList.remove('disabled');
}

function handleRotateShip() {
  if (!gameController.placementPhase) return;

  isVertical = !isVertical;

  // Update button text
  const rotateBtn = document.getElementById('rotate-ship');
  rotateBtn.textContent = `Rotate Ship (${isVertical ? 'Vertical' : 'Horizontal'})`;

  // Clear current preview
  clearPreview();
}

function updateGridVisuals() {
  const gameboard = gameController.currentPlayer.gameboard;
  const gridCells = document.querySelectorAll('.grid-cell');

  gridCells.forEach((cell) => {
    const cellRow = parseInt(cell.dataset.row);
    const cellCol = parseInt(cell.dataset.col);

    // Check if this cell has a ship on the gameboard
    if (gameboard.board[cellRow][cellCol] !== null) {
      cell.classList.add('ship-placed');
    } else {
      cell.classList.remove('ship-placed');
    }
  });
}

function updateShipInfo() {
  const shipInfo = document.querySelector('.ship-info');
  if (shipInfo) {
    if (gameController.placementPhase) {
      shipInfo.innerHTML = `
        <p>Current Ship: Length <span>${gameController.shipsToPlace[gameController.currentShipIndex]}</span></p>
        <p>Ships Remaining: <span>${gameController.shipsToPlace.length - gameController.currentShipIndex}</span></p>
      `;
    } else {
      shipInfo.innerHTML = `
        <p><span>All ships placed!</span></p>
        <p>Click <span>Confirm</span> to continue</p>
      `;
    }
  }
}

// Reset rotation state when switching players
function resetPlacementState() {
  isVertical = false;
  clearPreview();
}

// Export functions for DOM controller to use
export {
  renderShipPlacementScreen,
  resetPlacementState,
  updateShipInfo,
  updateGridVisuals,
};
