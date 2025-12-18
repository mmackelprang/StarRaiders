using NUnit.Framework;
using UnityEngine;
using StarRaiders.Systems.Navigation;

namespace StarRaiders.Tests.PlayMode
{
    public class ShipControllerTests
    {
        [Test]
        public void ShipController_ShouldInitialize()
        {
            GameObject go = new GameObject();
            ShipController controller = go.AddComponent<ShipController>();
            Assert.IsNotNull(controller);
            Object.DestroyImmediate(go);
        }

        [Test]
        public void SetSpeed_ShouldUpdateCurrentSpeed()
        {
            GameObject go = new GameObject();
            ShipController controller = go.AddComponent<ShipController>();
            
            controller.SetSpeed(5);
            Assert.AreEqual(5, controller.CurrentSpeed);
            Assert.AreEqual(11f, controller.GetCurrentMaxSpeed());
            
            Object.DestroyImmediate(go);
        }

        [Test]
        public void SetView_ShouldUpdateViewMode()
        {
            GameObject go = new GameObject();
            ShipController controller = go.AddComponent<ShipController>();
            
            controller.SetView(true);
            Assert.IsTrue(controller.IsAftView);
            
            controller.SetView(false);
            Assert.IsFalse(controller.IsAftView);
            
            Object.DestroyImmediate(go);
        }
    }
}
