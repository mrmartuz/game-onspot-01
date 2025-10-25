// Emoji Database
// Centralized emoji mappings for classes, races, and world rendering used throughout the application

// Stat emoji mapping for display
export const statEmoji = {
  STR: "💪",
  DEX: "🏹",
  CON: "❤️",
  INT: "🧠",
  WIS: "💡",
  CHA: "💬",
  LUCK: "🍀",
};

// Sex emoji mapping for display
export const sexEmoji = {
  male: "♂",
  female: "♀",
};

// Gold emoji mapping for display
export const goldEmoji = "🪙";
// The possible gold emojis are: 🪙 💰

// Class emoji mapping for display
export const classEmoji = {
  fighter: "⚔️",
  archer: "🏹",
  brute: "💪",
  monk: "🧘",
  cleric: "⛪",
  geomancer: "🌍",
  pyromancer: "🔥",
  necromancer: "💀",
  articaster: "❄️",
  martial_artist: "🥋",
  ranger: "🌲",
  explorer: "🔍",
  paladin: "🛡️",
  alchemist: "🧪",
  herbalist: "🌿",
  hunter: "🎯",
  dungeondiver: "🗝️",
  craftsman: "🔨",
};

// Race emoji mapping for display
export const raceEmoji = {
  Human: "👤",
  Elf: "🧝",
  Dwarf: "🧙",
  Orc: "👹",
  Goblin: "👺",
  Demon: "👿",
  Angel: "👼",
  Undead: "💀",
  Draconic: "🐉",
  Fishman: "🐠",
  Birdman: "🦅",
  // Beast races
  Wolf: "🐺",
  Bear: "🐻",
  MountainLion: "🦁",
  // Monster races
  Troll: "👹",
  Dragon: "🐉",
};

// Location emoji mapping for world rendering
export const locationEmoji = {
  waterfalls: "🏞️",
  volcano: "🌋",
  canyon: "⛰️",
  geyser: "🗻",
  peaks: "🏔️",
  "monster caves": "🕷️",
  cave: "🦇",
  ruin: "🏚️",
  camp: "⛺",
  farm: "🏡",
  outpost: "🏕️",
  hamlet: "🏠",
  village: "🏘️",
  city: "🏰",
};

// Flora emoji mapping for world rendering
export const floraEmoji = {
  oak: "🌳",
  pine: "🌲",
  palm: "🌴",
  cactus: "🌵",
  "sun-flower": "🌻",
  iris: "🪻",
  tulip: "🌷",
  mushroom: "🍄",
  "dead-tree": "🌵",
};

// Entity emoji mapping for world rendering
export const entityEmoji = {
  monster: "🧌",
  beast: "🦏",
  animal: "🐎",
  npc: "🧍🏻",
  group: "👫",
  army: "💂",
  trader: "🧑‍🎓",
  caravan: "🧑‍✈️",
};

// Helper function to get class emoji
export function getClassEmoji(className) {
  return classEmoji[className] || "👤";
}

// Helper function to get race emoji
export function getRaceEmoji(race) {
  return raceEmoji[race] || "👤";
}

// Helper function to get location emoji
export function getLocationEmoji(location) {
  return locationEmoji[location] || "🪨";
}

// Helper function to get flora emoji
export function getFloraEmoji(flora) {
  return floraEmoji[flora] || "🍀";
}

// Helper function to get entity emoji
export function getEntityEmoji(entity) {
  return entityEmoji[entity] || "🥷🏻";
}

// Default export containing all mappings
export default {
  classEmoji,
  raceEmoji,
  locationEmoji,
  floraEmoji,
  entityEmoji,
  getClassEmoji,
  getRaceEmoji,
  getLocationEmoji,
  getFloraEmoji,
  getEntityEmoji,
};
