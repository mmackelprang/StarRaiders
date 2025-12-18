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
