export const musicSlots = {
  jeopardyTheme: 'Setup',
  thinkingMusic: 'Final round',
  outroMusic: 'Standings',
} as const;

export type MusicSlot = keyof typeof musicSlots;
type SavedTrack = { slot: MusicSlot; file: File };
const selected = new Map<MusicSlot, { name: string; url: string }>();

function openLibrary(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('triviathon-music', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tracks', { keyPath: 'slot' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function setTrack(slot: MusicSlot, file: File | null) {
  const previous = selected.get(slot);
  if (previous) URL.revokeObjectURL(previous.url);
  if (file) selected.set(slot, { name: file.name, url: URL.createObjectURL(file) });
  else selected.delete(slot);
}

/** Restore this app profile's selections while leaving the original files untouched. */
export async function loadMusicLibrary() {
  const db = await openLibrary();
  try {
    const tracks = await new Promise<SavedTrack[]>((resolve, reject) => {
      const request = db.transaction('tracks').objectStore('tracks').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    for (const { slot, file } of tracks) setTrack(slot, file);
  } finally {
    db.close();
  }
}

export function selectedTrack(slot: MusicSlot) {
  return selected.get(slot);
}

async function checkMP3(file: File) {
  if (!/\.mp3$/i.test(file.name) || !file.size) throw new Error('Choose a non-empty MP3 file.');
  const url = URL.createObjectURL(file);
  const audio = new Audio();
  try {
    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error('This MP3 could not be played.'));
      audio.preload = 'metadata';
      audio.src = url;
    });
  } finally {
    audio.onloadedmetadata = audio.onerror = null;
    audio.removeAttribute('src');
    audio.load();
    URL.revokeObjectURL(url);
  }
}

/** Commit the local copy before switching playback, so a failed import preserves the old track. */
export async function saveMusicTrack(slot: MusicSlot, file: File | null) {
  if (file) {
    await checkMP3(file);
    file = new File([await file.arrayBuffer()], file.name, { type: 'audio/mpeg' });
  }
  const db = await openLibrary();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new Error('Could not save this music choice.'));
      const store = tx.objectStore('tracks');
      if (file) store.put({ slot, file });
      else store.delete(slot);
    });
    setTrack(slot, file);
  } finally {
    db.close();
  }
}
