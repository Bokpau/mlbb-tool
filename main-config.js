// =========================
// 🔐 MAIN CONFIG / CONSTANTS FILE
// Save as: main-config.js
// =========================

// Asset Paths
export const HERO_IMAGE_PATH = './hero/';
export const ITEM_IMAGE_PATH = './items/';
export const RUNE_IMAGE_PATH = './Rune/';
export const SKILL_IMAGE_PATH = './SKILL/';

// Map Limits
export const MIN = -37.5;
export const MAX = 37.5;

// Base UI Sizes
export const BASE_MAP_SIZE = 440;

// =========================
// PLAYER ROLE MAP
// =========================
export const PLAYER_ROLE_MAP = {
    "KarlTzy": "JUNGLE",
    "Sanji": "MID LANE",
    "Jaypee": "ROAM",
    "Sanford": "EXP LANE",
    "Daiki_": "GOLD LANE",
    "Light": "ROAM",
    "Yue": "MID LANE",
    "Domengkite": "GOLD LANE",
    "Edward": "EXP LANE",
    "Demonkite": "JUNGLE",
    "Sionnn": "MID LANE",
    "Caloy": "ROAM",
    "Owl.": "GOLD LANE",
    "MPtheKing.": "JUNGLE",
    "Lansu": "EXP LANE",
    "K1NGKONG": "JUNGLE",
    "Ryota": "EXP LANE",
    "Savero": "GOLD LANE",
    "Brusko": "ROAM",
    "SuperFrince": "MID LANE",
    "Nova_": "ROAM",
    "Kielvj": "EXP LANE",
    "shizou": "GOLD LANE",
    "JamesPangks": "JUNGLE",
    "Aqua": "MID LANE",
    "Jeymz": "EXP LANE",
    "Raizen.": "JUNGLE",
    "Minguin": "MID LANE",
    "Netskie": "GOLD LANE",
    "Perkziva": "ROAM",
    "LanceCy": "MID LANE",
    "Zaida": "JUNGLE",
    "3Mar": "EXP LANE",
    "Ch4knu": "ROAM",
    "Bennyqt": "GOLD LANE",
    "Nosia": "GOLD LANE",
    "Kirk": "EXP LANE",
    "SuperMarco": "GOLD LANE",
    "Kyle": "JUNGLE",
    "Hadji": "MID LANE",
    "Owgwen": "ROAM",
    "Flap": "EXP LANE",
    "Stowm.": "MID LANE",
    "Teddy": "GOLD LANE",
    "Tracy": "ROAM"
};

// =========================
// GOLD SOURCES
// =========================
export const GOLD_SOURCE_LABELS = {
    "1": "Minions",
    "2": "Jungle Creeps",
    "3": "Turtle + Lord",
    "4": "Turrets",
    "5": "Roam Equip",
    "6": "Kills + Assists",
    "9": "Roam Vision"
};

// =========================
// BOSS SNAP POINTS
// =========================
export const BOSS_SNAP_POINTS = {
    turtle: [
        { x: 16, y: -16 },
        { x: -16, y: 16 }
    ],
    lord: [
        { x: 12.5, y: -12.5 },
        { x: -12.5, y: 12.5 }
    ]
};

// =========================
// TOWER SYSTEM
// =========================
export const TOWER_COORDS = {
    down_inner: {
        1: { x: 17.50, y: 32.50 },
        2: { x: -17.50, y: -32.50 }
    },
    mid_inner: {
        1: { x: 22.50, y: 22.50 },
        2: { x: -22.50, y: -22.50 }
    },
    up_inner: {
        1: { x: 32.50, y: 17.50 },
        2: { x: -32.50, y: -17.50 }
    },
    down_mid: {
        1: { x: 2.50, y: 32.50 },
        2: { x: -2.50, y: -32.50 }
    },
    mid_mid: {
        1: { x: 15.00, y: 15.00 },
        2: { x: -15.00, y: -15.00 }
    },
    up_mid: {
        1: { x: 32.50, y: -2.50 },
        2: { x: -32.50, y: 2.50 }
    },
    down_outer: {
        1: { x: -17.50, y: 32.50 },
        2: { x: 17.50, y: -32.50 }
    },
    mid_outer: {
        1: { x: 7.50, y: 7.50 },
        2: { x: -7.50, y: -7.50 }
    },
    up_outer: {
        1: { x: 32.50, y: -17.50 },
        2: { x: -32.50, y: 17.50 }
    }
};

