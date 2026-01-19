// input_handlers.js
import { move } from "./movement.js";
import {
  getShowMenuDialog,
  getShowGoldDialog,
  getShowInventoryDialog,
  getShowDiscoveriesDialog,
  getShowHealthGroupDialog,
  getShowEventsDialog,
  toggleMapType,
} from "./interactions.js";
import { gameState } from "./gamestate/game_variables.js";
import { canvas } from "./rendering.js";

const directions = [
  { id: "btn-n", dx: 0, dy: -1 },
  { id: "btn-ne", dx: 1, dy: -1 },
  { id: "btn-e", dx: 1, dy: 0 },
  { id: "btn-se", dx: 1, dy: 1 },
  { id: "btn-s", dx: 0, dy: 1 },
  { id: "btn-sw", dx: -1, dy: 1 },
  { id: "btn-w", dx: -1, dy: 0 },
  { id: "btn-nw", dx: -1, dy: -1 },
];

// Track pressed keys for WASD movement
const pressedKeys = new Set();
let lastMovementTime = 0;
const MOVEMENT_COOLDOWN = 100; // Minimum time between movements in ms
const DIAGONAL_BUFFER_TIME = 150; // Time window to press second key for diagonal movement in ms
let movementInterval = null; // Store interval ID for cleanup
let diagonalBufferTimeout = null; // Timeout for diagonal movement buffer

// Calculate movement direction from pressed WASD keys
function getMovementFromKeys() {
  let dx = 0;
  let dy = 0;

  // W = North (up), S = South (down)
  if (pressedKeys.has("w")) {
    dy -= 1;
  }
  if (pressedKeys.has("s")) {
    dy += 1;
  }

  // A = West (left), D = East (right)
  if (pressedKeys.has("a")) {
    dx -= 1;
  }
  if (pressedKeys.has("d")) {
    dx += 1;
  }

  return { dx, dy };
}

// Handle keyboard movement
function handleKeyboardMovement() {
  const now = performance.now();
  if (now - lastMovementTime < MOVEMENT_COOLDOWN) {
    return;
  }

  const { dx, dy } = getMovementFromKeys();
  if (dx !== 0 || dy !== 0) {
    move(dx, dy);
    lastMovementTime = now;
  }
}

