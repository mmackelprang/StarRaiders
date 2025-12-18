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