// =========================
// CUSTOM ICONS
// =========================
export const CUSTOM_ICONS = {
    tower: {
        1: './icons/tower-red.png',
        2: './icons/tower-blue.png'
    }
};

// =========================
// HERO DATA
// =========================
export const HERO_DATA = {1:"Miya",2:"Balmond",3:"Saber",4:"Alice",5:"Nana",6:"Tigreal",7:"Alucard",8:"Karina",9:"Akai",10:"Franco",11:"Bane",12:"Bruno",13:"Clint",14:"Rafaela",15:"Eudora",16:"Zilong",17:"Fanny",18:"Layla",19:"Minotaur",20:"Lolita",21:"Hayabusa",22:"Freya",23:"Gord",24:"Natalia",25:"Kagura",26:"Chou",27:"Sun",28:"Alpha",29:"Ruby",30:"Yi Sun-shin",31:"Moskov",32:"Johnson",33:"Cyclops",34:"Estes",35:"Hilda",36:"Aurora",37:"Lapu-Lapu",38:"Vexana",39:"Roger",40:"Karrie",41:"Gatotkaca",42:"Harley",43:"Irithel",44:"Grock",45:"Argus",46:"Odette",47:"Lancelot",48:"Diggie",49:"Hylos",50:"Zhask",51:"Helcurt",52:"Pharsa",53:"Lesley",54:"Jawhead",55:"Angela",56:"Gusion",57:"Valir",58:"Martis",59:"Uranus",60:"Hanabi",61:"Chang'e",62:"Kaja",63:"Selena",64:"Aldous",65:"Claude",66:"Vale",67:"Leomord",68:"Lunox",69:"Hanzo",70:"Belerick",71:"Kimmy",72:"Thamuz",73:"Harith",74:"Minsitthar",75:"Kadita",76:"Faramis",77:"Badang",78:"Khufra",79:"Granger",80:"Guinevere",81:"Esmeralda",82:"Terizla",83:"X.Borg",84:"Ling",85:"Dyrroth",86:"Lylia",87:"Baxia",88:"Masha",89:"Wanwan",90:"Silvanna",91:"Cecilion",92:"Carmilla",93:"Atlas",94:"Popol and Kupa",95:"Yu Zhong",96:"Luo Yi",97:"Benedetta",98:"Khaleed",99:"Barats",100:"Brody",101:"Yve",102:"Mathilda",103:"Paquito",104:"Gloo",105:"Beatrix",106:"Phoveus",107:"Natan",108:"Aulus",109:"Aamon",110:"Valentina",111:"Edith",112:"Floryn",113:"Yin",114:"Melissa",115:"Xavier",116:"Julian",117:"Fredrinn",118:"Joy",119:"Novaria",120:"Arlott",121:"Ixia",122:"Nolan",123:"Cici",124:"Chip",125:"Zhuxin",126:"Suyou",127:"Lukas",128:"Kalea",129:"Zetian",130:"Obsidia",131:"Sora",132:"Marcel"};

