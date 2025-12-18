# Phases 6-9 Implementation Guide
# Navigation, Hyperspace, Combat, and PESCLR Systems

**Status:** 📝 DOCUMENTED  
**Date:** December 17, 2025  
**Prerequisites:** Phases 1-5 completed

---

# PHASE 6: Navigation & Ship Physics

## Overview

Implement player ship movement with acceleration, velocity capping, orientation, and energy consumption. Support speed levels 0-9 with inertial physics.

## Speed Levels

| Speed | Metrons/sec | Energy/sec | Use Case |
|-------|-------------|------------|----------|
| 0 | 0 | 0 | Docking, stopped |
| 1 | 2 | 2 | Precise maneuvering |
| 2 | 4 | 2 | Close combat |
| 3 | 8 | 2 | Slow approach |
| 4 | 10 | 5 | Moderate speed |
| 5 | 11 | 5 | Balanced travel |
| 6 | 12 | 8 | **OPTIMAL CRUISE** |
| 7 | 20 | 12 | Quick travel |
| 8 | 30 | 18 | High speed |
| 9 | 43 | 30 | Maximum (emergency) |

## Implementation

**Location:** `Assets/Scripts/Systems/Navigation/ShipController.cs`

```csharp
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
```

---

# PHASE 7: Hyperspace System

## Overview

Implement sector-to-sector travel with automatic (Novice/Pilot) and manual (Warrior/Commander) navigation modes. Energy cost scales with distance and difficulty.

## Energy Cost Formula

```
Energy Cost = 100 × Manhattan Distance × Difficulty Multiplier
```

Difficulty multipliers:
- Novice: 1.0×
- Pilot: 1.2×
- Warrior: 1.5×
- Commander: 2.0×

## Implementation

**Location:** `Assets/Scripts/Systems/Navigation/HyperspaceController.cs`

```csharp
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
```

---

# PHASE 8: Combat & Weapons

## Overview

Implement photon torpedo firing, lock indicators, hit detection, and optimal range mechanics.

## Combat Parameters

- **Lock indicators:** Horizontal ⊕ | Vertical ⊕ | Range ⊕
- **Optimal range:** 30-70 metrons
- **Torpedo speed:** 50 metrons/second
- **Energy cost:** 5 units/shot

## Implementation

**Location:** `Assets/Scripts/Systems/Combat/CombatSystem.cs`

