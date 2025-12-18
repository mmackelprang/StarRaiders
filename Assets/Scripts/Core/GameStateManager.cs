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
            // Check if scene exists in build settings before loading to prevent errors in dev
            if (Application.CanStreamedLevelBeLoaded(sceneName))
            {
                SceneManager.LoadScene(sceneName);
            }
            else
            {
                Debug.LogWarning($"Scene '{sceneName}' not found in Build Settings. Skipping load.");
            }
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
