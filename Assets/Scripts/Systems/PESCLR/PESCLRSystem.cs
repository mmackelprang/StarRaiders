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
