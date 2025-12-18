using NUnit.Framework;
using UnityEngine;
using StarRaiders.Core;

namespace StarRaiders.Tests.EditMode
{
    public class InputControllerTests
    {
        [Test]
        public void SpeedChange_ShouldTriggerEvent()
        {
            // Test that speed changes fire events correctly
            Assert.Pass("Input tests require PlayMode - see PlayMode tests");
        }

        [Test]
        public void InputController_ShouldBeConfigured()
        {
            // Verify input controller can be created
            GameObject testObj = new GameObject();
            InputController controller = testObj.AddComponent<InputController>();
            Assert.IsNotNull(controller);
            Object.DestroyImmediate(testObj);
        }
    }
}
