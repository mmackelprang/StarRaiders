// Mock Phaser before importing
jest.mock('phaser', () => ({
  Sound: {
    BaseSound: class {
      play(config?: any) {}
      stop() {}
    }
  }
}));

import { AudioManager } from '../AudioManager';

describe('AudioManager', () => {
  let manager: AudioManager;
  let mockScene: any;
  let mockSound: any;

  beforeEach(() => {
    // Create mock sound object
    mockSound = {
      play: jest.fn(),
      stop: jest.fn()
    };

    // Create mock scene with sound system
    mockScene = {
      sound: {
        add: jest.fn().mockReturnValue(mockSound),
        play: jest.fn() // For SFX that use play() directly
      }
    };

    manager = AudioManager.getInstance();
    manager.setEnabled(true); // Ensure enabled
    manager.initialize(mockScene);
  });

  test('should be singleton', () => {
    const manager2 = AudioManager.getInstance();
    expect(manager).toBe(manager2);
  });

  test('should initialize with scene', () => {
    const newMockScene: any = {
      sound: {
        add: jest.fn(() => mockSound)
      }
    };
    manager.initialize(newMockScene);
    expect(manager.isEnabled()).toBe(true);
  });

  describe('SFX Playback', () => {
    test('should play torpedo fire sound', () => {
      manager.playTorpedoFire();
      expect(mockScene.sound.play).toHaveBeenCalledWith('torpedo_fire', expect.any(Object));
    });

    test('should play explosion sound', () => {
      manager.playExplosion();
      expect(mockScene.sound.play).toHaveBeenCalledWith('explosion', expect.any(Object));
    });

    test('should play shield impact for hit sound', () => {
      manager.playHit();
      expect(mockScene.sound.play).toHaveBeenCalledWith('shield_impact', expect.any(Object));
    });

    test('should play shield activate sound', () => {
      manager.playShieldActivate();
      expect(mockScene.sound.play).toHaveBeenCalledWith('shield_activate', expect.any(Object));
    });

    test('should play hyperspace enter sound', () => {
      manager.playHyperspaceEnter();
      expect(mockScene.sound.play).toHaveBeenCalledWith('hyperspace_enter', expect.any(Object));
    });

    test('should play docking sound', () => {
      manager.playDocking();
      expect(mockScene.sound.play).toHaveBeenCalledWith('docking', expect.any(Object));
    });

    test('should play victory sound', () => {
      manager.playVictory();
      expect(mockScene.sound.play).toHaveBeenCalledWith('victory', expect.any(Object));
    });

    test('should not play sounds when disabled', () => {
      manager.setEnabled(false);
      mockScene.sound.play.mockClear();
      manager.playTorpedoFire();
      expect(mockScene.sound.play).not.toHaveBeenCalled();
    });
  });

  describe('Music Playback', () => {
    test('should play music with loop', () => {
      // Clear any previous calls
      mockScene.sound.add.mockClear();
      mockSound.play.mockClear();
      
      manager.playMusic('test_music', true);
      expect(mockScene.sound.add).toHaveBeenCalledWith('test_music');
      expect(mockSound.play).toHaveBeenCalledWith(
        expect.objectContaining({ loop: true })
      );
    });

    test('should stop music', () => {
      // First play music to set it up
      mockScene.sound.add.mockClear();
      mockSound.stop.mockClear();
      manager.playMusic('test_music');
      
      // Now stop it
      mockSound.stop.mockClear();
      manager.stopMusic();
      expect(mockSound.stop).toHaveBeenCalled();
    });
  });

  describe('Volume Controls', () => {
    test('should set and get master volume', () => {
      manager.setMasterVolume(0.5);
      expect(manager.getMasterVolume()).toBe(0.5);
    });

    test('should set and get SFX volume', () => {
      manager.setSFXVolume(0.6);
      expect(manager.getSFXVolume()).toBe(0.6);
    });

    test('should set and get music volume', () => {
      manager.setMusicVolume(0.4);
      expect(manager.getMusicVolume()).toBe(0.4);
    });

    test('should clamp volume values to 0-1 range', () => {
      manager.setMasterVolume(1.5);
      expect(manager.getMasterVolume()).toBe(1);
      
      manager.setMasterVolume(-0.5);
      expect(manager.getMasterVolume()).toBe(0);
    });

    test('should calculate effective volume correctly', () => {
      manager.setMasterVolume(0.7);
      manager.setSFXVolume(0.8);
      
      // Clear previous calls and play
      mockScene.sound.play.mockClear();
      manager.playTorpedoFire(); // volume = 0.6
      
      const expectedVolume = 0.7 * 0.8 * 0.6;
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'torpedo_fire',
        expect.objectContaining({
          volume: expect.closeTo(expectedVolume, 2)
        })
      );
    });
  });

  describe('Enable/Disable', () => {
    test('should enable and disable audio', () => {
      manager.setEnabled(false);
      expect(manager.isEnabled()).toBe(false);
      
      manager.setEnabled(true);
      expect(manager.isEnabled()).toBe(true);
    });

    test('should stop music when disabled', () => {
      manager.playMusic('test_music');
      mockSound.stop.mockClear();
      manager.setEnabled(false);
      expect(mockSound.stop).toHaveBeenCalled();
    });
  });
});
