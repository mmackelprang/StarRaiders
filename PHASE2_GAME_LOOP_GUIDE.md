# Phase 2 - Core Game Loop & State Management Guide

**Status:** 📝 DOCUMENTED  
**Date:** December 17, 2025  
**Prerequisites:** Phase 1 completed (Unity project setup)

## Overview

Phase 2 establishes the deterministic game loop and state management system that will control the entire game flow. This includes state transitions, scene loading, pause handling, and the centon timer system.

## Goals

1. Implement robust GameStateManager with all game states
2. Create deterministic game loop running at 60 FPS
3. Implement pause/resume functionality
4. Create centon timer system (100 centons ≈ 1 minute)
5. Add scene loading and transitions
6. Create simple UI for state visualization
7. Write EditMode tests for state transitions

## Game States

The game operates in five distinct states:

1. **Title** - Main menu, difficulty selection
2. **Playing** - Active gameplay in sectors
3. **Paused** - Game paused by player
4. **Hyperspace** - Traveling between sectors
5. **GameOver** - Mission completed or failed

## Implementation Steps

### Step 1: Expand GameStateManager

Enhance the stub created in Phase 1 with full functionality.

**Location:** `Assets/Scripts/Core/GameStateManager.cs`

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;
using System;

namespace StarRaiders.Core
{
    /// <summary>
    /// Game states for Star Raiders
    /// </summary>
    public enum GameState
    {
        Title,
        Playing,
        Paused,
        Hyperspace,
        GameOver
    }

    /// <summary>
    /// Manages game state transitions and scene loading
    /// </summary>
    public class GameStateManager : MonoBehaviour
    {
        public static GameStateManager Instance { get; private set; }
        
        [Header("State Management")]
        public GameState CurrentState { get; private set; } = GameState.Title;
        
        [Header("Events")]
        public event Action<GameState, GameState> OnStateChanged;
        public event Action OnPaused;
        public event Action OnResumed;
        public event Action OnHyperspaceStarted;
        public event Action OnHyperspaceEnded;
        
        private GameState _previousState;
        private bool _isPaused;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeState();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeState()
        {
            CurrentState = GameState.Title;
            _isPaused = false;
        }

        /// <summary>
        /// Change to a new game state
        /// </summary>
        public void ChangeState(GameState newState)
        {
            if (CurrentState == newState) 
            {
                Debug.LogWarning($"Already in state: {newState}");
                return;
            }

            // Validate transition
            if (!IsValidTransition(CurrentState, newState))
            {
                Debug.LogError($"Invalid state transition: {CurrentState} -> {newState}");
                return;
            }

            GameState oldState = CurrentState;
            _previousState = oldState;
            CurrentState = newState;

            Debug.Log($"State changed: {oldState} -> {newState}");
            OnStateChanged?.Invoke(oldState, newState);

            // Handle state-specific logic
            HandleStateEnter(newState);
        }

        /// <summary>
        /// Validate if a state transition is allowed
        /// </summary>
        private bool IsValidTransition(GameState from, GameState to)
        {
            // Define valid transitions
            switch (from)
            {
                case GameState.Title:
                    return to == GameState.Playing;
                
                case GameState.Playing:
                    return to == GameState.Paused || 
                           to == GameState.Hyperspace || 
                           to == GameState.GameOver;
                
                case GameState.Paused:
                    return to == GameState.Playing || 
                           to == GameState.Title ||
                           to == GameState.GameOver;
                
                case GameState.Hyperspace:
                    return to == GameState.Playing || 
                           to == GameState.GameOver;
                
                case GameState.GameOver:
                    return to == GameState.Title;
                
                default:
                    return false;
            }
        }

        /// <summary>
        /// Handle entering a new state
        /// </summary>
        private void HandleStateEnter(GameState state)
        {
            switch (state)
            {
                case GameState.Title:
                    Time.timeScale = 1f;
                    LoadScene("Title");
                    break;
                
                case GameState.Playing:
                    Time.timeScale = 1f;
                    _isPaused = false;
                    break;
                
                case GameState.Paused:
                    Time.timeScale = 0f;
                    _isPaused = true;
                    OnPaused?.Invoke();
                    break;
                
                case GameState.Hyperspace:
                    OnHyperspaceStarted?.Invoke();
                    break;
                
                case GameState.GameOver:
                    Time.timeScale = 0f;
                    break;
            }
        }

