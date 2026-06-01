import Sound from 'react-native-sound';

import { AudioService, SoundEffectName } from '../../types';

/**
 * `react-native-sound` adapter implementing the {@link AudioService} port.
 * Owns one looping music player and one player per sound effect, created lazily
 * in `init()`. All playback is best-effort (wrapped in try/catch) and gated by
 * the enabled flags, which the settings store drives. This is the only module
 * that imports the audio SDK.
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

const loadSound = (source: number): Promise<Sound> =>
  new Promise((resolve, reject) => {
    const sound = new Sound(source, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(sound);
    });
  });

class RNSoundAudioService implements AudioService {
  private musicPlayer: Sound | null = null;
  private effectPlayers: Partial<Record<SoundEffectName, Sound>> = {};
  private musicEnabled = true;
  private soundEnabled = true;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    try {
      Sound.setCategory('Playback', true);
      const effectNames = Object.keys(EFFECT_SOURCES) as SoundEffectName[];
      const [music, ...effects] = await Promise.all([
        loadSound(MUSIC_SOURCE),
        ...effectNames.map((name) => loadSound(EFFECT_SOURCES[name])),
      ]);
      this.musicPlayer = music;
      this.musicPlayer.setNumberOfLoops(-1);
      this.musicPlayer.setVolume(0.4);
      effectNames.forEach((name, index) => {
        this.effectPlayers[name] = effects[index];
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
      this.musicPlayer.setCurrentTime(0);
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
      player.stop(() => {
        player.play();
      });
    } catch {
      /* best-effort */
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  async dispose(): Promise<void> {
    try {
      this.musicPlayer?.release();
      Object.values(this.effectPlayers).forEach((player) => player?.release());
    } catch {
      /* best-effort */
    }
    this.musicPlayer = null;
    this.effectPlayers = {};
    this.initialized = false;
  }
}

export const audio: AudioService = new RNSoundAudioService();
