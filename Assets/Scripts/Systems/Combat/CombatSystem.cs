using UnityEngine;
using System;
using System.Collections.Generic;
using StarRaiders.Core;

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
            GameObject torpedo = null;
            
            if (torpedoPrefab != null)
            {
                torpedo = Instantiate(torpedoPrefab, spawnPos, transform.rotation);
                
                // Apply velocity
                Rigidbody rb = torpedo.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    rb.velocity = transform.forward * torpedoSpeed;
                }

                _activeTorpedoes.Add(torpedo);
                Destroy(torpedo, torpedoLifetime);
            }
            else
            {
                Debug.LogWarning("Torpedo prefab not assigned!");
            }

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
