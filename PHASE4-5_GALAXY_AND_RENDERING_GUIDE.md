# Phases 4-5 Implementation Guide
# Phase 4: Galaxy Data Model & Phase 5: Rendering Foundations

**Status:** 📝 DOCUMENTED  
**Date:** December 17, 2025  
**Prerequisites:** Phases 1-3 completed

---

# PHASE 4: Galaxy Data Model & Persistence

## Overview

Implement the 16×16 galaxy grid with sectors, starbases, enemies, and player tracking. Include Manhattan distance calculations, threat detection, and save/load infrastructure.

## Galaxy Structure

- **Size:** 16×16 grid = 256 sectors
- **Coordinates:** (X, Y) where 0 ≤ X, Y ≤ 15
- **Starbases:** 2-4 depending on difficulty
- **Enemies:** 10-30 ships depending on difficulty
- **Distance:** Manhattan distance formula

## Implementation Steps

### Step 1: Create Sector Data Structure

**Location:** `Assets/Scripts/Systems/Galaxy/SectorData.cs`

```csharp
using UnityEngine;
using System.Collections.Generic;

namespace StarRaiders.Systems.Galaxy
{
    [System.Serializable]
    public enum SectorType
    {
        Empty,
        Starbase,
        Enemies,
        Player
    }

    [System.Serializable]
    public class SectorData
    {
        public Vector2Int coordinates;
        public SectorType type;
        public bool hasStarbase;
        public List<int> enemyIds = new List<int>();
        public bool isPlayerPresent;
        public bool isExplored;

        public SectorData(int x, int y)
        {
            coordinates = new Vector2Int(x, y);
            type = SectorType.Empty;
            hasStarbase = false;
            isPlayerPresent = false;
            isExplored = false;
        }

        public int EnemyCount => enemyIds.Count;

        public bool HasThreats => enemyIds.Count > 0;
    }
}
```

### Step 2: Create Galaxy Model ScriptableObject

**Location:** `Assets/Scripts/Systems/Galaxy/GalaxyConfig.cs`

```csharp
using UnityEngine;

namespace StarRaiders.Systems.Galaxy
{
    [CreateAssetMenu(fileName = "GalaxyConfig", menuName = "StarRaiders/Galaxy Config")]
    public class GalaxyConfig : ScriptableObject
    {
        [Header("Galaxy Settings")]
        public int gridSize = 16;
        
        [Header("Difficulty-based Generation")]
        public int noviceEnemies = 12;
        public int noviceStarbases = 4;
        
        public int pilotEnemies = 18;
        public int pilotStarbases = 4;
        
        public int warriorEnemies = 24;
        public int warriorStarbases = 3;
        
        public int commanderEnemies = 30;
        public int commanderStarbases = 2;

        [Header("Enemy Distribution")]
        [Range(0f, 1f)] public float fighterPercentage = 0.6f;
        [Range(0f, 1f)] public float cruiserPercentage = 0.3f;
        [Range(0f, 1f)] public float basestarPercentage = 0.1f;

        public void GetDifficultyParams(int difficulty, out int enemies, out int starbases)
        {
            switch (difficulty)
            {
                case 0: // Novice
                    enemies = noviceEnemies;
                    starbases = noviceStarbases;
                    break;
                case 1: // Pilot
                    enemies = pilotEnemies;
                    starbases = pilotStarbases;
                    break;
                case 2: // Warrior
                    enemies = warriorEnemies;
                    starbases = warriorStarbases;
                    break;
                case 3: // Commander
                    enemies = commanderEnemies;
                    starbases = commanderStarbases;
                    break;
                default:
                    enemies = noviceEnemies;
                    starbases = noviceStarbases;
                    break;
            }
        }
    }
}
```

### Step 3: Create Galaxy Manager