// =========================
// ITEM DATA
// =========================
export const ITEM_DATA = {3212:{name:"Chastise Pauldron",full:1},3210:{name:"Radiant Armor",full:1},3209:{name:"Twilight Armor",full:1},3208:{name:"Brute Force Breastplate",full:1},3207:{name:"Immortality",full:1},3206:{name:"Dominance Ice",full:1},3205:{name:"Athena's Shield",full:1},3204:{name:"Oracle",full:1},3203:{name:"Antique Cuirass",full:1},3202:{name:"Guardian Helmet",full:1},3201:{name:"Cursed Helmet",full:1},3113:{name:"Clock of Destiny",full:1},3112:{name:"Flask of the Oasis",full:1},3111:{name:"Genius Wand",full:1},3110:{name:"Lightning Truncheon",full:1},3109:{name:"Fleeting Time",full:1},3108:{name:"Blood Wings",full:1},3106:{name:"Starlium Scythe",full:1},3105:{name:"Glowing Wand",full:1},3104:{name:"Ice Queen Wand",full:1},3103:{name:"Concentrated Energy",full:1},3102:{name:"Holy Crystal",full:1},3101:{name:"Divine Glaive",full:1},3015:{name:"Malefic Gun",full:1},3014:{name:"Great Dragon Spear",full:1},3013:{name:"Sea Halberd",full:1},3012:{name:"Rose Gold Meteor",full:1},3009:{name:"Hunter Strike",full:1},3008:{name:"Blade of Despair",full:1},3007:{name:"Blade of the Heptaseas",full:1},3006:{name:"Scarlet Phantom",full:1},3005:{name:"Windtalker",full:1},3004:{name:"Endless Battle",full:1},3003:{name:"Berserker's Fury",full:1},3002:{name:"Haas's Claws",full:1},3001:{name:"Malefic Roar",full:1},2212:{name:"Thunder Belt",full:1},2208:{name:"Queen's Wings",full:1},2207:{name:"Blade Armor",full:1},2112:{name:"Wishing Lantern",full:1},2110:{name:"Necklace of Durance",full:1},2108:{name:"Feather of Heaven",full:1},2107:{name:"Winter Crown",full:1},2106:{name:"Enchanted Talisman",full:1},2014:{name:"Sky Piercer",full:1},2013:{name:"War Axe",full:1},2011:{name:"Wind of Nature",full:1},2009:{name:"Golden Staff",full:1},2008:{name:"Corrosion Scythe",full:1},2006:{name:"Demon Hunter Sword",full:1}};

// =========================
// RUNTIME DEFAULTS
// =========================
export const DEFAULT_ACTIVE_TOWERS = {};

export function getHeroIconUrl(heroid) {
  return `${HERO_IMAGE_PATH}${heroid}_CIRCLE.png`;
}

export function getRuneIconUrl(id) {
  return `${RUNE_IMAGE_PATH}${id}_RUNES.png`;
}

export function getSkillIconUrl(skillid) {
  return `${SKILL_IMAGE_PATH}${skillid}.png`;
}

export function getItemIconUrl(itemId) {
  return `${ITEM_IMAGE_PATH}${itemId}.png`;
}

// -------------------------
// MAP COORDINATE SYSTEM
// -------------------------
export function apiToMap(x, y) {
  const s = Math.SQRT2 / 2;

  return {
      map_x: s * (x - y),
      map_y: s * (x + y)
  };
}

export function toPx(coord, isY = false, currentSize = BASE_MAP_SIZE) {
  const normalized = (coord - MIN) / (MAX - MIN);

  return isY
      ? currentSize * (1 - normalized)
      : currentSize * normalized;
}

export function normalizeTeamName(name) {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

export function normalizeTowerName(name) {
    if (!name || typeof name !== 'string') return '';
    let n = name.toLowerCase().trim();
    n = n.replace(/turret|tower|turret_|tower_/g, '');
    n = n.replace(/[^a-z0-9]/g, '_');
    n = n.replace(/_+/g, '_');
    n = n.replace(/^_|_$/g, '');
    n = n.replace(/bottom/g, 'down');
    n = n.replace(/upper/g, 'up');
    n = n.replace(/middle/g, 'mid');
    return n;
}

export function getTeamInitials(name) {
    if (!name) return '';

    const words = name.trim().split(/\s+/);

    // 🔥 If multi-word → use first letters
    if (words.length > 1) {
        return words
            .map(w => w[0])
            .join('')
            .substring(0, 4)
            .toUpperCase();
    }

    // 🔥 If single word → take first 4 letters
    return name
        .substring(0, 4)
        .toUpperCase();
}