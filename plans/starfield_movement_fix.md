# Starfield Movement Fix Plan

## Problem Statement

The TypeScript version of Star Raiders has a static starfield that doesn't match the original game's behavior. In the original game (as seen in the YouTube video), the starfield is constantly moving and rotates when navigation (arrow) keys are pressed, creating an immersive 3D space flight experience.

## Current Issues

### 1. No Navigation Input Integration
- **Location**: [`CombatView.ts:618-674`](ts_src/scenes/CombatView.ts:618)
- **Issue**: The `update()` method never listens to navigation events from InputManager
- **Impact**: Arrow keys have no effect on starfield rotation

### 2. Static Starfield at Game Start
- **Location**: [`CombatView.ts:629-630`](ts_src/scenes/CombatView.ts:629)
- **Issue**: Starfield only moves based on `velocity`, which starts at 0
- **Impact**: Completely static starfield until player changes speed

### 3. Limited Movement Axes
- **Location**: [`StarfieldManager.ts:64-75`](ts_src/systems/StarfieldManager.ts:64)
- **Issue**: Only handles velocityX and velocityY, no rotation concept
- **Impact**: Cannot simulate ship rotation in 3D space

## Root Cause Analysis

```typescript
// Current implementation in CombatView.ts:629-630
const velocity = SPEED_TABLE[gameState.player.velocity] || 0;
this.starfieldManager.update(deltaSeconds, 0, velocity);
```

**Problems:**
1. Only passes forward velocity (Y-axis)
2. X-axis velocity is always 0
3. No connection to arrow key input
4. No idle drift for visual interest

## Solution Architecture

### Phase 1: Add Navigation State Tracking

Add rotation velocity tracking to CombatView:

```typescript
private rotationVelocity = { x: 0, y: 0 };
private readonly ROTATION_SPEED = 30; // pixels per second when rotating
private readonly ROTATION_DAMPING = 0.92; // smooth deceleration
private readonly IDLE_DRIFT_SPEED = 5; // subtle constant movement
```

### Phase 2: Listen to Navigation Events

In [`CombatView.setupInput()`](ts_src/scenes/CombatView.ts:449):

```typescript
// Add navigation listener
this.inputManager.on('navigation', (navX: number, navY: number) => {
  // Update rotation velocity based on arrow keys
  this.rotationVelocity.x = navX * this.ROTATION_SPEED;
  this.rotationVelocity.y = navY * this.ROTATION_SPEED;
});
```

### Phase 3: Update Starfield with Combined Movement

In [`CombatView.update()`](ts_src/scenes/CombatView.ts:618):

```typescript
// Get forward velocity from speed setting
const forwardVelocity = SPEED_TABLE[gameState.player.velocity] || 0;

// Apply rotation damping for smooth deceleration
this.rotationVelocity.x *= this.ROTATION_DAMPING;
this.rotationVelocity.y *= this.ROTATION_DAMPING;

// Add idle drift for visual interest (even at velocity 0)
const idleDriftX = Math.sin(time * 0.0003) * this.IDLE_DRIFT_SPEED;
const idleDriftY = Math.cos(time * 0.0005) * this.IDLE_DRIFT_SPEED;

// Combine all movement sources
const totalVelocityX = this.rotationVelocity.x + idleDriftX;
const totalVelocityY = forwardVelocity + this.rotationVelocity.y + idleDriftY;

// Update starfield with combined velocity
this.starfieldManager.update(deltaSeconds, totalVelocityX, totalVelocityY);
```

### Phase 4: Enhanced Star Movement

Update [`Star.update()`](ts_src/entities/Star.ts:27) to better handle rotation:

```typescript
update(deltaTime: number, velocityX: number, velocityY: number, speedMultiplier: number): void {
  const layerSpeed = this.getLayerSpeedMultiplier();
  
  // Base movement with parallax
  const movementScale = 3; // Adjusted for better visibility
  this.x -= velocityX * layerSpeed * deltaTime * movementScale;
  this.y -= velocityY * layerSpeed * deltaTime * movementScale;
  
  // Optional: Add subtle Z-axis expansion effect for forward movement
  if (Math.abs(velocityY) > 1) {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const expansionRate = layerSpeed * Math.abs(velocityY) * deltaTime * 0.001;
    this.x += dx * expansionRate;
    this.y += dy * expansionRate;
  }
}
```

