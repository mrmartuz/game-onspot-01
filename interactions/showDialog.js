import { gameState } from "../gamestate/game_variables.js";
const gameDialog = document.getElementById("game-dialog");

export async function showChoiceDialog(message, components) {
  return new Promise((resolve) => {
    gameDialog.innerHTML = "";
    // Wrap the message in a div
    const pDiv = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = message || "No message provided"; // Fallback for empty message
    pDiv.appendChild(p);
    gameDialog.appendChild(pDiv);
    // Wrap each button in its own div
    if (components && components.length > 0) {
      components.forEach(({ type, label, value }) => {
        let component = { type, label, value };
        switch (component.type) {
          case "button":
            const btnDiv = document.createElement("div");
            const btn = document.createElement("button");
            btn.textContent = component.label || "Unnamed Button";
            btn.addEventListener("click", () => {
              gameDialog.close(component.value);
            });
            btnDiv.appendChild(btn);
            gameDialog.appendChild(btnDiv);
            break;
          case "input":
            const inputDiv = document.createElement("div");
            const input = document.createElement("input");
            const inputSubmit = document.createElement("button");
            inputSubmit.id = "dialog-submit";
            inputSubmit.textContent = "▶️";
            if (component.value === "seed") {
              inputSubmit.addEventListener("click", () => {
                if (
                  input.value &&
                  input.value.length === 9 &&
                  input.value.match(/^\d+$/)
                ) {
                  inputSubmit.style.backgroundColor = "green";
                  gameState.seed = input.value;
                  gameDialog.close("seed");
                } else {
                  input.value = "";
                  input.placeholder = "Please enter a value 9 numbers";
                  inputSubmit.style.backgroundColor = "red";
                }
              });
            } else {
              inputSubmit.addEventListener("click", () => {
                gameDialog.close(input.value);
              });
            }
            input.type = "text";
            input.placeholder = `Enter ${component.label}`;
            inputDiv.appendChild(input);
            inputDiv.appendChild(inputSubmit);
            gameDialog.appendChild(inputDiv);
            break;
          case "message":
            const msgDiv = document.createElement("div");
            const msg = document.createElement("p");
            msg.textContent = label || "Unnamed Button";
            msgDiv.appendChild(msg);
            gameDialog.appendChild(msgDiv);
            break;
          default:
            console.warn(
              "getShowChoiceDialog: Unknown component type: " + components.type
            );
            break;
        }
      });
    } else {
      console.warn(
        "getShowChoiceDialog: No components provided, adding fallback Close button"
      );
      const btnDiv = document.createElement("div");
      const btn = document.createElement("button");
      btn.textContent = "❌ Close";
      btn.addEventListener("click", () => {
        gameDialog.close("close");
      });
      btnDiv.appendChild(btn);
      gameDialog.appendChild(btnDiv);
    }
    // Log dialog content for debugging
    // Ensure dialog is not already open
    if (gameDialog.open) {
      gameDialog.close();
    }
    gameDialog.showModal();
    gameDialog.addEventListener(
      "close",
      () => resolve(gameDialog.returnValue),
      { once: true }
    );
  });
}
