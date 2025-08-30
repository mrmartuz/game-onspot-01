import { gameState } from '../game_variables.js';
import { getShowChoiceDialog } from '../interactions.js';
import { getTitleDialog } from '../interactions.js';

// Simple mapping numbers -> letters (can tweak for more "fantasy" vibes)
const numToLetter = {
  0: 'a', 1: 'e', 2: 'i', 3: 'o', 4: 'u',
  5: 'r', 6: 'n', 7: 's', 8: 't', 9: 'l'
};

function generateWorldName(seed) {
  // Convert seed (number) -> string of letters
  const letterStr = seed
    .toString()
    .split('')
    .map(d => numToLetter[d] || '')
    .join('');

  // Decide randomly into how many groups we split (2–4)
  const groupsCount = Math.floor(Math.random() * 3) + 1; // 2, 3, or 4
  const groupSize = Math.ceil(letterStr.length / groupsCount);

  let groups = [];
  for (let i = 0; i < groupsCount; i++) {
    groups.push(letterStr.slice(i * groupSize, (i + 1) * groupSize));
    groups[i] = groups[i].charAt(0).toUpperCase() + groups[i].slice(1);
  }

  // Filter out empties
  groups = groups.filter(g => g.length > 0);

  let name = groups.join(' ');

  // Maybe insert an apostrophe
  if (Math.random() < 0.5 && name.length > 2) {
    let r = Math.random() * 100;
    if(r > 50){
        const pos = Math.floor(Math.random() * (name.length - 2)) + 1;
        name = name.slice(0, pos) + "'" + name.slice(pos);
    } else {
        name = name.slice(0, 1) + " '" + name.slice(1).charAt(0).toUpperCase() + name.slice(2);
    }
  }

  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function startMenu() {
  const seed = gameState.seed;
  const worldName = generateWorldName(seed);
  const message =
    `\n` +
    ` ` +
    ``;

  const choice = await getShowChoiceDialog(message, [
    { type: 'button', label: 'Welcome Explorer to ExpoGa! ', value: 'title'},
    { type: 'message', label: `You are a great man, travel the world, hire new member, gain renown, become the greatest explorer the world of ${worldName} has ever seen.`, value: '' },
    { type: 'message', label: `Are you ready to start in the world of \n ${worldName}?`, value: '' },
    { type: 'button', label: `⏫ Explore ${worldName}! ⏫`, value: 'new' },
    { type: 'message', label: '\n Or enter a seed manually to start in another world:', value: 'seed'},
    { type: 'input', label: 'Seed', value: 'seed'},
    { type: 'message', label: '\n\nIf you had enough, you can exit the game. This will close the game-window.', value: '' },
    { type: 'button', label: '❌ Exit the game ❌', value: 'exit' }
  ]);
  if (choice === 'title') {
    await getTitleDialog();
  } else if (choice === 'new') {
    return true;
  } else if (choice === 'seed') {
    return true;
  } else if (choice === 'exit') {
    window.close();
  }

}
