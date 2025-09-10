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
import { gameState } from "./game_variables.js";
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
          console.log(`Clicked direction: ${dir.id}`); // Debug
          move(dir.dx, dir.dy);
        },
        { passive: true }
      );
    } else {
      console.error(`Button not found: ${dir.id}`);
    }
  });
  console.log("Directions setup:", directions); // Debug

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
      console.log("Player clicked at center tile"); // Debug
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
          console.log(`Touched button: ${id}`); // Debug
          e.preventDefault(); // Prevent click event from firing
          handler();
        },
        { passive: false }
      );
    } else {
      console.error(`Button not found: ${id}`);
    }
  });

  console.log("Input handlers setup complete"); // Debug
}