        /// <summary>
        /// Pause the game
        /// </summary>
        public void Pause()
        {
            if (CurrentState == GameState.Playing)
            {
                ChangeState(GameState.Paused);
            }
        }

        /// <summary>
        /// Resume the game
        /// </summary>
        public void Resume()
        {
            if (CurrentState == GameState.Paused)
            {
                ChangeState(GameState.Playing);
                OnResumed?.Invoke();
            }
        }

        /// <summary>
        /// Toggle pause state
        /// </summary>
        public void TogglePause()
        {
            if (_isPaused)
                Resume();
            else
                Pause();
        }

        /// <summary>
        /// Start a new game with selected difficulty
        /// </summary>
        public void StartNewGame(int difficultyLevel)
        {
            // To be expanded in Phase 4 with galaxy initialization
            LoadScene("GamePlay");
            ChangeState(GameState.Playing);
        }

        /// <summary>
        /// End the current game
        /// </summary>
        public void EndGame(bool victory)
        {
            ChangeState(GameState.GameOver);
            // To be expanded in Phase 14 with scoring
        }

        /// <summary>
        /// Return to title screen
        /// </summary>
        public void ReturnToTitle()
        {
            ChangeState(GameState.Title);
        }

        /// <summary>
        /// Load a scene by name
        /// </summary>
        private void LoadScene(string sceneName)
        {
            SceneManager.LoadScene(sceneName);
        }

        /// <summary>
        /// Check if game is currently paused
        /// </summary>
        public bool IsPaused() => _isPaused;

        /// <summary>
        /// Get the previous state
        /// </summary>
        public GameState GetPreviousState() => _previousState;
    }
}
```

### Step 2: Create Centon Timer System

Implement the game's time tracking system (100 centons ≈ 1 minute).

**Location:** `Assets/Scripts/Core/CentonTimer.cs`

```csharp
using UnityEngine;
using System;

namespace StarRaiders.Core
{
    /// <summary>
    /// Manages game time in centons (100 centons ≈ 60 seconds)
    /// </summary>
    public class CentonTimer : MonoBehaviour
    {
        public static CentonTimer Instance { get; private set; }

        [Header("Time Configuration")]
        [SerializeField] private float centonDuration = 0.6f; // 0.6 seconds per centon

        [Header("Current Time")]
        public float TotalCentons { get; private set; }
        public int CentonsPassed { get; private set; }

        [Header("Events")]
        public event Action<int> OnCentonTick; // Fires every centon
        public event Action<int> OnTenCentonTick; // Fires every 10 centons

        private float _centonAccumulator;
        private bool _isRunning;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            // Subscribe to game state changes
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged += HandleStateChanged;
            }
        }

        private void Update()
        {
            if (!_isRunning) return;

            // Accumulate time
            _centonAccumulator += Time.deltaTime;

            // Check if a centon has passed
            while (_centonAccumulator >= centonDuration)
            {
                _centonAccumulator -= centonDuration;
                IncrementCenton();
            }
        }

        private void IncrementCenton()
        {
            CentonsPassed++;
            TotalCentons += 1f;

            // Fire events
            OnCentonTick?.Invoke(CentonsPassed);

            if (CentonsPassed % 10 == 0)
            {
                OnTenCentonTick?.Invoke(CentonsPassed);
            }
        }

        private void HandleStateChanged(GameState oldState, GameState newState)
        {
            switch (newState)
            {
                case GameState.Playing:
                case GameState.Hyperspace:
                    StartTimer();
                    break;

                case GameState.Paused:
                case GameState.Title:
                case GameState.GameOver:
                    StopTimer();
                    break;
            }
        }

        public void StartTimer()
        {
            _isRunning = true;
        }

        public void StopTimer()
        {
            _isRunning = false;
        }

        public void ResetTimer()
        {
            TotalCentons = 0f;
            CentonsPassed = 0;
            _centonAccumulator = 0f;
        }

        /// <summary>
        /// Convert centons to real-world seconds
        /// </summary>
        public float CentonsToSeconds(int centons)
        {
            return centons * centonDuration;
        }

        /// <summary>
        /// Convert real-world seconds to centons
        /// </summary>
        public int SecondsToCentons(float seconds)
        {
            return Mathf.RoundToInt(seconds / centonDuration);
        }

        private void OnDestroy()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged -= HandleStateChanged;
            }
        }
    }
}
```

### Step 3: Create State Display UI

Create a simple UI to visualize the current game state for testing.

**Location:** `Assets/Scripts/UI/DebugStateDisplay.cs`

```csharp
using UnityEngine;
using TMPro;
using StarRaiders.Core;

