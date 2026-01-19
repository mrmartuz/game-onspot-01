// Weapon mapping database
// Maps weapon item names to their category, skill, and base damage bonus

export const weaponMapping = {
  // Great swords
  greatsword: { category: "great_swords", skill: "great_swords", baseDamage: 3 },
  claymore: { category: "great_swords", skill: "great_swords", baseDamage: 3 },
  zweihander: { category: "great_swords", skill: "great_swords", baseDamage: 3 },
  "bastard-sword": { category: "great_swords", skill: "great_swords", baseDamage: 3 },
  
  // Swords
  sword: { category: "swords", skill: "swords", baseDamage: 2 },
  rapier: { category: "swords", skill: "swords", baseDamage: 2 },
  scimitar: { category: "swords", skill: "swords", baseDamage: 2 },
  shortsword: { category: "swords", skill: "swords", baseDamage: 2 },
  longsword: { category: "swords", skill: "swords", baseDamage: 2 },
  broadsword: { category: "swords", skill: "swords", baseDamage: 2 },
  sabre: { category: "swords", skill: "swords", baseDamage: 2 },
  "skrith-blade": { category: "swords", skill: "swords", baseDamage: 2 },
  
  // Great axes
  greataxe: { category: "great_axes", skill: "great_axes", baseDamage: 4 },
  battleaxe: { category: "great_axes", skill: "great_axes", baseDamage: 4 },
  "war-axe": { category: "great_axes", skill: "great_axes", baseDamage: 4 },
  "vrakgul-axe": { category: "great_axes", skill: "great_axes", baseDamage: 4 },
  
  // Axes
  axe: { category: "axes", skill: "axes", baseDamage: 3 },
  hatchet: { category: "axes", skill: "axes", baseDamage: 3 },
  "hand-axe": { category: "axes", skill: "axes", baseDamage: 3 },
  tomahawk: { category: "axes", skill: "axes", baseDamage: 3 },
  
  // Polearms
  spear: { category: "polearms", skill: "polearms", baseDamage: 1 },
  halberd: { category: "polearms", skill: "polearms", baseDamage: 1 },
  poleaxe: { category: "polearms", skill: "polearms", baseDamage: 1 },
  staff: { category: "polearms", skill: "polearms", baseDamage: 1 },
  quarterstaff: { category: "polearms", skill: "polearms", baseDamage: 1 },
  scythe: { category: "polearms", skill: "polearms", baseDamage: 1 },
  pike: { category: "polearms", skill: "polearms", baseDamage: 1 },
  glaive: { category: "polearms", skill: "polearms", baseDamage: 1 },
  
  // Great hammers
  maul: { category: "great_hammers", skill: "great_hammers", baseDamage: 4 },
  "great-hammer": { category: "great_hammers", skill: "great_hammers", baseDamage: 4 },
  "war-hammer": { category: "great_hammers", skill: "great_hammers", baseDamage: 4 },
  "gormith-hammer": { category: "great_hammers", skill: "great_hammers", baseDamage: 4 },
  
  // Hammers
  mace: { category: "hammers", skill: "hammers", baseDamage: 2 },
  club: { category: "hammers", skill: "hammers", baseDamage: 2 },
  warhammer: { category: "hammers", skill: "hammers", baseDamage: 2 },
  flail: { category: "hammers", skill: "hammers", baseDamage: 2 },
  morningstar: { category: "hammers", skill: "hammers", baseDamage: 2 },
  
  // Bows
  bow: { category: "bows", skill: "bows", baseDamage: 1 },
  longbow: { category: "bows", skill: "bows", baseDamage: 1 },
  shortbow: { category: "bows", skill: "bows", baseDamage: 1 },
  "composite-bow": { category: "bows", skill: "bows", baseDamage: 1 },
  "recurve-bow": { category: "bows", skill: "bows", baseDamage: 1 },
  "lyssarion-bow": { category: "bows", skill: "bows", baseDamage: 1 },
  
  // Crossbows
  crossbow: { category: "crossbows", skill: "crossbows", baseDamage: 1 },
  "heavy-crossbow": { category: "crossbows", skill: "crossbows", baseDamage: 1 },
  "light-crossbow": { category: "crossbows", skill: "crossbows", baseDamage: 1 },
  "gormith-crossbow": { category: "crossbows", skill: "crossbows", baseDamage: 1 },
  
  // Throwing weapons
  dagger: { category: "throwing", skill: "throwing", baseDamage: 1 },
  javelin: { category: "throwing", skill: "throwing", baseDamage: 1 },
  "throwing-axe": { category: "throwing", skill: "throwing", baseDamage: 1 },
  "throwing-knife": { category: "throwing", skill: "throwing", baseDamage: 1 },
  sling: { category: "throwing", skill: "throwing", baseDamage: 1 },
  "sling-stone": { category: "throwing", skill: "throwing", baseDamage: 1 },
  "skrith-nedle": { category: "throwing", skill: "throwing", baseDamage: 1 },
  
  // Shields
  shield: { category: "shields", skill: "shields", baseDamage: 0 },
  buckler: { category: "shields", skill: "shields", baseDamage: 0 },
  "round-shield": { category: "shields", skill: "shields", baseDamage: 0 },
  "kite-shield": { category: "shields", skill: "shields", baseDamage: 0 },
  "aurethine-shield": { category: "shields", skill: "shields", baseDamage: 0 },
  "tower-shield": { category: "great_shields", skill: "great_shields", baseDamage: 0 },
  pavise: { category: "great_shields", skill: "great_shields", baseDamage: 0 },
  "great-shield": { category: "great_shields", skill: "great_shields", baseDamage: 0 },
};

// Helper function to get weapon mapping
export function getWeaponMapping(itemName) {
  if (!itemName) return null;
  
  // Try exact match first (case-insensitive)
  const normalizedName = itemName.toLowerCase().trim();
  const exactMatch = weaponMapping[normalizedName];
  if (exactMatch) return exactMatch;
  
  // Try to find by partial match (for item names like "sword" in "🗡️ [sword] iron common honed")
  // This handles cases where the item name might be embedded in a string
  for (const [key, value] of Object.entries(weaponMapping)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return null;
}

// Get primary weapon skill from weapon item name
export function getPrimaryWeaponSkillFromItem(itemName) {
  const mapping = getWeaponMapping(itemName);
  return mapping ? mapping.skill : "unarmed";
}

// Get base damage bonus from weapon item name
export function getWeaponBaseDamageFromItem(itemName) {
  const mapping = getWeaponMapping(itemName);
  return mapping ? mapping.baseDamage : 1;
}

// Get weapon category from item name
export function getWeaponCategoryFromItem(itemName) {
  const mapping = getWeaponMapping(itemName);
  return mapping ? mapping.category : null;
}




