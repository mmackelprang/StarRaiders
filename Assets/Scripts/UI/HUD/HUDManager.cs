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
