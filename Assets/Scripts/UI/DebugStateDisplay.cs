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
