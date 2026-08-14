"""
Player Photo Cropper — turns full-body broadcast cutouts into 1080x1080 web assets.

Source masters live in _raw/s18 (4672x7008 transparent PNGs, ~29MB each).
Output matches the spec measured off the existing playerimage/ folder:

    canvas            1080 x 1080 RGBA, transparent background
    subject width     74.6% of frame
    top margin        0.9%  (head just below the top edge)
    bottom margin     0.0%  (torso runs off the bottom of the frame)
    horizontal        centred on the subject

Usage:
    python3 player_cropper_server.py --batch     # auto-crop everything, build previews
    python3 player_cropper_server.py             # serve the tuning UI on :8090

Needs Pillow. If it is not installed system-wide:
    python3 -m venv venv && ./venv/bin/pip install Pillow
    ./venv/bin/python player_cropper_server.py --batch
"""

import os
import re
import sys
import json
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # masters are ~33MP over the default guard

PORT = 8090
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "_raw", "s18")
OUT_DIR = os.path.join(BASE_DIR, "playerimage_s18")
REF_DIR = os.path.join(BASE_DIR, "playerimage")          # existing assets, read-only
PREVIEW_DIR = os.path.join(SRC_DIR, ".previews")          # inside _raw -> gitignored
NAMES_FILE = os.path.join(BASE_DIR, "player_crop_names.json")
OVERRIDES_FILE = os.path.join(BASE_DIR, "player_crop_overrides.json")
SOLVED_FILE = os.path.join(BASE_DIR, "player_crop_solved.json")

OUT_SIZE = 1080
FILL = 0.746        # subject width as a fraction of the frame
TOP = 0.009         # headroom above the subject, as a fraction of the crop side
ALPHA_THR = 16      # alpha below this counts as background
PREVIEW_H = 900     # preview height sent to the browser

for d in (OUT_DIR, PREVIEW_DIR):
    os.makedirs(d, exist_ok=True)

_lock = threading.Lock()


def load_json(path, default):
    try:
        with open(path) as fh:
            return json.load(fh)
    except Exception:
        return default


def save_json(path, data):
    with open(path, "w") as fh:
        json.dump(data, fh, indent=1, sort_keys=True)


def alpha_bbox(im):
    """Bounding box of everything more opaque than ALPHA_THR."""
    return im.split()[3].point(lambda v: 255 if v > ALPHA_THR else 0).getbbox()


def solve(im, iters=6):
    """
    Find the square crop where the subject VISIBLE INSIDE THE CROP fills FILL
    of the frame.

    A single-shot bbox is not enough: it measures the whole standing figure, so a
    wide stance or a lowered arm inflates the width and the head-and-torso crop
    comes out too small. Each pass re-measures inside the candidate crop and
    rescales, which converges in a few rounds.
    """
    bb = alpha_bbox(im)
    if not bb:
        raise ValueError("image is fully transparent — no subject found")
    x0, y0, x1, y1 = bb
    side = (x1 - x0) / FILL
    cx = (x0 + x1) / 2.0
    for _ in range(iters):
        s = int(round(side))
        left = int(round(cx - side / 2.0))
        top = int(round(y0 - TOP * side))
        vis = alpha_bbox(im.crop((left, top, left + s, top + s)))
        if not vis:
            break
        vx0, _, vx1, _ = vis
        vw = vx1 - vx0
        if vw <= 0:
            break
        side = side * (vw / s) / FILL
        cx = cx + ((vx0 + vx1) / 2.0 - s / 2.0) * (side / s)
    return {"side": int(round(side)), "cx": int(round(cx)), "y0": int(y0),
            "w": im.size[0], "h": im.size[1]}


def render(im, sol, zoom=1.0, dx=0.0, dy=0.0):
    """Apply the solved geometry plus any manual nudge, return the 1080 output."""
    side = max(8, int(round(sol["side"] / max(zoom, 0.05))))
    left = int(round(sol["cx"] - side / 2.0 + dx * side))
    top = int(round(sol["y0"] - TOP * side + dy * side))
    # Paste onto a transparent square so a crop running past the master edge pads
    # rather than shrinks.
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im.crop((left, top, left + side, top + side)), (0, 0))
    return canvas.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)


def out_name(master, names):
    return names.get(master, master)


def process(master, names, overrides, solved, write_preview=True):
    """Crop one master. Returns the output filename."""
    src = os.path.join(SRC_DIR, master)
    im = Image.open(src).convert("RGBA")

    key = master
    if key not in solved:
        solved[key] = solve(im)
    sol = solved[key]

    ov = overrides.get(key, {})
    img = render(im, sol, ov.get("zoom", 1.0), ov.get("dx", 0.0), ov.get("dy", 0.0))

    dst_name = out_name(master, names)
    img.save(os.path.join(OUT_DIR, dst_name), "PNG", optimize=True)

    if write_preview:
        pv = os.path.join(PREVIEW_DIR, master)
        if not os.path.exists(pv):
            scale = PREVIEW_H / im.size[1]
            im.resize((max(1, int(im.size[0] * scale)), PREVIEW_H),
                      Image.Resampling.LANCZOS).save(pv, "PNG")
    return dst_name


