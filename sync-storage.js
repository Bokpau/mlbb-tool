#!/usr/bin/env node
/**
 * sync-storage.js — copy this repo's images into the Supabase Storage bucket
 * that serves them.
 *
 * GIT STAYS THE SOURCE OF TRUTH. This is a one-way COPY, never a move: nothing
 * is deleted here, and a file removed from the bucket is restored by re-running
 * this. jsDelivr keeps working for anything still pointed at it — notably the
 * `=IMAGE()` URLs in mlbb_assets_master.csv, which feed BOK's Google Sheets and
 * are not part of this migration.
 *
 * WHY THIS EXISTS. jsDelivr caps a GitHub package at 50 MB. This repo's tracked
 * tree is 57.4 MB, so data.jsdelivr.com returns
 *   403 "Package size exceeded the configured limit of 50 MB"
 * and, while individual files still passthrough-serve, jsDelivr cannot build a
 * package index — cold fetches measured 1.1-3.6s against 0.19-0.23s warm. MPL PH
 * never felt it because PH traffic keeps its files hot; MSL Thailand is a new
 * audience on Thai POPs that had never cached this repo, so its art was cold
 * every time. Storage has no such cap, so the ceiling stops being a design
 * constraint.
 *
 * CREDENTIALS come from the environment — deliberately not from a .env in this
 * repo, so the service-role key keeps exactly one home on this machine:
 *
 *   cd ../mpl-ph-s17 && set -a && . ./.env.local && set +a && cd - \
 *     && node sync-storage.js
 *
 * The service-role key bypasses RLS. It is server-side only and must never
 * reach a browser bundle or a NEXT_PUBLIC_ variable.
 *
 * TWO REPOS, ONE BUCKET. mlbb-tool holds the shared game art; the identity art
 * that grows every season lives in mlbb-assets-leagues. Their paths do not
 * overlap at all (checked: 0 collisions across 2692 + 77 files), so both mirror
 * into the same bucket and the site needs ONE base URL instead of three.
 *
 * NORMALISED PHOTO KEYS. Photo files are named inconsistently — mlbb-tool spells
 * them like the PH feed ('Aeon_FRONT.png'), mlbb-assets-leagues uppercases them
 * ('PAYEN_FRONT.png'), and one PH file is entirely lowercase
 * ('shizou_FRONT.png', which no spelling the site tried ever matched, so that
 * player showed a letter avatar despite having art). Storage is case-sensitive
 * like jsDelivr, so guessing the spelling meant a 404 per miss.
 *
 * Every photo therefore also uploads under an UPPERCASED stem, and `img.player()`
 * uppercases the name it looks up. One request, always, whatever the feed spells.
 * Verified collision-free: 135 photos -> 135 distinct uppercase keys. The
 * verbatim originals stay too, because cdnify() still rewrites database URLs to
 * the original spellings.
 *
 * USAGE
 *   node sync-storage.js                          # this repo
 *   node sync-storage.js --root ../mlbb-assets-leagues
 *   node sync-storage.js --dry-run                # report only, upload nothing
 *   node sync-storage.js hero items               # limit to those folders
 */

// ESM, because this package.json sets "type": "module".
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BUCKET = 'assets';
const IMAGE_RE = /\.(png|jpe?g|webp|svg|gif)$/i;

// A year, immutable. Filenames here are stable and their contents do not
// change; when art genuinely changes it should land under a NEW filename rather
// than overwriting, so nothing ever has to be purged from the edge.
const CACHE_CONTROL = '31536000, immutable';

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run:  cd ../mpl-ph-s17 && set -a && . ./.env.local && set +a && cd - && node sync-storage.js'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const rootFlag = args.indexOf('--root');
const REPO_ROOT =
  rootFlag !== -1 ? path.resolve(process.cwd(), args[rootFlag + 1]) : __dirname;
const onlyDirs = args.filter(
  (a, i) => !a.startsWith('--') && i !== rootFlag + 1
);

/** Folders whose files also get an uppercase-stem alias (see header). */
const NORMALISE_DIRS = new Set(['playerimage']);

/**
 * The keys a photo must also answer to, so `img.player()` never has to guess.
 *
 * Two transforms, both on the stem only, extension untouched:
 *   UPPERCASE                'Aeon_FRONT.png'      -> 'AEON_FRONT.png'
 *   UPPERCASE + no spaces    'SUPER MARCO_FRONT'   -> 'SUPERMARCO_FRONT'
 *
 * The second exists because display names and filenames disagree about spaces in
 * BOTH directions: five PH players are spelled 'SUPER MARCO' / 'FINDING HITO' /
 * 'DEX STAR' / 'SUPER FRINCE' / 'SUPER YOSHI' against files with no space, while
 * MSL's 'AMY H4CK' has the space in the file. Uploading both spellings and
 * stripping spaces in the lookup satisfies each without a per-name exception.
 *
 * SPACES ONLY — never all punctuation. Stripping '.' would collide three real
 * pairs that are deliberately distinct: AGI./AGI, IZY./IZY, ROBINX./ROBINX.
 * Verified: 135 photos produce 135 distinct keys under each transform.
 */
