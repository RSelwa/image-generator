import os
import math
import re
from urllib.parse import urlparse
import requests
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============== CONFIGURATION ==============
ZOOM_LEVEL = 12 # 4 or 14
FILE_TERM = "jpg"

TILE_URL_TEMPLATE = "https://tiles.mapgenie.io/games/star-wars-jedi-fallen-order/zeffo/default-v1/{z}/{x}/{y}.png"

# Set custom X/Y ranges for maps that don't start at 0 (e.g. MapGenie at high zoom)
# Leave as None to auto-detect bounds by probing the tile server
X_RANGE = (2030, 2051)  # e.g. (8137, 8178) or None
Y_RANGE = (2030, 2051) # e.g. (8137, 8178) or None

# Some tile servers use {y}/{x} instead of {x}/{y} — set to True to swap them in the URL
SWAP_XY = False

FOLDER_NAME = re.sub(r"[^\w\-]", "_", urlparse(TILE_URL_TEMPLATE).path.replace("/{z}/{x}/{y}", "").strip("/"))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "tiles", FOLDER_NAME)
MAX_WORKERS = 8
REQUEST_TIMEOUT = 15
HEADERS = {
    "User-Agent": "TileFetcher/1.0"
}
# ===========================================

TILE_EXT = TILE_URL_TEMPLATE.split("{y}")[-1].split("?")[0] or ".png"


def build_url(z, x, y):
    """Build tile URL."""
    return TILE_URL_TEMPLATE.format(z=z, x=x, y=y)


