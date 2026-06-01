// Build step for the MLBB live tool.
//
// What it does:
//   1. Reads the readable source: src/index.html + src/main-config.js
//   2. Inlines main-config.js into the app's <script type="module"> block
//      (so there is no separate /main-config.js file to download)
//   3. Obfuscates the combined app script
//   4. Writes the deployable, obfuscated ./index.html (served by Vercel)
//
// The readable source in src/ is the thing you EDIT. After editing, run:
//     npm run build
// then commit the regenerated ./index.html.
//
// Obfuscation is intentionally CONSERVATIVE:
//   - renameGlobals: false  -> top-level function names (fetchGame, loadGame,
//     the toggle* handlers, etc.) are preserved, because the HTML's
//     onclick="..." attributes and the window.X = X assignments reference them
//     by name. Renaming them would break every button.
//   - no controlFlowFlattening / selfDefending / debugProtection -> those are
//     the settings most likely to break a large app or tank performance.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const r = (p) => join(__dirname, p);

const SRC_HTML = r('src/index.html');
const SRC_CONFIG = r('src/main-config.js');
const OUT_HTML = r('index.html');

const START_TAG = '<script type="module">';
const END_TAG = '</script>';

// Function names that MUST keep their identifiers (referenced from HTML/window).
// Used as a post-build safety assertion.
const REQUIRED_NAMES = [
  'checkAccessMode', 'fetchGame', 'loadGame', 'loadBattle', 'resetFilters',
  'toggleDeathReviewMode', 'toggleDraftModal', 'toggleFullscreen',
  'toggleGoldDistributionModal', 'toggleItemTimingModal', 'toggleLiveData',
  'toggleMapModal', 'togglePlayerCompareModal', 'toggleStatsDonutModal',
  'applyFilters', 'renderDraftModal', 'renderItemTimings', 'renderStatsDonut',
];

function main() {
  const html = readFileSync(SRC_HTML, 'utf8');
  const config = readFileSync(SRC_CONFIG, 'utf8');

  // 1. Strip the `export ` keyword so main-config can be inlined as plain code.
  const inlinedConfig = config.replace(/^[ \t]*export\s+/gm, '');

  // 2. Locate the single app module script.
  const startIdx = html.indexOf(START_TAG);
  if (startIdx < 0) throw new Error('Could not find <script type="module"> in src/index.html');
  const contentStart = startIdx + START_TAG.length;
  const endIdx = html.indexOf(END_TAG, contentStart);
  if (endIdx < 0) throw new Error('Could not find closing </script> for the app module');

  let scriptBody = html.slice(contentStart, endIdx);

  // 3. Remove the `import { ... } from './main-config.js';` block.
  const before = scriptBody.length;
  scriptBody = scriptBody.replace(
    /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/main-config\.js['"];?/,
    ''
  );
  if (scriptBody.length === before) {
    throw new Error("Did not find the main-config.js import to remove — aborting.");
  }

  // 4. Combine: inlined config first, then the app body.
  const combined = `${inlinedConfig}\n\n${scriptBody}`;

  // 5. Obfuscate.
  const obfuscated = JavaScriptObfuscator.obfuscate(combined, {
    compact: true,
    target: 'browser',
    renameGlobals: false,          // keep onclick/window-referenced names intact
    renameProperties: false,
    identifierNamesGenerator: 'mangled-shuffled',
    stringArray: true,
    stringArrayThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    splitStrings: false,
    numbersToExpressions: false,
    transformObjectKeys: false,    // keep object-literal keys (app reads many by name)
    controlFlowFlattening: false,  // avoid breakage / perf hit
    deadCodeInjection: false,
    selfDefending: false,
    debugProtection: false,
    disableConsoleOutput: false,
    simplify: true,
    unicodeEscapeSequence: false,
  }).getObfuscatedCode();

  // 6. Safety assertion: every required handler name must survive obfuscation.
  const missing = REQUIRED_NAMES.filter((n) => !obfuscated.includes(n));
  if (missing.length) {
    throw new Error(
      `Obfuscation removed/renamed required handler name(s): ${missing.join(', ')}.\n` +
      `Add them to reservedNames or check renameGlobals. Aborting so the live app is not broken.`
    );
  }

  // 7. Re-assemble the HTML with the obfuscated script in place.
  const outHtml = html.slice(0, contentStart) + '\n' + obfuscated + '\n' + html.slice(endIdx);
  writeFileSync(OUT_HTML, outHtml, 'utf8');

  const kb = (s) => (s.length / 1024).toFixed(0);
  console.log(`✓ Built ${OUT_HTML}`);
  console.log(`  source script: ${kb(combined)} KB  ->  obfuscated: ${kb(obfuscated)} KB`);
  console.log(`  all ${REQUIRED_NAMES.length} required handler names preserved`);
}

main();
