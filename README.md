# Triviathon

A local quiz game for one laptop, available as a Windows app or in a browser.

Run `npm install` and `npm run dev` in this folder, then [play Triviathon on this laptop](http://127.0.0.1:5174/).

## Windows app

Double-click `Triviathon_0.1.0_x64-setup.exe`, finish setup, and open **Triviathon**
from Start. The Windows x64 installer includes the game, boards, effects, and the
offline Microsoft WebView2 runtime installer. The installed game runs locally.

To build an installer on Windows, install Node.js, stable Rust with the MSVC
toolchain, and Visual Studio C++ Build Tools with a Windows SDK. From this
folder run `npm ci` and `npm run desktop:build`. The first build downloads its
dependencies. If PowerShell cannot find Cargo after a user-local Rust install,
run `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"` in that terminal.
The installer appears in `src-tauri/target/release/bundle/nsis/`.
Use `npm run desktop:dev` during development. For a new release, update the
version in package.json, its lockfile, and the Rust package, then rebuild.

## Project Docs

- Game rules and app behavior: [`docs/GAME_SPEC.md`](docs/GAME_SPEC.md)
- Progress tracker: [`docs/PROGRESS.md`](docs/PROGRESS.md)
- Board generation guide: [`docs/BOARD_GENERATION.md`](docs/BOARD_GENERATION.md)

## Generating Boards

To generate a new board with Codex, ask Codex to follow [`docs/BOARD_GENERATION.md`](docs/BOARD_GENERATION.md) and inspect an existing board in `public/boards`.

Codex should ask a few questions first, wait for your answers, then create a validated board JSON file in `public/boards`.

## Stack

- React
- TypeScript
- Vite
- Plain CSS

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The development server runs at `http://127.0.0.1:5174` by default.

## Optional music

The game includes sound effects and plays through every round with or without music.
For the Windows app, place your own tracks in
`%LOCALAPPDATA%\com.sukritganesh.triviathon\music\` and reopen Triviathon.
For browser play, place them in `public/audio/`. Both versions use
`jeopardyTheme80s.mp3` (setup), `thinkingMusic.mp3` (final round), and
`outroMusic.mp3` (standings). Unmute the game to hear them.

Git ignores these three files. The desktop build packages only game boards,
settings, and six named sound effects alongside the compiled UI. Personal music
stays on your computer. The ordinary browser build copies `public/`, including
any music present there.