function aliasKeys(rel) {
  const dir = path.posix.dirname(rel);
  const base = path.posix.basename(rel);
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return [];
  const stem = base.slice(0, dot);
  const ext = base.slice(dot);
  const upper = stem.toUpperCase();
  return [...new Set([upper, upper.replace(/\s+/g, '')])]
    .filter((s) => s !== stem)
    .map((s) => `${dir}/${s}${ext}`);
}

const auth = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

/** Encode each path SEGMENT — 11 filenames carry spaces ('Role/EXP LANE.png'). */
const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');

const md5 = (buf) => createHash('md5').update(buf).digest('hex');

/**
 * Only files git tracks. The heavy working folders (_raw/, hero_transparent/,
 * HERO_CROP_RAW/) are gitignored and must not be swept up — they are masters,
 * some of them over 20 MB.
 */
function trackedImages() {
  const out = execFileSync('git', ['ls-files', '-z'], {
    cwd: REPO_ROOT,
    maxBuffer: 64 * 1024 * 1024,
    encoding: 'utf8',
  });
  return out
    .split('\0')
    .filter((f) => f && IMAGE_RE.test(f))
    .filter((f) => !onlyDirs.length || onlyDirs.includes(f.split('/')[0]))
    .sort();
}

/**
 * Every object already in the bucket, as path -> md5.
 *
 * Storage's list endpoint is per-prefix and pages at 100 by default, so this
 * walks one folder at a time with an explicit limit. eTag comes back quoted.
 */
async function remoteIndex(prefixes) {
  const index = new Map();
  for (const prefix of prefixes) {
    let offset = 0;
    for (;;) {
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
        {
          method: 'POST',
          headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, limit: 1000, offset }),
        }
      );
      if (!res.ok) throw new Error(`list ${prefix}: ${res.status} ${await res.text()}`);
      const rows = await res.json();
      for (const r of rows) {
        if (!r.metadata) continue; // a sub-folder, not an object
        const tag = (r.metadata.eTag || '').replace(/"/g, '');
        index.set(`${prefix}/${r.name}`, tag);
      }
      if (rows.length < 1000) break;
      offset += rows.length;
    }
  }
  return index;
}

async function upload(relPath, body) {
  const type = MIME[path.extname(relPath).toLowerCase()] || 'application/octet-stream';
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(relPath)}`,
    {
      method: 'POST',
      headers: {
        ...auth,
        'Content-Type': type,
        'Cache-Control': CACHE_CONTROL,
        'x-upsert': 'true',
      },
      body,
    }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
}

(async () => {
  const files = trackedImages();
  if (!files.length) {
    console.error('No tracked images matched. Check the folder names you passed.');
    process.exit(1);
  }

  const prefixes = [...new Set(files.map((f) => f.split('/').slice(0, -1).join('/')))].sort();
  process.stdout.write(
    `${files.length} tracked images across ${prefixes.length} folders — reading bucket…\n`
  );

  const remote = await remoteIndex(prefixes);
  console.log(`bucket holds ${remote.size} objects\n`);

  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;
  const failed = [];

  // Decide what to send before sending anything, so the pool below is pure I/O
  // and the dry run reports exactly what a real run would do.
  const queue = [];
  for (const rel of files) {
    let body;
    try {
      body = readFileSync(path.join(REPO_ROOT, rel));
    } catch (e) {
      // Tracked but absent from the working tree — report it rather than
      // silently shipping a bucket that is missing a file git thinks exists.
      failed.push([rel, `unreadable: ${e.code || e.message}`]);
      continue;
    }
    // Content hash, not size: a re-crop at the same byte length still differs.
    const hash = md5(body);
    if (remote.get(rel) === hash) skipped++;
    else queue.push([rel, body]);

    // Same bytes, extra keys: the spelling-proof ones the site looks up.
    if (NORMALISE_DIRS.has(rel.split('/')[0])) {
      for (const alias of aliasKeys(rel)) {
        if (remote.get(alias) === hash) skipped++;
        else queue.push([alias, body]);
      }
    }
  }

  if (dryRun) {
    for (const [rel, body] of queue) {
      console.log(`  would upload  ${rel}  (${(body.length / 1024).toFixed(0)} KB)`);
    }
    uploaded = queue.length;
    bytes = queue.reduce((n, [, b]) => n + b.length, 0);
  } else {
    // Eight at a time. Sequential uploads took ~7 minutes for a full sync; this
    // is well inside what Storage tolerates and keeps a re-run cheap enough to
    // be routine rather than an event.
    const CONCURRENCY = 8;
    let next = 0;
    const worker = async () => {
      for (;;) {
        const i = next++;
        if (i >= queue.length) return;
        const [rel, body] = queue[i];
        try {
          await upload(rel, body);
          uploaded++;
          bytes += body.length;
          if (uploaded % 250 === 0) {
            process.stdout.write(`  …${uploaded}/${queue.length} uploaded\n`);
          }
        } catch (e) {
          failed.push([rel, e.message]);
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  }

  console.log(
    `\n${dryRun ? 'DRY RUN — ' : ''}uploaded ${uploaded}, unchanged ${skipped}, ` +
      `failed ${failed.length}, ${(bytes / 1024 / 1024).toFixed(2)} MB transferred`
  );

  if (failed.length) {
    console.log('\nFAILURES');
    for (const [f, m] of failed) console.log(`  ${f}\n    ${m}`);
    process.exit(1);
  }

  const sample = files[0];
  console.log(
    `\npublic URL shape:\n  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodePath(sample)}`
  );
})();
