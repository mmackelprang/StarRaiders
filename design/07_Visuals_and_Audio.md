# Visuals and Audio

## 1. Visual Design Philosophy

### Core Principles
*   **Authenticity:** Honor the 1980 Atari 800 aesthetic.
*   **Clarity:** Function over form; high contrast.
*   **Vector Style:** Simple geometric shapes for ships (Triangles).
*   **Starfield:** Parallax scrolling with multiple depth layers.

### Enemy Design
*   **Fighter (Zylon):** Small isometric triangle. Aggressive silhouette.
*   **Cruiser:** Medium elongated triangle.
*   **Basestar:** Large, imposing triangle.

```text
Fighter (Small):
    ▲
   /█\
  /███\

Cruiser (Medium):
    ▲
   /█\
  /███\
 /█████\

Basestar (Large):
    ▲
   /█\
  /███\
 /█████\
/███████\
```

### Rendering Pipeline
*   **3D to 2D Projection:** Objects exist in 3D space but are rendered as 2D sprites/shapes scaled by distance.
*   **Perspective:** First-person view with focal length scaling.

```csharp
// Pseudocode: 3D to 2D Projection
function Project3DTo2D(worldPos):
    // Transform to camera space
    cameraPos = WorldToCameraSpace(worldPos)
    
    // Check if behind camera
    if cameraPos.z <= camera.nearPlane: return null
    
    // Perspective projection
    screenX = (cameraPos.x / cameraPos.z) * focalLength + screenWidth / 2
    screenY = (cameraPos.y / cameraPos.z) * focalLength + screenHeight / 2
    
    // Calculate scale based on distance
    scale = focalLength / cameraPos.z
    
    return { x: screenX, y: screenY, scale: scale }

function WorldToCameraSpace(worldPos):
    // Translate to camera origin
    relative = {
        x: worldPos.x - camera.position.x,
        y: worldPos.y - camera.position.y,
        z: worldPos.z - camera.position.z
    }
    
    // Rotate by camera rotation
    rotated = RotatePoint(relative, camera.rotation)
    return rotated
```

### Starfield Rendering
```csharp
// Pseudocode: Starfield
function RenderStarfield():
    // Render each parallax layer
    for layer in starfieldLayers:
        for star in layer.stars:
            // Calculate position based on camera
            offsetX = (star.x - camera.position.x) * layer.parallaxFactor
            offsetY = (star.y - camera.position.y) * layer.parallaxFactor
            
            // Wrap around screen
            screenX = (offsetX + screenWidth) % screenWidth
            screenY = (offsetY + screenHeight) % screenHeight
            
            // Draw star
            DrawPixel(screenX, screenY, star.color, star.size)
```

### Effects
    *   **Explosions:** Expanding circles/particles.
    *   **Hyperspace:** "Star streak" tunnel effect.
    *   **Shields:** Blue shimmer on screen edges.
    *   **Torpedo Trail:** White line with arrow head, fades after 0.5s.
    *   **Damage Flash:** Screen flashes red (50% opacity) and shakes.

## 2. Audio Design

### Audio Manager Implementation

```csharp
// Pseudocode: Audio Manager
class AudioManager:
    sounds = {}  // Dictionary of loaded sounds
    music = {}   // Dictionary of music tracks
    masterVolume = 1.0
    soundVolume = 1.0
    musicVolume = 1.0

function LoadAudio():
    // Load sound effects
    sounds["torpedo_fire"] = LoadSound("torpedo_fire.wav")
    sounds["explosion"] = LoadSound("explosion.wav")
    sounds["player_hit"] = LoadSound("player_hit.wav")
    sounds["enemy_hit"] = LoadSound("enemy_hit.wav")
    sounds["shields_on"] = LoadSound("shields_on.wav")
    sounds["shields_off"] = LoadSound("shields_off.wav")
    sounds["computer_on"] = LoadSound("computer_on.wav")
    sounds["hyperspace_enter"] = LoadSound("hyperspace_enter.wav")
    sounds["hyperspace_exit"] = LoadSound("hyperspace_exit.wav")
    sounds["docking"] = LoadSound("docking.wav")
    sounds["repair"] = LoadSound("repair.wav")
    sounds["alert_beep"] = LoadSound("alert_beep.wav")
    sounds["low_energy_beep"] = LoadSound("low_energy_beep.wav")
    sounds["critical_energy_beep"] = LoadSound("critical_energy_beep.wav")
    sounds["error"] = LoadSound("error.wav")
    sounds["system_damage"] = LoadSound("system_damage.wav")
    sounds["collision"] = LoadSound("collision.wav")

function PlaySound(soundName, volume = 1.0):
    if soundName not in sounds: return
    sound = sounds[soundName]
    effectiveVolume = volume * soundVolume * masterVolume
    PlaySoundEffect(sound, effectiveVolume)

function UpdateEngineSound():
    // Engine sound pitch scales with velocity
    basePitch = 1.0
    pitchMultiplier = 0.1 * playerVelocity
    enginePitch = basePitch + pitchMultiplier
    SetSoundPitch("engine_loop", enginePitch)
    
    // Volume based on velocity
    engineVolume = 0.3 + (0.2 * (playerVelocity / 9))
    SetSoundVolume("engine_loop", engineVolume)
```

### Sound Style
*   **Retro Synthesized:** 8-bit/16-bit aesthetic. No orchestral scores.
*   **Functional:** Sounds provide gameplay feedback (e.g., lock tone, low energy alarm).

### Key Sound Effects
*   **Torpedo Fire:** "Pew" laser sound.
*   **Explosion:** "Boom" with debris scatter.
*   **Hyperspace:** Rising "Whoosh" (Entry), Descending "Whoosh" (Exit).
*   **Alarms:**
    *   **Low Energy:** Slow beep.
    *   **Critical Energy:** Fast beep.
    *   **Red Alert:** Klaxon for starbase attack.
    *   **Lock:** High-pitched ping.

### Music
*   **Title:** Retro sci-fi theme.
*   **Victory:** Fanfare.
*   **Gameplay:** Mostly ambient/silence to emphasize space, with situational cues.
