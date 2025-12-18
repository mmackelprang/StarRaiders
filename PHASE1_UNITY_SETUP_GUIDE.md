# Phase 1 - Unity Project Setup Guide

**Status:** ⚠️ REQUIRES UNITY INSTALLATION  
**Date:** December 17, 2025

## Prerequisites

- Unity Hub installed
- Unity 2022.3 LTS or newer installed via Unity Hub
- Git configured for Unity projects
- Visual Studio or Rider (recommended IDE)

## Step-by-Step Setup Instructions

### 1. Create New Unity Project

1. Open Unity Hub
2. Click "New Project"
3. Select Unity version: **2022.3 LTS** (or latest LTS)
4. Select template: **3D (URP)** - Universal Render Pipeline
5. Project name: **StarRaiders**
6. Location: Current repository root
7. Click "Create Project"

### 2. Install Required Packages

Open Unity Package Manager (Window → Package Manager):

#### Input System
1. Select "Unity Registry" from dropdown
2. Find "Input System"
3. Click "Install"
4. When prompted, click "Yes" to enable new Input System backend

#### TextMeshPro
1. In Package Manager, find "TextMesh Pro"
2. Click "Install"
3. Import TMP Essential Resources when prompted

### 3. Configure Project Settings

#### Quality Settings
- Edit → Project Settings → Quality
- Set default quality level
- Target frame rate: 60 FPS
- V-Sync: Disabled (to allow manual FPS targeting)

#### Player Settings
- Edit → Project Settings → Player
- Company Name: Star Raiders Team
- Product Name: Star Raiders
- Version: 0.1.0
- Default Icon: (to be added later)

#### Physics Settings
- Edit → Project Settings → Physics
- Configure collision layers:
  - Player
  - Enemy
  - Torpedo
  - Starbase
  - UI

#### Time Settings
- Edit → Project Settings → Time
- Fixed Timestep: 0.02 (50 Hz physics)
- Maximum Allowed Timestep: 0.1

### 4. Create Folder Structure

Create the following folders in the Assets directory:

```
Assets/
├── Scenes/
│   ├── Bootstrap.unity (main entry scene)
│   ├── Title.unity
│   ├── GamePlay.unity
│   └── _Testing/ (test scenes)
├── Scripts/
│   ├── Core/
│   │   ├── GameStateManager.cs
│   │   ├── AudioManager.cs
│   │   └── InputManager.cs
│   ├── Systems/
│   │   ├── Galaxy/
│   │   ├── Combat/
│   │   ├── Navigation/
│   │   ├── Energy/
│   │   └── PESCLR/
│   ├── Entities/
│   │   ├── Player/
│   │   ├── Enemies/
│   │   ├── Starbase/
│   │   └── Projectiles/
│   ├── UI/
│   │   ├── Screens/
│   │   ├── HUD/
│   │   └── Menus/
│   ├── AI/
│   ├── Utils/
│   └── Tests/
│       ├── EditMode/
│       └── PlayMode/
├── Prefabs/
│   ├── Enemies/
│   ├── UI/
│   ├── Effects/
│   └── Projectiles/
├── ScriptableObjects/
│   ├── Galaxy/
│   ├── Enemies/
│   ├── Difficulty/
│   └── Audio/
├── Audio/
│   ├── Music/
│   ├── SFX/
│   └── Mixers/
├── Materials/
│   ├── Space/
│   ├── Ships/
│   └── UI/
├── Textures/
├── Models/
├── Animations/
├── Particles/
└── Resources/
```

### 5. Configure Assembly Definitions

Create Assembly Definition files for better compilation times:

#### StarRaiders.Core.asmdef
Location: `Assets/Scripts/Core/`
```json
{
  "name": "StarRaiders.Core",
  "references": [],
  "includePlatforms": [],
  "excludePlatforms": [],
  "allowUnsafeCode": false,
  "overrideReferences": false,
  "precompiledReferences": [],
  "autoReferenced": true,
  "defineConstraints": [],
  "versionDefines": [],
  "noEngineReferences": false
}
```

#### StarRaiders.Systems.asmdef
Location: `Assets/Scripts/Systems/`
```json
{
  "name": "StarRaiders.Systems",
  "references": ["StarRaiders.Core"],
  "includePlatforms": [],
  "excludePlatforms": [],
  "allowUnsafeCode": false,
  "overrideReferences": false,
  "precompiledReferences": [],
  "autoReferenced": true,
  "defineConstraints": [],
  "versionDefines": [],
  "noEngineReferences": false
}
```

#### StarRaiders.Tests.asmdef
Location: `Assets/Scripts/Tests/`
```json
{
  "name": "StarRaiders.Tests",
  "references": [
    "StarRaiders.Core",
    "StarRaiders.Systems",
    "UnityEngine.TestRunner",
    "UnityEditor.TestRunner"
  ],
  "includePlatforms": [],
  "excludePlatforms": [],
  "allowUnsafeCode": false,
  "overrideReferences": true,
  "precompiledReferences": [
    "nunit.framework.dll"
  ],
  "autoReferenced": false,
  "defineConstraints": [
    "UNITY_INCLUDE_TESTS"
  ],
  "versionDefines": [],
  "noEngineReferences": false
}
```

### 6. Create Bootstrap Scene

1. Create new scene: `Assets/Scenes/Bootstrap.unity`
2. Add empty GameObject: "GameManagers"
3. Add child GameObjects:
   - GameStateManager
   - AudioManager
   - InputManager
4. Mark GameManagers as DontDestroyOnLoad

