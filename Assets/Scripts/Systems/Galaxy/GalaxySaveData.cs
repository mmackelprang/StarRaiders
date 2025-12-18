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
