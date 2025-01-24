import { Armor, Weapon } from "./entities";
import { randomChoice } from "./utils";

export type Parts = {
  light: string[];
  medium: string[];
  heavy: string[];
  fatal?: string[];
};

export const pierce: Parts = {
  light: ["scrape[s]", "scratch[es]", "graze[s]", "minorly wound[s]"],
  medium: ["cut[s] into", "wound[s]", "maul[s]"],
  heavy: [
    "tear[s] into",
    "rip[s] into",
    "drive[s] %(his)s %(weapon)s into",
    "thrust[s] %(his)s %(weapon)s into",
  ],
};

export const slash: Parts = {
  light: [
    "scrape[s]",
    "scratch[es]",
    "graze[s]",
    "head-butt[s]",
    "punch[es]",
    "kick[s]",
  ],
  medium: ["cut[s] into", "wound[s]", "slash[es]", "slice[s]", "stab[s]"],
  heavy: [
    "tear[s] into",
    "drive[s] %(his)s %(weapon)s into",
    "thrust[s] %(his)s %(weapon)s into",
    "skewer[s]",
    "run[s] %(his)s %(weapon)s through",
  ],
};

export const bludgeon: Parts = {
  light: ["strike[s]", "glance[s]", "slap[s]"],
  medium: ["pound[s]", "beat[s]", "batter[s]", "hammer[s]", "slug[s]"],
  heavy: [
    "hurl[s] %(his)s %(weapon)s into",
    "hammer[s] %(his)s %(weapon)s into",
    "drive[s] %(his)s %(weapon)s into",
  ],
};

export const stumbles = [
  [
    "%(o_name)s tr<ies|y> to anticipate %(name_pos)s attack, but miscalculate<s>...",
    "%(o_name)s <is|are> caught off-guard for a moment...!",
    "%(o_name)s tr<ies|y> to dodge %(name_pos)s attack, but stumble<s>...",
    "Weary from battle, %(o_name)s stagger<s> for a moment...",
    "%(name)s trip[s] %(o_name)s and %(o_he)s fall<s> to the ground!",
    "%(name)s launch[es] %(himself)s at %(o_name)s!",
  ],
  [
    "%(o_name)s make<s> a feeble attempt to block %(name_pos)s next attack...",
    "%(o_name)s moan<s>...",
    "%(o_name)s reel<s> from the shock...",
    "%(o_name)s stagger<s>...",
    "%(o_name)s fall<s> to %(o_his)s knees!",
    "%(name)s trip[s] %(o_name)s and %(o_he)s fall<s> to the ground!",
  ],
];

export const humanoidParts: Parts = {
  light: ["fingers", "hand", "shoulder", "arm", "foot", "leg"],
  medium: ["right arm", "left arm", "right leg", "left leg", "side", "flank"],
  heavy: ["thigh", "stomach", "knee", "midsection", "torso", "ribcage", "back"],
  fatal: ["chest", "head", "neck", "spine", "skull", "eyes"],
};

type WeaponConfig = {
  name: string;
  damage: string;
  critRange: number;
  critMultiplier: number;
  words: Parts;
};

export const weapons: { [key: string]: WeaponConfig } = {
  maceAndChain: {
    name: "mace and chain",
    damage: "1d8",
    critRange: 0,
    critMultiplier: 2,
    words: bludgeon,
  },
  warhammer: {
    name: "warhammer",
    damage: "1d8",
    critRange: 0,
    critMultiplier: 3,
    words: bludgeon,
  },
  greatsword: {
    name: "greatsword",
    damage: "2d6",
    critRange: 1,
    critMultiplier: 2,
    words: slash,
  },
  longsword: {
    name: "longsword",
    damage: "1d8",
    critRange: 1,
    critMultiplier: 2,
    words: slash,
  },
  dagger: {
    name: "dagger",
    damage: "1d4",
    critRange: 1,
    critMultiplier: 2,
    words: pierce,
  },
  battleaxe: {
    name: "battleaxe",
    damage: "1d8",
    critRange: 0,
    critMultiplier: 3,
    words: slash,
  },
};
const weaponNames = Object.keys(weapons);

export function makeWeapon(maybeConfig?: WeaponConfig) {
  const config = maybeConfig || weapons[randomChoice(weaponNames)];
  return new Weapon(
    config.name,
    false,
    config.damage,
    config.words,
    config.critRange,
    config.critMultiplier,
  );
}

type ArmorConfig = {
  name: string;
  armorBonus: number;
};

export const armors: { [key: string]: ArmorConfig } = {
  cloth: { name: "cloth", armorBonus: 0 },
  padded: { name: "padded", armorBonus: 1 },
  leather: { name: "leather", armorBonus: 2 },
  chainShirt: { name: "chain shirt", armorBonus: 4 },
  chainmail: { name: "chainmail", armorBonus: 5 },
  splintMail: { name: "splint mail", armorBonus: 6 },
  halfPlate: { name: "half plate", armorBonus: 7 },
  fullPlate: { name: "full plate", armorBonus: 8 },
};
const armorNames = Object.keys(armors);

export function makeArmor(maybeConfig?: ArmorConfig) {
  const config = maybeConfig || armors[randomChoice(armorNames)];
  return new Armor(config.name, false, config.armorBonus);
}
