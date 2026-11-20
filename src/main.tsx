import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './modern.css';
import App from './App';
import { prepareLocalMusic } from './game/audio';
import { loadMusicLibrary } from './game/musicLibrary';

async function startGame() {
  for (const result of await Promise.allSettled([prepareLocalMusic(), loadMusicLibrary()])) {
    if (result.status === 'rejected') console.warn('Optional local music is unavailable.', result.reason);
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void startGame();
