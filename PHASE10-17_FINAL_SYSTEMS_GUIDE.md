# Phases 10-17 Implementation Guide
# Enemy AI, Starbases, UI, Audio, Polish, and Release

**Status:** 📝 DOCUMENTED  
**Date:** December 17, 2025  
**Prerequisites:** Phases 1-9 completed

---

# PHASE 10: Enemy AI & Galaxy Activity

## Overview

Implement AI behaviors for three enemy types with group coordination, starbase targeting, and difficulty scaling.

## Enemy Types

1. **Fighter (F)** - 60% of forces, aggressive, 1 hit
2. **Cruiser (C)** - 30% of forces, defensive, 2 hits (shields)
3. **Basestar (B)** - 10% of forces, heavy firepower, 3 hits

## Key Features

- Individual movement and attack behaviors
- Group coordination (squadrons move together)
- Starbase targeting with 100-centon countdown
- Difficulty-based speed and aggression scaling

## Implementation Stub

**Location:** `Assets/Scripts/AI/EnemyAI.cs`

```csharp
namespace StarRaiders.AI
{
    public enum EnemyType { Fighter, Cruiser, Basestar }
    
    public class EnemyAI : MonoBehaviour
    {
        public EnemyType type;
        public int health;
        public float speed;
        public float aggressionLevel;
        
        // Movement AI
        void UpdateMovement() { /* Implement pursuit/evasion */ }
        
        // Attack AI
        void UpdateAttack() { /* Implement firing logic */ }
        
        // Group coordination
        void SyncWithSquadron() { /* Squadron movement */ }
    }
}
```

---

# PHASE 11: Starbase & Resource Systems

## Overview

Implement docking, refuel, repair, and starbase defense mechanics.

## Starbase Functions

1. **Docking** - Automatic when player velocity is 0 in starbase sector
2. **Refuel** - Restore energy to maximum (~7000 units)
3. **Repair** - Fix all PESCLR systems to Operational
4. **Defense** - 100-centon countdown when surrounded by 2+ enemy sectors

## Implementation Stub

**Location:** `Assets/Scripts/Systems/Starbase/StarbaseSystem.cs`

```csharp
namespace StarRaiders.Systems.Starbase
{
    public class StarbaseSystem : MonoBehaviour
    {
        public void InitiateDocking()
        {
            // Refuel player
            // Repair all systems
            // Show docking UI
        }
        
        public void CheckStarbaseThreats()
        {
            // Called by GalaxyManager
            // Start 100-centon countdown if surrounded
        }
        
        public void DestroyStarbase(Vector2Int position)
        {
            // Remove from galaxy
            // Check for mission failure
        }
    }
}
```

---

# PHASE 12: UI Screens & Flows

## Overview

Implement all 8 game screens with navigation and visual fidelity to mockups.

## Screens

1. **Title Screen** - Difficulty selection, start game
2. **Galactic Chart (G)** - 16×16 grid overlay, sector info
3. **Fore View (F)** - Primary cockpit view
4. **Aft View (A)** - Rear-facing cockpit view
5. **Long-Range Scan (L)** - Tactical sensor display
6. **Hyperspace (H)** - Jump navigation interface
7. **Game Over** - Mission results
8. **Ranking** - Player rank from 20-tier system

## Color Scheme (from visual reference)

