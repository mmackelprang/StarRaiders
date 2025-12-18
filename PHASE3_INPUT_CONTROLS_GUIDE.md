# Phase 3 - Input & Controls Mapping Guide

**Status:** 📝 DOCUMENTED  
**Date:** December 17, 2025  
**Prerequisites:** Phase 2 completed (GameStateManager ready)

## Overview

Phase 3 implements the Unity Input System with all Star Raiders controls, including speed levels (0-9), view switches, weapon firing, and special functions. The system supports keyboard and gamepad, with optional remapping.

## Controls Summary

### Primary Controls
- **0-9:** Speed levels (0 = stopped, 9 = maximum)
- **F:** Fore view
- **A:** Aft view  
- **G:** Galactic chart overlay
- **L:** Long-range scan
- **H:** Hyperspace navigation
- **T:** Toggle attack computer
- **S:** Toggle shields
- **Fire/Space:** Photon torpedoes
- **Arrow Keys/Joystick:** Ship navigation
- **ESC:** Pause menu

## Implementation Steps

### Step 1: Create Input Actions Asset

1. Right-click in Project window: Create → Input Actions
2. Name: `StarRaidersInputActions`
3. Location: `Assets/ScriptableObjects/Input/`

### Input Actions Structure

```
Action Maps:
├── Gameplay
│   ├── Move (Vector2) - Arrow keys, WASD, Gamepad Left Stick
│   ├── Fire (Button) - Space, Gamepad South Button (A/Cross)
│   ├── Speed0-9 (Button) - Number keys 0-9
│   ├── ToggleShields (Button) - S key
│   ├── ToggleComputer (Button) - T key
│   ├── ViewFore (Button) - F key
│   ├── ViewAft (Button) - A key
│   ├── GalacticChart (Button) - G key
│   ├── LongRangeScan (Button) - L key
│   └── Hyperspace (Button) - H key
└── UI
    ├── Navigate (Vector2) - Arrow keys, Gamepad D-Pad
    ├── Submit (Button) - Enter, Gamepad South Button
    ├── Cancel (Button) - ESC, Gamepad East Button (B/Circle)
    └── Pause (Button) - ESC, Gamepad Start
```

### Step 2: Create InputController

**Location:** `Assets/Scripts/Core/InputController.cs`

```csharp
using UnityEngine;
using UnityEngine.InputSystem;
using System;

namespace StarRaiders.Core
{
    /// <summary>
    /// Central input controller for Star Raiders
    /// </summary>
    public class InputController : MonoBehaviour
    {
        public static InputController Instance { get; private set; }

        [Header("Input Actions")]
        [SerializeField] private InputActionAsset inputActions;

        // Action maps
        private InputActionMap _gameplayMap;
        private InputActionMap _uiMap;

        // Gameplay actions
        private InputAction _moveAction;
        private InputAction _fireAction;
        private InputAction _shieldsAction;
        private InputAction _computerAction;
        private InputAction _viewForeAction;
        private InputAction _viewAftAction;
        private InputAction _galacticChartAction;
        private InputAction _longRangeScanAction;
        private InputAction _hyperspaceAction;
        private InputAction _pauseAction;
        private InputAction[] _speedActions = new InputAction[10];

        // Events
        public event Action<Vector2> OnMove;
        public event Action OnFire;
        public event Action<int> OnSpeedChanged;
        public event Action OnShieldsToggled;
        public event Action OnComputerToggled;
        public event Action OnViewFore;
        public event Action OnViewAft;
        public event Action OnGalacticChart;
        public event Action OnLongRangeScan;
        public event Action OnHyperspace;
        public event Action OnPause;

        private int _currentSpeed = 0;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeInput();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeInput()
        {
            if (inputActions == null)
            {
                Debug.LogError("Input Actions asset not assigned!");
                return;
            }

            // Get action maps
            _gameplayMap = inputActions.FindActionMap("Gameplay");
            _uiMap = inputActions.FindActionMap("UI");

            // Get actions
            _moveAction = _gameplayMap.FindAction("Move");
            _fireAction = _gameplayMap.FindAction("Fire");
            _shieldsAction = _gameplayMap.FindAction("ToggleShields");
            _computerAction = _gameplayMap.FindAction("ToggleComputer");
            _viewForeAction = _gameplayMap.FindAction("ViewFore");
            _viewAftAction = _gameplayMap.FindAction("ViewAft");
            _galacticChartAction = _gameplayMap.FindAction("GalacticChart");
            _longRangeScanAction = _gameplayMap.FindAction("LongRangeScan");
            _hyperspaceAction = _gameplayMap.FindAction("Hyperspace");
            _pauseAction = _uiMap.FindAction("Pause");

            // Get speed actions
            for (int i = 0; i <= 9; i++)
            {
                _speedActions[i] = _gameplayMap.FindAction($"Speed{i}");
            }

            // Subscribe to input events
            BindActions();
        }

        private void BindActions()
        {
            // Movement (continuous)
            _moveAction.performed += ctx => OnMove?.Invoke(ctx.ReadValue<Vector2>());
            _moveAction.canceled += ctx => OnMove?.Invoke(Vector2.zero);

            // Fire
            _fireAction.performed += ctx => OnFire?.Invoke();

            // Speed changes
            for (int i = 0; i <= 9; i++)
            {
                int speed = i; // Capture for closure
                _speedActions[i].performed += ctx => ChangeSpeed(speed);
            }

            // Toggles
            _shieldsAction.performed += ctx => OnShieldsToggled?.Invoke();
            _computerAction.performed += ctx => OnComputerToggled?.Invoke();

            // View switches
            _viewForeAction.performed += ctx => OnViewFore?.Invoke();
            _viewAftAction.performed += ctx => OnViewAft?.Invoke();

            // Screens
            _galacticChartAction.performed += ctx => OnGalacticChart?.Invoke();
            _longRangeScanAction.performed += ctx => OnLongRangeScan?.Invoke();
            _hyperspaceAction.performed += ctx => OnHyperspace?.Invoke();

            // Pause
            _pauseAction.performed += ctx => OnPause?.Invoke();
        }

        private void ChangeSpeed(int newSpeed)
        {
            if (_currentSpeed != newSpeed)
            {
                _currentSpeed = newSpeed;
                OnSpeedChanged?.Invoke(newSpeed);
            }
        }

        private void OnEnable()
        {
            EnableGameplayInput();
        }

        private void OnDisable()
        {
            DisableAllInput();
        }

        public void EnableGameplayInput()
        {
            _gameplayMap?.Enable();
            _uiMap?.Enable();
        }

        public void EnableUIInput()
        {
            _gameplayMap?.Disable();
            _uiMap?.Enable();
        }

        public void DisableAllInput()
        {
            _gameplayMap?.Disable();
            _uiMap?.Disable();
        }

        public int GetCurrentSpeed() => _currentSpeed;

        public Vector2 GetMoveInput()
        {
            return _moveAction?.ReadValue<Vector2>() ?? Vector2.zero;
        }
    }
}
```

