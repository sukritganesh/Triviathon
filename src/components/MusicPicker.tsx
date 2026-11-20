import { useState } from 'react';
import { defaultMusicName } from '../game/audio';
import { musicSlots, saveMusicTrack, selectedTrack, type MusicSlot } from '../game/musicLibrary';

export function MusicPicker({ onChange }: { onChange: (slot: MusicSlot) => void }) {
  const [busy, setBusy] = useState<MusicSlot | null>(null);
  const [error, setError] = useState('');

  async function choose(slot: MusicSlot, file: File | null) {
    setBusy(slot);
    setError('');
    try {
      await saveMusicTrack(slot, file);
      onChange(slot);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this track on this device.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <fieldset className="form-section music-picker" disabled={busy !== null}>
      <legend>Music</legend>
      {(Object.keys(musicSlots) as MusicSlot[]).map(slot => {
        const track = selectedTrack(slot);
        return (
          <div className="music-row" key={slot}>
            <div>
              <strong>{musicSlots[slot]}</strong>
              <small aria-live="polite">{busy === slot ? 'Saving…' : track?.name ?? defaultMusicName(slot) ?? 'No track selected'}</small>
            </div>
            <label className="choose-music">
              Choose MP3
              <input type="file" accept=".mp3,audio/mpeg" aria-label={`Choose MP3 for ${musicSlots[slot]}`}
                onChange={event => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void choose(slot, file);
                }} />
            </label>
            {track && <button type="button" className="ghost-action" aria-label={`Reset ${musicSlots[slot]} music`}
              onClick={() => void choose(slot, null)}>Reset</button>}
          </div>
        );
      })}
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}
