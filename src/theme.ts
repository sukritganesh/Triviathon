/** Visual styles available across the entire game. */
export type Theme = 'modern' | 'retro';

const storageKey = 'jeopardy.theme';

/** New players and unrecognized preferences start in Modern. */
export function readTheme(): Theme {
  try {
    return localStorage.getItem(storageKey) === 'retro' ? 'retro' : 'modern';
  } catch {
    return 'modern';
  }
}

/** Remember the host's choice for the next visit on this browser. */
export function rememberTheme(theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // The selection still applies to this game when storage is unavailable.
  }
}
