# Starfield Movement Fix - Implementation Summary

## Problem
The TypeScript version of Star Raiders has a static starfield that doesn't match the original game. The starfield should be constantly moving and should rotate when arrow keys are pressed.

## Root Cause
1. **No navigation input handling**: [`CombatView`](ts_src/scenes/CombatView.ts) never listens to navigation events from [`InputManager`](ts_src/systems/InputManager.ts)
2. **Static at start**: Starfield only moves based on velocity, which starts at 0
3. **No idle movement**: No subtle drift to create sense of being in space

## Solution Overview

### Three Types of Movement
1. **Rotation** (arrow keys) - Player-controlled starfield rotation
2. **Forward velocity** (speed 0-9 keys) - Forward motion through space
3. **Idle drift** (automatic) - Subtle constant movement for visual interest

### Key Changes Required

#### 1. CombatView.ts - Add Properties
```typescript
private rotationVelocity = { x: 0, y: 0 };
private readonly ROTATION_SPEED = 30;
private readonly ROTATION_DAMPING = 0.92;
private readonly IDLE_DRIFT_SPEED = 5;
```

#### 2. CombatView.ts - Listen to Navigation
```typescript
// In setupInput()
this.inputManager.on('navigation', (navX: number, navY: number) => {
  this.rotationVelocity.x = navX * this.ROTATION_SPEED;
  this.rotationVelocity.y = navY * this.ROTATION_SPEED;
});
```

#### 3. CombatView.ts - Update Starfield Movement
```typescript
// In update()
const forwardVelocity = SPEED_TABLE[gameState.player.velocity] || 0;

// Apply damping
this.rotationVelocity.x *= this.ROTATION_DAMPING;
this.rotationVelocity.y *= this.ROTATION_DAMPING;

// Add idle drift
const idleDriftX = Math.sin(time * 0.0003) * this.IDLE_DRIFT_SPEED;
const idleDriftY = Math.cos(time * 0.0005) * this.IDLE_DRIFT_SPEED;

// Combine all velocities
const totalVelocityX = this.rotationVelocity.x + idleDriftX;
const totalVelocityY = forwardVelocity + this.rotationVelocity.y + idleDriftY;

// Update starfield
this.starfieldManager.update(deltaSeconds, totalVelocityX, totalVelocityY);
```

#### 4. CombatView.ts - Cleanup
```typescript
// In shutdown()
this.inputManager.off('navigation');
```

## Files to Modify

1. **ts_src/scenes/CombatView.ts** (primary changes)
   - Add rotation velocity properties
   - Add navigation event listener
   - Update starfield movement calculation
   - Add cleanup in shutdown

2. **ts_src/entities/Star.ts** (optional tuning)
   - Adjust movement scale if needed
   - Fine-tune parallax effect

## Expected Results

✅ **At Game Start**: Subtle idle drift visible immediately  
✅ **Arrow Keys**: Smooth rotation in all directions  
✅ **Speed Changes**: Forward velocity affects Y-axis movement  
✅ **Combined**: All three movement types work together seamlessly  
✅ **Parallax**: Different star layers move at different speeds  
✅ **Wrapping**: Stars wrap correctly at screen edges  

## Testing Plan

1. Start game → Verify idle drift visible
2. Press arrow keys → Verify rotation in all directions
3. Release arrow keys → Verify smooth deceleration
4. Press speed keys → Verify forward velocity
5. Combine arrow + speed → Verify both work together
6. Switch Fore/Aft views → Verify works in both views

## Risk Assessment

**Low Risk** - Changes are isolated and non-breaking:
- Only modifies CombatView scene
- No changes to core systems
- Easy to revert if needed
- No performance impact expected

## Next Steps

Ready to implement? The changes are straightforward and well-defined. We can:

1. **Switch to Code Mode** to implement the changes
2. **Review the plan** if you want to discuss any details
3. **Adjust parameters** if you want different movement speeds

## Documentation

- Full plan: [`plans/starfield_movement_fix.md`](plans/starfield_movement_fix.md)
- Architecture diagrams: [`plans/starfield_architecture_diagram.md`](plans/starfield_architecture_diagram.md)
