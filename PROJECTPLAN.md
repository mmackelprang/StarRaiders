# PROJECTPLAN – Star Raiders (Unity, C#)

This plan breaks the Star Raiders clone into iterative phases sized for an AI coding assistant. Use Unity (C#) for all UI and gameplay systems. Always cross-reference the provided documents for fidelity: `README.md`, `Star_Raiders_PRD.md` (Sections noted per phase), `QUICKSTART_DEVELOPER_GUIDE.md`, `star_raiders_technical_notes.txt`, `star_raiders_visual_mockups.txt`, `star_raiders_visual_reference.txt`. (README references `TEAM_ROLES_AND_TASKS.md`, but it is not present in this repository; incorporate it only if added later.)

## Conventions
- Target: Unity 2022+ LTS, C# 10+, URP (or built-in pipeline if simpler). Use prefab-based UI, ScriptableObjects for data, and Input System package.
- Architecture: Scene bootstrap → persistent managers (GameState, Audio, Input), feature systems in separate assemblies/namespaces.
- Deliverables per phase: code, Unity assets, minimal tests (PlayMode/EditMode) when applicable, and updated documentation.
- Units: **metron** = distance, **centon** = time (100 centons ≈ 1 minute); use values from QUICKSTART Section 1.
- Definition of done (all phases): meets PRD requirements, runs in Editor, basic smoke test executed, notes in changelog/README section.

## Phase 0 – Repository & Context Intake ✅ COMPLETED
**Goal:** Ensure assistant uses canonical specs and assets.  
**Tasks:** Read all context docs; note key sections for later; confirm available visual assets (current `/images` folder is a placeholder).  
**Status:** ✅ Completed - See PHASE0_SUMMARY.md for full details  
**Deliverables:**
- Reviewed all 6 context documents (README, PRD, QUICKSTART, technical notes, visual mockups, visual reference)
- Created comprehensive summary covering constraints, 8 required screens, controls, PESCLR system, difficulty levels, enemy types, and performance targets
- Confirmed `/images` folder contains placeholder assets only
- Documented key measurements (metrons, centons) and game statistics

**AI Agent Prompt:**  
```
You are preparing to implement Star Raiders (Unity, C#). Read README.md, Star_Raiders_PRD.md (focus Sections 5-20 for gameplay/controls/audio and 21-27 for visuals/performance/architecture/testing), QUICKSTART_DEVELOPER_GUIDE.md, star_raiders_technical_notes.txt, star_raiders_visual_mockups.txt, star_raiders_visual_reference.txt. Note that `/images` currently contains only a placeholder. Produce a short summary of constraints, required screens (8), controls, PESCLR rules, and performance targets. Do not write code.
```

## Phase 1 – Unity Project Setup 📝 DOCUMENTED
**Goal:** Create baseline Unity project.  
**Tasks:** Initialize Unity URP project; configure source control ignores; add Input System, TextMeshPro; set base scene and folders (`Scripts`, `Prefabs`, `Scenes`, `ScriptableObjects`, `UI`, `Audio`, `Tests`).  
**Status:** 📝 Documented - See PHASE1_UNITY_SETUP_GUIDE.md for complete implementation guide  
**Note:** Requires Unity Editor environment (not available in current CI/CD environment)  
**Deliverables:**
- Comprehensive step-by-step setup guide created
- Folder structure defined (13 main directories)
- Assembly definition specifications documented
- Core manager scripts (GameStateManager, AudioManager, InputManager) templated
- .gitignore configuration for Unity projects
- Bootstrap scene structure defined
- README update instructions provided

**AI Agent Prompt:**  
```
Create a Unity 2022+ URP project for Star Raiders. Add Input System & TextMeshPro, set default quality to 60 FPS target, configure Assembly Definitions per feature folder, and create a Bootstrap scene with GameManagers (GameState, Audio, Input). Update README with run instructions if needed. Follow PRD Section 23 (Technical Architecture) and the QUICKSTART_DEVELOPER_GUIDE.md Performance Targets section.
```

## Phase 2 – Core Game Loop & State Management 📝 DOCUMENTED
**Goal:** Establish deterministic loop and state transitions.  
**Tasks:** Implement GameStateManager (Title, Playing, Paused, GameOver, Hyperspace), scene loading, pause handling, timers; hook to UI events.  
**Status:** 📝 Documented - See PHASE2_GAME_LOOP_GUIDE.md for complete implementation guide  
**Deliverables:**
- Expanded GameStateManager with full state machine (5 states)
- State transition validation logic
- CentonTimer system (100 centons ≈ 1 minute)
- Pause/Resume functionality with Time.timeScale management
- DebugStateDisplay UI for visualization
- EditMode tests with 10+ test cases
- Event system for state changes, pause, and hyperspace
- Scene loading integration

**AI Agent Prompt:**  
```
Implement GameStateManager in Unity per PRD Sections 6 and 23. States: Title, Playing, Paused, Hyperspace, GameOver. Provide events for state changes, pause/resume, hyperspace start/end. Add simple UI to display current state for smoke testing. Include EditMode tests for transitions.
```

## Phase 3 – Input & Controls Mapping
**Goal:** Modern input bindings matching classic controls.  
**Tasks:** Configure Unity Input System actions (movement, fire, shields, computer, view switches, speed 0-9, hyperspace, long-range scan). Support keyboard/gamepad; allow remapping.  
**AI Agent Prompt:**  
```
Define Input Actions asset using controls listed in QUICKSTART_DEVELOPER_GUIDE.md Feature Checklist/Controls and PRD Section 19 (Controls and Input). Map keys (0-9, F, A, G, L, H, T, S, Fire, Joystick/Arrows). Expose an InputController that raises events with normalized values. Include UI for remapping (optional toggle). Provide tests for action bindings (EditMode).
```

## Phase 4 – Galaxy Data Model & Persistence
**Goal:** Represent 16×16 galaxy with entities and serialization.  
**Tasks:** ScriptableObject for galaxy config; data structs for sectors, starbases, enemies; utilities for Manhattan distance and threats; seed-based initialization; save/load stubs.  
**AI Agent Prompt:**  
```
Create GalaxyModel (16×16 grid) per PRD Section 10 and QUICKSTART_DEVELOPER_GUIDE.md Game Statistics/Core Systems overview. Include sector types, player location, starbases, enemies. Implement distance calculations and threat detection (CheckStarbaseThreats noted in the Core Systems overview). Add JSON save/load placeholders. Provide EditMode tests for generation and threat rules.
```

## Phase 5 – Rendering Foundations & HUD Shell
**Goal:** Build camera rig, starfield, and HUD scaffolding.  
**Tasks:** Set up cockpit camera with URP, starfield particle system, UI canvas with HUD placeholders (energy, system status, crosshair, speed). Use colors/layout from visual mockups/reference.  
**AI Agent Prompt:**  
```
Implement rendering baseline: cockpit camera, starfield particle effect, and HUD shell (energy meter, PESCLR indicators, crosshair, speed). Follow star_raiders_visual_mockups.txt and star_raiders_visual_reference.txt for layout/colors. Use Unity UI prefabs and TextMeshPro. No gameplay logic yet; just visual placeholders for integration.
```

## Phase 6 – Navigation & Ship Physics
**Goal:** Player ship movement and inertia.  
**Tasks:** Implement ship controller with acceleration, velocity capped per speed level, orientation, braking; integrate energy consumption hooks. Support Fore/Aft view switching and basic collision bounds.  
**AI Agent Prompt:**  
```
Build ShipController for player movement per PRD Sections 10 & 15 and technical_notes Sections 10 & 13. Implement speed levels 0-9, acceleration curves, inertial damping, and view switching (Fore/Aft). Emit events for position/velocity to other systems. Add PlayMode test covering speed ramp and view toggles.
```

## Phase 7 – Hyperspace System
**Goal:** Sector-to-sector travel with manual/auto modes.  
**Tasks:** Implement hyperspace charge, course plotting, manual alignment (Commander/Warrior), energy cost multipliers, jump animation, failure cases, and arrival positioning.  
**AI Agent Prompt:**  
```
Implement HyperspaceController per PRD Section 15 and QUICKSTART difficulty table. Support auto (Novice/Pilot) and manual (Warrior/Commander) alignment. Include energy cost = 100 × distance × difficulty multiplier, jump timer, cancel flow, and arrival placement in destination sector. Connect to GameStateManager. Add PlayMode test for cost calculation and state transitions.
```

## Phase 8 – Combat & Weapons
**Goal:** Photon torpedo firing, lock indicators, hit detection.  
**Tasks:** Torpedo projectiles, lock status (horizontal/vertical/range), optimal range checks, damage application stubs, muzzle flash/sound hooks.  
**AI Agent Prompt:**  
```
Create CombatSystem per PRD Section 12 and technical_notes Section 7. Implement FireTorpedo, lock indicator calculations, hit detection with colliders or raycasts, and optimal range checks (30-70 metrons). Provide damage events for PESCLR. Add PlayMode tests for lock logic and projectile lifetime.
```

## Phase 9 – PESCLR Damage System
**Goal:** Ship systems damage states and HUD integration.  
**Tasks:** Manage states (Operational/Damaged/Destroyed) for P,E,S,C,L,R; degradation impacts on subsystems (e.g., shields absorb less, computer accuracy drop); repair at starbase; HUD indicator updates.  
**AI Agent Prompt:**  
```
Implement PesclrSystem per PRD Section 11 and QUICKSTART Section 6. Track states and effects on subsystems (e.g., Shield efficiency, Computer lock accuracy, Engines speed cap). Add RepairAllSystems at starbase. Update HUD indicators. Provide EditMode tests for state transitions and effect calculations.
```

## Phase 10 – Enemy AI & Galaxy Activity
**Goal:** Enemy spawning, movement, and behaviors.  
**Tasks:** Implement AI behaviors for Fighters, Cruisers, Basestars (movement, attack, evasion), group coordination, starbase attack countdown (100-centon), difficulty scaling. Update galaxy map in real time.  
**AI Agent Prompt:**  
```
Develop EnemyAI per PRD Section 13 and technical_notes Sections 5-6. Include per-type behaviors, group coordination, starbase targeting with 100-centon countdowns, and difficulty multipliers (speed, aggression). Integrate with GalaxyModel updates. Add PlayMode simulations verifying countdown triggers and basic pursuit.
```

## Phase 11 – Starbase & Resource Systems
**Goal:** Refuel/repair loop and starbase defense.  
**Tasks:** Implement docking/refuel flows, repair of PESCLR, energy restore, invulnerability windows, starbase destruction states, scoring/penalties.  
**AI Agent Prompt:**  
```
Implement StarbaseSystem per PRD Section 14 and energy rules in Section 16. Support docking interactions, full refuel, RepairAllSystems, and starbase destruction consequences. Tie into galaxy threats and scoring. Add PlayMode test for docking/refuel cycle.
```

## Phase 12 – UI Screens & Flows
**Goal:** Complete 8 screens with navigation.  
**Tasks:** Title with difficulty selection; Galactic Chart overlay; Fore/Aft view; Long-Range Scan; Hyperspace view; Game Over; Ranking. Use visual mockups and `/images`.  
**AI Agent Prompt:**  
```
Build UI screens per PRD Sections 8-9 and star_raiders_visual_mockups.txt. Implement Title (difficulty selection), Galactic Chart overlay (G), Fore/Aft cockpits, Long-Range Scan (L), Hyperspace view (H), Game Over, Ranking screen with 20 titles. Wire key bindings and GameStateManager transitions. Keep visual fidelity to star_raiders_visual_reference.txt palettes.
```

## Phase 13 – Audio System
**Goal:** Integrate SFX/music tied to gameplay.  
**Tasks:** Audio manager, engine hum by velocity, torpedo fire, explosions, shield toggle, hyperspace, alerts, UI sounds; volume/mix settings.  
**AI Agent Prompt:**  
```
Implement AudioSystem per technical_notes "Audio System Architecture" section and PRD Section 20. Add audio events for engine (speed-based pitch), torpedo, explosions, shields, hyperspace, alert tones, and UI clicks. Provide mixer groups and volume controls. Smoke test with simple audio clips.
```

## Phase 14 – Scoring, Ranking, and Session Flow
**Goal:** Full scoring and rank calculation.  
**Tasks:** Implement scoring per PRD Section 18, ranking table (20 tiers), mission end evaluation, difficulty modifiers, and persistence for last rank.  
**AI Agent Prompt:**  
```
Implement ScoringAndRanking per PRD Section 18. Apply score rules for enemy kills, starbase losses, energy use, and time. Compute rank across 20 tiers and display on Ranking screen. Add EditMode tests for rank thresholds and difficulty modifiers.
```

## Phase 15 – Save/Load, Settings, Accessibility
**Goal:** Modern quality-of-life features.  
**Tasks:** Save/load slots (JSON), remapping persistence, graphics/audio settings, colorblind modes, resolution scaling, window/fullscreen toggle.  
**AI Agent Prompt:**  
```
Add SaveLoadSystem and Settings per PRD Sections 24 and modernizations in README FAQ. Persist control bindings, difficulty, video/audio settings, and accessibility toggles (colorblind palettes, scaling). Provide simple settings UI and basic serialization tests.
```

## Phase 16 – Performance, Optimization, and QA
**Goal:** Meet 60 FPS and stability targets.  
**Tasks:** Profiling pass, pooling for projectiles/particles, culling, job system where needed; finalize automated tests per QUICKSTART Section 7; regression checklist.  
**AI Agent Prompt:**  
```
Optimize and harden the project to meet performance targets (PRD Section 22, QUICKSTART Section 9). Add pooling for torpedoes/explosions, reduce GC, and implement automated tests from QUICKSTART Section 7 (unit + integration smoke). Deliver profiling report and bugfixes for critical issues.
```

## Phase 17 – Packaging & Release
**Goal:** Ship-ready builds and documentation.  
**Tasks:** Create build pipeline (Desktop default), produce README updates for running the game, include LICENSE/credits, final verification checklist.  
**AI Agent Prompt:**  
```
Set up build pipeline for desktop (Windows/macOS/Linux) in Unity CI or local. Verify all 8 screens, difficulties, and PESCLR behavior. Update README with run instructions and controls. Prepare final build artifacts and release notes summarizing scope and known issues.
```