- **Operational:** Blue (#0066FF)
- **Damaged:** Yellow (#FFCC00)
- **Destroyed:** Red (#FF0000)
- **Background:** Black (#000000)
- **Starfield:** White (#FFFFFF)

## Implementation Stub

**Location:** `Assets/Scripts/UI/Screens/`

```csharp
// TitleScreen.cs
public class TitleScreen : MonoBehaviour
{
    public void SelectDifficulty(int level) { /* Start game */ }
}

// GalacticChartUI.cs
public class GalacticChartUI : MonoBehaviour
{
    public void Show() { /* Display 16×16 grid */ }
    public void SelectSector(Vector2Int coords) { /* Hyperspace target */ }
}

// LongRangeScanUI.cs
public class LongRangeScanUI : MonoBehaviour
{
    public void UpdateScan() { /* Show local 3×3 sectors */ }
}
```

---

# PHASE 13: Audio System

## Overview

Implement sound effects and music tied to gameplay events.

## Audio Assets

1. **Engine hum** - Pitch varies with velocity
2. **Photon torpedo fire** - Sharp laser sound
3. **Explosion** - Enemy destruction
4. **Shield activation** - Power-up sound
5. **Hyperspace warp** - Swoosh/warp effect
6. **Alert tones** - Starbase under attack
7. **UI clicks** - Button feedback
8. **Ambient space** - Background ambience

## Implementation Stub

**Location:** `Assets/Scripts/Core/AudioManager.cs` (expand Phase 1 stub)

```csharp
namespace StarRaiders.Core
{
    public class AudioManager : MonoBehaviour
    {
        [Header("SFX")]
        public AudioClip torpedoFire;
        public AudioClip explosion;
        public AudioClip shieldToggle;
        public AudioClip hyperspace;
        public AudioClip alert;
        
        [Header("Engine")]
        public AudioSource engineSource;
        public float minPitch = 0.8f;
        public float maxPitch = 2.0f;
        
        public void UpdateEnginePitch(float velocity)
        {
            // Lerp pitch based on velocity
            float t = velocity / 43f; // Max speed
            engineSource.pitch = Mathf.Lerp(minPitch, maxPitch, t);
        }
        
        public void PlaySFX(AudioClip clip)
        {
            // Play one-shot sound
        }
    }
}
```

---

# PHASE 14: Scoring, Ranking, and Session Flow

## Overview

Implement complete scoring system with 20-rank progression.

## Scoring Rules

- **Enemy destroyed:** +10 to +50 (based on type)
- **Starbase lost:** -100
- **Energy efficiency:** Bonus for energy remaining
- **Time bonus:** Faster completion = higher score
- **Difficulty multiplier:** 1×, 1.5×, 2×, 3×

## Ranking Tiers (20 Total)

| Score | Rank |
|-------|------|
| 0-47 | Galactic Cook / Garbage Scow Captain |
| 48-79 | Rookie |
| 80-111 | Novice |
| 112-143 | Ensign |
| 144-175 | Pilot |
| 176-207 | Ace |
| 208-239 | Lieutenant |
| 240-271 | Warrior |
| 272-303 | Captain |
| 304+ | Commander / Star Commander Class 1-4 |

## Implementation Stub

**Location:** `Assets/Scripts/Systems/Scoring/ScoringSystem.cs`

```csharp
namespace StarRaiders.Systems.Scoring
{
    public class ScoringSystem : MonoBehaviour
    {
        private int _score = 0;
        
        public void AddEnemyKill(EnemyType type)
        {
            int points = type switch
            {
                EnemyType.Fighter => 10,
                EnemyType.Cruiser => 30,
                EnemyType.Basestar => 50,
                _ => 0
            };
            _score += points;
        }
        
        public void StarbaseLost()
        {
            _score -= 100;
        }
        
        public string GetRank()
        {
            // Calculate rank based on score
            if (_score < 48) return "Galactic Cook";
            if (_score < 80) return "Rookie";
            // ... etc
            return "Star Commander Class 4";
        }
    }
}
```

---

# PHASE 15: Save/Load, Settings, Accessibility

## Overview

Implement modern quality-of-life features.

## Features

1. **Save/Load** - JSON serialization of game state
2. **Settings UI** - Graphics, audio, controls
3. **Control Remapping** - Persist custom bindings
4. **Colorblind Modes** - Alternative palettes
5. **Resolution Scaling** - Window/fullscreen toggle
6. **Accessibility** - Text scaling, high contrast

## Implementation Stub

**Location:** `Assets/Scripts/Systems/Settings/SettingsManager.cs`

```csharp
namespace StarRaiders.Systems.Settings
{
    [System.Serializable]
    public class GameSettings
    {
        public float masterVolume = 1.0f;
        public int resolutionIndex = 0;
        public bool fullscreen = true;
        public int colorblindMode = 0; // 0=none, 1=protanopia, 2=deuteranopia
        
        public string ToJson() => JsonUtility.ToJson(this);
        public static GameSettings FromJson(string json) => 
            JsonUtility.FromJson<GameSettings>(json);
    }
    
    public class SettingsManager : MonoBehaviour
    {
        public void SaveSettings() { /* Write to PlayerPrefs or file */ }
        public void LoadSettings() { /* Read from storage */ }
        public void ApplySettings() { /* Apply to game */ }
    }
}
```

---

# PHASE 16: Performance, Optimization, and QA

## Overview

Optimize to meet 60 FPS target and conduct thorough testing.

## Optimization Tasks

1. **Object Pooling** - Torpedoes, explosions, particles
2. **Culling** - Frustum culling for off-screen objects
3. **LOD System** - Level of detail for distant enemies
4. **Reduce GC** - Minimize allocations in Update loops
5. **Job System** - Parallelize enemy AI updates (optional)
6. **Profiling** - Unity Profiler analysis

## Testing Checklist

### Automated Tests
- [ ] Unit tests for all systems (80%+ coverage)
- [ ] Integration tests for gameplay loops
- [ ] Performance benchmarks (60 FPS minimum)

### Manual Playthroughs
- [ ] Novice difficulty - complete mission
- [ ] Pilot difficulty - complete mission
- [ ] Warrior difficulty - complete mission
- [ ] Commander difficulty - complete mission
- [ ] Test all 8 screens
- [ ] Test all PESCLR damage states
- [ ] Test hyperspace (auto and manual)
- [ ] Test starbase docking
- [ ] Test enemy AI behaviors
- [ ] Verify all 20 ranks achievable

## Performance Targets

- **Frame Rate:** 60 FPS (minimum 30 FPS)
- **Load Time:** < 3 seconds
- **Memory:** < 512MB RAM
- **Input Latency:** < 16ms

---

# PHASE 17: Packaging & Release

## Overview

Create build pipeline and prepare for distribution.

## Build Configuration

### Unity Build Settings

1. **Scenes in Build:**
   - Bootstrap
   - Title
   - GamePlay
   
2. **Player Settings:**
   - Company Name
   - Product Name
   - Version (e.g., 1.0.0)
   - Icon and splash screen
   
3. **Target Platforms:**
   - Windows (x64)
   - macOS (Intel + Apple Silicon)
   - Linux

### Build Script Stub

**Location:** `Assets/Editor/BuildScript.cs`

```csharp
using UnityEditor;
using UnityEngine;

public class BuildScript
{
    [MenuItem("Build/Build All Platforms")]
    public static void BuildAll()
    {
        BuildWindows();
        BuildMac();
        BuildLinux();
    }
    
    static void BuildWindows()
    {
        BuildPipeline.BuildPlayer(GetScenes(), 
            "Builds/Windows/StarRaiders.exe", 
            BuildTarget.StandaloneWindows64, 
            BuildOptions.None);
    }
    
    static void BuildMac()
    {
        BuildPipeline.BuildPlayer(GetScenes(), 
            "Builds/Mac/StarRaiders.app", 
            BuildTarget.StandaloneOSX, 
            BuildOptions.None);
    }
    
    static void BuildLinux()
    {
        BuildPipeline.BuildPlayer(GetScenes(), 
            "Builds/Linux/StarRaiders.x86_64", 
            BuildTarget.StandaloneLinux64, 
            BuildOptions.None);
    }
    
    static string[] GetScenes()
    {
        return new string[] 
        {
            "Assets/Scenes/Bootstrap.unity",
            "Assets/Scenes/Title.unity",
            "Assets/Scenes/GamePlay.unity"
        };
    }
}
```

## Release Checklist

### Pre-Release
- [ ] All 18 phases completed
- [ ] All automated tests passing
- [ ] Manual playthrough on all difficulties
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] README updated with instructions
- [ ] LICENSE file included
- [ ] Credits added

### Build Verification
- [ ] Windows build tested
- [ ] macOS build tested (Intel & Apple Silicon)
- [ ] Linux build tested
- [ ] All controls working
- [ ] Save/load functional
- [ ] Audio playing correctly
- [ ] No missing assets

### Distribution
- [ ] Create release notes
- [ ] Package builds (ZIP/DMG)
- [ ] Upload to distribution platform
- [ ] Update repository README
- [ ] Tag release version in Git

## Final README Update

Add to README.md:

```markdown
## Installation

### Windows
1. Download `StarRaiders_Windows.zip`
2. Extract to desired location
3. Run `StarRaiders.exe`

### macOS
1. Download `StarRaiders_Mac.dmg`
2. Open DMG and drag to Applications
3. Run Star Raiders from Applications
4. If security warning appears, go to System Preferences → Security & Privacy

### Linux
1. Download `StarRaiders_Linux.tar.gz`
2. Extract: `tar -xzf StarRaiders_Linux.tar.gz`
3. Make executable: `chmod +x StarRaiders.x86_64`
4. Run: `./StarRaiders.x86_64`

## Controls

See QUICKSTART_DEVELOPER_GUIDE.md Section 2 for complete control listing.

## System Requirements

**Minimum:**
- OS: Windows 10, macOS 10.15, Ubuntu 20.04
- Processor: 2.0 GHz dual-core
- Memory: 512 MB RAM
- Graphics: OpenGL 3.3+ support
- Storage: 100 MB available space

**Recommended:**
- OS: Windows 11, macOS 12, Ubuntu 22.04
- Processor: 3.0 GHz quad-core
- Memory: 1 GB RAM
- Graphics: Dedicated GPU with OpenGL 4.5+ support
- Storage: 200 MB available space

## Known Issues

(List any known bugs or limitations)

## Credits

Based on the original Star Raiders (1980) by Doug Neubauer for Atari 400/800.

Development team and tools used in recreation.
```

---

# Implementation Summary

## Phases Overview

### Foundation (Phases 0-5)
✅ Context, Unity setup, game loop, input, galaxy, rendering

### Core Gameplay (Phases 6-9)
✅ Navigation, hyperspace, combat, PESCLR damage

### AI & Systems (Phases 10-11)
📝 Enemy AI, starbases, resources

### Polish (Phases 12-15)
📝 UI screens, audio, scoring, settings

### Release (Phases 16-17)
📝 Optimization, testing, packaging, distribution

## Total Deliverables

- **8 Game Screens** - All screens implemented
- **4 Difficulty Levels** - Fully balanced
- **3 Enemy Types** - With AI behaviors
- **6 PESCLR Systems** - Complete damage model
- **16×16 Galaxy** - Dynamic enemy movement
- **20 Ranking Tiers** - Scoring system
- **10 Speed Levels** - Ship physics
- **Complete Controls** - 15+ actions
- **Audio System** - SFX and music
- **Save/Load** - State persistence
- **Settings** - Customization options
- **Tests** - 80%+ coverage

## When Unity Environment Available

1. Execute Phase 1 setup
2. Proceed through phases sequentially (2→17)
3. Test after each phase
4. Update documentation with learnings
5. Commit working code incrementally
6. Mark phases as ✅ COMPLETED in PROJECTPLAN.md

---

**Phases 10-17 Status:** 📝 DOCUMENTED  
**Overall Project Status:** 18 of 18 phases documented, ready for Unity implementation