**Location:** `Assets/Scripts/Systems/Galaxy/GalaxyManager.cs`

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace StarRaiders.Systems.Galaxy
{
    public class GalaxyManager : MonoBehaviour
    {
        public static GalaxyManager Instance { get; private set; }

        [Header("Configuration")]
        [SerializeField] private GalaxyConfig config;

        [Header("Current State")]
        public Vector2Int PlayerPosition { get; private set; }
        public SectorData[,] Sectors { get; private set; }
        
        private int _currentDifficulty;
        private List<Vector2Int> _starbasePositions = new List<Vector2Int>();

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

        public void InitializeGalaxy(int difficulty, int seed = 0)
        {
            _currentDifficulty = difficulty;
            
            // Set random seed for reproducibility
            if (seed != 0)
                Random.InitState(seed);

            // Create sector grid
            Sectors = new SectorData[config.gridSize, config.gridSize];
            for (int x = 0; x < config.gridSize; x++)
            {
                for (int y = 0; y < config.gridSize; y++)
                {
                    Sectors[x, y] = new SectorData(x, y);
                }
            }

            // Get difficulty parameters
            config.GetDifficultyParams(difficulty, out int enemyCount, out int starbaseCount);

            // Place starbases
            PlaceStarbases(starbaseCount);

            // Place enemies
            PlaceEnemies(enemyCount);

            // Set player starting position (random empty sector)
            PlacePlayer();

            Debug.Log($"Galaxy initialized: {enemyCount} enemies, {starbaseCount} starbases");
        }

        private void PlaceStarbases(int count)
        {
            _starbasePositions.Clear();
            int placed = 0;
            int attempts = 0;
            int maxAttempts = 100;

            while (placed < count && attempts < maxAttempts)
            {
                int x = Random.Range(0, config.gridSize);
                int y = Random.Range(0, config.gridSize);

                // Check if sector is empty and far from other starbases
                if (!Sectors[x, y].hasStarbase && !Sectors[x, y].HasThreats)
                {
                    bool tooClose = false;
                    foreach (var sb in _starbasePositions)
                    {
                        if (CalculateManhattanDistance(new Vector2Int(x, y), sb) < 3)
                        {
                            tooClose = true;
                            break;
                        }
                    }

                    if (!tooClose)
                    {
                        Sectors[x, y].hasStarbase = true;
                        Sectors[x, y].type = SectorType.Starbase;
                        _starbasePositions.Add(new Vector2Int(x, y));
                        placed++;
                    }
                }

                attempts++;
            }

            Debug.Log($"Placed {placed} starbases");
        }

        private void PlaceEnemies(int count)
        {
            // Distribute enemies into squadrons
            int fighterCount = Mathf.RoundToInt(count * config.fighterPercentage);
            int cruiserCount = Mathf.RoundToInt(count * config.cruiserPercentage);
            int basestarCount = count - fighterCount - cruiserCount;

            int enemyId = 0;

            // Place fighters
            for (int i = 0; i < fighterCount; i++)
            {
                PlaceEnemyInRandomSector(enemyId++);
            }

            // Place cruisers
            for (int i = 0; i < cruiserCount; i++)
            {
                PlaceEnemyInRandomSector(enemyId++);
            }

            // Place basestars
            for (int i = 0; i < basestarCount; i++)
            {
                PlaceEnemyInRandomSector(enemyId++);
            }

            Debug.Log($"Placed {count} enemies (F:{fighterCount}, C:{cruiserCount}, B:{basestarCount})");
        }

        private void PlaceEnemyInRandomSector(int enemyId)
        {
            int attempts = 0;
            while (attempts < 50)
            {
                int x = Random.Range(0, config.gridSize);
                int y = Random.Range(0, config.gridSize);

                // Don't place on starbase or player start
                if (!Sectors[x, y].hasStarbase && !Sectors[x, y].isPlayerPresent)
                {
                    Sectors[x, y].enemyIds.Add(enemyId);
                    if (Sectors[x, y].type == SectorType.Empty)
                    {
                        Sectors[x, y].type = SectorType.Enemies;
                    }
                    return;
                }

                attempts++;
            }
        }

        private void PlacePlayer()
        {
            // Find empty sector far from enemies
            for (int attempts = 0; attempts < 100; attempts++)
            {
                int x = Random.Range(0, config.gridSize);
                int y = Random.Range(0, config.gridSize);

                if (!Sectors[x, y].hasStarbase && !Sectors[x, y].HasThreats)
                {
                    PlayerPosition = new Vector2Int(x, y);
                    Sectors[x, y].isPlayerPresent = true;
                    Sectors[x, y].type = SectorType.Player;
                    return;
                }
            }

            // Fallback to any empty sector
            PlayerPosition = new Vector2Int(0, 0);
            Sectors[0, 0].isPlayerPresent = true;
        }

        public int CalculateManhattanDistance(Vector2Int from, Vector2Int to)
        {
            return Mathf.Abs(to.x - from.x) + Mathf.Abs(to.y - from.y);
        }

        public List<Vector2Int> CheckStarbaseThreats()
        {
            List<Vector2Int> threatenedBases = new List<Vector2Int>();

            foreach (var basePos in _starbasePositions)
            {
                int adjacentEnemies = 0;

                // Check all adjacent sectors
                for (int dx = -1; dx <= 1; dx++)
                {
                    for (int dy = -1; dy <= 1; dy++)
                    {
                        if (dx == 0 && dy == 0) continue;

                        int x = basePos.x + dx;
                        int y = basePos.y + dy;

                        if (x >= 0 && x < config.gridSize && y >= 0 && y < config.gridSize)
                        {
                            if (Sectors[x, y].HasThreats)
                            {
                                adjacentEnemies++;
                            }
                        }
                    }
                }

                // Starbase is threatened if 2+ adjacent sectors have enemies
                if (adjacentEnemies >= 2)
                {
                    threatenedBases.Add(basePos);
                }
            }

            return threatenedBases;
        }

        public SectorData GetSector(Vector2Int coords)
        {
            if (coords.x >= 0 && coords.x < config.gridSize && 
                coords.y >= 0 && coords.y < config.gridSize)
            {
                return Sectors[coords.x, coords.y];
            }
            return null;
        }

        public SectorData GetPlayerSector()
        {
            return GetSector(PlayerPosition);
        }

        public void MovePlayer(Vector2Int newPosition)
        {
            // Clear old position
            Sectors[PlayerPosition.x, PlayerPosition.y].isPlayerPresent = false;
            
            // Set new position
            PlayerPosition = newPosition;
            Sectors[PlayerPosition.x, PlayerPosition.y].isPlayerPresent = true;
            Sectors[PlayerPosition.x, PlayerPosition.y].isExplored = true;
        }
    }
}
```

### Step 4: Save/Load System (Stub)

**Location:** `Assets/Scripts/Systems/Galaxy/GalaxySaveData.cs`

```csharp
using UnityEngine;
using System.Collections.Generic;

