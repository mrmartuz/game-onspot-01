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
      components.forEach((componentData) => {
        let component = { ...componentData };
        switch (component.type) {
          case "button":
            const btnDiv = document.createElement("div");
            const btn = document.createElement("button");
            btn.textContent = component.label || "Unnamed Button";
            btn.disabled = component.disabled || false;

            // Add visual styling for disabled buttons
            if (btn.disabled) {
              btn.style.opacity = "0.5";
              btn.style.cursor = "not-allowed";
            }

            btn.addEventListener("click", () => {
              if (!btn.disabled) {
                gameDialog.close(component.value);
              }
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
            msg.textContent = component.label || "Unnamed Message";
            msgDiv.appendChild(msg);
            gameDialog.appendChild(msgDiv);
            break;
          case "select":
            const selectDiv = document.createElement("div");
            const selectLabel = document.createElement("label");
            selectLabel.textContent = component.label || "Select Option:";
            selectDiv.appendChild(selectLabel);

            const select = document.createElement("select");
            select.id = component.value || "select";

            // Add options
            if (component.options && Array.isArray(component.options)) {
              component.options.forEach((option) => {
                const optionElement = document.createElement("option");
                optionElement.value = option.value || option;
                optionElement.textContent = option.label || option;

                // Set default selection if specified
                if (
                  component.defaultValue &&
                  optionElement.value === component.defaultValue
                ) {
                  optionElement.selected = true;
                }

                select.appendChild(optionElement);
              });
            }

            selectDiv.appendChild(select);
            gameDialog.appendChild(selectDiv);

            // Debug: Log select element details
            `Select created - ID: ${select.id}, Default Value: ${component.defaultValue}, Current Value: ${select.value}`;
            break;
          case "checkbox":
            const checkboxDiv = document.createElement("div");
            const checkboxLabel = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = component.value || "checkbox";
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.appendChild(
              document.createTextNode(" " + (component.label || "Checkbox"))
            );
            checkboxDiv.appendChild(checkboxLabel);
            gameDialog.appendChild(checkboxDiv);
            break;
          case "number":
            const numberDiv = document.createElement("div");
            const numberLabel = document.createElement("label");
            numberLabel.textContent = component.label || "Enter Number:";
            numberDiv.appendChild(numberLabel);

            const numberInput = document.createElement("input");
            numberInput.type = "number";
            numberInput.id = component.value || "number";
            numberInput.min = component.min || 0;
            numberInput.max = component.max || 100;
            numberInput.value = component.defaultValue || 0;
            numberDiv.appendChild(numberInput);
            gameDialog.appendChild(numberDiv);
            break;
          case "button_grid":
            const gridContainer = document.createElement("div");
            gridContainer.style.display = "grid";
            gridContainer.style.gridTemplateColumns =
              "repeat(auto-fit, minmax(100px, 1fr))";
            gridContainer.style.gap = "8px";
            gridContainer.style.marginBottom = "10px";

            if (component.buttons && Array.isArray(component.buttons)) {
              component.buttons.forEach((buttonConfig) => {
                const btn = document.createElement("button");
                btn.textContent = buttonConfig.label || "Unnamed Button";
                btn.disabled = buttonConfig.disabled || false;

                // Apply grid column span if specified
                if (buttonConfig.gridColumn) {
                  btn.style.gridColumn = `span ${buttonConfig.gridColumn}`;
                }

                // Add visual styling for disabled buttons
                if (btn.disabled) {
                  btn.style.opacity = "0.5";
                  btn.style.cursor = "not-allowed";
                }

                btn.addEventListener("click", () => {
                  if (!btn.disabled) {
                    gameDialog.close(buttonConfig.value);
                  }
                });

                gridContainer.appendChild(btn);
              });
            }

            gameDialog.appendChild(gridContainer);
            break;
          case "squaregrid":
            const mobileGridContainer = document.createElement("div");
            mobileGridContainer.style.display = "grid";
            mobileGridContainer.style.gridTemplateColumns = "repeat(10, 1fr)";
            mobileGridContainer.style.gridTemplateRows = "repeat(10, 1fr) 40px";
            mobileGridContainer.style.gap = "2px";
            mobileGridContainer.style.marginBottom = "15px";
            mobileGridContainer.style.padding = "10px";
            mobileGridContainer.style.backgroundColor = "#4a4a4a";
            mobileGridContainer.style.borderRadius = "8px";
            mobileGridContainer.style.border = "2px solid #6a6a6a";

            // Calculate size to fit mobile screens while being larger than dialog elements
            const mobileGridSize = Math.min(
              Math.min(window.innerWidth * 0.6, window.innerHeight * 0.4),
              300
            );
            mobileGridContainer.style.width = `${mobileGridSize}px`;
            mobileGridContainer.style.height = `${mobileGridSize + 40}px`; // Add extra height for name row
            mobileGridContainer.style.maxWidth = "70vw";
            mobileGridContainer.style.maxHeight = "70vh";

            // Create 10x10 grid of divs
            for (let row = 0; row < 10; row++) {
              for (let col = 0; col < 10; col++) {
                const gridDiv = document.createElement("div");
                gridDiv.style.backgroundColor = "#gray";
                gridDiv.style.border = "1px solid #6a6a6a";
                gridDiv.style.borderRadius = "2px";
                gridDiv.style.display = "flex";
                gridDiv.style.alignItems = "center";
                gridDiv.style.justifyContent = "center";
                gridDiv.style.fontSize = "20px";
                gridDiv.style.fontWeight = "bold";
                gridDiv.style.color = "#333";
                gridDiv.style.cursor = "pointer";
                gridDiv.style.transition = "all 0.2s ease";
                gridDiv.style.position = "relative";
                gridDiv.style.minHeight = "0";
                gridDiv.style.minWidth = "0";
                gridDiv.style.aspectRatio = "1";
                gridDiv.style.maxHeight = "100%";
                gridDiv.style.maxWidth = "100%";

                // Add hover effects
                gridDiv.addEventListener("mouseenter", () => {
                  gridDiv.style.backgroundColor = "#e0e0e0";
                  gridDiv.style.border = "2px solid #red";
                  gridDiv.style.transform = "scale(1.05)";
                });

                gridDiv.addEventListener("mouseleave", () => {
                  // Revert to tile's defined color or default
                  const tileData =
                    component.tiles && component.tiles[`${row}-${col}`];
                  const originalColor = tileData?.backgroundColor || "#4a4a4a";
                  gridDiv.style.backgroundColor = originalColor;
                  gridDiv.style.transform = "scale(1)";
                });

                // Add click handler
                gridDiv.addEventListener("click", () => {
                  const creatureName =
                    gridDiv.dataset.creatureName || `${row}-${col}`;

                  // Update the selected name display
                  const selectedNameDiv = document.getElementById(
                    "selected-creature-name"
                  );
                  if (selectedNameDiv) {
                    // If no emoji (empty cell), set text to empty
                    if (
                      !gridDiv.textContent ||
                      gridDiv.textContent.trim() === ""
                    ) {
                      selectedNameDiv.textContent =
                        "Click on a creature to see its name";
                      selectedNameDiv.style.backgroundColor = "#6a6a6a";
                      selectedNameDiv.style.border = "1px solid #6a6a6a";
                    } else {
                      selectedNameDiv.textContent = creatureName;
                      selectedNameDiv.style.backgroundColor = "#6a6a6a";
                      selectedNameDiv.style.border = "2px solid #6a6a6a";
                    }
                  }
                });

                // Check if there's content for this cell position
                const cellKey = `${row}-${col}`;
                let cellContent = "";
                let cellName = "";

                if (component.tiles && component.tiles[cellKey]) {
                  const tileData = component.tiles[cellKey];

                  // Only support object format with emoji and name
                  if (typeof tileData === "object" && tileData.emoji) {
                    cellContent = tileData.emoji;
                    cellName = tileData.name || tileData.emoji;

                    // Apply background color if provided
                    if (tileData.backgroundColor) {
                      gridDiv.style.backgroundColor = tileData.backgroundColor;
                    }
                  }
                } else if (component.showCoordinates === true) {
                  // Only show coordinates if explicitly enabled
                  cellContent = `${row},${col}`;
                  cellName = `${row},${col}`;
                }
                // If no tile data and showCoordinates is false/undefined, leave empty

                gridDiv.textContent = cellContent;

                // Store the creature name for click events
                gridDiv.dataset.creatureName = cellName;

                mobileGridContainer.appendChild(gridDiv);
              }
            }

            // Add the name display div as the 11th row (spans all 10 columns)
            const selectedNameDiv = document.createElement("div");
            selectedNameDiv.id = "selected-creature-name";
            selectedNameDiv.style.gridColumn = "span 10";
            selectedNameDiv.style.gridRow = "11";
            selectedNameDiv.style.textAlign = "center";
            selectedNameDiv.style.fontSize = "12px";
            selectedNameDiv.style.color = "white";
            selectedNameDiv.style.padding = "8px";
            selectedNameDiv.style.backgroundColor = "#6a6a6a";
            selectedNameDiv.style.borderRadius = "4px";
            selectedNameDiv.style.border = "1px solid #ddd";
            selectedNameDiv.style.display = "flex";
            selectedNameDiv.style.alignItems = "center";
            selectedNameDiv.style.justifyContent = "center";
            selectedNameDiv.style.minHeight = "0";
            selectedNameDiv.style.maxWidth = "100%";
            selectedNameDiv.style.boxSizing = "border-box";
            selectedNameDiv.textContent = "Click on a creature to see its name";
            mobileGridContainer.appendChild(selectedNameDiv);

            gameDialog.appendChild(mobileGridContainer);

            break;
          default:
            console.warn(
              "getShowChoiceDialog: Unknown component type: " + component.type
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
      () => {
        // Check if there are any complex components (select, checkbox, number)
        const selects = gameDialog.querySelectorAll("select");
        const checkboxes = gameDialog.querySelectorAll(
          "input[type='checkbox']"
        );
        const numbers = gameDialog.querySelectorAll("input[type='number']");

        // If there are complex components, return an object
        if (selects.length > 0 || checkboxes.length > 0 || numbers.length > 0) {
          const result = { value: gameDialog.returnValue };

          // Collect select values
          selects.forEach((select) => {
            `Select element - ID: ${select.id}, Value: "${select.value}"`;
            result[select.id] = select.value;
          });

          // Collect checkbox values
          checkboxes.forEach((checkbox) => {
            result[checkbox.id] = checkbox.checked;
          });

          // Collect number values
          numbers.forEach((number) => {
            result[number.id] = parseInt(number.value) || 0;
          });

          resolve(result);
        } else {
          // For simple dialogs with only buttons/messages, return the value directly
          resolve(gameDialog.returnValue);
        }
      },
      { once: true }
    );
  });
}

// Helper function to get values from dialog result
export function getDialogValue(result, key) {
  if (typeof result === "object" && result !== null) {
    // Check if the key exists in the result object (even if it's an empty string)
    if (key in result) {
      return result[key];
    }
    // Fallback to value only if the key doesn't exist at all
    return result.value;
  }
  return result;
}
