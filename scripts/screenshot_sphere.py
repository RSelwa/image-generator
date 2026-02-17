"""
Spherical screenshot capture for 3D environments.

Moves the mouse to control the camera view, capturing screenshots
in a bottom-to-top sweep with horizontal rotations at each level.

Usage:
    python scripts/screenshot_sphere.py

You have a few seconds after launching to focus the 3D environment window.
Press Ctrl+C at any time to stop.
"""

import os
import time
import pyautogui

# --- Configuration ---

TOTAL_SCREENSHOTS = 70
ROWS = 7              # vertical levels (bottom to top)
COLS = 10             # horizontal positions per level (ROWS * COLS = TOTAL_SCREENSHOTS)

HORIZONTAL_PIXELS = 200   # mouse pixels to move per horizontal step
VERTICAL_PIXELS = 100     # mouse pixels to move up per row

DELAY_BETWEEN_SHOTS = 0.3  # seconds to wait after moving before screenshot
INITIAL_DELAY = 4           # seconds before starting (to focus the 3D window)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

# --- Script ---

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Capturing {ROWS} rows x {COLS} cols = {ROWS * COLS} screenshots")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Starting in {INITIAL_DELAY} seconds — focus your 3D environment now!")
    time.sleep(INITIAL_DELAY)

    screenshot_index = 0

    for row in range(ROWS):
        # Alternate horizontal direction each row (snake pattern)
        direction = 1 if row % 2 == 0 else -1

        for col in range(COLS):
            # Take screenshot
            filename = os.path.join(OUTPUT_DIR, f"capture_{screenshot_index:03d}_r{row}_c{col}.png")
            pyautogui.screenshot(filename)
            screenshot_index += 1
            print(f"[{screenshot_index}/{TOTAL_SCREENSHOTS}] Saved {os.path.basename(filename)}")

            # Move horizontally (except after last col in this row)
            if col < COLS - 1:
                pyautogui.moveRel(direction * HORIZONTAL_PIXELS, 0, duration=0.1)
                time.sleep(DELAY_BETWEEN_SHOTS)

        # Move up to next row (except after last row)
        if row < ROWS - 1:
            pyautogui.moveRel(0, -VERTICAL_PIXELS, duration=0.1)
            time.sleep(DELAY_BETWEEN_SHOTS)

    print(f"\nDone! {screenshot_index} screenshots saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    pyautogui.FAILSAFE = True  # move mouse to top-left corner to abort
    main()
