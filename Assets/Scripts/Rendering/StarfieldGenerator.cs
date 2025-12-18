using UnityEngine;

namespace StarRaiders.Rendering
{
    public class StarfieldGenerator : MonoBehaviour
    {
        [Header("Starfield Settings")]
        [SerializeField] private ParticleSystem starfieldParticles;
        [SerializeField] private int starCount = 1000;
        [SerializeField] private float fieldRadius = 500f;
        [SerializeField] private Vector2 starSizeRange = new Vector2(0.1f, 0.5f);

        private void Start()
        {
            GenerateStarfield();
        }

        private void GenerateStarfield()
        {
            if (starfieldParticles == null) return;

            var main = starfieldParticles.main;
            main.maxParticles = starCount;
            main.startLifetime = Mathf.Infinity;
            main.startSpeed = 0;
            main.startSize = new ParticleSystem.MinMaxCurve(starSizeRange.x, starSizeRange.y);

            var emission = starfieldParticles.emission;
            emission.enabled = false;

            // Emit stars in sphere around camera
            ParticleSystem.Particle[] particles = new ParticleSystem.Particle[starCount];
            
            for (int i = 0; i < starCount; i++)
            {
                Vector3 position = Random.onUnitSphere * fieldRadius;
                particles[i].position = position;
                particles[i].startColor = Color.white;
                particles[i].startSize = Random.Range(starSizeRange.x, starSizeRange.y);
                particles[i].remainingLifetime = Mathf.Infinity;
            }

            starfieldParticles.SetParticles(particles, starCount);
        }
    }
}
