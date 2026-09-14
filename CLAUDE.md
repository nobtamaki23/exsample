# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repo is a small collection of standalone, dependency-free browser games written in vanilla HTML5 Canvas / JavaScript. There is no build system, package manager, or test suite — each game is self-contained and runs directly in a browser.

- `.game/index.html` — 落ちものパズル (a Tetris-style falling block puzzle). All HTML, CSS, and JS are inlined in a single file inside an IIFE.
- `.game/index1.html` + `.game/main.js` — ブロック崩し (Breakout/Arkanoid clone). HTML markup in `index1.html`, game logic in the separate `main.js` (loaded via `<script src="main.js">`).

## Running the games

There is no dev server or build step. Open the HTML file directly in a browser, or serve the `.game` directory statically, e.g.:

```
python -m http.server 8000 --directory .game
```

Then visit `http://localhost:8000/index.html` (Tetris) or `http://localhost:8000/index1.html` (Breakout).

## Architecture notes

Both games use the same basic pattern: a `<canvas>` element, a 2D rendering context, mutable module-level state, and a `requestAnimationFrame` loop that updates state and redraws every frame. There is no framework, no modules/bundler, and no asset pipeline — everything (colors, shapes, layout constants) is defined inline as JS literals at the top of each file.

- Tetris (`index.html`): piece shapes/rotations are hardcoded per-rotation coordinate lists in `SHAPES`; collision, locking, and line-clearing are done directly against a `field` 2D array (`ROWS x COLS`). Wall-kick rotation is a simple fixed offset list (`[0, 1, -1, 2, -2]`), not full SRS.
- Breakout (`main.js`): bricks are a `bricks[col][row]` grid of `{x, y, status}`; physics (paddle/wall/brick collisions) and rendering are both done in the single `draw()` function called each frame, with `running`/`gameOver` flags gating simulation vs. idle/message screens.

## Devcontainer

`.devcontainer/devcontainer.json` just specifies a bare Ubuntu 24.04 base image — no language runtimes or tooling are provisioned since these games need nothing beyond a browser to run.