export function setupInputs() {
  // Clear existing listeners to prevent duplicates
  directions.forEach((dir) => {
    const button = document.getElementById(dir.id);
    if (button) {
      // Remove previous listeners if any
      button.removeEventListener("click", move);
      button.addEventListener(
        "click",
        () => {
          `Clicked direction: ${dir.id}`; // Debug
          move(dir.dx, dir.dy);
        },
        { passive: true }
      );
    } else {
      console.error(`Button not found: ${dir.id}`);
    }
  });
  "Directions setup:", directions; // Debug

  // Function to handle player interaction (for both touch and click)
  const handlePlayerInteraction = (e) => {
    if (gameState.cooldown) return; // Prevent interaction during cooldown
    let rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.type === "touchstart") {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if (e.type === "click") {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    let vx = Math.floor((x - gameState.offsetX) / gameState.tileSize);
    let vy = Math.floor((y - gameState.offsetY) / gameState.tileSize);

    // Check if click is on the player (center tile)
    let centerTileX = Math.floor(gameState.viewWidth / 2);
    let centerTileY = Math.floor(gameState.viewHeight / 2);

    if (vx === centerTileX && vy === centerTileY) {
      ("Player clicked at center tile"); // Debug
      getShowMenuDialog();
    }
  };

  // Remove existing canvas listeners to prevent duplicates
  canvas.removeEventListener("touchstart", handlePlayerInteraction);
  canvas.removeEventListener("click", handlePlayerInteraction);
  canvas.removeEventListener("touchend", preventDefaultTouchEnd);

  // Add touch and click listeners for canvas
  canvas.addEventListener("touchstart", handlePlayerInteraction, {
    passive: true,
  });
  canvas.addEventListener("click", handlePlayerInteraction, { passive: true });
  canvas.addEventListener("touchend", preventDefaultTouchEnd, {
    passive: false,
  });

  function preventDefaultTouchEnd(e) {
    e.preventDefault();
  }

  // Setup click and touchstart listeners for status buttons
  const buttons = [
    { id: "gold-button", handler: getShowGoldDialog },
    { id: "inventory-button", handler: getShowInventoryDialog },
    { id: "group-button", handler: getShowHealthGroupDialog },
    { id: "date-button", handler: getShowEventsDialog },
    { id: "discoveries-button", handler: getShowDiscoveriesDialog },
    { id: "map-button", handler: toggleMapType },
  ];

  buttons.forEach(({ id, handler }) => {
    const button = document.getElementById(id);
    if (button) {
      button.removeEventListener("click", handler);
      button.removeEventListener("touchstart", handler);
      button.addEventListener("click", handler, { passive: true });
      button.addEventListener(
        "touchstart",
        (e) => {
          `Touched button: ${id}`; // Debug
          e.preventDefault(); // Prevent click event from firing
          handler();
        },
        { passive: false }
      );
    } else {
      console.error(`Button not found: ${id}`);
    }
  });

  // Setup WASD keyboard movement
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();

    // Handle WASD keys for movement
    if (["w", "a", "s", "d"].includes(key)) {
      const wasEmpty = pressedKeys.size === 0;
      pressedKeys.add(key);
      e.preventDefault(); // Prevent default browser behavior

      // Clear any pending single-direction movement timeout
      if (diagonalBufferTimeout) {
        clearTimeout(diagonalBufferTimeout);
        diagonalBufferTimeout = null;
      }

      const { dx, dy } = getMovementFromKeys();
      const isDiagonal = dx !== 0 && dy !== 0;

      // If diagonal movement or multiple keys, move immediately
      if (isDiagonal || pressedKeys.size > 1) {
        if (!gameState.cooldown) {
          handleKeyboardMovement();
        }
      } else if (wasEmpty && !gameState.cooldown) {
        // If this is the first key pressed, wait a bit for potential diagonal
        diagonalBufferTimeout = setTimeout(() => {
          if (pressedKeys.size === 1 && !gameState.cooldown) {
            // Still only one key after buffer time, move in single direction
            handleKeyboardMovement();
          }
          diagonalBufferTimeout = null;
        }, DIAGONAL_BUFFER_TIME);
      }
    }

    // Handle E key for menu interaction (harvest/build buttons) (only in regional map)
    if (key === "e") {
      if (gameState.mapType === "regional") {
        e.preventDefault();
        getShowMenuDialog();
      }
    }
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      pressedKeys.delete(key);

      // Clear diagonal buffer timeout when key is released
      if (diagonalBufferTimeout) {
        clearTimeout(diagonalBufferTimeout);
        diagonalBufferTimeout = null;
      }

      // If keys are still pressed after release, check if we should move
      if (pressedKeys.size > 0 && !gameState.cooldown) {
        const { dx, dy } = getMovementFromKeys();
        if (dx !== 0 || dy !== 0) {
          // If only one direction remains, wait for potential diagonal again
          const isDiagonal = dx !== 0 && dy !== 0;
          if (!isDiagonal && pressedKeys.size === 1) {
            diagonalBufferTimeout = setTimeout(() => {
              if (pressedKeys.size === 1 && !gameState.cooldown) {
                handleKeyboardMovement();
              }
              diagonalBufferTimeout = null;
            }, DIAGONAL_BUFFER_TIME);
          }
        }
      }
    }
  };

  // Remove existing keyboard listeners to prevent duplicates
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);

  // Add keyboard listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Continuous movement check for held keys (handles diagonal movement)
  if (movementInterval) {
    clearInterval(movementInterval);
  }
  movementInterval = setInterval(() => {
    if (!gameState.cooldown && pressedKeys.size > 0) {
      handleKeyboardMovement();
    }
  }, MOVEMENT_COOLDOWN);

  ("Input handlers setup complete"); // Debug
}