def tile_exists(z, x, y):
    """Check if a tile exists on the server (HEAD request)."""
    url = build_url(z, x, y)
    try:
        r = requests.head(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        return r.status_code == 200
    except requests.RequestException:
        return False


def binary_search_min(z, axis, other_mid, lo, hi):
    """Find the first coordinate that has a valid tile."""
    while lo < hi:
        mid = (lo + hi) // 2
        coords = (z, mid, other_mid) if axis == "x" else (z, other_mid, mid)
        if tile_exists(*coords):
            hi = mid
        else:
            lo = mid + 1
    return lo


def binary_search_max(z, axis, other_mid, lo, hi):
    """Find the last coordinate that has a valid tile."""
    while lo < hi:
        mid = (lo + hi + 1) // 2
        coords = (z, mid, other_mid) if axis == "x" else (z, other_mid, mid)
        if tile_exists(*coords):
            lo = mid
        else:
            hi = mid - 1
    return lo


def auto_detect_bounds(zoom):
    """Auto-detect the tile bounds using binary search."""
    n = 2 ** zoom
    print(f"Auto-detecting tile bounds for zoom {zoom} (max range 0-{n - 1})...")

    # First, find any valid tile by checking the center area
    mid = n // 2
    found_x, found_y = None, None

    # Search outward from center
    for offset in range(0, n, max(1, n // 32)):
        for tx in [mid + offset, mid - offset]:
            for ty in [mid + offset, mid - offset]:
                if 0 <= tx < n and 0 <= ty < n and tile_exists(zoom, tx, ty):
                    found_x, found_y = tx, ty
                    break
            if found_x is not None:
                break
        if found_x is not None:
            break

    if found_x is None:
        print("Could not find any valid tile. Falling back to full range.")
        return 0, n - 1, 0, n - 1

    print(f"Found valid tile at ({found_x}, {found_y}), searching bounds...")

    # Binary search for X bounds using found_y as reference
    x_min = binary_search_min(zoom, "x", found_y, 0, found_x)
    x_max = binary_search_max(zoom, "x", found_y, found_x, n - 1)

    # Binary search for Y bounds using found_x as reference
    y_min = binary_search_min(zoom, "y", found_x, 0, found_y)
    y_max = binary_search_max(zoom, "y", found_x, found_y, n - 1)

    print(f"Detected bounds: X=[{x_min}, {x_max}] Y=[{y_min}, {y_max}]")
    return x_min, x_max, y_min, y_max


def get_tile_ranges(zoom):
    if X_RANGE and Y_RANGE:
        return X_RANGE[0], X_RANGE[1], Y_RANGE[0], Y_RANGE[1]
    return auto_detect_bounds(zoom)


def fetch_tile(z, x, y):
    url = TILE_URL_TEMPLATE.format(z=z, x=x, y=y)
    tile_dir = os.path.join(OUTPUT_DIR, str(z), str(x))
    os.makedirs(tile_dir, exist_ok=True)
    tile_path = os.path.join(tile_dir, f"{y}{TILE_EXT}")

    if os.path.exists(tile_path):
        return f"SKIP {z}/{x}/{y} (already exists)"

    try:
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        with open(tile_path, "wb") as f:
            f.write(response.content)
        return f"OK   {z}/{x}/{y}"
    except requests.RequestException as e:
        return f"FAIL {z}/{x}/{y} - {e}"


def main():
    x_min, x_max, y_min, y_max = get_tile_ranges(ZOOM_LEVEL)
    x_count = x_max - x_min + 1
    y_count = y_max - y_min + 1
    total = x_count * y_count
    print(f"\nZoom level: {ZOOM_LEVEL}")
    print(f"X range: {x_min} -> {x_max} ({x_count} tiles)")
    print(f"Y range: {y_min} -> {y_max} ({y_count} tiles)")
    print(f"Total tiles: {total}")
    print(f"URL template: {TILE_URL_TEMPLATE}")
    print(f"Output: {OUTPUT_DIR}")
    print()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    done = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(fetch_tile, ZOOM_LEVEL, x, y): (x, y)
            for x in range(x_min, x_max + 1)
            for y in range(y_min, y_max + 1)
        }

        for future in as_completed(futures):
            result = future.result()
            done += 1
            if result.startswith("FAIL"):
                failed += 1
            print(f"[{done}/{total}] {result}")

    print(f"\nDone. {done - failed}/{total} tiles saved, {failed} failed.")

    # Merge all tiles into a single world image
    print("\nMerging tiles into world image...")
    merge_tiles(ZOOM_LEVEL, x_min, x_max, y_min, y_max)


def detect_tile_size(zoom, x_min, x_max, y_min, y_max):
    """Detect tile size from the first available tile."""
    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            tile_path = os.path.join(OUTPUT_DIR, str(zoom), str(x), f"{y}{TILE_EXT}")
            if os.path.exists(tile_path):
                with Image.open(tile_path) as img:
                    w, h = img.size
                    print(f"Detected tile size: {w}x{h}px")
                    return w, h
    return 256, 256


def merge_tiles(zoom, x_min, x_max, y_min, y_max):
    tile_w, tile_h = detect_tile_size(zoom, x_min, x_max, y_min, y_max)
    x_count = x_max - x_min + 1
    y_count = y_max - y_min + 1
    if SWAP_XY:
        world_width = y_count * tile_w
        world_height = x_count * tile_h
    else:
        world_width = x_count * tile_w
        world_height = y_count * tile_h

    print(f"Creating image: {world_width}x{world_height}px")
    world_image = Image.new("RGB", (world_width, world_height), (200, 200, 200))

    missing = 0
    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            tile_path = os.path.join(OUTPUT_DIR, str(zoom), str(x), f"{y}{TILE_EXT}")
            if not os.path.exists(tile_path):
                missing += 1
                continue
            tile = Image.open(tile_path)
            if SWAP_XY:
                px = (y - y_min) * tile_w
                py = (x - x_min) * tile_h
            else:
                px = (x - x_min) * tile_w
                py = (y - y_min) * tile_h
            world_image.paste(tile, (px, py))

    if missing:
        print(f"Warning: {missing} tiles missing, filled with gray.")

    output_path = os.path.join(OUTPUT_DIR, f"world_z{zoom}.png")
    world_image.save(output_path)
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    main()
