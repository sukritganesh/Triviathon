# Triviathon

A local browser-based quiz game for one laptop.

[Play Triviathon](https://sukritganesh.github.io/Triviathon/).

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
To enable music on your laptop, place your own tracks in `public/audio/` using
`jeopardyTheme80s.mp3` (setup), `thinkingMusic.mp3` (final round), and
`outroMusic.mp3` (standings). Unmute the game to hear them.

Git ignores these three files. Vite copies local public assets into production
builds, so build from a fresh checkout for a distribution without the music.
