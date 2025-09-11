import { gameState } from "../gamestate/game_variables.js";
import { getShowChoiceDialog } from "../interactions.js";
import { getGroupBonus } from "../utils.js";
import { updateStatus } from "../rendering.js";
import { logEvent } from "../time_system.js";
import { getTile } from "../rendering/tile.js";
import { getShowDeathDialog } from "../interactions.js";
import { showChoiceDialog } from "./showDialog.js";

export async function handleAnimal(x, y) {
  let tile = getTile(x, y);
  if (tile.entity === "animal" && gameState.food > 0) {
    let hunting = true;
    if (gameState.food <= -20) {
      showChoiceDialog(
        `🏹 You have ${Math.floor(
          gameState.food
        )} food left. You cant hunt anymore. You need to find some... 🍞`,
        [{ type: "button", label: "OK", value: "ok" }]
      );
      return;
    }
    while (hunting) {
      gameState.food -= 1;
      let r = Math.floor(Math.random() * 100 + getGroupBonus("combat"));
      if (r > 80) {
        let killPoints = 10 + getGroupBonus("food");
        gameState.killPoints += killPoints;
        let food = Math.floor(Math.random() * 3) + 1 + getGroupBonus("food");
        gameState.food += food;
        let msg = "";
        let r = Math.random() * 100;
        if (r > 50) {
          msg = `🪙🏹 You find traces of an animal. You follow them between the bushes. You find it near a stream, you took your shot and killed an animal gained ${killPoints} kill points and ${food} food🍞!`;
        } else if (r > 20) {
          msg = `You find a nice spot and wait for the animal to come there. You hear something in the distance and see it approaching. You take your shot and killed an animal gained ${killPoints} kill points and ${food} food🍞!`;
        } else {
          msg = `You take a walk around the woods. You spot an animal and you get close to take your shot. You heard a growl and see it running towards you. You take your shot and killed an animal gained ${killPoints} kill points and ${food} food🍞!`;
        }
        logEvent(msg);
        let choice = await getShowChoiceDialog(msg, [
          { type: "button", label: "🏹 Hunt again", value: "7" },
          { type: "button", label: "Leave", value: "leave" },
        ]);
        if (choice === "7") {
          continue; // Continue hunting
        } else {
          hunting = false; // Stop hunting
        }
      } else if (r > 50) {
        let msg = "";
        let r = Math.random() * 100;
        if (r > 50) {
          msg = `You see an animal but it runs away before you can kill it.`;
        } else if (r > 20) {
          msg = `You search far and wide for traces of the animal but you don't find any.`;
        } else {
          msg =
            "Your group got lost! You searched for them and found them, you get back on the trail..";
        }
        logEvent(msg);
        let choice = await getShowChoiceDialog(msg, [
          { type: "button", label: "🏹 Hunt again...", value: "7" },
          { type: "button", label: "Leave", value: "leave" },
        ]);
        if (choice === "7") {
          continue; // Continue hunting
        } else {
          hunting = false; // Stop hunting
        }
      } else if (r > 20) {
        let msg = "";
        let r = Math.random() * 100;
        let health = Math.floor(Math.random() * 5);
        gameState.health -= health;
        if (r > 50) {
          msg = `You failed to kill an animal and injured yourself 🩸. You lost ${health} health.`;
        } else if (r > 20) {
          msg = `You lost your self in the woods and couldn't find your way back. You found your way back to the group but injured yourself in the end. You lost ${health} health. 🩸`;
        } else {
          msg = `You saw and animal coming toward you but you didn't have time to kill it before you got hit and injured yourself 🩸. You lost ${health} health.`;
        }
        logEvent(msg);
        let choice = await getShowChoiceDialog(msg, [
          { type: "button", label: "🏹 Hunt again...", value: "7" },
          { type: "button", label: "Leave", value: "leave" },
        ]);

        if (choice === "7") {
          continue; // Continue hunting
        } else {
          hunting = false; // Stop hunting
        }
      } else if (r > 10) {
        let health = Math.floor(Math.random() * 20 + 5);
        gameState.health -= health;
        logEvent(
          `You failed to kill an animal, gravely injured yourself. You lost ${health} health. 🩸🩸`
        );
        let choice = await getShowChoiceDialog(
          `You failed to kill an animal and gravely injured yourself. You lost ${health} health. 🩸🩸`,
          [
            { type: "button", label: "🏹 Hunt again", value: "7" },
            { type: "button", label: "Leave", value: "leave" },
          ]
        );
        if (choice === "7") {
          continue; // Continue hunting
        } else {
          hunting = false; // Stop hunting
        }
      } else {
        let memberToRemove =
          gameState.group[
            Math.floor(Math.random() * gameState.group.length) + 1
          ];
        if (gameState.group.length > 1) {
          gameState.group.splice(memberToRemove, 1);
        } else {
          await getShowDeathDialog("hunting");
        }
        let health = Math.floor(Math.random() * 20 + 5);
        gameState.health -= health;
        logEvent(
          `☠️ You failed to kill an animal, gravely injured yourself and lost one of ${memberToRemove.role} in your party ☠️. You lost ${health} health. 🩸🩸`
        );
        let choice = await getShowChoiceDialog(
          `☠️ You failed to kill an animal, gravely injured yourself and lost one of ${memberToRemove.role} in your party ☠️. You lost ${health} health. 🩸🩸`,
          [
            {
              type: "button",
              label: "🏹 Are you sure you want to Hunt again?",
              value: "7",
            },
            { type: "button", label: "Leave", value: "leave" },
          ]
        );
        if (choice === "7") {
          continue; // Continue hunting
        } else {
          hunting = false; // Stop hunting
        }
      }
      updateStatus();
    }
  }
}