### 7. Create Core Manager Scripts

#### GameStateManager.cs
Location: `Assets/Scripts/Core/GameStateManager.cs`

Basic structure:
```csharp
using UnityEngine;
using System;

namespace StarRaiders.Core
{
    public enum GameState
    {
        Title,
        Playing,
        Paused,
        Hyperspace,
        GameOver
    }

    public class GameStateManager : MonoBehaviour
    {
        public static GameStateManager Instance { get; private set; }
        
        public GameState CurrentState { get; private set; }
        public event Action<GameState> OnStateChanged;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void ChangeState(GameState newState)
        {
            if (CurrentState == newState) return;
            
            CurrentState = newState;
            OnStateChanged?.Invoke(newState);
        }
    }
}
```

#### AudioManager.cs
Location: `Assets/Scripts/Core/AudioManager.cs`

Basic structure:
```csharp
using UnityEngine;

namespace StarRaiders.Core
{
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        // To be expanded in Phase 13
    }
}
```

#### InputManager.cs
Location: `Assets/Scripts/Core/InputManager.cs`

Basic structure:
```csharp
using UnityEngine;

namespace StarRaiders.Core
{
    public class InputManager : MonoBehaviour
    {
        public static InputManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        // To be expanded in Phase 3
    }
}
```

### 8. Configure .gitignore for Unity

Create/update `.gitignore` in repository root:

```
# Unity generated files
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/

# Visual Studio cache directory
.vs/

# Rider cache directory
.idea/

# Gradle cache directory (Android)
.gradle/

# Autogenerated VS/MD/Consulo solution and project files
ExportedObj/
.consulo/
*.csproj
*.unityproj
*.sln
*.suo
*.tmp
*.user
*.userprefs
*.pidb
*.booproj
*.svd
*.pdb
*.mdb
*.opendb
*.VC.db

# Unity3D generated meta files
*.pidb.meta
*.pdb.meta
*.mdb.meta

# Unity3D generated file on crash reports
sysinfo.txt

# Builds
*.apk
*.aab
*.unitypackage
*.app

# Crashlytics generated file
crashlytics-build.properties

# Packed Addressables
[Aa]ssets/[Aa]ddressable[Aa]ssets[Dd]ata/*/*.bin*

# Temporary auto-generated Android Assets
[Aa]ssets/[Ss]treamingAssets/aa.meta
[Aa]ssets/[Ss]treamingAssets/aa/*

# macOS
.DS_Store

# Documentation build artifacts
docs/_build/
```

### 9. Configure Build Settings

1. File → Build Settings
2. Add scenes in order:
   - Bootstrap
   - Title
   - GamePlay
3. Select platform: PC, Mac & Linux Standalone (default)
4. Click "Player Settings" to review configuration

### 10. Test Initial Setup

1. Open Bootstrap scene
2. Press Play
3. Verify no errors in Console
4. Verify GameManagers persist (check Hierarchy during Play mode)
5. Stop Play mode

### 11. Create Initial README Update

Add to README.md under "Development" section:

```markdown
## Development Setup

### Requirements
- Unity 2022.3 LTS or newer
- Visual Studio 2022 or JetBrains Rider
- Git

### Getting Started
1. Clone this repository
2. Open Unity Hub
3. Click "Add" and select the repository folder
4. Open the project in Unity
5. Load the Bootstrap scene from `Assets/Scenes/Bootstrap.unity`
6. Press Play to verify setup

### Project Structure
- `Assets/Scenes/` - Unity scenes
- `Assets/Scripts/` - C# scripts organized by feature
- `Assets/Prefabs/` - Reusable game objects
- `Assets/ScriptableObjects/` - Data assets
- See PHASE1_UNITY_SETUP_GUIDE.md for complete structure

### Running the Game
1. Open Bootstrap.unity scene
2. Press Play in Unity Editor
3. Current status: Phase 1 - Core setup complete
```

## Verification Checklist

- [ ] Unity 2022.3 LTS (or newer) project created with URP
- [ ] Input System package installed and configured
- [ ] TextMeshPro package installed
- [ ] Folder structure created as specified
- [ ] Assembly definitions created for Core, Systems, and Tests
- [ ] Bootstrap scene created with GameManagers
- [ ] GameStateManager, AudioManager, InputManager scripts created
- [ ] .gitignore configured for Unity
- [ ] Build settings configured
- [ ] Project runs without errors
- [ ] README updated with setup instructions
- [ ] Git commit created for Phase 1

## Next Steps

After Phase 1 is complete, proceed to:
- **Phase 2:** Core Game Loop & State Management
  - Expand GameStateManager with full state machine
  - Implement scene loading
  - Create pause handling
  - Add timer systems (centons)

## Common Issues and Solutions

### Issue: Input System backend warning
**Solution:** Go to Edit → Project Settings → Player → Other Settings → Active Input Handling, select "Input System Package (New)"

### Issue: TMP Essentials not imported
**Solution:** Window → TextMeshPro → Import TMP Essential Resources

### Issue: Assembly references not resolving
**Solution:** Assets → Reimport All, then restart Unity

### Issue: Scenes not loading in Build Settings
**Solution:** Drag scenes from Project window to Build Settings window

## Notes

- Phase 1 focuses on project infrastructure only
- No gameplay code is implemented in Phase 1
- All managers are stubs that will be expanded in later phases
- Performance profiling baseline should be established now (60 FPS in empty scene)

---

**Phase 1 Status:** ⚠️ AWAITING UNITY ENVIRONMENT
