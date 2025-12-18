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
