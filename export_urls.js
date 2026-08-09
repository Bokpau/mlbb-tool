import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock browser Image object for Node environment
if (typeof globalThis.Image === 'undefined') {
    globalThis.Image = class Image {
        constructor() {
            this.src = '';
        }
    };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;

// Base URLs
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Bokpau/mlbb-tool@main';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Bokpau/mlbb-tool/main';

// Dynamic import after setting globalThis.Image
const { HERO_DATA, ITEM_DATA } = await import('./src/main-config.js');

// Additional dictionaries for items, runes, and skills
const EXTRA_ITEM_NAMES = {
    '1001': 'Dagger',
    '1002': 'Knife',
    '1003': 'Javelin',
    '1004': 'Vampire Mallet',
    '1005': 'Iron Hunting Bow',
    '1006': 'Regular Spear',
    '1007': 'Swift Crossbow',
    '1008': 'Power Potion',
    '1010': 'Power Potion',
    '1101': 'Mystery Codex',
    '1102': 'Power Crystal',
    '1103': 'Magic Necklace',
    '1104': 'Book of Sages',
    '1105': 'Mystic Container',
    '1110': 'Magic Potion',
    '1111': 'Throw Forbidden',
    '1112': 'Broken Heart',
    '1113': 'Allow Throw',
    '1114': 'Vitality Crystal',
    '1201': 'Vitality Crystal',
    '1202': 'Leather Jerkin',
    '1203': 'Magic Resist Cloak',
    '1204': 'Healing Necklace',
    '1205': "Hero's Ring",
    '1210': 'Rock Potion',
    '1301': 'Boots',
    '1401': "Hunter's Knife",
    '1411': "Ice Hunter's Speed Boots",
    '1412': "Flame Hunter's Speed Boots",
    '1413': "Behemoth Hunter's Speed Boots",
    '1501': 'Wooden Mask',
    '1511': 'Roaming Boots - Conceal',
    '1512': 'Roaming Boots - Encourage',
    '1513': 'Roaming Boots - Favor',
    '1514': 'Roaming Boots - Dire Hit',
    '2001': 'Legion Sword',
    '2002': 'Ogre Tomahawk',
    '2003': 'Rogue Meteor',
    '2004': 'Fury Hammer',
    '2005': 'Magic Blade',
    '2101': 'Magic Wand',
    '2102': 'Tome of Evil',
    '2103': 'Azure Blade',
    '2104': 'Exotic Veil',
    '2105': 'Elegant Gem',
    '2201': 'Ares Belt',
    '2202': 'Molten Essence',
    '2203': 'Silence Robe',
    '2204': 'Black Ice Shield',
    '2205': 'Dreadnaught Armor',
    '2206': 'Steel Legplates',
    '2301': 'Warrior Boots',
    '2302': 'Tough Boots',
    '2303': 'Magic Shoes',
    '2304': 'Arcane Boots',
    '2305': 'Swift Boots',
    '2306': 'Rapid Boots',
    '2308': 'Demon Shoes'
};

const RUNE_NAMES = {
    '111': 'Thrill',
    '112': 'Swift',
    '121': 'Wilderness Blessing',
    '122': 'Seasoned Hunter',
    '131': 'Impure Rage',
    '132': 'Quantum Charge',
    '133': 'War Cry',
    '134': 'Temporal Reign',
    '311': 'Vitality',
    '321': 'Tenacity',
    '331': 'Concussive Blast',
    '511': 'Rupture',
    '521': 'Master Assassin',
    '531': 'Killing Spree',
    '611': 'Inspire',
    '621': 'Bargain Hunter',
    '631': 'Lethal Ignition',
    '711': 'Firmness',
    '721': 'Festival of Blood',
    '731': 'Brave Smite',
    '811': 'Agility',
    '821': 'Pull Yourself Together',
    '831': 'Focusing Mark',
    '1211': 'Fatal',
    '1221': 'Weapon Master',
    '1231': 'Weakness Finder',
    '20001': 'Physical Emblem',
    '20002': 'Magic Emblem',
    '20003': 'Tank Emblem',
    '20004': 'Jungle Emblem',
    '20005': 'Assassin Emblem',
    '20006': 'Mage Emblem',
    '20007': 'Fighter Emblem',
    '20008': 'Support Emblem',
    '20012': 'Marksman Emblem'
};

const SKILL_NAMES = {
    '20020': 'Retribution',
    '200201': 'Flame Retribution',
    '200202': 'Ice Retribution',
    '200203': 'Bloody Retribution',
    '20030': 'Inspire',
    '20040': 'Sprint',
    '20050': 'Revitalize',
    '20060': 'Aegis',
    '20070': 'Petrify',
    '20080': 'Purify',
    '20100': 'Flicker',
    '20140': 'Flameshot',
    '20150': 'Execute',
    '20160': 'Arrival',
    '20190': 'Vengeance'
};

// Utility to escape CSV fields safely
function escapeCsv(val) {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
}

// Function to scan a folder and return array of files with metadata
function scanFolder(folderName, categoryName) {
    const dirPath = path.join(ROOT_DIR, folderName);
    if (!fs.existsSync(dirPath)) {
        console.warn(`Directory not found: ${dirPath}`);
        return [];
    }

    const files = fs.readdirSync(dirPath)
        .filter(f => !f.startsWith('.') && f.match(/\.(png|jpg|jpeg|webp)$/i))
        .sort();

    return files.map(file => {
        const cdnUrl = `${CDN_BASE}/${folderName}/${encodeURIComponent(file)}`;
        const rawUrl = `${GITHUB_RAW_BASE}/${folderName}/${encodeURIComponent(file)}`;
        const imageFormula = `=IMAGE("${cdnUrl}")`;

        let assetId = '';
        let assetName = '';

        // Parsing depending on folder
        if (folderName === 'hero') {
            const m = file.match(/^(\d+)_CIRCLE/);
            if (m) {
                assetId = m[1];
                assetName = HERO_DATA[assetId] || `Hero ${assetId}`;
            } else {
                assetName = file.replace(/\.[^.]+$/, '');
            }
        } else if (folderName === 'hero_ban') {
            const m = file.match(/^(\d+)_(.+)_ban/);
            if (m) {
                assetId = m[1];
                assetName = m[2].replace(/_/g, ' ');
            } else {
                assetName = file.replace(/\.[^.]+$/, '');
            }
        } else if (folderName === 'hero_selection') {
            const m = file.match(/^(\d+)_(.+)_selection/);
            if (m) {
                assetId = m[1];
                assetName = m[2].replace(/_/g, ' ');
            } else {
                assetName = file.replace(/\.[^.]+$/, '');
            }
        } else if (folderName === 'items') {
            const m = file.match(/^(\d+)/);
            if (m) {
                assetId = m[1];
                assetName = (ITEM_DATA[assetId] && ITEM_DATA[assetId].name) || EXTRA_ITEM_NAMES[assetId] || `Item ${assetId}`;
            } else {
                assetName = file.replace(/\.[^.]+$/, '');
            }
        } else if (folderName === 'Rune') {
            const m = file.match(/^(\d+)/);
            if (m) {
                assetId = m[1];
                assetName = RUNE_NAMES[assetId] || `Rune ${assetId}`;
            } else {
                assetName = file.replace(/\.[^.]+$/, '');
            }
        } else if (folderName === 'SKILL') {
            const m = file.match(/^(\d+)/);
            if (m) {
                assetId = m[1];
                assetName = SKILL_NAMES[assetId] || `Skill ${assetId}`;
            } else {
                assetName = file.replace(/\.[^.]+$/, '');
            }
        } else if (folderName === 'Role') {
            assetName = file.replace(/\.[^.]+$/, '');
            assetId = assetName;
        } else {
            assetName = file.replace(/\.[^.]+$/, '');
        }

        return {
            category: categoryName,
            folder: folderName,
            assetId,
            assetName,
            filename: file,
            cdnUrl,
            rawUrl,
            imageFormula
        };
    });
}

function generateMasterCsv() {
    const foldersToScan = [
        { folder: 'hero', name: 'Hero Circle Photo' },
        { folder: 'hero_ban', name: 'Hero Ban Photo' },
        { folder: 'hero_selection', name: 'Hero Selection Photo' },
        { folder: 'items', name: 'Item' },
        { folder: 'Rune', name: 'Rune / Emblem' },
        { folder: 'SKILL', name: 'Skill / Spell' },
        { folder: 'Role', name: 'Role' }
    ];

    let allAssets = [];
    foldersToScan.forEach(f => {
        const assets = scanFolder(f.folder, f.name);
        allAssets = allAssets.concat(assets);
    });

    // 1. Export Master CSV (all assets consolidated)
    const masterHeaders = ['Category', 'Folder', 'Asset ID / Code', 'Asset Name', 'Filename', 'CDN URL', 'GitHub Raw URL', 'Google Sheets Image Formula'];
    const masterRows = [masterHeaders.map(escapeCsv).join(',')];

    allAssets.forEach(item => {
        const row = [
            item.category,
            item.folder,
            item.assetId,
            item.assetName,
            item.filename,
            item.cdnUrl,
            item.rawUrl,
            item.imageFormula
        ];
        masterRows.push(row.map(escapeCsv).join(','));
    });

    const masterCsvPath = path.join(ROOT_DIR, 'mlbb_assets_master.csv');
    fs.writeFileSync(masterCsvPath, masterRows.join('\n'), 'utf8');
    console.log(`✅ Generated Master CSV: ${masterCsvPath} (${allAssets.length} total items)`);

    // 2. Export Side-by-Side Heroes Matrix CSV
    const heroCircleMap = new Map();
    const heroBanMap = new Map();
    const heroSelectionMap = new Map();

    scanFolder('hero', 'Hero Circle').forEach(a => { if (a.assetId) heroCircleMap.set(a.assetId, a); });
    scanFolder('hero_ban', 'Hero Ban').forEach(a => { if (a.assetId) heroBanMap.set(a.assetId, a); });
    scanFolder('hero_selection', 'Hero Selection').forEach(a => { if (a.assetId) heroSelectionMap.set(a.assetId, a); });

    // Collect all Hero IDs numerically
    const heroIds = Array.from(new Set([
        ...heroCircleMap.keys(),
        ...heroBanMap.keys(),
        ...heroSelectionMap.keys()
    ])).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const heroHeaders = [
        'HERO ID', 'HERO NAME',
        'Circle Photo URL', 'Circle Image Formula',
        'Ban Photo URL', 'Ban Image Formula',
        'Selection Photo URL', 'Selection Image Formula'
    ];
    const heroRows = [heroHeaders.map(escapeCsv).join(',')];

    heroIds.forEach(id => {
        const circle = heroCircleMap.get(id);
        const ban = heroBanMap.get(id);
        const sel = heroSelectionMap.get(id);

        const heroName = (circle && circle.assetName) || (ban && ban.assetName) || (sel && sel.assetName) || HERO_DATA[id] || `Hero ${id}`;

        const circleUrl = circle ? circle.cdnUrl : '';
        const circleFormula = circle ? circle.imageFormula : '';

        const banUrl = ban ? ban.cdnUrl : '';
        const banFormula = ban ? ban.imageFormula : '';

        const selUrl = sel ? sel.cdnUrl : '';
        const selFormula = sel ? sel.imageFormula : '';

        heroRows.push([
            id,
            heroName,
            circleUrl,
            circleFormula,
            banUrl,
            banFormula,
            selUrl,
            selFormula
        ].map(escapeCsv).join(','));
    });

    const heroMatrixCsvPath = path.join(ROOT_DIR, 'mlbb_heroes_matrix.csv');
    fs.writeFileSync(heroMatrixCsvPath, heroRows.join('\n'), 'utf8');
    console.log(`✅ Generated Heroes Side-by-Side CSV: ${heroMatrixCsvPath} (${heroIds.length} heroes)`);

    // 3. Export Category specific CSVs (Items, Runes, Skills, Roles)
    const exportCategory = (folder, name, filename) => {
        const items = scanFolder(folder, name);
        const headers = ['ID / Code', 'Name', 'Filename', 'CDN URL', 'Google Sheets Image Formula'];
        const rows = [headers.map(escapeCsv).join(',')];
        items.forEach(i => {
            rows.push([i.assetId, i.assetName, i.filename, i.cdnUrl, i.imageFormula].map(escapeCsv).join(','));
        });
        const targetPath = path.join(ROOT_DIR, filename);
        fs.writeFileSync(targetPath, rows.join('\n'), 'utf8');
        console.log(`✅ Generated ${name} CSV: ${targetPath} (${items.length} items)`);
    };

    exportCategory('items', 'Items', 'mlbb_items.csv');
    exportCategory('Rune', 'Runes', 'mlbb_runes.csv');
    exportCategory('SKILL', 'Skills', 'mlbb_skills.csv');
    exportCategory('Role', 'Roles', 'mlbb_roles.csv');
}

generateMasterCsv();
