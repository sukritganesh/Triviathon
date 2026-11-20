import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

/** Control the native window so fullscreen covers the taskbar and title bar. */
export function FullscreenButton() {
  const [full, setFull] = useState(true);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const change = useCallback(async (exitOnly = false) => {
    if (pending.current) return;
    pending.current = true;
    try {
      const win = getCurrentWindow();
      const active = await win.isFullscreen();
      if (active || !exitOnly) await win.setFullscreen(!active);
      setFull(await win.isFullscreen());
      setError('');
    } catch {
      setError('Could not change fullscreen.');
    } finally {
      pending.current = false;
    }
  }, []);
  useEffect(() => {
    void getCurrentWindow().isFullscreen().then(setFull).catch(() => {});
    function handleKey(event: KeyboardEvent) {
      if (event.key !== 'F11' && (event.key !== 'Escape' || !full)) return;
      event.preventDefault();
      if (!event.repeat) void change(event.key === 'Escape');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [change, full]);
  const label = full ? 'Exit fullscreen' : 'Enter fullscreen';
  return (
    <>
      <button type="button" className="fullscreen-button" aria-label={label}
        title={`${label} (F11)`} aria-pressed={full} onClick={() => void change()}>⛶</button>
      {error && <span className="fullscreen-error" role="alert">{error}</span>}
    </>
  );
}
