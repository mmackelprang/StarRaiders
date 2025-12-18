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
