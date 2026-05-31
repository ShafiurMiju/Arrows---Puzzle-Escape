import { type AudioPlayer, createAudioPlayer } from 'expo-audio';

import { AudioService, SoundEffectName } from '../../types';

/**
 * `expo-audio` adapter implementing the {@link AudioService} port. Owns one
 * looping music player and one player per sound effect, created lazily in
 * `init()`. All playback is best-effort (wrapped in try/catch) and gated by the
 * enabled flags, which the settings store drives. This is the only module that
 * imports the audio SDK.
 */
const EFFECT_SOURCES: Record<SoundEffectName, number> = {
  button: require('../../assets/sounds/button.wav'),
  rotate: require('../../assets/sounds/rotate.wav'),
  place: require('../../assets/sounds/place.wav'),
  victory: require('../../assets/sounds/victory.wav'),
  failure: require('../../assets/sounds/failure.wav'),
  star: require('../../assets/sounds/star.wav'),
};

const MUSIC_SOURCE: number = require('../../assets/sounds/music.wav');

class ExpoAudioService implements AudioService {
  private musicPlayer: AudioPlayer | null = null;
  private effectPlayers: Partial<Record<SoundEffectName, AudioPlayer>> = {};
  private musicEnabled = true;
  private soundEnabled = true;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    try {
      this.musicPlayer = createAudioPlayer(MUSIC_SOURCE);
      this.musicPlayer.loop = true;
      this.musicPlayer.volume = 0.4;
      (Object.keys(EFFECT_SOURCES) as SoundEffectName[]).forEach((name) => {
        this.effectPlayers[name] = createAudioPlayer(EFFECT_SOURCES[name]);
      });
    } catch {
      // Audio is non-essential; never let it crash the app.
    }
  }

  async playMusic(): Promise<void> {
    if (!this.musicEnabled || !this.musicPlayer) {
      return;
    }
    try {
      await this.musicPlayer.seekTo(0);
      this.musicPlayer.play();
    } catch {
      /* best-effort */
    }
  }

  async stopMusic(): Promise<void> {
    try {
      this.musicPlayer?.pause();
    } catch {
      /* best-effort */
    }
  }

  async setMusicEnabled(enabled: boolean): Promise<void> {
    this.musicEnabled = enabled;
    if (enabled) {
      await this.playMusic();
    } else {
      await this.stopMusic();
    }
  }

  async playEffect(effect: SoundEffectName): Promise<void> {
    if (!this.soundEnabled) {
      return;
    }
    const player = this.effectPlayers[effect];
    if (!player) {
      return;
    }
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      /* best-effort */
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  async dispose(): Promise<void> {
    try {
      this.musicPlayer?.remove();
      Object.values(this.effectPlayers).forEach((player) => player?.remove());
    } catch {
      /* best-effort */
    }
    this.musicPlayer = null;
    this.effectPlayers = {};
    this.initialized = false;
  }
}

export const audio: AudioService = new ExpoAudioService();