```csharp
using UnityEngine;
using System;
using System.Collections.Generic;

namespace StarRaiders.Systems.Combat
{
    public class CombatSystem : MonoBehaviour
    {
        public static CombatSystem Instance { get; private set; }

        [Header("Torpedo Configuration")]
        [SerializeField] private GameObject torpedoPrefab;
        [SerializeField] private float torpedoSpeed = 50f;
        [SerializeField] private float torpedoLifetime = 5f;
        [SerializeField] private int torpedoEnergyCost = 5;

        [Header("Lock Configuration")]
        [SerializeField] private float horizontalLockThreshold = 10f; // degrees
        [SerializeField] private float verticalLockThreshold = 10f;
        [SerializeField] private float optimalRangeMin = 30f;
        [SerializeField] private float optimalRangeMax = 70f;

        [Header("Current Locks")]
        public bool HorizontalLock { get; private set; }
        public bool VerticalLock { get; private set; }
        public bool RangeLock { get; private set; }

        private List<GameObject> _activeTorpedoes = new List<GameObject>();
        private Transform _currentTarget;

        public event Action OnTorpedoFired;
        public event Action<bool, bool, bool> OnLockStatusChanged;

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
            // Subscribe to fire input
            if (InputController.Instance != null)
            {
                InputController.Instance.OnFire += FireTorpedo;
            }
        }

        private void Update()
        {
            UpdateLockStatus();
            CleanupTorpedoes();
        }

        public void FireTorpedo()
        {
            // Check energy (to be integrated with EnergyManager)
            // if (EnergyManager.Instance.GetCurrentEnergy() < torpedoEnergyCost)
            // {
            //     Debug.LogWarning("Insufficient energy to fire torpedo!");
            //     return;
            // }

            // Consume energy
            // EnergyManager.Instance.ConsumeEnergy(torpedoEnergyCost);

            // Spawn torpedo
            Vector3 spawnPos = transform.position + transform.forward * 2f;
            GameObject torpedo = Instantiate(torpedoPrefab, spawnPos, transform.rotation);
            
            // Apply velocity
            Rigidbody rb = torpedo.GetComponent<Rigidbody>();
            if (rb != null)
            {
                rb.velocity = transform.forward * torpedoSpeed;
            }

            _activeTorpedoes.Add(torpedo);
            Destroy(torpedo, torpedoLifetime);

            OnTorpedoFired?.Invoke();
            Debug.Log("Torpedo fired!");
        }

        private void UpdateLockStatus()
        {
            if (_currentTarget == null)
            {
                SetLockStatus(false, false, false);
                return;
            }

            // Calculate angle to target
            Vector3 toTarget = _currentTarget.position - transform.position;
            float distance = toTarget.magnitude;

            // Horizontal lock (yaw)
            Vector3 toTargetFlat = new Vector3(toTarget.x, 0, toTarget.z);
            Vector3 forwardFlat = new Vector3(transform.forward.x, 0, transform.forward.z);
            float horizontalAngle = Vector3.Angle(forwardFlat, toTargetFlat);
            bool hLock = horizontalAngle < horizontalLockThreshold;

            // Vertical lock (pitch)
            float verticalAngle = Mathf.Abs(Mathf.Atan2(toTarget.y, toTargetFlat.magnitude) * Mathf.Rad2Deg);
            bool vLock = verticalAngle < verticalLockThreshold;

            // Range lock
            bool rLock = distance >= optimalRangeMin && distance <= optimalRangeMax;

            SetLockStatus(hLock, vLock, rLock);
        }

        private void SetLockStatus(bool h, bool v, bool r)
        {
            if (HorizontalLock != h || VerticalLock != v || RangeLock != r)
            {
                HorizontalLock = h;
                VerticalLock = v;
                RangeLock = r;
                OnLockStatusChanged?.Invoke(h, v, r);
            }
        }

        private void CleanupTorpedoes()
        {
            _activeTorpedoes.RemoveAll(t => t == null);
        }

        public void SetTarget(Transform target)
        {
            _currentTarget = target;
        }

        public void ClearTarget()
        {
            _currentTarget = null;
        }
    }
}
```

---

# PHASE 9: PESCLR Damage System

## Overview

Implement the six-system damage model with three states each: Operational, Damaged, Destroyed.

## PESCLR Systems

1. **P** - Photon Torpedoes
2. **E** - Engines
3. **S** - Shields
4. **C** - Computer (Attack Computer)
5. **L** - Long-Range Scanner
6. **R** - Radio (Subspace Radio)

## Implementation

**Location:** `Assets/Scripts/Systems/PESCLR/PESCLRSystem.cs`