def masters():
    return sorted(f for f in os.listdir(SRC_DIR) if f.lower().endswith(".png"))


def build_names():
    """
    Map each master file to its output filename.

    Filenames must match what the site's photoName() produces, because that is how
    overlays resolve a photo:
        photoName = strip whitespace, keep only [a-zA-Z0-9._]
    Where the player already has an asset in playerimage/ under a different CASE,
    the existing spelling wins — GitHub and jsDelivr are case-sensitive, so
    diverging would silently create a duplicate file rather than replace one.
    """
    if os.path.exists(NAMES_FILE):
        return load_json(NAMES_FILE, {})
    existing = [f[:-10] for f in os.listdir(REF_DIR)
                if f.endswith("_FRONT.png")] if os.path.isdir(REF_DIR) else []
    by_lower = {e.lower(): e for e in existing}
    names = {}
    for m in masters():
        stem = m[:-4]                                  # "Coach Eson_FRONT"
        base, _, suffix = stem.partition("_FRONT")     # "Coach Eson", "", "" | "_1"
        pn = re.sub(r"[^a-zA-Z0-9._]", "", re.sub(r"\s+", "", base.strip()))
        names[m] = f"{by_lower.get(pn.lower(), pn)}_FRONT{suffix}.png"
    save_json(NAMES_FILE, names)
    return names


def batch(force=False):
    names, overrides = build_names(), load_json(OVERRIDES_FILE, {})
    solved = load_json(SOLVED_FILE, {})
    files = masters()
    done = 0
    for i, m in enumerate(files, 1):
        dst = os.path.join(OUT_DIR, out_name(m, names))
        if not force and os.path.exists(dst) and m in solved:
            print(f"[{i}/{len(files)}] skip {m}", flush=True)
            continue
        try:
            name = process(m, names, overrides, solved)
            done += 1
            print(f"[{i}/{len(files)}] {m}  ->  {name}", flush=True)
        except Exception as exc:
            print(f"[{i}/{len(files)}] FAILED {m}: {exc}", flush=True)
    save_json(SOLVED_FILE, solved)
    print(f"\ncropped {done} file(s) into {os.path.relpath(OUT_DIR, BASE_DIR)}/", flush=True)
    return done


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=BASE_DIR, **kw)

    def log_message(self, *a):
        pass

    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/players":
            names = build_names()
            overrides = load_json(OVERRIDES_FILE, {})
            solved = load_json(SOLVED_FILE, {})
            out = []
            for m in masters():
                sol = solved.get(m)
                dst = out_name(m, names)
                out.append({
                    "master": m,
                    "out": dst,
                    "label": m[:-4].partition("_FRONT")[0],
                    "solved": sol,
                    "ready": sol is not None and os.path.exists(os.path.join(PREVIEW_DIR, m)),
                    "hasOutput": os.path.exists(os.path.join(OUT_DIR, dst)),
                    "override": overrides.get(m, {}),
                    "previewH": PREVIEW_H,
                })
            return self._json({"players": out, "fill": FILL, "top": TOP, "size": OUT_SIZE})
        return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            data = {}

        if self.path == "/api/save-crop":
            m = data.get("master")
            if not m or m not in masters():
                return self._json({"error": "unknown master"}, 400)
            with _lock:
                names = build_names()
                overrides = load_json(OVERRIDES_FILE, {})
                solved = load_json(SOLVED_FILE, {})
                ov = {k: float(data.get(k, d))
                      for k, d in (("zoom", 1.0), ("dx", 0.0), ("dy", 0.0))}
                if ov == {"zoom": 1.0, "dx": 0.0, "dy": 0.0}:
                    overrides.pop(m, None)
                else:
                    overrides[m] = ov
                try:
                    name = process(m, names, overrides, solved)
                except Exception as exc:
                    return self._json({"error": str(exc)}, 500)
                save_json(OVERRIDES_FILE, overrides)
                save_json(SOLVED_FILE, solved)
            return self._json({"ok": True, "out": name})

        if self.path == "/api/batch":
            threading.Thread(target=batch, kwargs={"force": bool(data.get("force"))},
                             daemon=True).start()
            return self._json({"ok": True, "started": True})

        return self._json({"error": "not found"}, 404)


def main():
    if "--batch" in sys.argv:
        batch(force="--force" in sys.argv)
        return
    print(f"Player Cropper  ->  http://localhost:{PORT}/player_cropper.html")
    print(f"  masters: {os.path.relpath(SRC_DIR, BASE_DIR)}  ({len(masters())} files)")
    print(f"  output : {os.path.relpath(OUT_DIR, BASE_DIR)}")
    HTTPServer(("", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
