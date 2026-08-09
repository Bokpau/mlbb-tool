import os
import json
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
from PIL import Image

PORT = 8089
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SELECTION_DIR = os.path.join(BASE_DIR, "hero_selection")
BAN_DIR = os.path.join(BASE_DIR, "hero_ban")

os.makedirs(BAN_DIR, exist_ok=True)

def parse_hero_info(filename):
    # Match pattern like "100_Brody_selection.png"
    match = re.match(r"^(\d+)_(.*)_selection\.png$", filename, re.IGNORECASE)
    if match:
        hero_id = int(match.group(1))
        hero_name = match.group(2).replace("_", " ")
        ban_filename = f"{match.group(1)}_{match.group(2)}_ban.png"
        return hero_id, hero_name, ban_filename
    return None, filename, filename.replace("_selection.png", "_ban.png")

def auto_crop_image(src_path, dst_path, y_offset_ratio=0.03, aspect_ratio=150/70):
    with Image.open(src_path) as img:
        img = img.convert("RGBA")
        w, h = img.size
        
        # Calculate crop box with requested aspect ratio (150:70)
        crop_w = w
        crop_h = int(w / aspect_ratio)
        if crop_h > h:
            crop_h = h
            crop_w = int(h * aspect_ratio)
            
        crop_x = int((w - crop_w) / 2)
        crop_y = int(h * y_offset_ratio)
        if crop_y + crop_h > h:
            crop_y = max(0, h - crop_h)
            
        cropped = img.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))
        resized = cropped.resize((150, 70), Image.Resampling.LANCZOS)
        resized.save(dst_path, "PNG")

class HeroCropperHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/heroes":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            
            heroes = []
            if os.path.exists(SELECTION_DIR):
                files = os.listdir(SELECTION_DIR)
                selection_files = [f for f in files if f.endswith("_selection.png")]
                
                # Sort numerically by hero id
                def get_id(fname):
                    h_id, _, _ = parse_hero_info(fname)
                    return h_id if h_id is not None else 9999
                
                selection_files.sort(key=get_id)
                
                for f in selection_files:
                    h_id, h_name, ban_fname = parse_hero_info(f)
                    ban_path = os.path.join(BAN_DIR, ban_fname)
                    is_cropped = os.path.exists(ban_path)
                    heroes.append({
                        "id": h_id,
                        "name": h_name,
                        "selectionFilename": f,
                        "banFilename": ban_fname,
                        "isCropped": is_cropped,
                        "selectionUrl": f"/hero_selection/{f}",
                        "banUrl": f"/hero_ban/{ban_fname}" if is_cropped else None
                    })
            
            self.wfile.write(json.dumps(heroes).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            data = json.loads(body_data)
        except Exception:
            data = {}

        if self.path == "/api/save-crop":
            filename = data.get("selectionFilename")
            crop_box = data.get("cropBox") # { x, y, width, height } in original image px
            
            if not filename:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing filename"}).encode("utf-8"))
                return

            src_path = os.path.join(SELECTION_DIR, filename)
            _, _, ban_fname = parse_hero_info(filename)
            dst_path = os.path.join(BAN_DIR, ban_fname)

            if not os.path.exists(src_path):
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Selection image not found"}).encode("utf-8"))
                return

            with Image.open(src_path) as img:
                img = img.convert("RGBA")
                w, h = img.size
                
                if crop_box and all(k in crop_box for k in ("x", "y", "width", "height")):
                    cx = max(0, min(w, crop_box["x"]))
                    cy = max(0, min(h, crop_box["y"]))
                    cw = max(1, min(w - cx, crop_box["width"]))
                    ch = max(1, min(h - cy, crop_box["height"]))
                    cropped = img.crop((cx, cy, cx + cw, cy + ch))
                else:
                    # Default auto crop if box not provided
                    crop_w = w
                    crop_h = int(w * 70 / 150)
                    crop_y = int(h * 0.03)
                    cropped = img.crop((0, crop_y, crop_w, crop_y + crop_h))

                resized = cropped.resize((150, 70), Image.Resampling.LANCZOS)
                resized.save(dst_path, "PNG")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "banFilename": ban_fname,
                "banUrl": f"/hero_ban/{ban_fname}?t={os.path.getmtime(dst_path)}"
            }).encode("utf-8"))
            return

        elif self.path == "/api/batch-auto-crop":
            y_offset = float(data.get("yOffsetRatio", 0.03))
            files = [f for f in os.listdir(SELECTION_DIR) if f.endswith("_selection.png")]
            processed = 0

            for f in files:
                src = os.path.join(SELECTION_DIR, f)
                _, _, ban_fname = parse_hero_info(f)
                dst = os.path.join(BAN_DIR, ban_fname)
                try:
                    auto_crop_image(src, dst, y_offset_ratio=y_offset)
                    processed += 1
                except Exception as e:
                    print(f"Error processing {f}: {e}")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "processedCount": processed
            }).encode("utf-8"))
            return

        self.send_response(444)
        self.end_headers()

def run(server_class=HTTPServer, handler_class=HeroCropperHandler, port=PORT):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Hero Cropper server running at http://localhost:{port}/hero_cropper.html")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
