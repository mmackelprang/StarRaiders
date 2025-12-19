# Keyboard Unresponsiveness Bug Fix

## Problem Description
After running the TypeScript Star Raiders game for a while and switching between scenes, the application became unresponsive to keypresses.

## Root Cause Analysis
The issue was caused by **event listener accumulation** in the singleton `InputManager`:

1. **EventEmitter Listener Leaks**: Each scene registered event listeners via `inputManager.on()` but couldn't properly remove them in `shutdown()` because they didn't store callback references
2. **Keyboard Event Handler Accumulation**: The `setupKeyboardListeners()` method used `removeAllListeners()` on the scene's keyboard, but didn't properly track and remove the handler reference
3. **Singleton Pattern Issue**: The `InputManager` singleton persisted across all scenes, accumulating listeners from every scene transition
4. **scene.restart() Doesn't Call shutdown()**: When switching views (FORE/AFT) using `scene.restart()`, the `shutdown()` method was never called, causing listeners to accumulate on every restart

### Diagnostic Evidence
Added logging showed:
- EventEmitter listener count increasing with each scene transition (20, 21, 22... up to 792!)
- Keyboard 'keydown' listeners accumulating despite `removeAllListeners()` calls
- Hundreds of listeners registered after multiple scene transitions
- `shutdown()` was not being called when using `scene.restart()`

## Solution Implemented

### 1. Store Keyboard Handler Reference
**File**: `ts_src/systems/InputManager.ts`

Added a private field to store the keyboard handler:
```typescript
private keydownHandler: ((event: KeyboardEvent) => void) | null = null;
```

Modified `setupKeyboardListeners()` to store the handler:
```typescript
this.keydownHandler = (event: KeyboardEvent) => {
  const action = this.keyBindings.get(event.keyCode);
  if (action) {
    this.handleAction(action);
  }
};
this.scene.input.keyboard.on('keydown', this.keydownHandler);
```

### 2. Add Cleanup Method
**File**: `ts_src/systems/InputManager.ts`

Added `cleanup()` method to properly remove keyboard listeners:
```typescript
cleanup(): void {
  if (this.scene && this.scene.input.keyboard && this.keydownHandler) {
    console.log('[InputManager] Cleaning up keyboard listener from previous scene');
    this.scene.input.keyboard.off('keydown', this.keydownHandler);
    this.keydownHandler = null;
  }
  this.cursors = null;
}
```

Called `cleanup()` at the start of `initialize()` to remove previous scene's listeners.

### 3. Add removeAllListeners Method
**File**: `ts_src/systems/InputManager.ts`

Added method to clear EventEmitter listeners:
```typescript
removeAllListeners(event?: string | InputAction): void {
  if (event) {
    this.eventEmitter.removeAllListeners(event as string);
  } else {
    this.eventEmitter.removeAllListeners();
  }
}
```

### 4. Clean Up Listeners in init() and create()
**Files**:
- `ts_src/scenes/CombatView.ts` - Added cleanup in `init()` method
- `ts_src/scenes/GalacticChart.ts` - Added cleanup in `create()` method
- `ts_src/scenes/LongRangeScan.ts` - Added cleanup in `create()` method

**Critical Fix**: Since `scene.restart()` doesn't call `shutdown()`, we must clean up listeners at the start of `init()` or `create()`:

```typescript
init(data: { direction?: ViewDirection }): void {
  // Clean up listeners from previous instance if this is a restart
  const inputManager = InputManager.getInstance();
  inputManager.removeAllListeners();
  console.log('[CombatView] init() - cleaned up listeners from previous instance');
  
  // ... rest of init ...
}
```

### 5. Update Scene Shutdown Methods
**Files**:
- `ts_src/scenes/CombatView.ts`
- `ts_src/scenes/GalacticChart.ts`
- `ts_src/scenes/LongRangeScan.ts`

Replaced individual `off()` calls with single `removeAllListeners()` call:
```typescript
shutdown(): void {
  console.log('[SceneName] shutdown() called - cleaning up listeners');
  
  // ... other cleanup ...
  
  if (this.inputManager) {
    this.inputManager.removeAllListeners();
  }
}
```

### 6. Fix PESCLR Display WebGL Error
**File**: `ts_src/scenes/CombatView.ts`

Added null checks before accessing text objects that may have been destroyed:
```typescript
private updatePESCLRDisplay(): void {
  // Check if text objects still exist and are active
  for (let i = 0; i < systemKeys.length; i++) {
    if (i < this.pesclrTexts.length && this.pesclrTexts[i] && this.pesclrTexts[i].active) {
      // Safe to update
      this.pesclrTexts[i].setColor(color);
    }
  }
}
```

## Benefits of This Solution

1. **Prevents Memory Leaks**: Properly removes all event listeners when scenes shut down
2. **Maintains Keyboard Responsiveness**: No accumulation of keyboard handlers
3. **Diagnostic Logging**: Added console logs to track listener counts (can be removed in production)
4. **Simpler Scene Cleanup**: Scenes no longer need to track individual callback references
5. **Singleton-Safe**: Works correctly with the singleton InputManager pattern

## Testing Recommendations

1. Switch between scenes multiple times (CombatView → GalacticChart → LongRangeScan → repeat)
2. Monitor console logs to verify listener counts stay constant
3. Verify keyboard remains responsive after extended play sessions
4. Test all keyboard inputs in each scene

## Future Improvements

1. Consider removing diagnostic console.log statements in production build
2. Add automated tests for InputManager listener management
3. Consider implementing a scene-specific listener registry for more granular control
4. Add memory profiling to detect other potential leaks

## Files Modified

1. `ts_src/systems/InputManager.ts` - Core fixes for listener management
2. `ts_src/scenes/CombatView.ts` - Updated shutdown method
3. `ts_src/scenes/GalacticChart.ts` - Updated shutdown method
4. `ts_src/scenes/LongRangeScan.ts` - Updated shutdown method
