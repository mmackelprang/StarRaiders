using UnityEngine;

namespace StarRaiders.Rendering
{
    public enum CameraView
    {
        Fore,
        Aft
    }

    public class CameraController : MonoBehaviour
    {
        [Header("Camera Settings")]
        [SerializeField] private Camera mainCamera;
        [SerializeField] private float fieldOfView = 60f;

        [Header("View Positions")]
        [SerializeField] private Transform forePosition;
        [SerializeField] private Transform aftPosition;

        private CameraView _currentView = CameraView.Fore;

        private void Start()
        {
            if (mainCamera == null)
                mainCamera = Camera.main;

            SetView(CameraView.Fore);
        }

        public void SetView(CameraView view)
        {
            _currentView = view;

            Transform targetTransform = view == CameraView.Fore ? forePosition : aftPosition;
            
            if (targetTransform != null)
            {
                mainCamera.transform.position = targetTransform.position;
                mainCamera.transform.rotation = targetTransform.rotation;
            }
        }

        public void ToggleView()
        {
            SetView(_currentView == CameraView.Fore ? CameraView.Aft : CameraView.Fore);
        }

        public CameraView GetCurrentView() => _currentView;
    }
}
