import { getShowChoiceDialog } from "../interactions.js";
import { gameState } from "../gamestate/game_variables.js";
import { getTile } from "../rendering/tile.js";

/**
 * Get the appropriate death image based on death type and location
 * @param {string} death - Death type ("health", "gold", "thirst", "starvation", "hunting")
 * @returns {string} Image path
 */
function getDeathImage(death) {
  if (death === "health") {
    // Get current location for health deaths
    const tile = getTile(gameState.px, gameState.py);
    const location = tile?.location || "none";

    // Map location types to death images
    if (location === "volcano") {
      return "images/death-volcano-01.png";
    } else if (location === "monster caves" || location === "monster-cave") {
      return "images/death-monsters-cave-01.png";
    } else if (location === "cave") {
      return "images/death-cave-01.png";
    } else {
      // Default to encounter image for outside locations
      return "images/death-encounter-01.png";
    }
  } else if (death === "gold") {
    return "images/death-gold-01.png";
  } else if (death === "thirst") {
    return "images/death-thirst-01.png";
  } else if (death === "starvation") {
    return "images/death-starvation-01.png";
  }
  // No image for hunting or other death types
  return null;
}

export async function showDeathDialog(death) {
  let value = "";
  const deathImage = getDeathImage(death);

  // Helper function to build dialog options with image, message, and button
  function buildDialogOptions(message) {
    const options = [];
    // Add image if available (first)
    if (deathImage) {
      options.push({
        type: "image",
        src: deathImage,
        alt: "Death scene",
        maxWidth: "100%",
        marginBottom: "15px",
      });
    }
    // Add message (second)
    if (message) {
      options.push({
        type: "message",
        label: message,
        value: "",
      });
    }
    // Add button (third)
    options.push({ type: "button", label: "🔄 Restart Game", value: "reload" });
    return options;
  }

  if (death === "health") {
    await getShowChoiceDialog("", buildDialogOptions("You died fighting! ☠️"));
    value = "reload";
  } else if (death === "gold") {
    await getShowChoiceDialog(
      "",
      buildDialogOptions("You paid your debt with your life! ☠️")
    );
    value = "reload";
  } else if (death === "hunting") {
    await getShowChoiceDialog(
      "",
      buildDialogOptions("The hunter became the hunted! ☠️ \n You died!")
    );
    value = "reload";
  }
  if (death === "thirst") {
    if (gameState.group.length > 1) {
      await getShowChoiceDialog(
        "",
        buildDialogOptions(
          "You left your group without anything to drink, they clench their thirst with your blood! ☠️"
        )
      );
      value = "reload";
    } else {
      await getShowChoiceDialog(
        "",
        buildDialogOptions(
          "Your head pulsating like a roaring storm... your throat swells closing your airway... you died of thirst! ☠️"
        )
      );
      value = "reload";
    }
  }
  if (death === "starvation") {
    if (gameState.group.length > 1) {
      await getShowChoiceDialog(
        "",
        buildDialogOptions(
          "You left your group without anything to eat, they clench their hunger with your blood! ☠️"
        )
      );
      value = "reload";
    } else {
      await getShowChoiceDialog(
        "",
        buildDialogOptions(
          "A slow and steady agony... you died of starvation! ☠️"
        )
      );
      value = "reload";
    }
  }

  if (value === "reload") {
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
}
