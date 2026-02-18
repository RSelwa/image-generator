# Screenshot Sphere

Captures a grid of screenshots from a 3D environment by automating mouse movements to rotate the camera, sweeping from bottom to top in a snake pattern.

## Prerequisites

- Python 3
- `pyautogui` library

```bash
pip install pyautogui
```

## Usage

1. Open your 3D environment (game, viewer, etc.) in a window where mouse movement controls the camera.
2. Run the script:

```bash
python scripts/screenshot_sphere.py
```

3. You have **4 seconds** to click on / focus the 3D window before capture begins.
4. The script will automatically move the mouse and take screenshots in a grid pattern.

To **abort** at any time, move your mouse to the top-left corner of the screen (pyautogui failsafe) or press `Ctrl+C`.

## Configuration

Edit the constants at the top of the script to adjust behavior:

| Constant | Default | Description |
|---|---|---|
| `ROWS` | 7 | Number of vertical levels |
| `COLS` | 10 | Number of horizontal positions per level |
| `HORIZONTAL_PIXELS` | 200 | Mouse pixels moved per horizontal step |
| `VERTICAL_PIXELS` | 100 | Mouse pixels moved up per row |
| `DELAY_BETWEEN_SHOTS` | 0.3s | Wait time after each mouse move before capturing |
| `INITIAL_DELAY` | 4s | Time to focus the 3D window before capture starts |

Total screenshots = `ROWS` x `COLS` (default: 70).

## Output

Screenshots are saved to `scripts/screenshots/` with the naming pattern:

```
capture_000_r0_c0.png
capture_001_r0_c1.png
...
```

Where `r` is the row index (bottom to top) and `c` is the column index.

## How it works

The script sweeps the camera in a **snake pattern**: it moves horizontally across one row, steps up, then moves horizontally in the opposite direction for the next row. This minimizes unnecessary camera movement and produces an even coverage of the sphere.
