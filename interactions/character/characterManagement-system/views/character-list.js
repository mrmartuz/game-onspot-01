// Character list view - shows player + all group members
import { gameState } from "../../../../gamestate/game_variables.js";
import { showChoiceDialog } from "../../../showDialog.js";
import { classEmoji } from "../../../../gamestate/emoji-database.js";
import { raceEmoji } from "../../../../gamestate/emoji-database.js";
import { createMessage, createCloseButton } from "../utils/utils-navigation.js";

/**
 * Show character list with player + all group members
 * @returns {Promise<Object>} Selected character or navigation result
 */
export async function showCharacterList() {
  const message = "👥 CHARACTER LIST";

  let components = [];
  components.push(createMessage("Select a character to view details:"));
  components.push(createMessage("")); // Empty line for spacing

  let characterIndex = 0;
  const characters = [];

  // Add player character first if it exists
  if (gameState.playerCharacter) {
    const player = gameState.playerCharacter;
    const raceEmojiIcon = raceEmoji[player.race] || "👤";
    const classEmojiIcon = classEmoji[player.class] || "👤";

    components.push({
      type: "button",
      label: `👤 ${player.firstName} ${
        player.lastName
      } ${raceEmojiIcon} ${classEmojiIcon} | Lvl.${player.level || 1} | ${
        player.health?.current || 0
      }/${player.health?.max || 0} HP`,
      value: `character_${characterIndex}`,
    });

    characters.push({
      character: player,
      type: "player",
      index: characterIndex,
    });
    characterIndex++;
  }

  // Add group members
  if (gameState.group.length > 0) {
    gameState.group.forEach((member) => {
      const raceEmojiIcon = raceEmoji[member.race] || "👤";
      const classEmojiIcon = classEmoji[member.class] || "👤";

      components.push({
        type: "button",
        label: `👥 ${member.firstName} ${
          member.lastName
        } ${raceEmojiIcon} ${classEmojiIcon} | Lvl.${member.level || 1} | ${
          member.health?.current || 0
        }/${member.health?.max || 0} HP`,
        value: `character_${characterIndex}`,
      });

      characters.push({
        character: member,
        type: "group",
        index: characterIndex,
      });
      characterIndex++;
    });
  }

  // Add close button
  components.push(createCloseButton());

  const choice = await showChoiceDialog(message, components);

  if (choice === "close") {
    return "close";
  }

  if (choice && choice.startsWith("character_")) {
    const index = parseInt(choice.split("_")[1]);
    const selected = characters[index];
    if (selected) {
      return {
        action: "preview",
        character: selected.character,
        type: selected.type,
        index: selected.index,
        characters: characters, // Include full character list for navigation
      };
    }
  }

  return "close";
}
