import Phaser from 'phaser';
import { Debug } from '@utils/Debug';

/**
 * AudioManager - manages all game audio (sound effects and music)
 * 
 * Uses WAV audio files from ts_src/assets/audio for all sound effects.
 * Integrates with Phaser's sound system for audio playback.
 * 
 * Phase 18 Implementation
 */
export class AudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  // Audio objects (would be Phaser.Sound objects in full implementation)
  private sounds: Map<string, any> = new Map();
  private music: Phaser.Sound.BaseSound | null = null;

  private constructor() {
    Debug.log('AudioManager: Initialized with WAV audio support');
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    Debug.log('AudioManager: Scene initialized with Phaser sound system');
  }

  /**
   * Play a sound effect
   */
  playSFX(soundName: string, volume: number = 1.0): void {
    if (!this.enabled || !this.scene) {
      return;
    }

    const effectiveVolume = this.masterVolume * this.sfxVolume * volume;
    Debug.log(`AudioManager: Play SFX '${soundName}' at volume ${effectiveVolume.toFixed(2)}`);

    // Play the sound using Phaser's sound system
    // Using scene.sound.play() for one-off sounds that auto-cleanup after playing
    try {
      this.scene.sound.play(soundName, { volume: effectiveVolume });
    } catch (error) {
      Debug.log(`AudioManager: Failed to play sound '${soundName}': ${error}`);
    }
  }

  /**
   * Play background music (looping)
   */
  playMusic(musicName: string, loop: boolean = true): void {
    if (!this.enabled || !this.scene) {
      return;
    }

    const effectiveVolume = this.masterVolume * this.musicVolume;
    Debug.log(`AudioManager: Play music '${musicName}' (loop: ${loop}) at volume ${effectiveVolume.toFixed(2)}`);

    // Stop any currently playing music
    this.stopMusic();
    
    // Play the music using Phaser's sound system
    try {
      this.music = this.scene.sound.add(musicName);
      this.music.play({ volume: effectiveVolume, loop });
    } catch (error) {
      Debug.log(`AudioManager: Failed to play music '${musicName}': ${error}`);
      this.music = null;
    }
  }

  /**
   * Stop currently playing music
   */
  stopMusic(): void {
    if (this.music) {
      Debug.log('AudioManager: Stop music');
      this.music.stop();
      this.music = null;
    }
  }

  /**
   * Combat sound effects
   */
  playTorpedoFire(): void {
    this.playSFX('torpedo_fire', 0.6);
  }

  playExplosion(): void {
    this.playSFX('explosion', 0.8);
  }

  playHit(): void {
    // Use shield_impact for hit sound (no separate hit.wav file)
    this.playSFX('shield_impact', 0.7);
  }

  playShieldImpact(): void {
    this.playSFX('shield_impact', 0.5);
  }

  /**
   * System sound effects
   */
  playShieldActivate(): void {
    this.playSFX('shield_activate', 0.6);
  }

  playShieldDeactivate(): void {
    // Use shield_activate for deactivate sound (no separate shield_deactivate.wav file)
    this.playSFX('shield_activate', 0.5);
  }

  playComputerToggle(): void {
    // Use shield_activate for computer toggle (no computer_toggle.wav file)
    this.playSFX('shield_activate', 0.4);
  }

  playSystemDamage(): void {
    // Use shield_impact for system damage (no system_damage.wav file)
    this.playSFX('shield_impact', 0.7);
  }

  playSystemDestroyed(): void {
    // Use explosion for system destroyed (no system_destroyed.wav file)
    this.playSFX('explosion', 0.8);
  }

  /**
   * Navigation sound effects
   */
  playHyperspaceEnter(): void {
    this.playSFX('hyperspace_enter', 0.9);
  }

  playHyperspaceExit(): void {
    this.playSFX('hyperspace_exit', 0.8);
  }

  playDocking(): void {
    this.playSFX('docking', 0.7);
  }

  playLockAchieved(): void {
    // Use shield_activate for lock achieved (no lock_achieved.wav file)
    this.playSFX('shield_activate', 0.5);
  }

  /**
   * Alert sound effects
   */
  playLowEnergyAlert(): void {
    this.playSFX('low_energy_alert', 0.6);
  }

  playCriticalEnergyAlert(): void {
    // Use low_energy_alert for critical energy (no critical_energy_alert.wav file)
    this.playSFX('low_energy_alert', 0.8);
  }

  playStarbaseAttackAlert(): void {
    this.playSFX('starbase_attack_alert', 0.7);
  }

  playVictory(): void {
    this.playSFX('victory', 1.0);
  }

  playDefeat(): void {
    this.playSFX('defeat', 1.0);
  }

  /**
   * Volume controls
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Debug.log(`AudioManager: Master volume set to ${this.masterVolume.toFixed(2)}`);
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    Debug.log(`AudioManager: SFX volume set to ${this.sfxVolume.toFixed(2)}`);
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    Debug.log(`AudioManager: Music volume set to ${this.musicVolume.toFixed(2)}`);
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
    Debug.log(`AudioManager: ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Load audio assets (called in preload by AssetLoader)
   */
  preloadAssets(scene: Phaser.Scene): void {
    Debug.log('AudioManager: Audio assets are preloaded by AssetLoader');
    // Note: Audio files are loaded by AssetLoader.preloadAudio() in the Boot scene
  }
}
