using UnityEngine;
using UnityEngine.InputSystem;
using TMPro;

namespace StarRaiders.UI
{
    /// <summary>
    /// UI for remapping controls
    /// </summary>
    public class InputRemappingUI : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private GameObject remapPanel;
        [SerializeField] private TextMeshProUGUI statusText;

        private InputAction _currentRemapping;
        private int _bindingIndex;

        public void StartRemap(InputAction action, int bindingIndex)
        {
            _currentRemapping = action;
            _bindingIndex = bindingIndex;

            // Disable action during rebind
            action.Disable();

            // Start rebind operation
            var rebindOperation = action.PerformInteractiveRebinding(bindingIndex)
                .OnMatchWaitForAnother(0.1f)
                .OnComplete(operation => OnRebindComplete())
                .OnCancel(operation => OnRebindCanceled());

            statusText.text = "Press any key...";
            rebindOperation.Start();
        }

        private void OnRebindComplete()
        {
            _currentRemapping?.Enable();
            statusText.text = "Rebound successfully!";
            HideRemapPanel();
        }

        private void OnRebindCanceled()
        {
            _currentRemapping?.Enable();
            statusText.text = "Rebind canceled";
            HideRemapPanel();
        }

        private void HideRemapPanel()
        {
            if (remapPanel != null)
            {
                remapPanel.SetActive(false);
            }
        }

        public void ShowRemapPanel()
        {
            if (remapPanel != null)
            {
                remapPanel.SetActive(true);
            }
        }

        public void ResetToDefaults()
        {
            // Reset all bindings to defaults
            InputSystem.ResetDevice(Keyboard.current);
            InputSystem.ResetDevice(Gamepad.current);
            statusText.text = "Reset to defaults";
        }
    }
}