```csharp
using UnityEngine;
using System;

namespace StarRaiders.Systems.PESCLR
{
    public enum SystemState
    {
        Operational = 0,
        Damaged = 1,
        Destroyed = 2
    }

    public enum ShipSystem
    {
        Photons = 0,
        Engines = 1,
        Shields = 2,
        Computer = 3,
        LongRange = 4,
        Radio = 5
    }

    [System.Serializable]
    public class SystemStatus
    {
        public ShipSystem system;
        public SystemState state = SystemState.Operational;
        
        public bool IsOperational => state == SystemState.Operational;
        public bool IsDamaged => state == SystemState.Damaged;
        public bool IsDestroyed => state == SystemState.Destroyed;
    }

    public class PESCLRSystem : MonoBehaviour
    {
        public static PESCLRSystem Instance { get; private set; }

        [Header("System States")]
        [SerializeField] private SystemStatus[] systems = new SystemStatus[6];

        public event Action<ShipSystem, SystemState> OnSystemDamaged;
        public event Action OnAllSystemsRepaired;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                InitializeSystems();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeSystems()
        {
            for (int i = 0; i < 6; i++)
            {
                systems[i] = new SystemStatus
                {
                    system = (ShipSystem)i,
                    state = SystemState.Operational
                };
            }
        }

        public void ApplyDamage(ShipSystem system)
        {
            int index = (int)system;
            if (index < 0 || index >= systems.Length) return;

            SystemStatus status = systems[index];

            // Progress damage: Operational → Damaged → Destroyed
            if (status.state == SystemState.Operational)
            {
                status.state = SystemState.Damaged;
            }
            else if (status.state == SystemState.Damaged)
            {
                status.state = SystemState.Destroyed;
            }

            OnSystemDamaged?.Invoke(system, status.state);
            Debug.Log($"{system} system now {status.state}");

            ApplySystemEffects(system, status.state);
        }

        private void ApplySystemEffects(ShipSystem system, SystemState state)
        {
            switch (system)
            {
                case ShipSystem.Photons:
                    // Reduce fire rate and damage
                    // CombatSystem.Instance.SetTorpedoEfficiency(GetEfficiency(state));
                    break;

                case ShipSystem.Engines:
                    // Reduce max speed and increase energy cost
                    // ShipController.Instance.SetEngineEfficiency(GetEfficiency(state));
                    break;

                case ShipSystem.Shields:
                    // Reduce protection percentage
                    // ShieldsSystem.Instance.SetShieldEfficiency(GetEfficiency(state));
                    break;

                case ShipSystem.Computer:
                    // Reduce lock accuracy
                    // CombatSystem.Instance.SetComputerEfficiency(GetEfficiency(state));
                    break;

                case ShipSystem.LongRange:
                    // Add false echoes, reduce accuracy
                    // ScannerSystem.Instance.SetScannerEfficiency(GetEfficiency(state));
                    break;

                case ShipSystem.Radio:
                    // Delay or disable alerts
                    // RadioSystem.Instance.SetRadioEfficiency(GetEfficiency(state));
                    break;
            }
        }

        public float GetEfficiency(SystemState state)
        {
            return state switch
            {
                SystemState.Operational => 1.0f,
                SystemState.Damaged => 0.5f,
                SystemState.Destroyed => 0.0f,
                _ => 1.0f
            };
        }

        public void RepairSystem(ShipSystem system)
        {
            int index = (int)system;
            if (index < 0 || index >= systems.Length) return;

            systems[index].state = SystemState.Operational;
            OnSystemDamaged?.Invoke(system, SystemState.Operational);
            ApplySystemEffects(system, SystemState.Operational);
        }

        public void RepairAllSystems()
        {
            for (int i = 0; i < systems.Length; i++)
            {
                systems[i].state = SystemState.Operational;
                ApplySystemEffects((ShipSystem)i, SystemState.Operational);
            }

            OnAllSystemsRepaired?.Invoke();
            Debug.Log("All systems repaired!");
        }

        public SystemState GetSystemState(ShipSystem system)
        {
            int index = (int)system;
            if (index >= 0 && index < systems.Length)
            {
                return systems[index].state;
            }
            return SystemState.Operational;
        }

        public bool IsSystemOperational(ShipSystem system)
        {
            return GetSystemState(system) == SystemState.Operational;
        }
    }
}
```

## Verification Checklist

### Phase 6
- [ ] Ship speed levels 0-9 working
- [ ] Acceleration and velocity physics
- [ ] Turning controls responding
- [ ] Energy consumption per speed
- [ ] Fore/Aft view switching
- [ ] Position updates broadcasting

### Phase 7
- [ ] Automatic hyperspace (Novice/Pilot)
- [ ] Manual hyperspace (Warrior/Commander)
- [ ] Energy cost calculation
- [ ] Crosshair drift in manual mode
- [ ] Failed navigation handling
- [ ] Sector transition working

### Phase 8
- [ ] Torpedo firing functional
- [ ] Lock indicators calculating
- [ ] Optimal range detection (30-70m)
- [ ] Hit detection working
- [ ] Energy cost per shot
- [ ] Torpedo pooling/cleanup

### Phase 9
- [ ] All 6 PESCLR systems tracked
- [ ] Damage progression (Op→Dam→Des)
- [ ] System effects applied correctly
- [ ] Repair at starbase working
- [ ] HUD indicators updating
- [ ] Efficiency calculations correct

## Next Steps

After Phases 6-9, proceed to:
- **Phase 10:** Enemy AI & Galaxy Activity
- **Phase 11:** Starbase & Resource Systems

---

**Phases 6-9 Status:** 📝 DOCUMENTED
