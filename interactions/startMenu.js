import { gameState } from '../game_variables.js';
import { getShowChoiceDialog } from '../interactions.js';
import { getTitleDialog } from '../interactions.js';
import { getWorldName } from '../utils.js';


export async function startMenu() {
  const seed = gameState.seed;
  const worldName = getWorldName(seed);
  const message =
    `\n` +
    ` ` +
    ``;

  const choice = await getShowChoiceDialog(message, [
    { type: 'button', label: 'Welcome to ExpoGa! ', value: 'title'},
    { type: 'message', label: `You are a great man, travel the world, hire new member, gain renown, become the greatest explorer the world of ${worldName} has ever seen.`, value: '' },
    { type: 'message', label: `Are you ready to start in the world of \n ${worldName}?`, value: '' },
    { type: 'button', label: `⏫ Explore ${worldName}! ⏫`, value: 'new' },
    { type: 'message', label: '\n Or enter a seed manually to start in another world:', value: 'seed'},
    { type: 'input', label: 'Seed', value: 'seed'},
    { type: 'message', label: '\n\nIf you had enough, you can exit the game. This will close the game-window.', value: '' },
    { type: 'button', label: '❌ Exit the game ❌', value: 'exit' }
  ]);
  if (choice === 'title') {
    return choice;
  } else if (choice === 'new') {
    return choice;
  } else if (choice === 'seed') {
    return choice;
  } else if (choice === 'exit') {
    return choice;
  }

}