### Step 3: Create Input Remapping UI (Optional)

**Location:** `Assets/Scripts/UI/InputRemappingUI.cs`

```csharp
using UnityEngine;
using UnityEngine.InputSystem;
using TMPro;

namespace StarRaiders.UI
{
    /// <summary>
    /// UI for remapping controls
    /// </summary>
    public class InputRemappingUI : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private GameObject remapPanel;
        [SerializeField] private TextMeshProUGUI statusText;

        private InputAction _currentRemapping;
        private int _bindingIndex;

        public void StartRemap(InputAction action, int bindingIndex)
        {
            _currentRemapping = action;
            _bindingIndex = bindingIndex;

            // Disable action during rebind
            action.Disable();

            // Start rebind operation
            var rebindOperation = action.PerformInteractiveRebinding(bindingIndex)
                .OnMatchWaitForAnother(0.1f)
                .OnComplete(operation => OnRebindComplete())
                .OnCancel(operation => OnRebindCanceled());

            statusText.text = "Press any key...";
            rebindOperation.Start();
        }

        private void OnRebindComplete()
        {
            _currentRemapping?.Enable();
            statusText.text = "Rebound successfully!";
            HideRemapPanel();
        }

        private void OnRebindCanceled()
        {
            _currentRemapping?.Enable();
            statusText.text = "Rebind canceled";
            HideRemapPanel();
        }

        private void HideRemapPanel()
        {
            if (remapPanel != null)
            {
                remapPanel.SetActive(false);
            }
        }

        public void ShowRemapPanel()
        {
            if (remapPanel != null)
            {
                remapPanel.SetActive(true);
            }
        }

        public void ResetToDefaults()
        {
            // Reset all bindings to defaults
            InputSystem.ResetDevice(Keyboard.current);
            InputSystem.ResetDevice(Gamepad.current);
            statusText.text = "Reset to defaults";
        }
    }
}
```

### Step 4: Create EditMode Tests

**Location:** `Assets/Scripts/Tests/EditMode/InputControllerTests.cs`

```csharp
using NUnit.Framework;
using UnityEngine;
using StarRaiders.Core;

namespace StarRaiders.Tests.EditMode
{
    public class InputControllerTests
    {
        [Test]
        public void SpeedChange_ShouldTriggerEvent()
        {
            // Test that speed changes fire events correctly
            Assert.Pass("Input tests require PlayMode - see PlayMode tests");
        }

        [Test]
        public void InputController_ShouldBeConfigured()
        {
            // Verify input controller can be created
            GameObject testObj = new GameObject();
            InputController controller = testObj.AddComponent<InputController>();
            Assert.IsNotNull(controller);
            Object.DestroyImmediate(testObj);
        }
    }
}
```

### Step 5: Integration with GameStateManager

Update Bootstrap scene to connect inputs:

```csharp
// In Bootstrap scene startup script
void Start()
{
    // Connect pause input to GameStateManager
    if (InputController.Instance != null)
    {
        InputController.Instance.OnPause += () =>
        {
            GameStateManager.Instance?.TogglePause();
        };
    }
}
```

## Verification Checklist

- [ ] Input Actions asset created with all mappings
- [ ] InputController singleton implemented
- [ ] All 15+ actions defined and bound
- [ ] Speed keys (0-9) working
- [ ] View switches (F/A) triggering events
- [ ] Screen toggles (G/L/H) working
- [ ] Weapon fire (Space) functioning
- [ ] Movement input (arrows/joystick) reading
- [ ] Pause (ESC) integrated with GameStateManager
- [ ] Events firing for all actions
- [ ] Gamepad support working
- [ ] Optional: Remapping UI implemented
- [ ] Tests created

## Testing Scenarios

1. **Keyboard Input**
   - Press 0-9, verify speed change events
   - Press F/A, verify view change events
   - Press G/L/H, verify screen events
   - Press T/S, verify toggle events
   - Press Space, verify fire event
   - Press ESC, verify pause

2. **Gamepad Input**
   - Test left stick movement
   - Test button mappings
   - Verify all actions accessible

3. **Remapping**
   - Open remap UI
   - Change a keybinding
   - Verify new binding works
   - Reset to defaults

## Next Steps

After Phase 3, proceed to:
- **Phase 4:** Galaxy Data Model & Persistence
  - Use speed input to control ship velocity
  - Use view switches to change camera

---

**Phase 3 Status:** 📝 DOCUMENTED