namespace StarRaiders.UI
{
    /// <summary>
    /// Debug display for current game state
    /// </summary>
    public class DebugStateDisplay : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI stateText;
        [SerializeField] private TextMeshProUGUI centonText;
        [SerializeField] private TextMeshProUGUI fpsText;

        [Header("Settings")]
        [SerializeField] private bool showDisplay = true;
        [SerializeField] private float fpsUpdateInterval = 0.5f;

        private float _fpsAccumulator;
        private int _fpsFrameCount;
        private float _fpsNextUpdate;

        private void Start()
        {
            if (!showDisplay)
            {
                gameObject.SetActive(false);
                return;
            }

            // Subscribe to events
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged += UpdateStateDisplay;
                UpdateStateDisplay(GameState.Title, GameStateManager.Instance.CurrentState);
            }

            _fpsNextUpdate = Time.time + fpsUpdateInterval;
        }

        private void Update()
        {
            if (!showDisplay) return;

            UpdateCentonDisplay();
            UpdateFPSDisplay();
        }

        private void UpdateStateDisplay(GameState oldState, GameState newState)
        {
            if (stateText != null)
            {
                stateText.text = $"State: {newState}";
                
                // Color code states
                stateText.color = newState switch
                {
                    GameState.Title => Color.cyan,
                    GameState.Playing => Color.green,
                    GameState.Paused => Color.yellow,
                    GameState.Hyperspace => Color.magenta,
                    GameState.GameOver => Color.red,
                    _ => Color.white
                };
            }
        }

        private void UpdateCentonDisplay()
        {
            if (centonText != null && CentonTimer.Instance != null)
            {
                int centons = CentonTimer.Instance.CentonsPassed;
                int minutes = centons / 100;
                int seconds = (centons % 100) * 60 / 100;
                centonText.text = $"Time: {centons} centons ({minutes:00}:{seconds:00})";
            }
        }

        private void UpdateFPSDisplay()
        {
            _fpsAccumulator += Time.unscaledDeltaTime;
            _fpsFrameCount++;

            if (Time.time >= _fpsNextUpdate)
            {
                float fps = _fpsFrameCount / _fpsAccumulator;
                if (fpsText != null)
                {
                    fpsText.text = $"FPS: {fps:F1}";
                    fpsText.color = fps >= 60 ? Color.green : fps >= 30 ? Color.yellow : Color.red;
                }

                _fpsAccumulator = 0f;
                _fpsFrameCount = 0;
                _fpsNextUpdate = Time.time + fpsUpdateInterval;
            }
        }

        private void OnDestroy()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged -= UpdateStateDisplay;
            }
        }
    }
}
```

### Step 4: Update Bootstrap Scene

Add the new components to the Bootstrap scene:

1. Open `Assets/Scenes/Bootstrap.unity`
2. Add CentonTimer component to GameManagers GameObject
3. Create UI Canvas:
   - Add Canvas (Screen Space - Overlay)
   - Add TextMeshPro text objects for:
     - State display (top-left)
     - Centon time (top-center)
     - FPS counter (top-right)
4. Create DebugStateDisplay GameObject with script component
5. Wire up references in Inspector

### Step 5: Create EditMode Tests

**Location:** `Assets/Scripts/Tests/EditMode/GameStateManagerTests.cs`

```csharp
using NUnit.Framework;
using UnityEngine;
using StarRaiders.Core;

namespace StarRaiders.Tests.EditMode
{
    public class GameStateManagerTests
    {
        private GameObject testObject;
        private GameStateManager manager;

        [SetUp]
        public void Setup()
        {
            testObject = new GameObject("TestGameStateManager");
            manager = testObject.AddComponent<GameStateManager>();
        }

        [TearDown]
        public void Teardown()
        {
            Object.DestroyImmediate(testObject);
        }

        [Test]
        public void InitialState_ShouldBeTitle()
        {
            Assert.AreEqual(GameState.Title, manager.CurrentState);
        }

