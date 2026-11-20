import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './modern.css';
import App from './App';
import { prepareLocalMusic } from './game/audio';

async function startGame() {
  try {
    await prepareLocalMusic();
  } catch (error) {
    console.warn('Optional local music is unavailable.', error);
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void startGame();
