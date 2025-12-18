# Phase 10 Combat System - Testing Guide

## Overview
This document outlines manual testing procedures for the combat system implemented in Phase 10.

## Combat System Components

### 1. Torpedo Entity
**Location:** `ts_src/entities/Torpedo.ts`

**Features:**
- Position and velocity tracking
- Direction-based firing (fore/aft)
- Range limiting (100 metrons max)
- Collision detection with enemies
- Visual length calculation based on distance

### 2. CombatSystem
**Location:** `ts_src/systems/CombatSystem.ts`

**Features:**
- Torpedo lifecycle management
- Lock status calculation (H-Lock, V-Lock, Range-Lock)
- Accuracy based on lock status (0-3 locks)
- Energy consumption per shot (5 energy)
- Cooldown system (0.25s between shots)
- Damage application to enemies
- Support for damaged photon system (misfire)

### 3. ExplosionManager
**Location:** `ts_src/systems/ExplosionManager.ts`

**Features:**
- Multi-phase explosion effects (white flash → orange → red → debris)
- Muzzle flash on torpedo fire
- Debris particle system
- Proper fade-out and cleanup

## Manual Testing Procedures

### Test 1: Basic Torpedo Firing
**Steps:**
1. Start development server: `npm run dev`
2. Navigate to Combat View (press F from title screen)
3. Press SPACE to fire torpedo

**Expected Results:**
- ✅ Muzzle flash appears at center of screen
- ✅ White torpedo line appears and moves forward
- ✅ Energy decreases by 5 points
- ✅ Console logs "Fired torpedo!" message

### Test 2: Lock Indicators
**Steps:**
1. In Combat View, observe the three lock indicators at bottom of screen
2. Note the colors:
   - Green = locked
   - Gray = not locked

**Expected Results:**
- ✅ H-Lock (left) indicator shows lock status for horizontal alignment
- ✅ Range-Lock (center) indicator shows lock status for optimal range (30-70m)
- ✅ V-Lock (right) indicator shows lock status for vertical alignment
- ✅ Range display shows current distance to target

### Test 3: Torpedo Hit Detection
**Steps:**
1. In Combat View with enemies present
2. Align with enemy (get all three locks)
3. Fire torpedo with SPACE

**Expected Results:**
- ✅ Torpedo travels toward enemy
- ✅ On impact, explosion effect plays
- ✅ Enemy health decreases
- ✅ Enemy destroyed after correct number of hits (Fighter=1, Cruiser=2, Basestar=3)
- ✅ Kill counter increases

### Test 4: Energy Management
**Steps:**
1. In Combat View, note current energy level
2. Fire multiple torpedoes rapidly

**Expected Results:**
- ✅ Energy decreases by 5 per shot
- ✅ Cannot fire when energy < 5
- ✅ Console logs "Insufficient energy" message when trying to fire with low energy

### Test 5: Cooldown System
**Steps:**
1. In Combat View
2. Hold down SPACE key

**Expected Results:**
- ✅ Torpedoes fire at maximum rate of 4 per second (0.25s cooldown)
- ✅ Console logs "Torpedo on cooldown" when trying to fire too quickly

### Test 6: Accuracy System
**Steps:**
1. Fire torpedoes with 0 locks (not aligned)
2. Fire torpedoes with 1-2 locks (partially aligned)
3. Fire torpedoes with 3 locks (fully aligned)

**Expected Results:**
- ✅ 0 locks: Torpedoes have high inaccuracy (9 metrons deviation)
- ✅ 1-2 locks: Torpedoes have medium inaccuracy (3-6 metrons deviation)
- ✅ 3 locks: Torpedoes have minimal inaccuracy (0 metrons deviation)

### Test 7: Fore/Aft Views
**Steps:**
1. In Combat View (Fore), fire torpedo with F key
2. Press A to switch to Aft view
3. Fire torpedo

**Expected Results:**
- ✅ Fore view: Torpedoes travel forward (positive Z)
- ✅ Aft view: Torpedoes travel backward (negative Z)
- ✅ View indicator shows "F" or "A" in HUD

### Test 8: Damaged Photon System
**Steps:**
1. Manually set photon system to DAMAGED in game state
2. Fire torpedoes

**Expected Results:**
- ✅ Torpedoes veer off course (misfire)
- ✅ Additional 5 metron deviation applied

### Test 9: Destroyed Photon System
**Steps:**
1. Manually set photon system to DESTROYED in game state
2. Try to fire torpedoes

**Expected Results:**
- ✅ Cannot fire torpedoes
- ✅ Console logs "Photon torpedoes destroyed" message

### Test 10: Visual Effects
**Steps:**
1. Fire multiple torpedoes
2. Observe explosion effects when hitting enemies

**Expected Results:**
- ✅ Muzzle flash: Bright white circle that fades quickly
- ✅ Torpedo trail: White line extending from ship
- ✅ Explosion Phase 1 (0-0.1s): Bright white flash
- ✅ Explosion Phase 2 (0.1-0.4s): Orange expanding circle
- ✅ Explosion Phase 3 (0.4-0.7s): Red circle with debris
- ✅ Explosion Phase 4 (0.7-1.0s): Debris spreading and fading

## Performance Testing

### Frame Rate
**Test:** Fire multiple torpedoes simultaneously (10+)
**Expected:** Game maintains 60 FPS

### Memory
**Test:** Fire 100+ torpedoes over time
**Expected:** No memory leaks, inactive torpedoes properly cleaned up

## Known Limitations (To Be Addressed)

1. **Unit Tests:** Jest tests fail due to Phaser canvas dependencies
   - **Solution:** Will implement proper mocking in Phase 18

2. **Enemy AI:** Enemies are currently static
   - **Solution:** Will be implemented in Phases 13-14

3. **Sound Effects:** No audio yet
   - **Solution:** Will be implemented in Phase 18

4. **Enemy Return Fire:** Not yet implemented
   - **Solution:** Will be implemented in Phases 13-14

## Test Results Log

### Date: [Fill in during testing]

| Test # | Result | Notes |
|--------|--------|-------|
| 1      |        |       |
| 2      |        |       |
| 3      |        |       |
| 4      |        |       |
| 5      |        |       |
| 6      |        |       |
| 7      |        |       |
| 8      |        |       |
| 9      |        |       |
| 10     |        |       |

## Integration with Future Phases

### Phase 11: PESCLR Damage System
- Combat system already checks photon system status
- Will integrate with full damage system

### Phase 12: Energy Management  
- Energy consumption already implemented
- Will integrate with full energy system

### Phase 13-14: Enemy AI
- Collision detection ready for enemy movement
- Will add enemy return fire capability

### Phase 18: Audio & Polish
- Event system already in place for sound triggers
- Will add sound effects for torpedo fire, hit, and explosion

## Conclusion

The Phase 10 combat system implementation is complete with:
- ✅ Torpedo entity with physics
- ✅ Combat system with collision detection
- ✅ Lock-based accuracy system
- ✅ Energy consumption
- ✅ Visual effects (explosions, muzzle flash)
- ✅ Full integration with CombatView scene

Ready to proceed to Phase 11: PESCLR Damage System.
