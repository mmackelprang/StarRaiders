using NUnit.Framework;
using UnityEngine;
using StarRaiders.Core;

namespace StarRaiders.Tests.EditMode
{
    public class GameStateManagerTests
    {
        private GameObject testObject;
        private GameStateManager manager;

        [SetUp]
        public void Setup()
        {
            testObject = new GameObject("TestGameStateManager");
            manager = testObject.AddComponent<GameStateManager>();
        }

        [TearDown]
        public void Teardown()
        {
            Object.DestroyImmediate(testObject);
        }

        [Test]
        public void InitialState_ShouldBeTitle()
        {
            Assert.AreEqual(GameState.Title, manager.CurrentState);
        }

        [Test]
        public void ChangeState_FromTitleToPlaying_ShouldSucceed()
        {
            manager.ChangeState(GameState.Playing);
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void ChangeState_FromPlayingToPaused_ShouldSucceed()
        {
            manager.ChangeState(GameState.Playing);
            manager.ChangeState(GameState.Paused);
            Assert.AreEqual(GameState.Paused, manager.CurrentState);
        }

        [Test]
        public void ChangeState_FromPausedToPlaying_ShouldSucceed()
        {
            manager.ChangeState(GameState.Playing);
            manager.ChangeState(GameState.Paused);
            manager.ChangeState(GameState.Playing);
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void ChangeState_InvalidTransition_ShouldNotChange()
        {
            manager.ChangeState(GameState.Playing);
            manager.ChangeState(GameState.Title); // Invalid
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void Pause_WhenPlaying_ShouldTransitionToPaused()
        {
            manager.ChangeState(GameState.Playing);
            manager.Pause();
            Assert.AreEqual(GameState.Paused, manager.CurrentState);
        }

        [Test]
        public void Resume_WhenPaused_ShouldTransitionToPlaying()
        {
            manager.ChangeState(GameState.Playing);
            manager.Pause();
            manager.Resume();
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void TogglePause_ShouldAlternateBetweenStates()
        {
            manager.ChangeState(GameState.Playing);
            
            manager.TogglePause();
            Assert.AreEqual(GameState.Paused, manager.CurrentState);
            
            manager.TogglePause();
            Assert.AreEqual(GameState.Playing, manager.CurrentState);
        }

        [Test]
        public void IsPaused_ShouldReturnCorrectValue()
        {
            manager.ChangeState(GameState.Playing);
            Assert.IsFalse(manager.IsPaused());
            
            manager.Pause();
            Assert.IsTrue(manager.IsPaused());
        }

        [Test]
        public void OnStateChanged_ShouldFireEvent()
        {
            bool eventFired = false;
            GameState oldState = GameState.Title;
            GameState newState = GameState.Title;

            manager.OnStateChanged += (o, n) =>
            {
                eventFired = true;
                oldState = o;
                newState = n;
            };

            manager.ChangeState(GameState.Playing);

            Assert.IsTrue(eventFired);
            Assert.AreEqual(GameState.Title, oldState);
            Assert.AreEqual(GameState.Playing, newState);
        }
    }
}
