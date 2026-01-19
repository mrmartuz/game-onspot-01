// Main character management system entry point
import { showCharacterList } from "./views/character-list.js";
import { showCharacterPreview } from "./views/character-preview.js";

/**
 * Main character management dialog entry point
 * @returns {Promise<string>} Navigation result
 */
export async function showCharacterManagementDialog() {
  let currentIndex = 0;
  let characters = [];

  // Show character list
  let result = await showCharacterList();

  // Handle close
  if (result === "close") {
    return "close";
  }

  // Handle preview request
  if (result && result.action === "preview") {
    // Store character list and current index for navigation
    characters = result.characters || [];
    currentIndex = result.index || 0;

    // Show preview with navigation capability
    while (true) {
      const currentCharacter = characters[currentIndex]?.character;
      if (!currentCharacter) {
        break;
      }

      const previewResult = await showCharacterPreview(
        currentCharacter,
        currentIndex,
        characters
      );

      // Handle navigation
      if (previewResult === "nav_previous") {
        // Go to previous character, wrap to last if at first
        if (currentIndex > 0) {
          currentIndex--;
        } else {
          currentIndex = characters.length - 1;
        }
        continue; // Re-show preview with new character
      }

      if (previewResult === "nav_next") {
        // Go to next character, wrap to first if at last
        if (currentIndex < characters.length - 1) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        continue; // Re-show preview with new character
      }

      // Go back to list
      if (previewResult === "back") {
        result = await showCharacterList();
        if (result === "close") {
          return "close";
        }
        if (result && result.action === "preview") {
          characters = result.characters || [];
          currentIndex = result.index || 0;
          continue; // Show new preview
        }
        break;
      }

      // Return any other result
      return previewResult;
    }
  }

  // Return any other result
  return result;
}