## Implementation Details

### File Changes Required

1. **ts_src/scenes/CombatView.ts**
   - Add rotation velocity properties
   - Add navigation event listener in `setupInput()`
   - Update starfield movement logic in `update()`
   - Clean up navigation listener in `shutdown()`

2. **ts_src/entities/Star.ts**
   - Adjust movement scale for better visibility
   - Fine-tune Z-axis expansion effect

3. **ts_src/systems/StarfieldManager.ts**
   - No changes needed (already supports X/Y velocity)

### Configuration Constants

Add to CombatView class:

```typescript
// Starfield rotation configuration
private readonly ROTATION_SPEED = 30;        // Base rotation speed
private readonly ROTATION_DAMPING = 0.92;    // Smooth deceleration
private readonly IDLE_DRIFT_SPEED = 5;       // Subtle constant drift
private readonly IDLE_DRIFT_FREQ_X = 0.0003; // Horizontal drift frequency
private readonly IDLE_DRIFT_FREQ_Y = 0.0005; // Vertical drift frequency
```

## Expected Behavior After Fix

### At Game Start (Velocity = 0)
- ✅ Starfield has subtle idle drift (slow sine wave motion)
- ✅ Stars are visible and moving slightly
- ✅ Creates sense of being in space

### When Arrow Keys Pressed
- ✅ Starfield rotates in the direction of arrow key
- ✅ Smooth acceleration when key pressed
- ✅ Smooth deceleration when key released (damping)
- ✅ Different star layers move at different speeds (parallax)

### When Speed Changed
- ✅ Forward velocity affects Y-axis movement
- ✅ Higher speeds create faster forward motion
- ✅ Stars expand from center at high speeds (depth effect)

### Combined Movement
- ✅ Arrow keys + forward velocity work together
- ✅ Can rotate while moving forward
- ✅ Natural, fluid 3D space flight feel

## Testing Checklist

- [ ] Starfield moves at game start (idle drift visible)
- [ ] Left arrow key rotates starfield left
- [ ] Right arrow key rotates starfield right
- [ ] Up arrow key rotates starfield up
- [ ] Down arrow key rotates starfield down
- [ ] Rotation smoothly decelerates when key released
- [ ] Speed 0-9 keys affect forward velocity
- [ ] Stars wrap correctly at screen edges
- [ ] Parallax effect visible (different layer speeds)
- [ ] No performance issues with star movement
- [ ] Fore/Aft view switching works correctly
- [ ] Navigation works in both Fore and Aft views

## Performance Considerations

- **Star Count**: Current config has 200 stars total (4 layers)
- **Update Frequency**: 60 FPS target
- **Memory**: Reusing Graphics objects (no new allocations per frame)
- **Expected Impact**: Minimal (simple position updates)

## Rollback Plan

If issues arise:
1. Revert changes to CombatView.ts
2. Keep original starfield update call: `this.starfieldManager.update(deltaSeconds, 0, velocity)`
3. Remove navigation event listener

## Future Enhancements

1. **Camera Shake**: Add subtle shake during combat
2. **Warp Effect**: Enhanced star streaking during hyperspace
3. **Nebula Background**: Add colored fog layers
4. **Star Brightness**: Pulse effect for distant stars
5. **Configurable Settings**: Allow players to adjust starfield density

## References

- Original Game Video: https://youtu.be/3_VDM8nC9sM?list=PLV47S3gjZ5mBcJvQfzfSn0MvXwVpdIrLr
- InputManager Navigation Events: [`ts_src/systems/InputManager.ts:122-133`](ts_src/systems/InputManager.ts:122)
- Current Starfield Update: [`ts_src/scenes/CombatView.ts:629-630`](ts_src/scenes/CombatView.ts:629)
- Star Movement Logic: [`ts_src/entities/Star.ts:27-48`](ts_src/entities/Star.ts:27)
