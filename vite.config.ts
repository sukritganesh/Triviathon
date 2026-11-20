import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync } from 'node:fs';

const effects = ['boardFill.mp3', 'buzzer-ding.mp3', 'correctAnswer.mp3', 'dailyDouble.mp3',
  'incorrectAnswer.mp3', 'timesUp.mp3'];

export default defineConfig(({ mode }) => {
  const desktop = mode === 'desktop';
  const audio = desktop ? effects : readdirSync('public/audio').filter(name => name.endsWith('.mp3'));
  return {
    plugins: [
      react(),
      desktop && {
        name: 'desktop-game-assets',
        generateBundle() {
          const boards = readdirSync('public/boards').filter(name => name.endsWith('.json'));
          const files = ['config/game-settings.json', ...boards.map(name => 'boards/' + name),
            ...effects.map(name => 'audio/' + name)];
          for (const fileName of files) {
            this.emitFile({ type: 'asset', fileName, source: readFileSync('public/' + fileName) });
          }
        },
      },
    ],
    define: { __GAME_AUDIO_FILES__: JSON.stringify(audio) },
    build: desktop ? { outDir: 'dist-desktop', copyPublicDir: false, emptyOutDir: true } : {},
    server: { host: '127.0.0.1', port: 5174, strictPort: true },
  };
});
