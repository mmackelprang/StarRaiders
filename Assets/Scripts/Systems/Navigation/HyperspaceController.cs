using UnityEngine;
using System;
using System.Collections;
using StarRaiders.Core;
using StarRaiders.Systems.Galaxy;

namespace StarRaiders.Systems.Navigation
{
    public class HyperspaceController : MonoBehaviour
    {
        public static HyperspaceController Instance { get; private set; }

        [Header("Configuration")]
        [SerializeField] private float hyperspaceJumpDuration = 3f;
        [SerializeField] private float manualAlignmentTolerance = 0.15f;
        [SerializeField] private float[] difficultyMultipliers = { 1.0f, 1.2f, 1.5f, 2.0f };

        [Header("Manual Navigation")]
        [SerializeField] private float driftSpeed = 0.5f;
        [SerializeField] private Vector2 crosshairPosition;

        private bool _isJumping = false;
        private bool _isManualMode = false;
        private Vector2Int _targetSector;
        private Vector2 _drift;

        public event Action OnHyperspaceStarted;
        public event Action OnHyperspaceCompleted;
        public event Action<int> OnEnergyCostCalculated;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public bool InitiateJump(Vector2Int destination, int difficulty)
        {
            if (_isJumping) return false;

            // Calculate distance
            Vector2Int currentPos = GalaxyManager.Instance.PlayerPosition;
            int distance = GalaxyManager.Instance.CalculateManhattanDistance(currentPos, destination);

            // Calculate energy cost
            float multiplier = difficultyMultipliers[Mathf.Clamp(difficulty, 0, 3)];
            int energyCost = Mathf.RoundToInt(100 * distance * multiplier);

            // Check energy availability (to be implemented with EnergyManager)
            // if (EnergyManager.Instance.GetCurrentEnergy() < energyCost)
            // {
            //     Debug.LogWarning("Insufficient energy for hyperspace jump!");
            //     return false;
            // }

            OnEnergyCostCalculated?.Invoke(energyCost);

            _targetSector = destination;
            _isManualMode = (difficulty >= 2); // Warrior and Commander

            if (_isManualMode)
            {
                StartManualHyperspace();
            }
            else
            {
                StartAutomaticHyperspace();
            }

            return true;
        }

        private void StartAutomaticHyperspace()
        {
            GameStateManager.Instance?.ChangeState(GameState.Hyperspace);
            OnHyperspaceStarted?.Invoke();
            StartCoroutine(AutomaticJumpSequence());
        }

        private IEnumerator AutomaticJumpSequence()
        {
            _isJumping = true;

            // Hyperspace animation duration
            yield return new WaitForSeconds(hyperspaceJumpDuration);

            // Arrive at destination
            CompleteJump(_targetSector);
        }

        private void StartManualHyperspace()
        {
            GameStateManager.Instance?.ChangeState(GameState.Hyperspace);
            OnHyperspaceStarted?.Invoke();
            
            // Initialize drift
            _drift = new Vector2(
                UnityEngine.Random.Range(-1f, 1f),
                UnityEngine.Random.Range(-1f, 1f)
            ).normalized * driftSpeed;

            StartCoroutine(ManualJumpSequence());
        }

        private IEnumerator ManualJumpSequence()
        {
            _isJumping = true;
            float elapsed = 0f;
            bool successfulAlignment = false;

            while (elapsed < hyperspaceJumpDuration)
            {
                // Update drift
                crosshairPosition += _drift * Time.deltaTime;

                // Get player input to counter drift
                Vector2 input = InputController.Instance?.GetMoveInput() ?? Vector2.zero;
                crosshairPosition -= input * Time.deltaTime;

                // Check if aligned
                float distanceFromCenter = crosshairPosition.magnitude;
                if (distanceFromCenter < manualAlignmentTolerance)
                {
                    successfulAlignment = true;
                }

                elapsed += Time.deltaTime;
                yield return null;
            }

            // Determine arrival location
            Vector2Int arrival = successfulAlignment ? _targetSector : GetRandomAdjacentSector(_targetSector);
            CompleteJump(arrival);
        }

        private void CompleteJump(Vector2Int arrival)
        {
            _isJumping = false;

            // Move player to new sector
            GalaxyManager.Instance?.MovePlayer(arrival);

            // Return to playing state
            GameStateManager.Instance?.ChangeState(GameState.Playing);
            OnHyperspaceCompleted?.Invoke();

            Debug.Log($"Arrived at sector ({arrival.x}, {arrival.y})");
        }

        private Vector2Int GetRandomAdjacentSector(Vector2Int target)
        {
            // Failed manual navigation - arrive at random adjacent sector
            int dx = UnityEngine.Random.Range(-1, 2);
            int dy = UnityEngine.Random.Range(-1, 2);

            int newX = Mathf.Clamp(target.x + dx, 0, 15);
            int newY = Mathf.Clamp(target.y + dy, 0, 15);

            return new Vector2Int(newX, newY);
        }

        public bool IsJumping() => _isJumping;
        public Vector2 GetCrosshairPosition() => crosshairPosition;
    }
}