        [Test]
        public void ChangeState_FromTitleToPlaying_ShouldSucceed()
        {
            manager.ChangeState(GameState.Playing);
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void ChangeState_FromPlayingToPaused_ShouldSucceed()
        {
            manager.ChangeState(GameState.Playing);
            manager.ChangeState(GameState.Paused);
            Assert.AreEqual(GameState.Paused, manager.CurrentState);
        }

        [Test]
        public void ChangeState_FromPausedToPlaying_ShouldSucceed()
        {
            manager.ChangeState(GameState.Playing);
            manager.ChangeState(GameState.Paused);
            manager.ChangeState(GameState.Playing);
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void ChangeState_InvalidTransition_ShouldNotChange()
        {
            manager.ChangeState(GameState.Playing);
            manager.ChangeState(GameState.Title); // Invalid
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void Pause_WhenPlaying_ShouldTransitionToPaused()
        {
            manager.ChangeState(GameState.Playing);
            manager.Pause();
            Assert.AreEqual(GameState.Paused, manager.CurrentState);
        }

        [Test]
        public void Resume_WhenPaused_ShouldTransitionToPlaying()
        {
            manager.ChangeState(GameState.Playing);
            manager.Pause();
            manager.Resume();
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void TogglePause_ShouldAlternateBetweenStates()
        {
            manager.ChangeState(GameState.Playing);
            
            manager.TogglePause();
            Assert.AreEqual(GameState.Paused, manager.CurrentState);
            
            manager.TogglePause();
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void IsPaused_ShouldReturnCorrectValue()
        {
            manager.ChangeState(GameState.Playing);
            Assert.IsFalse(manager.IsPaused());
            
            manager.Pause();
            Assert.IsTrue(manager.IsPaused());
        }

        [Test]
        public void OnStateChanged_ShouldFireEvent()
        {
            bool eventFired = false;
            GameState oldState = GameState.Title;
            GameState newState = GameState.Title;

            manager.OnStateChanged += (o, n) =>
            {
                eventFired = true;
                oldState = o;
                newState = n;
            };

            manager.ChangeState(GameState.Playing);

            Assert.IsTrue(eventFired);
            Assert.AreEqual(GameState.Title, oldState);
            Assert.AreEqual(GameState.Playing, newState);
        }
    }
}
```

### Step 6: Running Tests

1. Open Unity Test Runner: Window → General → Test Runner
2. Select EditMode tab
3. Click "Run All" to execute tests
4. Verify all tests pass

## Verification Checklist

- [ ] GameStateManager fully implemented with all states
- [ ] State transitions validated (only valid transitions allowed)
- [ ] CentonTimer implemented and tracking time correctly
- [ ] Pause/Resume functionality working
- [ ] Time.timeScale properly managed
- [ ] DebugStateDisplay showing current state
- [ ] FPS counter displaying (should show ~60 FPS)
- [ ] Centon counter displaying correctly (100 centons ≈ 1 minute)
- [ ] EditMode tests created and passing
- [ ] Events firing correctly for state changes
- [ ] No errors in Console

## Testing Scenarios

### Manual Testing

1. **State Transitions**
   - Start game → observe Title state
   - Transition to Playing → verify state changes
   - Press pause → verify Paused state and Time.timeScale = 0
   - Resume → verify Playing state and time resumes

2. **Centon Timer**
   - Enter Playing state
   - Watch centon counter increment
   - Verify ~100 centons pass in ~60 seconds
   - Pause → verify timer stops
   - Resume → verify timer continues

3. **Performance**
   - Check FPS counter stays at ~60 FPS
   - No frame drops during state transitions
   - Memory usage stable

## Common Issues and Solutions

### Issue: Time.timeScale not resetting
**Solution:** Ensure HandleStateEnter sets timeScale explicitly for each state

### Issue: CentonTimer not incrementing
**Solution:** Check that timer is started when game state changes to Playing

### Issue: Events not firing
**Solution:** Verify event subscriptions in Start() methods, check for null references

### Issue: Tests failing in batch mode
**Solution:** Ensure proper Setup/Teardown, avoid singleton conflicts

## Performance Targets

- Frame rate: 60 FPS (stable)
- State transition: < 1ms
- Memory usage: < 50MB (for Phase 2 only)
- No GC allocations in Update loops

## Next Steps

After Phase 2 completion, proceed to:
- **Phase 3:** Input & Controls Mapping
  - Create Input Actions asset
  - Map all control keys
  - Integrate with state manager for pause handling

---

**Phase 2 Status:** 📝 DOCUMENTED
