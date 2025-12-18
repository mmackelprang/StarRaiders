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
