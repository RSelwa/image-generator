"""
Spherical screenshot capture for 3D environments.

Holds the mouse button down and moves the mouse to control the camera view,
capturing screenshots in a bottom-to-top sweep with a full 360° horizontal
rotation at each level.

Usage:
    python scripts/screenshot_sphere.py

You have a few seconds after launching to focus the 3D environment window.
Press Ctrl+C at any time to stop (or move mouse to top-left corner).
"""

import os
import time
import pyautogui

# --- Configuration ---

CLICK_MODE = False     # True = hold mouse button to move camera (default), False = just move mouse (Steam games)
PRESS_ALT_TAB = False     # Whether to switch to the game window with Alt+Tab at the start (default: True)

ROWS = 7              # vertical levels (bottom to top)
COLS = 10             # horizontal screenshots per full 360° rotation

HORIZONTAL_OFFSET = 1000        # Sometimes horizontal rotation doesn't perform a full 360° with the expected pixels. Adjust this if needed.
FULL_ROTATION_PIXELS = 4200 + HORIZONTAL_OFFSET  # total mouse pixels for a full 360° horizontal rotation
FULL_VERTICAL_PIXELS = 2100  # total mouse pixels for bottom-to-top (180°)

DELAY_BETWEEN_SHOTS = 0.3  # seconds to wait after moving before screenshot
INITIAL_DELAY = 4           # seconds before starting (to focus the 3D window)

OUTPUT_BASE = os.path.join(os.path.dirname(__file__), "screenshots")

# --- Script ---

HORIZONTAL_STEP = FULL_ROTATION_PIXELS // COLS
VERTICAL_STEP = FULL_VERTICAL_PIXELS // (ROWS - 1)
TOTAL_SCREENSHOTS = ROWS * COLS
def main():
    from datetime import datetime
    run_name = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_dir = os.path.join(OUTPUT_BASE, run_name)
    os.makedirs(output_dir, exist_ok=True)

    print(f"Capturing {ROWS} rows x {COLS} cols = {TOTAL_SCREENSHOTS} screenshots")
    print(f"Full 360° = {FULL_ROTATION_PIXELS}px ({HORIZONTAL_STEP}px per step)")
    print(f"Output directory: {output_dir}")
    print(f"Click mode: {'ON' if CLICK_MODE else 'OFF (Steam)'}")
    print(f"Switching to game window...")
    if CLICK_MODE:
        pyautogui.hotkey('alt', 'tab')
    time.sleep(INITIAL_DELAY)

    screenshot_index = 0

    if CLICK_MODE:
        pyautogui.mouseDown()
    try:
        for row in range(ROWS):
            for col in range(COLS):
                # Take screenshot
                filename = os.path.join(output_dir, f"capture_{screenshot_index:03d}_r{row}_c{col}.png")
                pyautogui.screenshot(filename)
                screenshot_index += 1
                print(f"[{screenshot_index}/{TOTAL_SCREENSHOTS}] Saved {os.path.basename(filename)}")

                # Move horizontally
                if col < COLS - 1:
                    pyautogui.moveRel(HORIZONTAL_STEP, 0, duration=0.3)
                    time.sleep(DELAY_BETWEEN_SHOTS)

            # Complete the full 360°
            remaining = FULL_ROTATION_PIXELS - HORIZONTAL_STEP * (COLS - 1)
            pyautogui.moveRel(remaining, 0, duration=0.3)
            time.sleep(DELAY_BETWEEN_SHOTS)

            # Move up to the next row
            if row < ROWS - 1:
                pyautogui.moveRel(0, -VERTICAL_STEP, duration=0.3)
                time.sleep(DELAY_BETWEEN_SHOTS)
    finally:
        if CLICK_MODE:
            pyautogui.mouseUp()

    print(f"\nDone! {screenshot_index} screenshots saved to {output_dir}")


def debug():
    """Move the mouse horizontally until Ctrl+C. Prints total distance for FULL_ROTATION_PIXELS."""
    step = 200
    total = 0

    print(f"Starting debug mode — moving {step}px continuously. Press Ctrl+C to stop.")
    print(f"Click mode: {'ON' if CLICK_MODE else 'OFF (Steam)'}")
    print(f"Switching to game window...")
    pyautogui.hotkey('alt', 'tab')
    time.sleep(INITIAL_DELAY)

    screen_w, screen_h = pyautogui.size()
    center_x, center_y = screen_w // 2, screen_h // 2
    pyautogui.moveTo(center_x, center_y)
    if CLICK_MODE:
        pyautogui.mouseDown()
    try:
        while True:
            pyautogui.moveRel(step, 0, duration=0.3)
            total += step
            print(f"Total: {total}px")
            time.sleep(0.3)
    except KeyboardInterrupt:
        pass
    finally:
        if CLICK_MODE:
            pyautogui.mouseUp()

    print(f"\nTotal distance moved: {total}px")
    print(f"Set FULL_ROTATION_PIXELS = {total}")


def debug_vertical():
    """Move the mouse vertically (up) until Ctrl+C. Prints total distance for VERTICAL_STEP."""
    step = 200
    total = 0

    print(f"Starting vertical debug — moving {step}px up continuously. Press Ctrl+C to stop.")
    print(f"Click mode: {'ON' if CLICK_MODE else 'OFF (Steam)'}")
    print(f"Switching to game window...")
    pyautogui.hotkey('alt', 'tab')
    time.sleep(INITIAL_DELAY)

    screen_w, screen_h = pyautogui.size()
    center_x, center_y = screen_w // 2, screen_h // 2
    pyautogui.moveTo(center_x, center_y)
    if CLICK_MODE:
        pyautogui.mouseDown()
    try:
        while True:
            pyautogui.moveRel(0, -step, duration=0.3)
            total += step
            print(f"Total: {total}px")
            time.sleep(0.3)
    except KeyboardInterrupt:
        pass
    finally:
        if CLICK_MODE:
            pyautogui.mouseUp()

    print(f"\nTotal distance moved (bottom to top 180°): {total}px")
    print(f"Set VERTICAL_STEP = {total // ROWS} (total / ROWS = {total} / {ROWS})")


if __name__ == "__main__":
    pyautogui.FAILSAFE = True  # move mouse to top-left corner to abort

    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "debug":
        debug()
    elif len(sys.argv) > 1 and sys.argv[1] == "debug-v":
        debug_vertical()
    else:
        main()
