// Combat Dialog Render Effects
// Manages visual backdrop effects for combat dialogs with randomly generated blood stain patterns

const gameDialog = document.getElementById("game-dialog");
let dynamicStyleElement = null;

/**
 * Generate random blood stain pattern using radial-gradient circles
 * @param {string} targetType - "ally" or "enemy"
 * @returns {Array<string>} Array of radial-gradient CSS strings
 */
function generateBloodStainPattern(targetType) {
  const stains = [];

  // Generate main blood stains (doubled, smaller, concentrated on edges)
  const numMainStains = Math.floor(Math.random() * 16) + 60; // 60-75 main stains (doubled)

  // Color arrays
  const vividRedColors = [
    "#dc143c",
    "#ff0000",
    "#b22222",
    "#8b0000",
    "#a52a2a",
    "#c71585",
    "#ff4500",
  ];
  const darkRedColors = [
    "#8b0000",
    "#5a0000",
    "#6b0000",
    "#4a0000",
    "#3a0000",
    "#7a0000",
    "#2a0000",
  ];

  const colors = targetType === "ally" ? vividRedColors : darkRedColors;

  // Helper function to generate position outside dialog area
  // Dialog is centered (25-75% horizontal) and starts at top
  // Focus on edges: left (0-20%), right (80-100%), top (0-15%), bottom (85-100%)
  function getEdgePosition() {
    const side = Math.random();
    let x, y;

    if (side < 0.3) {
      // Left edge
      x = Math.random() * 20; // 0-20%
      y = Math.random() * 100; // Full height
    } else if (side < 0.6) {
      // Right edge
      x = Math.random() * 20 + 80; // 80-100%
      y = Math.random() * 100; // Full height
    } else if (side < 0.75) {
      // Top edge
      x = Math.random() * 100; // Full width
      y = Math.random() * 15; // 0-15%
    } else {
      // Bottom edge
      x = Math.random() * 100; // Full width
      y = Math.random() * 15 + 85; // 85-100%
    }

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }

  // Generate main blood stains (positioned on edges, outside dialog)
  for (let i = 0; i < numMainStains; i++) {
    const pos = getEdgePosition();

    // Smaller size (2-6% radius for more stains)
    const size = Math.floor(Math.random() * 5) + 2;

    // Random color from appropriate array
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Create radial gradient
    stains.push(
      `radial-gradient(circle at ${pos.x}% ${
        pos.y
      }%, ${color} ${size}%, transparent ${size + 1}%)`
    );
  }

  // Add scattered blood droplets (very small, also on edges, doubled)
  const numDroplets = Math.floor(Math.random() * 20) + 80; // 80-100 small droplets (doubled)
  for (let i = 0; i < numDroplets; i++) {
    const pos = getEdgePosition();

    // Very small droplets (1-3% radius)
    const size = Math.floor(Math.random() * 3) + 1;

    // Random color from appropriate array
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Create small droplet
    stains.push(
      `radial-gradient(circle at ${pos.x}% ${
        pos.y
      }%, ${color} ${size}%, transparent ${size + 0.5}%)`
    );
  }

  return stains;
}

/**
 * Generate white line patterns
 * @param {string} effectType - "hit" or "miss"
 * @returns {Array<string>} Array of linear-gradient CSS strings
 */
function generateWhiteLines(effectType) {
  const lines = [];

  if (effectType === "miss") {
    // X pattern - two diagonal lines (thinner: 0.5% width instead of 4%)
    lines.push(
      `linear-gradient(135deg, transparent 49.75%, white 49.75% 50.25%, transparent 50.25%)`
    );
    lines.push(
      `linear-gradient(45deg, transparent 49.75%, white 49.75% 50.25%, transparent 50.25%)`
    );
  } else {
    // Hit - random diagonal lines through blood stains (2-4 lines, thinner)
    const numLines = Math.floor(Math.random() * 3) + 2; // 2-4 lines

    for (let i = 0; i < numLines; i++) {
      // Random angle (variations of 135deg and 45deg)
      const baseAngle = Math.random() < 0.5 ? 135 : 45;
      const angle = baseAngle + (Math.random() * 20 - 10); // ±10 degrees variation

      // Random position for the line
      const position = Math.floor(Math.random() * 20) + 40; // 40-60%

      // Thinner lines: 0.5% width instead of 4%
      lines.push(
        `linear-gradient(${angle}deg, transparent ${position - 0.25}%, white ${
          position - 0.25
        }% ${position + 0.25}%, transparent ${position + 0.25}%)`
      );
    }
  }

  return lines;
}

/**
 * Apply combat backdrop effect to dialog
 * @param {string} effectType - "hit" or "miss"
 * @param {string} targetType - "ally" or "enemy"
 */
export function applyCombatBackdrop(effectType, targetType) {
  if (!gameDialog) {
    console.warn("Game dialog element not found");
    return;
  }

  // Clear any existing dynamic styles
  clearCombatBackdrop();

  // Generate patterns
  const whiteLines = generateWhiteLines(effectType);

  // Only generate blood stains for hits (not misses)
  const bloodStains =
    effectType === "hit" ? generateBloodStainPattern(targetType) : [];

  // Combine all background images (blood stains first, then white lines last)
  // This ensures slashes render on top and appear sharper
  const allImages = [...bloodStains, ...whiteLines];
  const backgroundImage = allImages.join(", ");

  // Determine CSS class and opacity
  let className = "";
  let opacity = 0.92;

  if (effectType === "miss") {
    className = "combat-backdrop-ally-miss";
    opacity = 0.85;
  } else if (targetType === "ally") {
    className = "combat-backdrop-ally-hit";
    opacity = 0.92;
  } else {
    className = "combat-backdrop-enemy-hit";
    opacity = 0.95; // Increased opacity for darker enemy hit spots
  }

  // Create or get dynamic style element
  if (!dynamicStyleElement) {
    dynamicStyleElement = document.createElement("style");
    dynamicStyleElement.id = "combat-backdrop-dynamic-style";
    document.head.appendChild(dynamicStyleElement);
  }

  // Generate CSS for the backdrop
  // Layer the background: dark gray base, then blood stains, then slashes on top
  // Slashes are rendered last so they appear on top and sharper
  // Use minimal blur - blood stains get slight blur, slashes stay relatively sharp
  const blurAmount = effectType === "miss" ? "0" : "0.5px"; // Very minimal blur to keep slashes sharp
  const css = `
    #game-dialog.${className}::backdrop {
      background-color: rgba(0, 0, 0, 0.7) !important;
      background-image: ${backgroundImage} !important;
      filter: blur(${blurAmount});
      opacity: ${opacity} !important;
      transition: opacity 0.2s ease-in;
    }
  `;

  dynamicStyleElement.textContent = css;

  // Add class to dialog element immediately
  // The backdrop will be visible when the dialog opens with showModal()
  gameDialog.classList.add(className);

  // Force a reflow to ensure styles are applied
  void gameDialog.offsetHeight;
}

/**
 * Clear combat backdrop effect
 */
export function clearCombatBackdrop() {
  if (!gameDialog) {
    return;
  }

  // Remove all combat backdrop classes
  gameDialog.classList.remove(
    "combat-backdrop-ally-hit",
    "combat-backdrop-ally-miss",
    "combat-backdrop-enemy-hit"
  );

  // Clear dynamic style (but keep the element for reuse)
  if (dynamicStyleElement) {
    dynamicStyleElement.textContent = "";
  }
}
