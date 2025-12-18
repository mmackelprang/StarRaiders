using UnityEngine;
using System;
using StarRaiders.Core;

namespace StarRaiders.Systems.Navigation
{
    public class ShipController : MonoBehaviour
    {
        public static ShipController Instance { get; private set; }

        [Header("Speed Configuration")]
        [SerializeField] private float[] speedLevels = new float[] 
            { 0f, 2f, 4f, 8f, 10f, 11f, 12f, 20f, 30f, 43f };
        [SerializeField] private float[] energyCosts = new float[] 
            { 0f, 2f, 2f, 2f, 5f, 5f, 8f, 12f, 18f, 30f };

        [Header("Physics")]
        [SerializeField] private float accelerationRate = 5f;
        [SerializeField] private float turnRate = 2f;
        [SerializeField] private float inertialDamping = 0.95f;

        [Header("Current State")]
        public int CurrentSpeed { get; private set; } = 0;
        public Vector3 Velocity { get; private set; }
        public Vector3 Position { get; private set; }
        public Quaternion Rotation { get; private set; }

        [Header("View")]
        public bool IsAftView { get; private set; } = false;

        public event Action<int> OnSpeedChanged;
        public event Action<Vector3> OnPositionChanged;
        public event Action<bool> OnViewChanged;

        private Vector3 _targetVelocity;
        private float _maxSpeed;
        private float _currentEnergyDrain;

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

        private void Start()
        {
            // Subscribe to input
            if (InputController.Instance != null)
            {
                InputController.Instance.OnSpeedChanged += SetSpeed;
                InputController.Instance.OnMove += HandleMoveInput;
                InputController.Instance.OnViewFore += () => SetView(false);
                InputController.Instance.OnViewAft += () => SetView(true);
            }

            Position = transform.position;
            Rotation = transform.rotation;
        }

        private void Update()
        {
            UpdatePhysics(Time.deltaTime);
            ConsumeEnergy(Time.deltaTime);
        }

        public void SetSpeed(int speed)
        {
            if (speed < 0 || speed >= speedLevels.Length) return;

            CurrentSpeed = speed;
            _maxSpeed = speedLevels[speed];
            _currentEnergyDrain = energyCosts[speed];

            OnSpeedChanged?.Invoke(speed);
            Debug.Log($"Speed set to {speed} ({_maxSpeed} m/s)");
        }

        private void HandleMoveInput(Vector2 input)
        {
            // Apply turning based on input
            float yaw = input.x * turnRate * Time.deltaTime;
            float pitch = input.y * turnRate * Time.deltaTime;

            // Invert pitch for aft view
            if (IsAftView)
            {
                pitch = -pitch;
                yaw = -yaw;
            }

            Rotation *= Quaternion.Euler(-pitch, yaw, 0);
        }

        private void UpdatePhysics(float deltaTime)
        {
            // Calculate target velocity based on current speed and facing
            Vector3 forward = Rotation * Vector3.forward;
            _targetVelocity = forward * _maxSpeed;

            // Accelerate toward target velocity
            Velocity = Vector3.Lerp(Velocity, _targetVelocity, accelerationRate * deltaTime);

            // Apply inertial damping
            Velocity *= inertialDamping;

            // Update position
            Position += Velocity * deltaTime;

            // Update transform
            transform.position = Position;
            transform.rotation = Rotation;

            OnPositionChanged?.Invoke(Position);
        }

        private void ConsumeEnergy(float deltaTime)
        {
            if (_currentEnergyDrain > 0)
            {
                // Energy consumption handled by EnergyManager (Phase 4 expansion)
                // EnergyManager.Instance?.ConsumeEnergy(_currentEnergyDrain * deltaTime);
            }
        }

        public void SetView(bool aftView)
        {
            IsAftView = aftView;
            OnViewChanged?.Invoke(aftView);
        }

        public float GetCurrentMaxSpeed() => _maxSpeed;
        public float GetEnergyDrain() => _currentEnergyDrain;
    }
}
