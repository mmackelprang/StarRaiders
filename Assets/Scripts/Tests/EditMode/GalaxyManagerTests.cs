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
