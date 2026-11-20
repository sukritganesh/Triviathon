import { publicAssetUrl } from './publicAssetUrl';
import { convertFileSrc, invoke, isTauri } from '@tauri-apps/api/core';
import { musicSlots, selectedTrack, type MusicSlot } from './musicLibrary';

export type SoundName =
  | 'boardFill'
  | 'buzzerDing'
  | 'correctAnswer'
  | 'dailyDouble'
  | 'incorrectAnswer'
  | 'jeopardyTheme'
  | 'outroMusic'
  | 'thinkingMusic'
  | 'timesUp';

export type AudioMixerSettings = {
  isMuted: boolean;
  musicVolume: number;
  effectsVolume: number;
};

const SOUND_PATHS: Record<SoundName, string> = {
  boardFill: '/audio/boardFill.mp3',
  buzzerDing: '/audio/buzzer-ding.mp3',
  correctAnswer: '/audio/correctAnswer.mp3',
  dailyDouble: '/audio/dailyDouble.mp3',
  incorrectAnswer: '/audio/incorrectAnswer.mp3',
  jeopardyTheme: '/audio/jeopardyTheme80s.mp3',
  outroMusic: '/audio/outroMusic.mp3',
  thinkingMusic: '/audio/thinkingMusic.mp3',
  timesUp: '/audio/timesUp.mp3',
};

const LOOPING_SOUNDS = new Set<SoundName>(['jeopardyTheme', 'thinkingMusic']);
function isMusic(name: SoundName): name is MusicSlot {
  return Object.hasOwn(musicSlots, name);
}
declare const __GAME_AUDIO_FILES__: string[];
const availableAudioFiles = new Set(__GAME_AUDIO_FILES__);
const desktopMusic = new Map<string, string>();

/** Discover the user's optional tracks before the first audio gesture. */
export async function prepareLocalMusic() {
  if (!isTauri()) return;
  const tracks = await invoke<Record<string, string>>('local_music');
  for (const [filename, path] of Object.entries(tracks)) {
    desktopMusic.set(filename, convertFileSrc(path));
  }
}

function isBrowserAudioAvailable() {
  return typeof Audio !== 'undefined';
}

export function defaultMusicName(slot: MusicSlot) {
  const filename = SOUND_PATHS[slot].slice('/audio/'.length);
  return (isTauri() ? desktopMusic.has(filename) : availableAudioFiles.has(filename)) ? filename : undefined;
}

export class GameAudio {
  private sounds = new Map<SoundName, HTMLAudioElement>();
  private settings: AudioMixerSettings = {
    isMuted: true,
    musicVolume: 0.45,
    effectsVolume: 0.8,
  };

  private getVolume(name: SoundName) {
    return isMusic(name) ? this.settings.musicVolume : this.settings.effectsVolume;
  }

  private applySettingsToSound(name: SoundName, audio: HTMLAudioElement) {
    audio.muted = this.settings.isMuted;
    audio.volume = this.getVolume(name);
  }

  private getSound(name: SoundName) {
    const existing = this.sounds.get(name);

    if (existing) {
      return existing;
    }

    const path = SOUND_PATHS[name];
    const filename = path.slice('/audio/'.length);
    const fallback = isTauri() && isMusic(name)
      ? desktopMusic.get(filename)
      : availableAudioFiles.has(filename) && publicAssetUrl(path);
    const url = (isMusic(name) && selectedTrack(name)?.url) || fallback;
    if (!url) return;
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.loop = LOOPING_SOUNDS.has(name);
    this.applySettingsToSound(name, audio);
    this.sounds.set(name, audio);
    return audio;
  }

  setSettings(settings: AudioMixerSettings) {
    const wasMuted = this.settings.isMuted;
    this.settings = {
      isMuted: settings.isMuted,
      musicVolume: Math.max(0, Math.min(1, settings.musicVolume)),
      effectsVolume: Math.max(0, Math.min(1, settings.effectsVolume)),
    };

    for (const [name, audio] of this.sounds) {
      this.applySettingsToSound(name, audio);
    }

    if (!wasMuted && this.settings.isMuted) {
      this.pauseAll();
    }
  }

  play(name: SoundName) {
    if (!isBrowserAudioAvailable() || this.settings.isMuted) {
      return;
    }

    const audio = this.getSound(name);
    if (!audio) return;
    this.applySettingsToSound(name, audio);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browsers may block audio until the first user gesture.
    });
  }

  loop(name: SoundName) {
    if (!isBrowserAudioAvailable() || this.settings.isMuted) {
      return;
    }

    const audio = this.getSound(name);
    if (!audio) return;
    audio.loop = true;
    this.applySettingsToSound(name, audio);
    void audio.play().catch(() => {
      // Ambient tracks start once the browser allows audio playback.
    });
  }

  stop(name: SoundName) {
    const audio = this.sounds.get(name);

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }

  stopAmbient() {
    this.stop('jeopardyTheme');
    this.stop('thinkingMusic');
  }

  refreshMusic(slot: MusicSlot) {
    this.stop(slot);
    this.sounds.delete(slot);
  }

  pauseAll() {
    for (const audio of this.sounds.values()) {
      audio.pause();
    }
  }
}