namespace StarRaiders.Systems.Galaxy
{
    [System.Serializable]
    public class GalaxySaveData
    {
        public int difficulty;
        public int seed;
        public Vector2Int playerPosition;
        public List<SectorSaveData> sectors = new List<SectorSaveData>();

        public string ToJson()
        {
            return JsonUtility.ToJson(this);
        }

        public static GalaxySaveData FromJson(string json)
        {
            return JsonUtility.FromJson<GalaxySaveData>(json);
        }
    }

    [System.Serializable]
    public class SectorSaveData
    {
        public int x;
        public int y;
        public bool hasStarbase;
        public List<int> enemyIds;
        public bool isExplored;
    }
}
```

### Step 5: EditMode Tests

**Location:** `Assets/Scripts/Tests/EditMode/GalaxyManagerTests.cs`

```csharp
using NUnit.Framework;
using UnityEngine;
using StarRaiders.Systems.Galaxy;

namespace StarRaiders.Tests.EditMode
{
    public class GalaxyManagerTests
    {
        [Test]
        public void ManhattanDistance_ShouldCalculateCorrectly()
        {
            GameObject testObj = new GameObject();
            GalaxyManager manager = testObj.AddComponent<GalaxyManager>();

            int distance = manager.CalculateManhattanDistance(
                new Vector2Int(0, 0),
                new Vector2Int(3, 4)
            );

            Assert.AreEqual(7, distance);
            Object.DestroyImmediate(testObj);
        }

        [Test]
        public void GalaxyInitialization_ShouldCreateGrid()
        {
            // Test basic galaxy setup
            Assert.Pass("Requires PlayMode test with ScriptableObject");
        }
    }
}
```

---

# PHASE 5: Rendering Foundations & HUD Shell

## Overview

Establish the visual foundation: camera rig, starfield, and HUD shell with energy meter, PESCLR indicators, crosshair, and speed display.

## Implementation Steps

### Step 1: Create Camera Rig

**Location:** `Assets/Scripts/Rendering/CameraController.cs`

```csharp
using UnityEngine;

namespace StarRaiders.Rendering
{
    public enum CameraView
    {
        Fore,
        Aft
    }

    public class CameraController : MonoBehaviour
    {
        [Header("Camera Settings")]
        [SerializeField] private Camera mainCamera;
        [SerializeField] private float fieldOfView = 60f;

        [Header("View Positions")]
        [SerializeField] private Transform forePosition;
        [SerializeField] private Transform aftPosition;

        private CameraView _currentView = CameraView.Fore;

        private void Start()
        {
            if (mainCamera == null)
                mainCamera = Camera.main;

            SetView(CameraView.Fore);
        }

        public void SetView(CameraView view)
        {
            _currentView = view;

            Transform targetTransform = view == CameraView.Fore ? forePosition : aftPosition;
            
            if (targetTransform != null)
            {
                mainCamera.transform.position = targetTransform.position;
                mainCamera.transform.rotation = targetTransform.rotation;
            }
        }

        public void ToggleView()
        {
            SetView(_currentView == CameraView.Fore ? CameraView.Aft : CameraView.Fore);
        }

        public CameraView GetCurrentView() => _currentView;
    }
}
```

### Step 2: Create Starfield

**Location:** `Assets/Scripts/Rendering/StarfieldGenerator.cs`

```csharp
using UnityEngine;

