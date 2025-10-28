// Random character generation step
import characterGeneration from "../../generation.js";
import { showCharacterPreview } from "./character-preview.js";

/**
 * Handle random character generation
 * @returns {Promise<Object|string>} Generated character or navigation result
 */
export async function handleRandomGeneration() {
  // Directly generate random character without confirmation
  const character = await characterGeneration.generateCharacter({
    usePointAllocation: false,
  });

  const result = await showCharacterPreview(
    character,
    "random",
    null,
    null,
    null,
    null,
    null
  );

  // Check if character was accepted
  if (result && result.action === "accept") {
    return result; // Return the accepted character
  }

  return result; // Return other results (back, regenerate, etc.)
}