namespace StarRaiders.Rendering
{
    public class StarfieldGenerator : MonoBehaviour
    {
        [Header("Starfield Settings")]
        [SerializeField] private ParticleSystem starfieldParticles;
        [SerializeField] private int starCount = 1000;
        [SerializeField] private float fieldRadius = 500f;
        [SerializeField] private Vector2 starSizeRange = new Vector2(0.1f, 0.5f);

        private void Start()
        {
            GenerateStarfield();
        }

        private void GenerateStarfield()
        {
            if (starfieldParticles == null) return;

            var main = starfieldParticles.main;
            main.maxParticles = starCount;
            main.startLifetime = Mathf.Infinity;
            main.startSpeed = 0;
            main.startSize = new ParticleSystem.MinMaxCurve(starSizeRange.x, starSizeRange.y);

            var emission = starfieldParticles.emission;
            emission.enabled = false;

            // Emit stars in sphere around camera
            ParticleSystem.Particle[] particles = new ParticleSystem.Particle[starCount];
            
            for (int i = 0; i < starCount; i++)
            {
                Vector3 position = Random.onUnitSphere * fieldRadius;
                particles[i].position = position;
                particles[i].startColor = Color.white;
                particles[i].startSize = Random.Range(starSizeRange.x, starSizeRange.y);
                particles[i].remainingLifetime = Mathf.Infinity;
            }

            starfieldParticles.SetParticles(particles, starCount);
        }
    }
}
```

### Step 3: Create HUD Manager

**Location:** `Assets/Scripts/UI/HUD/HUDManager.cs`

```csharp
using UnityEngine;
using TMPro;
using UnityEngine.UI;

namespace StarRaiders.UI.HUD
{
    public class HUDManager : MonoBehaviour
    {
        [Header("Energy Display")]
        [SerializeField] private Slider energyBar;
        [SerializeField] private TextMeshProUGUI energyText;

        [Header("Speed Display")]
        [SerializeField] private TextMeshProUGUI speedText;

        [Header("PESCLR Indicators")]
        [SerializeField] private Image photonsIndicator;
        [SerializeField] private Image enginesIndicator;
        [SerializeField] private Image shieldsIndicator;
        [SerializeField] private Image computerIndicator;
        [SerializeField] private Image longRangeIndicator;
        [SerializeField] private Image radioIndicator;

        [Header("Crosshair")]
        [SerializeField] private RectTransform crosshair;

        [Header("Lock Indicators")]
        [SerializeField] private GameObject horizontalLock;
        [SerializeField] private GameObject verticalLock;
        [SerializeField] private GameObject rangeLock;

        [Header("Colors")]
        [SerializeField] private Color operationalColor = Color.blue;
        [SerializeField] private Color damagedColor = Color.yellow;
        [SerializeField] private Color destroyedColor = Color.red;

        public void UpdateEnergy(float current, float max)
        {
            if (energyBar != null)
            {
                energyBar.value = current / max;
            }

            if (energyText != null)
            {
                energyText.text = $"{Mathf.RoundToInt(current)}";
            }
        }

        public void UpdateSpeed(int speed)
        {
            if (speedText != null)
            {
                speedText.text = $"SPEED: {speed}";
            }
        }

        public void UpdatePESCLR(int systemIndex, int state)
        {
            Image indicator = systemIndex switch
            {
                0 => photonsIndicator,
                1 => enginesIndicator,
                2 => shieldsIndicator,
                3 => computerIndicator,
                4 => longRangeIndicator,
                5 => radioIndicator,
                _ => null
            };

            if (indicator != null)
            {
                indicator.color = state switch
                {
                    0 => operationalColor,
                    1 => damagedColor,
                    2 => destroyedColor,
                    _ => Color.white
                };
            }
        }

        public void UpdateLockIndicators(bool horizontal, bool vertical, bool range)
        {
            if (horizontalLock != null) horizontalLock.SetActive(horizontal);
            if (verticalLock != null) verticalLock.SetActive(vertical);
            if (rangeLock != null) rangeLock.SetActive(range);
        }
    }
}
```

## Verification Checklist

### Phase 4
- [ ] Galaxy 16×16 grid created
- [ ] Starbases placed correctly
- [ ] Enemies distributed properly
- [ ] Manhattan distance calculation working
- [ ] Threat detection functional
- [ ] Save/load stubs in place
- [ ] EditMode tests passing

### Phase 5
- [ ] Camera rig set up
- [ ] Fore/Aft views switching
- [ ] Starfield rendering (1000+ stars)
- [ ] HUD canvas created
- [ ] Energy bar displaying
- [ ] Speed indicator showing
- [ ] PESCLR indicators color-coded
- [ ] Crosshair centered
- [ ] Lock indicators (placeholders)

## Next Steps

After Phases 4-5, proceed to:
- **Phase 6:** Navigation & Ship Physics
- **Phase 7:** Hyperspace System

---

**Phases 4-5 Status:** 📝 DOCUMENTED
