# Star Raiders - Product Requirements Document
## Full-Featured Clone Specification

**Version:** 1.0  
**Date:** December 17, 2025  
**Status:** Final Specification  
**Project:** Star Raiders Recreation

---

## Document Control

| Role | Name | Approval |
|------|------|----------|
| Product Owner | Mark Mackelprang | ☐ |
| Lead Developer | Mark Mackelprang | ☐ |
| Technical Lead | Mark Mackelprang | ☐ |
| QA Lead | [TBD] | ☐ |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Audience](#3-target-audience)
4. [Scope and Objectives](#4-scope-and-objectives)
5. [Game Overview](#5-game-overview)
6. [Core Gameplay Loop](#6-core-gameplay-loop)
7. [Difficulty Levels](#7-difficulty-levels)
8. [Game Screens and Views](#8-game-screens-and-views)
9. [User Interface Specifications](#9-user-interface-specifications)
10. [Galaxy and Sector System](#10-galaxy-and-sector-system)
11. [Ship Systems (PESCLR)](#11-ship-systems-pesclr)
12. [Combat System](#12-combat-system)
13. [Enemy Types and Behaviors](#13-enemy-types-and-behaviors)
14. [Starbase System](#14-starbase-system)
15. [Navigation and Hyperspace](#15-navigation-and-hyperspace)
16. [Energy Management](#16-energy-management)
17. [Damage and Repair Mechanics](#17-damage-and-repair-mechanics)
18. [Ranking and Scoring System](#18-ranking-and-scoring-system)
19. [Controls and Input](#19-controls-and-input)
20. [Audio Design](#20-audio-design)
21. [Visual Design](#21-visual-design)
22. [Performance Requirements](#22-performance-requirements)
23. [Technical Architecture](#23-technical-architecture)
24. [Platform Requirements](#24-platform-requirements)
25. [Development Phases](#25-development-phases)
26. [Testing Strategy](#26-testing-strategy)
27. [Success Criteria](#27-success-criteria)
28. [Risk Analysis](#28-risk-analysis)

---

## 1. Executive Summary

### 1.1 Project Purpose
Create a full-featured, faithful recreation of the classic Atari 800 game **Star Raiders** (1980) by Doug Neubauer. This project aims to preserve all original gameplay mechanics, features, and strategic depth while modernizing the technical implementation for contemporary platforms.

### 1.2 Key Deliverables
- Complete game with all original features
- 4 difficulty levels with authentic scaling
- 256-sector galaxy system
- 3 enemy types with group AI
- PESCLR damage system (6 ship components)
- 20-rank progression system
- 8 functional game screens
- Modern platform support

### 1.3 Project Constraints
- **Timeline:** 13 weeks (3 months)
- **Team Size:** 5 people (1 lead, 2 programmers, 1 audio, 1 designer/QA)
- **Budget:** [To be determined by implementation team]
- **Scope:** Single-player only (multiplayer is future enhancement)

### 1.4 Success Definition
Success is measured by **100% feature parity** with the original game, authentic gameplay feel, and ability to complete missions on all difficulty levels with proper rank calculations.

---

## 2. Product Vision

### 2.1 Vision Statement
"To create a pixel-perfect behavioral clone of Star Raiders that honors the original's innovative gameplay while making it accessible to modern audiences."

### 2.2 Core Principles
1. **Authenticity First** - All mechanics must match original behavior
2. **Strategic Depth** - Preserve the original's balance of action and strategy
3. **Accessibility** - Optional modern enhancements without compromising gameplay
4. **Performance** - Smooth 60 FPS on target platforms
5. **Respect Legacy** - Honor Doug Neubauer's groundbreaking design

### 2.3 What Makes Star Raiders Special
- **First-person space combat** (1980 innovation)
- **Strategic galaxy management** blended with real-time action
- **Resource management** (energy, time, equipment damage)
- **Dynamic enemy AI** that coordinates attacks on starbases
- **Risk/reward decisions** in every hyperspace jump
- **Skill-based progression** with authentic difficulty curve

---

## 3. Target Audience

### 3.1 Primary Audience
- **Retro gaming enthusiasts** (Age 35-60)
- **Classic Atari fans** seeking authentic experience
- **Preservation community** interested in gaming history

### 3.2 Secondary Audience
- **New players** discovering classic gameplay
- **Strategy game fans** appreciating resource management
- **Speedrunners** optimizing rank achievements

### 3.3 User Personas

**Persona 1: "The Nostalgist"**
- Age: 45-55
- Played original on Atari 800 in 1980s
- Wants authentic experience with muscle memory intact
- Values: Accuracy, original feel, proper difficulty scaling

**Persona 2: "The Preservationist"**
- Age: 30-45
- Studies gaming history
- Wants to experience influential titles authentically
- Values: Historical accuracy, complete feature set

**Persona 3: "The Modern Gamer"**
- Age: 20-35
- Curious about classic games
- Needs accessible controls and quality-of-life features
- Values: Clear tutorials, modern conveniences

---

## 4. Scope and Objectives

### 4.1 In Scope
✅ All original game features and mechanics  
✅ 4 difficulty levels (Novice, Pilot, Warrior, Commander)  
✅ Complete PESCLR damage system  
✅ 3 enemy types with authentic AI  
✅ 256-sector galaxy  
✅ Hyperspace navigation  
✅ Starbase defense mechanics  
✅ 20-rank scoring system  
✅ All 8 game screens  
✅ Original audio style  
✅ Authentic visual design  
✅ Modern platform support  
✅ Configurable controls  
✅ Save/load functionality (modernization)  

### 4.2 Out of Scope
❌ Multiplayer modes  
❌ New game modes beyond original  
❌ Graphical enhancements beyond resolution scaling  
❌ Additional enemy types  
❌ Modified gameplay mechanics  
❌ Online leaderboards (future enhancement)  
❌ VR support  
❌ Campaign/story mode beyond original structure  

### 4.3 Objectives

**Primary Objectives:**
1. Achieve 100% feature parity with original game
2. Maintain authentic difficulty curve and balance
3. Deliver smooth 60 FPS performance
4. Support modern platforms (Windows, Mac, Linux, Web)

**Secondary Objectives:**
1. Implement optional QoL improvements without altering gameplay
2. Provide accessibility options (colorblind modes, rebindable keys)
3. Create comprehensive documentation
4. Establish testing framework for ongoing maintenance

---

## 5. Game Overview

### 5.1 Game Summary
Star Raiders is a first-person space combat and strategy game where the player commands a starship defending the galaxy from invading Zylon forces. The game combines real-time action combat with strategic resource management across a 16×16 sector galaxy.

### 5.2 Core Concept
Players must **destroy all enemy ships** before they destroy all friendly starbases, while managing:
- **Energy** (limited resource for all actions)
- **Ship damage** (6 systems that degrade during combat)
- **Time** (enemies continuously attack starbases)
- **Positioning** (strategic hyperspace navigation)

### 5.3 Win/Loss Conditions

**Victory:**
- Destroy all Zylon ships in the galaxy
- At least one starbase remains operational
- Player ship survives

**Defeat:**
- All starbases destroyed
- Player ship destroyed
- Energy depleted to zero

### 5.4 Game Flow
- Title Screen → Difficulty Selection → Mission Start
- ↓
- Galactic Chart (Strategic View)
- ↓
- Select Destination → Hyperspace Travel
- ↓
- Sector Arrival (Combat View)
- ↓
- Combat / Avoid / Scan → Repeat
- ↓
- Victory or Defeat → Ranking Screen

---

## 6. Core Gameplay Loop

### 6.1 Moment-to-Moment Gameplay

**Strategic Phase (Galactic Chart):**
1. Survey galaxy for enemy positions
2. Identify threatened starbases
3. Plan hyperspace route
4. Check ship status (PESCLR)
5. Select destination sector

**Travel Phase (Hyperspace):**
1. Engage hyperspace (H key)
2. Navigate crosshairs (Warrior/Commander difficulty)
3. Arrive in target sector

**Combat Phase (Fore/Aft View):**
1. Assess threats (Long-Range Scan)
2. Activate shields
3. Enable attack computer
4. Engage enemies with photon torpedoes
5. Manage energy consumption
6. Monitor damage systems
7. Escape via hyperspace or clear sector

**Maintenance Phase:**
1. Dock at starbase when damaged
2. Repair all systems (PESCLR)
3. Refuel energy
4. Return to strategic planning

### 6.2 Decision Points

**Every Turn:**
- Which sector to visit next?
- Engage enemies or avoid?
- When to activate shields?
- When to retreat to starbase?

**Strategic:**
- Prioritize starbase defense vs. enemy elimination?
- Risk low energy for faster travel?
- Accept damage to save time?

### 6.3 Skill Development
- **Novice:** Learn controls, basic combat
- **Pilot:** Energy management, strategic routing
- **Warrior:** Damage mitigation, hyperspace piloting
- **Commander:** Perfect optimization, risk calculation

---

## 7. Difficulty Levels

### 7.1 Overview
Four difficulty levels provide escalating challenge through enemy behavior, damage mechanics, and hyperspace complexity.

### 7.2 Novice Level

**Characteristics:**
- Fewest enemy ships (starting positions)
- Shields prevent all damage
- Automatic hyperspace navigation
- Slower enemy movement
- Enemies attack individually

**Ideal For:** Learning controls and basic mechanics

**Enemy Count:** ~10-12 ships total  
**Starbase Count:** 4  
**Energy Multiplier:** 1.0×  

### 7.3 Pilot Level

**Characteristics:**
- Moderate enemy count
- Shields reduce but don't prevent damage
- Automatic hyperspace navigation
- Moderate enemy speed
- Enemies begin coordinating

**Ideal For:** Practicing energy management and routing

**Enemy Count:** ~15-18 ships total  
**Starbase Count:** 3-4  
**Energy Multiplier:** 1.2×  

### 7.4 Warrior Level

**Characteristics:**
- High enemy count
- Shields significantly reduce damage
- **Manual hyperspace navigation required**
- Fast enemy movement
- Coordinated enemy attacks
- Enemies prioritize starbase assaults

**Ideal For:** Experienced players seeking challenge

**Enemy Count:** ~20-24 ships total  
**Starbase Count:** 2-3  
**Energy Multiplier:** 1.5×  

### 7.5 Commander Level

**Characteristics:**
- Maximum enemy count
- Shields minimally reduce damage
- **Manual hyperspace navigation required**
- Fastest enemy movement
- Highly coordinated enemy behavior
- Aggressive starbase targeting
- Required for highest ranks

**Ideal For:** Mastery and score optimization

**Enemy Count:** ~25-30 ships total  
**Starbase Count:** 2  
**Energy Multiplier:** 2.0×  

### 7.6 Difficulty Scaling Parameters

| Parameter | Novice | Pilot | Warrior | Commander |
|-----------|--------|-------|---------|-----------|
| Enemy Speed | 0.5× | 0.75× | 1.0× | 1.25× |
| Damage Taken | 0× | 0.5× | 0.75× | 1.0× |
| Energy Cost | 1.0× | 1.2× | 1.5× | 2.0× |
| Hyperspace | Auto | Auto | Manual | Manual |
| AI Aggression | Low | Medium | High | Maximum |
| Group Behavior | None | Basic | Advanced | Expert |

---

## 8. Game Screens and Views

### 8.1 Screen Overview
Star Raiders features **8 distinct screens**:

1. **Title Screen** - Difficulty selection
2. **Galactic Chart** - Strategic overview
3. **Fore View** - Forward combat view
4. **Aft View** - Rear combat view
5. **Long-Range Scan** - Local sector scan
6. **Hyperspace View** - Travel sequence
7. **Game Over Screen** - Mission end
8. **Ranking Screen** - Performance evaluation

### 8.2 Title Screen

**Elements:**
- Game title ("STAR RAIDERS")
- Difficulty selector (Novice/Pilot/Warrior/Commander)
- Start game prompt
- Optional: Credits, settings access

**Controls:**
- Arrow keys or joystick: Select difficulty
- Fire button/Enter: Begin mission
- ESC: Settings (optional modernization)

**Behavior:**
- Animated starfield background
- Cycling difficulty highlight
- Sound confirmation on selection

### 8.3 Galactic Chart (Key G)

**Purpose:** Strategic overview of galaxy state

**Visual Elements:**
- 16×16 grid representing 256 sectors
- Player position (highlighted cursor)
- Starbases (blue squares)
- Enemy squadrons (red clusters)
- Empty sectors (black/dark)
- Cursor for hyperspace targeting

**HUD Overlay:**
- Current sector coordinates
- PESCLR damage status (bottom right)
- Energy level
- Kills count
- Time elapsed (centons)

**Controls:**
- Joystick/Arrow keys: Move target cursor
- H: Engage hyperspace to cursor position
- F: Return to fore view

**Behavior:**
- Real-time enemy movement (slow animation)
- Flashing alerts for surrounded starbases
- Starbase destruction animations

### 8.4 Fore View (Key F)

**Purpose:** Main combat view looking forward

**Visual Elements:**
- First-person 3D space view
- Enemy ships (3D vectors)
- Starfield (scrolling stars)
- Photon torpedo trails
- Shield effects (when active)
- Explosions and debris

**HUD Elements:**
- Top Left: Top Right:
  - V: 12 (Velocity) K: 05 (Kills)
  - E: 2840 (Energy) T: F (Tracking: Fighter)
- Center:
  - ○ Horizontal position indicator
  - ○ Vertical position indicator
  - R: 50 (Range to target)
- Bottom:
  - Photon lock indicators (⊕ horizontal, ⊕ vertical, ⊕ range)

**Controls:**
- Joystick: Aim ship (pitch/yaw)
- Fire button: Photon torpedoes
- 0-9 keys: Set velocity
- G: Galactic Chart
- A: Aft view
- L: Long-range scan
- H: Hyperspace
- T: Toggle tracking computer
- S: Toggle shields

### 8.5 Aft View (Key A)

**Purpose:** Rear-facing combat view

**Identical to Fore View except:**
- Shows space behind ship
- Used for checking pursuers
- Photon torpedoes fire backward
- Tracking indicator shows "R" (Rear) instead of "F" (Front)

**Strategic Use:**
- Escape while fighting
- Monitor threats during retreat
- Defend against pursuing enemies

### 8.6 Long-Range Scan (Key L)

**Purpose:** Tactical view of current sector

**Visual Elements:**
- Top-down 2D view of local sector
- Player ship (center, triangle icon)
- Enemy ships (small dots/triangles)
- Distance indicators
- Directional markers

**Display Information:**
- Range circles showing distance
- Enemy positions relative to player
- Number of enemies in sector
- Empty space indicators

**Strategic Use:**
- Assess combat situation before engagement
- Locate enemies not in visual range
- Plan tactical approach
- Determine if sector is clear

**Damage Effects:**
- When Long-Range (L) system damaged: False echoes appear
- Yellow damage: Occasional ghost contacts
- Red damage: System non-functional

### 8.7 Hyperspace View (Key H)

**Purpose:** Travel between sectors

**Visual Elements (Novice/Pilot):**
- Animated starfield streaming effect
- Progress indicator
- Destination sector coordinates
- Travel time counter

**Visual Elements (Warrior/Commander):**
- Crosshair reticle (must be centered)
- Turbulence effects
- Drift indicators (ship veers if not corrected)
- Warp tunnel effects

**Behavior:**
- Energy depletes during travel
- Longer distances = more energy
- Manual piloting required at higher difficulties
- Arrival triggers sector load

**Controls (Warrior/Commander):**
- Joystick/Arrows: Correct drift, keep crosshair centered
- Failure to correct: Arrive off-target in random sector

### 8.8 Game Over Screen

**Displayed When:**
- All starbases destroyed
- Player ship destroyed
- Mission completed (all enemies destroyed)

**Elements:**
- Mission status ("MISSION COMPLETE" or "MISSION FAILED")
- Statistics summary
- Transition to Ranking Screen
- Restart prompt

### 8.9 Ranking Screen

**Purpose:** Evaluate player performance

**Displayed Information:**
1. **Mission Parameters:**
   - Difficulty level played
   - Starting enemy count
   - Starting starbase count

2. **Performance Metrics:**
   - Enemies destroyed (Kill count)
   - Energy used
   - Time taken (centons)
   - Starbases remaining
   - Damage taken

3. **Score Calculation:**
   - Point total (0-303+)
   - Rank achieved (see Section 18)
   - Class level (1-4 for higher ranks)

4. **Rank Title Display:**
   - Large text showing rank name
   - Example: "STAR COMMANDER - CLASS 4"
   - Humorous low ranks: "GARBAGE SCOW CAPTAIN", "GALACTIC COOK"

**Controls:**
- Fire button/Enter: Return to title screen
- ESC: Quit game

---

## 9. User Interface Specifications

### 9.1 HUD Design Principles

**Consistency:**
- All views share common HUD elements (V, E, K, T)
- Color coding: Blue (good), Yellow (damaged), Red (critical)
- Monospace font for readability

**Information Hierarchy:**
1. Critical: Energy, Velocity, Shields status
2. Important: Kills, Tracking target, Range
3. Contextual: Position indicators, lock indicators

### 9.2 Color Palette

**Primary Colors:**
- Background: #000000 (Black space)
- HUD Text: #00FF00 (Green - readable)
- Enemies: #FF0000 (Red)
- Starbases: #0000FF (Blue)
- Player Elements: #FFFFFF (White)
- Warning: #FFFF00 (Yellow)
- Critical: #FF0000 (Red)

**System Status Colors:**
- Operational: #00FFFF (Cyan/Blue)
- Damaged: #FFFF00 (Yellow)
- Destroyed: #FF0000 (Red)

### 9.3 Typography

**Font Style:**
- Monospace/fixed-width font (Atari-style)
- Clear, high-contrast lettering
- Minimum size: 12pt equivalent at 1080p

**Text Elements:**
- Labels: Uppercase (V:, E:, K:, T:)
- Values: Numbers and single letters
- Messages: Title case with impact

### 9.4 Visual Feedback

**Immediate Feedback:**
- Torpedo fire: Bright flash and projectile trail
- Hit confirmed: Explosion effect with debris
- Damage taken: Screen shake, red flash
- Shield activation: Shimmer effect around edges
- Energy depletion: Pulsing/flashing E value

**State Indicators:**
- Shields active: Border glow effect
- Attack computer on: Enhanced targeting reticle
- System damage: Flashing red text in PESCLR display
- Low energy: Flashing E value when < 500

### 9.5 Accessibility Considerations

**Colorblind Modes:**
- Deuteranopia: Adjust red/green to blue/orange
- Protanopia: Similar red/green adjustment
- Tritanopia: Adjust blue/yellow to red/cyan

**Display Options:**
- High contrast mode
- Adjustable HUD scale (80%, 100%, 120%)
- Optional larger fonts
- Screen reader support for menus

### 9.6 Responsive Layout

**Base Resolution:** 1920×1080 (16:9)

**Supported Resolutions:**
- 1280×720 (HD)
- 1920×1080 (Full HD)
- 2560×1440 (2K)
- 3840×2160 (4K)

**Scaling Behavior:**
- HUD elements scale proportionally
- 3D view maintains aspect ratio
- Text remains readable at all resolutions

---

## 10. Galaxy and Sector System

### 10.1 Galaxy Structure

**Size:** 16×16 grid = 256 sectors total

**Coordinate System:**
- X-axis: 0-15 (horizontal)
- Y-axis: 0-15 (vertical)
- Display format: "X,Y" (e.g., "7,12")

**Sector Types:**
1. **Empty Sectors:** No objects (most common)
2. **Starbase Sectors:** Contains friendly starbase
3. **Enemy Sectors:** Contains Zylon squadron (1-3 ships)
4. **Player Sector:** Current player location

### 10.2 Initial Galaxy Generation

**Starbase Placement:**
- Novice: 4 starbases
- Pilot: 3-4 starbases
- Warrior: 2-3 starbases
- Commander: 2 starbases
- Random distribution, minimum 3 sectors apart

**Enemy Placement:**
- Start in clustered groups
- 2-4 initial spawn points
- Each spawn contains 3-6 ships
- Minimum 4 sectors from starbases
- Random formation assignments

### 10.3 Enemy Movement Logic

**Movement Rules:**
1. Enemies move every 10-20 centons (game time)
2. Speed varies by formation type:
   - Fighters: 1-2 sectors per move
   - Cruisers: 0.5-1 sectors per move
   - Basestars: 0.5 sectors per move

3. **Target Selection:**
   - Identify nearest vulnerable starbase
   - Calculate path toward target
   - Multiple squadrons converge on same target

4. **Group Behavior:**
   - Squadrons merge when adjacent
   - Surround starbase before attacking
   - Split after starbase destroyed

### 10.4 Starbase Attack Mechanics

**Attack Sequence:**
1. Enemies surround starbase (occupy 2+ adjacent sectors)
2. Countdown begins: 100 centons (approximately 1 minute real-time)
3. Subspace radio alert: "STARBASE AT X,Y UNDER ATTACK!"
4. If not defended within countdown: Starbase destroyed
5. Squadrons split and seek next target

**Defense Requirements:**
- Player must arrive at starbase sector OR adjacent sector
- Must destroy at least one surrounding squadron
- Clears "surrounded" status, countdown stops

### 10.5 Sector Details

**Sector Properties:**
- Sector ID: (X,Y) coordinates
- Contents: Empty / Starbase / Enemies / Player
- Enemy count: 0-6 ships per sector
- Distance from player: Calculated in sectors

**Visibility:**
- All sector contents visible on Galactic Chart
- No fog of war (player has perfect information)
- Real-time updates as enemies move

---

## 11. Ship Systems (PESCLR)

### 11.1 PESCLR Overview

**PESCLR Acronym:**
- **P** - Photon Torpedoes
- **E** - Engines
- **S** - Shields
- **C** - Computer (Attack Computer)
- **L** - Long-Range Scan
- **R** - Radio (Subspace Radio)

Each system can be: **Operational** (Blue), **Damaged** (Yellow), or **Destroyed** (Red)

### 11.2 Photon Torpedoes (P)

**Function:** Primary weapon system

**Operational (Blue):**
- Fire rate: 2-3 shots per second
- Unlimited ammunition
- Accurate trajectory
- Full damage output

**Damaged (Yellow):**
- Fire rate reduced to 50%
- Occasional misfire (torpedo veers off)
- Reduced damage (80% of normal)

**Destroyed (Red):**
- Cannot fire torpedoes
- Must retreat to starbase
- Player defenseless

**Energy Cost:** 5 energy units per shot

### 11.3 Engines (E)

**Function:** Ship propulsion and maneuverability

**Operational (Blue):**
- Full speed range (0-9, up to 43 metrons/second)
- Responsive controls
- Normal energy consumption

**Damaged (Yellow):**
- Maximum speed reduced to level 6 (20 metrons/second)
- Sluggish turning response
- Increased energy consumption (+50%)

**Destroyed (Red):**
- Maximum speed limited to level 3 (8 metrons/second)
- Very slow turning
- Cannot effectively pursue or escape

**Energy Cost:** Varies by speed (see Section 16)

### 11.4 Shields (S)

**Function:** Damage reduction system

**Operational (Blue):**
- Full damage reduction (difficulty-scaled)
- Novice: 100% protection
- Pilot: 50% damage reduction
- Warrior: 25% damage reduction
- Commander: 10% damage reduction

**Damaged (Yellow):**
- 50% of normal protection
- Occasional flicker (brief vulnerability)
- Visual stutter effect

**Destroyed (Red):**
- No protection
- Every hit causes system damage
- Extremely vulnerable

**Energy Cost:** 10 energy units per second when active

### 11.5 Computer - Attack Computer (C)

**Function:** Targeting assistance and tracking

**Operational (Blue):**
- Auto-target nearest enemy
- Display tracking indicator (T: F/C/B)
- Show range to target (R: value)
- Enhanced lock indicators (⊕)
- Accurate range calculations

**Damaged (Yellow):**
- Intermittent tracking loss
- Inaccurate range readings (±20%)
- Occasional wrong target selection

**Destroyed (Red):**
- No automatic targeting
- No range information (R: shows ---)
- No lock indicators
- Manual aiming only

**Energy Cost:** 2 energy units per second when active

### 11.6 Long-Range Scan (L)

**Function:** Sector scanning system

**Operational (Blue):**
- Accurate display of all ships in sector
- Clear position information
- Correct enemy count
- Reliable distance measurement

**Damaged (Yellow):**
- False echoes appear (ghost contacts)
- 1-2 phantom ships shown
- Occasionally incorrect positions
- Flickering display

**Destroyed (Red):**
- Screen shows static/noise
- Cannot use Long-Range Scan view
- Must rely on visual identification only

**Energy Cost:** None (passive system)

### 11.7 Radio - Subspace Radio (R)

**Function:** Starbase communication system

**Operational (Blue):**
- Receive starbase attack alerts
- Display messages on Galactic Chart
- Audio alert for urgent messages
- Clear text readouts

**Damaged (Yellow):**
- Delayed message delivery
- Occasional garbled text
- Intermittent audio
- May miss some alerts

**Destroyed (Red):**
- No starbase alerts
- Cannot receive distress calls
- Must manually monitor Galactic Chart
- Higher difficulty (information loss)

**Energy Cost:** None (passive system)

### 11.8 Damage Accumulation

**How Systems Are Damaged:**
1. Enemy photon hits (primary source)
2. Collision with enemies or asteroids
3. Prolonged shield failure

**Damage Progression:**
- Each hit has chance to damage 1 system
- Operational → Damaged (Yellow) → Destroyed (Red)
- Multiple hits required for complete destruction
- Higher difficulties: faster damage progression

**Repair:**
- Dock at starbase
- All systems restored to Operational (Blue)
- Energy refilled to maximum
- No cost for repairs (but time spent)

---

## 12. Combat System

### 12.1 Combat Overview

**Combat Flow:**
1. Enter sector with enemies
2. Activate shields (S key)
3. Enable attack computer (T key)
4. Identify targets (Long-Range Scan or visual)
5. Maneuver to firing position
6. Lock onto target (⊕ indicators)
7. Fire photon torpedoes
8. Destroy enemy or retreat

### 12.2 Photon Torpedo Mechanics

**Firing:**
- Fire button shoots torpedo forward (Fore View) or backward (Aft View)
- Torpedo speed: 50 metrons/second (faster than ships)
- Range: Approximately 100 metrons effective range
- Visual: Bright projectile trail

**Hit Detection:**
- Torpedo must intersect enemy hitbox
- Lock indicators improve accuracy
- Attack computer calculates trajectory

**Damage:**
- One hit destroys Fighter
- Two hits destroy Cruiser (if shields down)
- Three hits destroy Basestar
- Enemy shields absorb first hit

### 12.3 Lock Indicators

**Three Lock Types:**

1. **Horizontal Lock (⊕ left):**
   - Enemy horizontally aligned with ship
   - Adjust with left/right joystick

2. **Vertical Lock (⊕ right):**
   - Enemy vertically aligned with ship
   - Adjust with up/down joystick

3. **Range Lock (⊕ center):**
   - Enemy in optimal firing range (30-70 metrons)
   - Adjust speed to close distance

**All Three Locked:**
- Highest hit probability
- Optimal firing condition
- Display: ⊕ ⊕ ⊕ (all three visible)

### 12.4 Enemy Combat Behavior

**Fighter Behavior:**
- Aggressive, direct attacks
- Fast approach speed
- Fires frequently at close range
- Evasive maneuvers when damaged

**Cruiser Behavior:**
- Defensive, patrols sector
- Only fires if attacked first
- Moderate speed
- Attempts to maintain distance

**Basestar Behavior:**
- Slow movement
- Heavy firepower
- Deploys defensive fire
- Difficult to approach
- Must be destroyed at close range

### 12.5 Enemy Weapons

**Enemy Photon Torpedoes:**
- Visual: Red projectile (player's are white)
- Speed: Equal to player (50 metrons/second)
- Damage: May damage 1 random PESCLR system per hit
- Frequency: Varies by enemy type

**Hit Effects on Player:**
- Screen flash (red)
- Screen shake
- Random system damage
- Energy reduction
- Visual explosion at impact

### 12.6 Collision Mechanics

**Ship-to-Ship Collision:**
- Damage: Severe (2-3 systems damaged)
- Player velocity reduced dramatically
- Energy loss: 200-500 units
- Visual: Large explosion effect
- Rare but catastrophic

### 12.7 Combat Strategies

**Offensive:**
- Lock all three indicators for accuracy
- Close to 30-50 metron range
- Fire in bursts (3-5 torpedoes)
- Use tracking computer for auto-targeting

**Defensive:**
- Activate shields immediately
- Maintain high velocity for evasion
- Use Aft View to monitor pursuers
- Retreat to hyperspace if overwhelmed

**Energy Management:**
- Deactivate shields when no enemies present
- Use speed 6 (12 metrons/sec) for efficiency
- Avoid prolonged combat
- Plan starbase visits for repairs/refuel

---

## 13. Enemy Types and Behaviors

### 13.1 Enemy Classification

**Three Enemy Types:**
1. Fighter (F) - Fast attack craft
2. Cruiser (C) - Patrol vessel
3. Basestar (B) - Heavy capital ship

### 13.2 Fighter

**Appearance:**
- Small triangular vector shape
- Fast-moving
- Aggressive red color

**Behavior:**
- Aggression: High - attacks on sight
- Speed: Fast (1.5× player cruise speed)
- Attack Pattern: Direct approach, rapid fire
- Evasion: Performs barrel rolls when hit
- Health: 1 photon torpedo kill
- Shields: None

**Tactical Notes:**
- Most common enemy type (60% of forces)
- Dangerous in groups
- Prioritize when multiple enemies present
- Quick to engage, quick to destroy

### 13.3 Cruiser

**Appearance:**
- Medium-sized elongated shape
- Slower, more deliberate movement
- Yellow/orange color scheme

**Behavior:**
- Aggression: Defensive - only attacks if provoked
- Speed: Moderate (0.75× player cruise speed)
- Attack Pattern: Long-range harassment fire
- Evasion: Attempts to maintain distance
- Health: 2 photon torpedoes (with shields)
- Shields: Yes (absorbs first hit)

**Tactical Notes:**
- 30% of enemy forces
- Can be bypassed if not engaged
- Becomes aggressive after first attack
- Useful for energy conservation (avoid combat)

### 13.4 Basestar

**Appearance:**
- Large, imposing capital ship design
- Slow, methodical movement
- Bright red with visual prominence

**Behavior:**
- Aggression: High - attacks on approach
- Speed: Slow (0.5× player cruise speed)
- Attack Pattern: Heavy sustained fire
- Evasion: Minimal (relies on firepower)
- Health: 3 photon torpedoes
- Shields: Strong (requires close-range penetration)

**Tactical Notes:**
- 10% of enemy forces
- Must approach to 20-30 metrons to damage
- Highest threat level
- Often accompanied by fighters
- Major energy drain to destroy

### 13.5 Enemy Formation Types

**Squadron Formations:**
1. Line Formation: Enemies in row (balanced speed)
2. V Formation: Triangle pattern (fighter-heavy)
3. Cluster: Tight grouping (basestar + escorts)

**Formation Effects:**
- Determines movement speed across galaxy
- Affects combat encounter difficulty
- Influences starbase attack timing

### 13.6 Enemy AI Behavior

**Strategic Level (Galaxy Map):**
1. Target Selection: Identify nearest vulnerable starbase
2. Calculate shortest path
3. Begin movement toward target
4. Group Coordination: Multiple squadrons converge
5. Surround starbase before attacking
6. Split and retarget after destruction

**Tactical Level (Sector Combat):**
1. Detect player in sector
2. Turn to face player
3. Close to optimal range
4. Open fire
5. Execute type-specific behavior
6. Evade when damaged

**Difficulty Scaling:**
- Novice: Enemies attack individually, slow reaction
- Pilot: Basic coordination, moderate speed
- Warrior: Advanced tactics, group attacks
- Commander: Expert coordination, maximum aggression

---

## 14. Starbase System

### 14.1 Starbase Function

**Primary Purposes:**
1. Repair: Restore all PESCLR systems to operational (blue)
2. Refuel: Restore energy to maximum (~7000 units)
3. Strategic Points: Represent player's strategic assets

**Gameplay Role:**
- Safe haven for damaged ships
- Required for extended missions
- Loss of all starbases = mission failure
- Protection is key strategic objective

### 14.2 Starbase Locations

**Placement:**
- Randomly distributed across galaxy
- Minimum 3 sectors apart
- Number varies by difficulty:
  - Novice: 4 starbases
  - Pilot: 3-4 starbases
  - Warrior: 2-3 starbases
  - Commander: 2 starbases

**Visual Identification:**
- Blue square on Galactic Chart
- Distinct icon in sector view
- Always visible to player

### 14.3 Docking Procedure

**Requirements:**
1. Enter sector containing starbase
2. Reduce speed to 0-2 (slow approach)
3. Approach within 10 metrons
4. Automatic docking triggers

**Docking Sequence:**
- Screen fades briefly
- "DOCKED AT STARBASE" message
- All repairs completed instantly
- Energy restored to maximum
- Return to Galactic Chart view

**Time Cost:** ~10-20 centons (gameplay time)

### 14.4 Starbase Under Attack

**Attack Trigger:**
- 2+ enemy squadrons surround starbase (adjacent sectors)
- Countdown begins: 100 centons
- Subspace radio alert (if operational)

**Alert Message:**
"STARBASE AT SECTOR X,Y UNDER ATTACK!"

**Visual Indicators:**
- Flashing starbase icon on Galactic Chart
- Red alert border around sector
- Audio alarm (pulsing tone)

**Defense Requirements:**
- Player must arrive within 100 centons
- Must destroy at least one surrounding squadron
- Countdown resets when siege broken

**Failure Consequences:**
- Starbase destroyed
- Removed from Galactic Chart
- Cannot be used for repairs/refuel
- Enemy squadrons split and seek next target
- Mission failure if last starbase lost

### 14.5 Strategic Importance

**Decision Points:**
- Prioritize starbase defense vs. enemy elimination?
- Risk combat with damaged systems vs. dock for repairs?
- Which starbase to use (if multiple available)?
- Defend distant starbase or let it fall?

**Advanced Tactics:**
- Position between enemies and starbase
- Intercept enemy squadrons before they reach starbase
- Use starbases as staging points for counterattacks
- Preserve closest starbase for emergency repairs

---

## 15. Navigation and Hyperspace

### 15.1 Hyperspace Overview

**Function:** Fast travel between galaxy sectors

**Activation:** Press H key (from Galactic Chart)

**Requirements:**
- Destination selected on Galactic Chart
- Sufficient energy for travel
- Ship not in immediate danger

### 15.2 Energy Cost Calculation

**Formula:** Energy Cost = Distance × 100 × Difficulty Multiplier

**Distance:** Manhattan distance (|X1-X2| + |Y1-Y2|)

**Example:**
- From sector (5,5) to (8,10)
- Distance = |5-8| + |5-10| = 3 + 5 = 8 sectors
- Base Cost = 8 × 100 = 800 energy
- Commander (2.0× multiplier) = 1600 energy

### 15.3 Automatic Hyperspace (Novice/Pilot)

**Behavior:**
- Press H to engage
- Animated warp tunnel displays
- Automatic navigation to destination
- Arrival at exact target sector
- Duration: ~3-5 seconds real-time

**Visual Effects:**
- Streaming stars accelerating
- Tunnel effect
- Progress indicator
- Sector coordinates display

### 15.4 Manual Hyperspace (Warrior/Commander)

**Behavior:**
- Press H to engage
- Crosshair reticle appears in center
- Ship experiences "drift" (crosshair moves)
- Player must correct drift with joystick
- Keep crosshair centered on target

**Drift Mechanics:**
- Random directional drift every 0.5 seconds
- Magnitude increases with distance
- Commander difficulty: stronger drift

**Success:**
- Crosshair remains centered (±10% tolerance)
- Arrive at intended destination
- Energy cost as calculated

**Failure:**
- Crosshair drifts off-center (>20%)
- Arrive at random adjacent sector
- Energy still consumed
- May arrive in enemy-occupied sector (dangerous!)

**Strategy:**
- Maintain constant correction
- Anticipate drift direction
- Shorter jumps = easier navigation
- Practice improves muscle memory

### 15.5 Navigation Strategy

**Route Planning:**
1. Survey Galactic Chart for enemy positions
2. Identify nearest threats to starbases
3. Calculate energy costs for routes
4. Plan multi-hop journeys for distant sectors
5. Reserve energy for combat and return trips

**Optimal Routing:**
- Prioritize threatened starbases
- Intercept enemies before they reach bases
- Plan starbase visits when energy low or systems damaged
- Avoid unnecessary long jumps
- Consider manual navigation difficulty

---

## 16. Energy Management

### 16.1 Energy System Overview

**Energy (E) Display:**
- Shown in HUD as E: XXXX
- Maximum: ~7000 units (difficulty-scaled)
- Current value updates in real-time
- Color warning at low levels (<500)

**Energy Sources:**
- Start of mission: Full energy
- Starbase docking: Restore to maximum

**Energy Uses:**
- Ship velocity (speed 0-9)
- Shields (continuous drain)
- Attack computer (continuous drain)
- Photon torpedoes (per shot)
- Hyperspace travel (per jump)

### 16.2 Energy Consumption Rates

**Velocity (per second):**
- Speed 0: 0 energy/sec
- Speed 1-3: 2 energy/sec
- Speed 4-5: 5 energy/sec
- Speed 6: 8 energy/sec (optimal cruise)
- Speed 7: 12 energy/sec
- Speed 8: 18 energy/sec
- Speed 9: 30 energy/sec (maximum burn)

**Systems (per second when active):**
- Shields: 10 energy/sec
- Attack Computer: 2 energy/sec

**Weapons (per shot):**
- Photon Torpedo: 5 energy/shot

**Hyperspace:**
- Distance-based (see Section 15.2)

### 16.3 Optimal Energy Usage

**Speed 6 Recommendation:**
- Velocity of 12 metrons/second
- Best energy efficiency
- Adequate for most travel
- Default cruising speed

**Combat Energy Management:**
- Activate shields only when enemies present
- Deactivate shields in empty sectors
- Use attack computer for targeting assistance
- Avoid speed 7-9 unless critical
- Monitor energy during extended combat

**Emergency Protocols:**
- Energy < 1000: Plan starbase visit
- Energy < 500: Immediate retreat required
- Energy < 100: Mission-critical (flashing warning)

### 16.4 Energy Depletion

**Zero Energy:**
- Ship becomes immobile (speed locked to 0)
- Cannot fire weapons
- Cannot engage hyperspace
- Cannot activate shields/computer
- Mission failure (unable to complete objectives)

**Prevention:**
- Monitor energy constantly
- Plan refueling stops
- Avoid unnecessary combat
- Optimize hyperspace routes

---

## 17. Damage and Repair Mechanics

### 17.1 Damage System Overview

**PESCLR Status Display:**
- Located bottom-right of Galactic Chart
- Shows: DC: PESCLR
- Color-coded by system health:
  - Blue/Cyan: Operational
  - Yellow: Damaged
  - Red: Destroyed

**Damage Sources:**
1. Enemy photon torpedo hits
2. Ship-to-ship collisions
3. Asteroid impacts (if present)

### 17.2 Damage Probability

**Per Enemy Hit:**
- 40% chance to damage 1 random system
- Shields active: Reduce probability
  - Novice: 0% (shields prevent all damage)
  - Pilot: 20% (shields cut damage chance in half)
  - Warrior: 30%
  - Commander: 35%

**Damage Progression:**
- First hit: Operational → Damaged (Yellow)
- Second hit: Damaged → Destroyed (Red)
- Systems can be hit multiple times in one battle

### 17.3 System Damage Effects

**Photon Torpedoes (P) - Damaged:**
- Fire rate reduced 50%
- Occasional misfires
- Reduced damage output (80%)

**Photon Torpedoes (P) - Destroyed:**
- Cannot fire weapons
- Defenseless
- Must retreat immediately

**Engines (E) - Damaged:**
- Max speed reduced to 6
- Sluggish turning
- Energy consumption +50%

**Engines (E) - Destroyed:**
- Max speed reduced to 3
- Very slow turning
- Cannot pursue or escape effectively

**Shields (S) - Damaged:**
- Protection reduced 50%
- Occasional flickering (brief vulnerability)

**Shields (S) - Destroyed:**
- No damage protection
- Every hit damages systems
- Extremely vulnerable

**Computer (C) - Damaged:**
- Intermittent tracking loss
- Inaccurate range (±20%)
- Wrong target selection

**Computer (C) - Destroyed:**
- No auto-targeting
- No range information (R: ---)
- No lock indicators
- Manual aiming only

**Long-Range Scan (L) - Damaged:**
- False echoes (ghost ships)
- Flickering display
- Inaccurate positions

**Long-Range Scan (L) - Destroyed:**
- Static/noise display
- Cannot use scan view
- Visual identification only

**Radio (R) - Damaged:**
- Delayed messages
- Garbled text
- Intermittent alerts

**Radio (R) - Destroyed:**
- No starbase alerts
- No distress calls
- Manual chart monitoring required

### 17.4 Repair Mechanics

**Repair Method:**
- Dock at starbase (only method)

**Repair Process:**
1. Enter starbase sector
2. Reduce speed to 0-2
3. Approach within 10 metrons
4. Automatic docking
5. All systems instantly repaired
6. Energy refilled to maximum

**Repair Animation:**
- Each PESCLR letter changes color sequentially
- Red → Yellow → Cyan (0.2 seconds per letter)
- Accompanied by repair sound effects
- Total duration: ~1.5 seconds

**No Cost:**
- Repairs are free
- Only cost is time spent traveling to starbase

---

## 18. Ranking and Scoring System

### 18.1 Scoring Formula

**Score Calculation:**
- Base Score = (Enemies Destroyed × 10) + (Starbases Saved × 20)
- Difficulty Bonus = Base Score × Difficulty Multiplier
- Time Bonus = Max(0, 1000 - Mission Time in Centons)
- Energy Bonus = (Remaining Energy / 100)
- Total Score = Base Score + Difficulty Bonus + Time Bonus + Energy Bonus

**Difficulty Multipliers:**
- Novice: 1.0×
- Pilot: 1.5×
- Warrior: 2.0×
- Commander: 3.0×

### 18.2 Ranking System

**20 Rank Tiers:**

| Score Range | Rank Title |
|-------------|------------|
| 0-47 | GALACTIC COOK |
| 0-47 | GARBAGE SCOW CAPTAIN |
| 48-79 | ROOKIE |
| 80-111 | NOVICE |
| 112-143 | ENSIGN |
| 144-175 | PILOT |
| 176-207 | ACE |
| 208-239 | LIEUTENANT |
| 240-271 | WARRIOR |
| 272-303 | CAPTAIN |
| 304-335 | COMMANDER |
| 336+ | STAR COMMANDER - CLASS 1 |
| 368+ | STAR COMMANDER - CLASS 2 |
| 400+ | STAR COMMANDER - CLASS 3 |
| 432+ | STAR COMMANDER - CLASS 4 |

**Humorous Low Ranks:**
- Players who perform very poorly receive humorous ranks
- "Garbage Scow Captain" and "Galactic Cook" for scores below 48
- Encourages players to retry at appropriate difficulty

**Class System:**
- Star Commander ranks have 4 class levels
- Class 4 is the highest achievement
- Requires Commander difficulty + near-perfect play
- Very difficult to achieve

### 18.3 Rank Display

**Ranking Screen Elements:**
1. Large rank title in center
2. Class designation (if applicable)
3. Score breakdown
4. Performance statistics
5. Encouragement/advice for low ranks

**Example Display:**
- MISSION COMPLETE
- STAR COMMANDER
- CLASS 4
- Score: 445 points
- Enemies Destroyed: 28/28
- Starbases Remaining: 2/2
- Mission Time: 412 centons
- Energy Remaining: 3240
- OUTSTANDING PERFORMANCE!

---

## 19. Controls and Input

### 19.1 Keyboard Controls

**Primary Controls:**
- **0-9 Keys:** Set velocity (0 = stopped, 9 = maximum)
- **Arrow Keys:** Steer ship (pitch/yaw)
- **Spacebar or Ctrl:** Fire photon torpedoes
- **F:** Fore view
- **A:** Aft view
- **G:** Galactic chart
- **L:** Long-range scan
- **H:** Hyperspace (engage from Galactic Chart)
- **T:** Toggle tracking computer
- **S:** Toggle shields
- **ESC:** Pause/Menu

**Galactic Chart Controls:**
- **Arrow Keys:** Move cursor
- **H:** Hyperspace to cursor position

### 19.2 Joystick/Gamepad Controls

**Analog Stick:**
- Left/Right: Yaw (turn ship)
- Up/Down: Pitch (tilt ship)

**Buttons:**
- Button A: Fire torpedoes
- Button B: Toggle shields
- Button X: Toggle computer
- Button Y: Switch view (Fore/Aft)
- D-Pad: Navigate menus
- L1/L2: Decrease velocity
- R1/R2: Increase velocity
- Start: Galactic Chart
- Select: Long-range scan

### 19.3 Optional Mouse Support

**Mouse Controls (Optional):**
- Mouse movement: Aim ship
- Left click: Fire torpedoes
- Right click: Toggle shields
- Scroll wheel: Adjust velocity
- Middle click: Toggle computer

### 19.4 Control Customization

**Rebindable Keys:**
- All keyboard controls customizable
- Gamepad button mapping
- Sensitivity adjustments
- Deadzone configuration
- Invert Y-axis option

### 19.5 Control Feedback

**Visual Feedback:**
- Button press highlights
- Velocity indicator updates
- System toggle indicators
- Cursor movement

**Audio Feedback:**
- Key press confirmation sounds
- System toggle sounds
- Error sounds for invalid inputs
- Continuous engine sound (pitch varies with velocity)

---

## 20. Audio Design

### 20.1 Audio Philosophy

**Retro Aesthetic:**
- 8-bit/16-bit synthesized sounds
- Simple waveforms (square, sawtooth, sine)
- No orchestral or realistic sounds
- Authentic to 1980 original style

**Functional Audio:**
- Every sound conveys information
- Audio cues for important events
- Alert tones for critical situations
- Minimal music (ambient only)

### 20.2 Sound Effects

**Combat Sounds:**
- Photon torpedo fire: "PEW" laser sound (0.1s)
- Torpedo hit: "BOOM" explosion (0.5s)
- Enemy destroyed: Explosion + debris (1.0s)
- Player hit: "CLANG" impact + screen shake (0.2s)
- Shield impact: Dampened hit sound (0.15s)

**System Sounds:**
- Shield activation: "BWOOM" power-up (0.3s)
- Shield deactivation: "WOOOM" power-down (0.2s)
- Computer on: Electronic beep (0.1s)
- Computer off: Electronic beep lower pitch (0.1s)
- System damage: "BZZT" static/error (0.3s)
- System destroyed: Alarm tone (0.5s)

**Navigation Sounds:**
- Hyperspace enter: Rising "WHOOOOSH" (1.0s)
- Hyperspace exit: Descending "WOOSH" (0.5s)
- Docking: "CLUNK" + repair sequence (2.0s)
- Lock achieved: "PING" confirmation (0.1s)

**Alert Sounds:**
- Low energy: "BEEP BEEP" alarm (repeating at 2 Hz)
- Critical energy: "BEEPBEEPBEEP" rapid alarm (4 Hz)
- Starbase attack: "BOOP BOOP" alert tone (1 Hz)
- Mission complete: Victory fanfare (3.0s)
- Mission failed: Defeat tone (2.0s)

**Continuous Sounds:**
- Engine hum: Pitch varies with velocity (continuous)
- Shield shimmer: Subtle electrical hum when active
- Hyperspace tunnel: Rushing wind/warp sound

### 20.3 Music

**Title Screen:**
- Retro synthesizer theme
- 30-60 seconds loop
- Upbeat, adventurous tone
- Optional (can be disabled)

**Gameplay:**
- Minimal ambient music
- Sparse, atmospheric
- Does not interfere with sound effects
- Optional (can be disabled)

**Victory:**
- Short fanfare (5-10 seconds)
- Triumphant synthesizer melody
- Plays once on mission completion

**Defeat:**
- Short somber tone (3-5 seconds)
- Lower pitch, slower tempo
- Plays once on mission failure

### 20.4 Audio Settings

**Volume Controls:**
- Master volume (0-100%)
- Sound effects volume (0-100%)
- Music volume (0-100%)
- Independent control for each category

**Audio Options:**
- Mute all audio
- Disable music only
- Disable sound effects only
- Audio output device selection (if multiple)

### 20.5 Audio Technical Specifications

**Format:**
- Sound effects: WAV or OGG (44.1 kHz, 16-bit)
- Music: OGG Vorbis (128-192 kbps)
- Channels: Mono (effects), Stereo (music)

**Performance:**
- Maximum simultaneous sounds: 16
- Audio latency: <20ms
- No crackling or popping
- Smooth volume transitions

---

## 21. Visual Design

### 21.1 Visual Philosophy

**Authentic Retro:**
- Simple geometric shapes
- Solid colors (minimal gradients)
- High contrast
- Vector-style graphics for enemies
- Pixel-aligned when possible

**Modern Enhancements:**
- Higher resolution (1080p+)
- Smooth 60 FPS animations
- Subtle effects (glow, particles)
- Alpha blending for shields/effects
- Maintains retro spirit

### 21.2 Visual Style

**Color Philosophy:**
- Black space background
- High contrast elements
- Color-coded information (red = danger, blue = friendly)
- Consistent color language throughout

**Shape Language:**
- Triangles for enemies (aggressive, threatening)
- Squares for starbases (solid, defensive)
- Circles for indicators (neutral, informational)
- Simple, recognizable silhouettes

### 21.3 Visual Effects

**Particle Effects:**
- Explosions: 20-30 particles radiating outward
- Torpedo trails: Fading line behind projectile
- Debris: Small triangles/squares spinning
- Shield impacts: Brief sparkle at hit point

**Screen Effects:**
- Damage flash: Red overlay (0.2s)
- Screen shake: ±2-4 pixels on impact
- Warp tunnel: Streaming lines from center
- Shield glow: Blue shimmer at screen edges

**Animation:**
- Smooth interpolation between positions
- 60 FPS target for all animations
- Easing functions for natural motion
- No jarring or stuttering

### 21.4 Starfield

**Parallax Layers:**
- Layer 1 (Near): Large white dots, 100% scroll speed
- Layer 2 (Mid): Medium gray dots, 50% scroll speed
- Layer 3 (Far): Small dim dots, 25% scroll speed
- Layer 4 (Distant): Tiny dots, 10% scroll speed

**Density:**
- 100-200 stars visible at any time
- Random distribution
- Wrap-around at screen edges
- Creates depth perception

### 21.5 Accessibility

**Colorblind Modes:**
- Deuteranopia support (red/green adjusted)
- Protanopia support (similar adjustment)
- Tritanopia support (blue/yellow adjusted)
- High contrast mode

**Visual Options:**
- Large text mode (1.5× text size)
- HUD scale adjustment (80-120%)
- Reduced motion mode (no screen shake, minimal effects)
- Brightness adjustment

---

## 22. Performance Requirements

### 22.1 Target Frame Rate

**Primary Target:** 60 FPS (16.67ms per frame)
**Minimum Acceptable:** 30 FPS (33.33ms per frame)
**No Drops Below:** 30 FPS during normal gameplay

**Frame Budget Allocation:**
- Rendering: 10ms
- Game Logic: 4ms
- Physics/Collision: 2ms
- Audio: 1ms
- Buffer: 0.67ms

### 22.2 Hardware Requirements

**Minimum Specifications:**
- CPU: Dual-core 2.0 GHz
- RAM: 2 GB
- GPU: Integrated graphics (2014+)
- Storage: 200 MB
- OS: Windows 7, macOS 10.12, Ubuntu 18.04

**Recommended Specifications:**
- CPU: Quad-core 2.5 GHz
- RAM: 4 GB
- GPU: Dedicated graphics (2016+)
- Storage: 500 MB (with room for saves)
- OS: Windows 10, macOS 11, Ubuntu 20.04

### 22.3 Resolution Support

**Supported Resolutions:**
- 1280×720 (HD)
- 1920×1080 (Full HD) - Primary target
- 2560×1440 (2K)
- 3840×2160 (4K)

**Aspect Ratios:**
- 16:9 (primary)
- 16:10 (letterboxed)
- 4:3 (letterboxed)
- 21:9 (extended sides)

### 22.4 Memory Usage

**Target Memory Footprint:**
- Total RAM: <512 MB
- VRAM: <256 MB
- Textures: <128 MB
- Audio: <50 MB
- Game state: <5 MB

**Memory Management:**
- No memory leaks
- Stable memory usage over time
- Efficient asset loading/unloading

### 22.5 Load Times

**Target Load Times:**
- Game startup: <3 seconds
- Screen transitions: <0.5 seconds
- Hyperspace: <1 second
- Save/Load: <1 second

### 22.6 Performance Monitoring

**Metrics to Track:**
- Frame time (average, min, max)
- Draw calls per frame
- Memory usage over time
- CPU usage per system
- GPU utilization
- Asset load times

---

## 23. Technical Architecture

### 23.1 Engine Choice

**Recommended Options:**
1. Unity (C#) - Excellent 2D/3D, cross-platform
2. Godot (GDScript/C#) - Free, open source, lightweight
3. Custom (C++/SDL2) - Maximum control, optimal performance
4. Web (HTML5/JavaScript) - Browser-based, easy distribution

**Selection Criteria:**
- Cross-platform support
- 2D/3D rendering capabilities
- Performance characteristics
- Development team familiarity
- Licensing costs

### 23.2 Core Systems

**Game Loop:**
- Fixed timestep (60 FPS)
- Separate update and render
- Input processing at frame start
- State management

**State Machine:**
- Title, Playing, Paused, Galactic Chart, Hyperspace, Game Over
- Clean state transitions
- State-specific update/render

**Entity System:**
- Player ship
- Enemy ships (pooled)
- Torpedoes (pooled)
- Particles (pooled)
- Starbases

### 23.3 Rendering Pipeline

**3D Projection:**
- World space → Camera space → Screen space
- Perspective projection for enemies
- Depth sorting (back-to-front)
- Frustum culling

**2D Overlay:**
- HUD elements
- UI screens
- Text rendering
- Always on top

**Batching:**
- Combine similar draw calls
- Use sprite atlases
- Minimize state changes
- Target: <20 draw calls per frame

### 23.4 Data Storage

**Save File Format:**
- JSON or binary
- Version number for compatibility
- Checksum for validation
- Player progress, galaxy state, game settings

**Configuration:**
- Separate config file
- Graphics settings
- Audio settings
- Control mappings

---

## 24. Platform Requirements

### 24.1 Windows

**Supported Versions:**
- Windows 7 SP1 or later
- Windows 10 recommended

**Distribution:**
- Standalone executable
- Optional installer
- Include required DLLs

### 24.2 macOS

**Supported Versions:**
- macOS 10.12 Sierra or later
- macOS 11 Big Sur recommended

**Distribution:**
- .app bundle
- Universal binary (Intel + Apple Silicon)
- Optional .dmg installer

### 24.3 Linux

**Supported Distributions:**
- Ubuntu 18.04+
- Fedora 30+
- Arch Linux
- Other distributions (best effort)

**Distribution:**
- AppImage (preferred)
- .deb package
- .rpm package
- Tarball with run script

### 24.4 Web (Optional)

**Browser Support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Technology:**
- WebAssembly (Emscripten)
- WebGL for rendering
- Web Audio API

**Limitations:**
- 2GB memory limit
- Slower than native
- Save to browser local storage

---

## 25. Development Phases

### 25.1 Phase 1: Core Engine (Weeks 1-3)

**Goals:**
- Game loop running at 60 FPS
- State management system
- Input handling (keyboard/gamepad)
- Basic rendering system

**Deliverables:**
- Functional game loop
- Window/screen management
- Input system tested
- Basic sprite rendering

**Team Focus:**
- Lead: Architecture decisions
- Programmer 1: Game loop and state management
- Programmer 2: Input and rendering foundations

### 25.2 Phase 2: Visual Systems (Weeks 4-6)

**Goals:**
- All 8 game screens implemented
- 3D rendering pipeline
- HUD system
- Visual effects

**Deliverables:**
- Title screen functional
- Galactic Chart rendered
- Combat views working
- Starfield parallax
- Explosion effects

**Team Focus:**
- Programmer 1: 3D projection and enemy rendering
- Programmer 2: UI screens and HUD
- Designer: Screen layouts and visual assets

### 25.3 Phase 3: Gameplay Mechanics (Weeks 7-9)

**Goals:**
- Combat system complete
- Energy management
- PESCLR damage system
- Hyperspace navigation

**Deliverables:**
- Torpedoes fire and hit
- Energy consumption working
- System damage functional
- Hyperspace travel implemented
- Starbase docking working
- Lock indicators operational

**Team Focus:**
- Programmer 1: Combat and collision systems
- Programmer 2: Energy, PESCLR, hyperspace
- Designer: Testing and balance feedback
- Audio: Begin sound effect creation

### 25.4 Phase 4: Enemy AI (Weeks 10-11)

**Goals:**
- Strategic AI (galaxy movement)
- Tactical AI (sector combat)
- All enemy types behave correctly
- Difficulty scaling

**Deliverables:**
- Enemies move across galaxy
- Starbase attack logic working
- Fighter, Cruiser, Basestar behaviors distinct
- All 4 difficulty levels functional

**Team Focus:**
- Programmer 1: Strategic AI and pathfinding
- Programmer 2: Tactical AI and behaviors
- Designer: AI testing and balance
- Audio: Continue sound effects

### 25.5 Phase 5: Polish & Testing (Weeks 12-13)

**Goals:**
- Audio implementation
- Ranking system
- Bug fixes
- Balance tuning
- Performance optimization

**Deliverables:**
- All audio integrated
- Ranking calculation accurate
- No critical bugs
- All features tested
- Build packages for all platforms

**Team Focus:**
- All: Bug fixing and testing
- Audio: Final implementation and mixing
- Designer: Full playthroughs on all difficulties
- Lead: Final review and approval

---

## 26. Testing Strategy

### 26.1 Unit Testing

**Core Systems to Test:**
- Galaxy generation (correct sector counts)
- Energy consumption (accurate calculations)
- Damage system (proper state transitions)
- Collision detection (accurate hits)
- Scoring formula (correct rank calculation)
- Save/load (data integrity)

**Test Framework:**
- Automated unit tests for all systems
- Run tests on every build
- Maintain >80% code coverage
- Document test cases

### 26.2 Integration Testing

**System Interactions:**
- Combat → Energy → Damage flow
- Galaxy → Hyperspace → Sector loading
- AI → Combat → Player interaction
- Input → State → Rendering pipeline

**Test Scenarios:**
- Complete mission on Novice
- Complete mission on Commander
- Defend multiple starbases
- Survive with all systems damaged
- Dock at starbase successfully

### 26.3 Playthrough Testing

**Test Matrix:**

| Difficulty | Playthroughs | Focus Areas |
|------------|--------------|-------------|
| Novice | 5+ | New player experience, tutorial clarity |
| Pilot | 5+ | Energy management, basic strategy |
| Warrior | 10+ | Manual hyperspace, advanced tactics |
| Commander | 10+ | Difficulty balance, achievable ranks |

**Success Criteria:**
- All difficulties completable
- No soft-locks or game-breaking bugs
- Consistent performance (60 FPS)
- Save/load works reliably

### 26.4 Performance Testing

**Benchmarks:**
- Frame time measurement (every frame)
- Memory profiling (30+ minute sessions)
- Load time measurement
- CPU/GPU utilization tracking

**Stress Tests:**
- Maximum enemies on screen (10+)
- Maximum particles (500+)
- Rapid screen transitions
- Extended gameplay sessions (2+ hours)

**Target Hardware Testing:**
- Minimum spec machine
- Recommended spec machine
- High-end machine
- Various GPUs (Intel, AMD, NVIDIA)

### 26.5 Compatibility Testing

**Platform Coverage:**
- Windows 7, 10, 11
- macOS 10.12, 11, 12+
- Ubuntu 18.04, 20.04, 22.04
- Intel and Apple Silicon Mac
- Web browsers (Chrome, Firefox, Safari)

**Input Device Testing:**
- Keyboard only
- Gamepad (Xbox, PlayStation, Generic)
- Mouse (optional support)
- Various keyboard layouts

### 26.6 Accessibility Testing

**Colorblind Testing:**
- Deuteranopia simulation
- Protanopia simulation
- Tritanopia simulation
- High contrast mode

**Other Accessibility:**
- Large text mode
- Reduced motion mode
- Screen reader compatibility (menus)
- Keyboard-only navigation

### 26.7 User Acceptance Testing

**Beta Testing:**
- 10-20 external testers
- Mix of original players and new players
- Feedback on authenticity
- Bug reports and suggestions

**Feedback Collection:**
- Survey after playtesting
- Direct communication channels
- Bug tracking system
- Feature request consideration

---

## 27. Success Criteria

### 27.1 Feature Completeness

**Must Have (100% complete):**
- All 8 game screens functional
- All 4 difficulty levels playable
- Complete PESCLR damage system
- All 3 enemy types with correct AI
- 256-sector galaxy with real-time movement
- Hyperspace navigation (auto and manual)
- Starbase docking and repair
- 20-rank scoring system
- All audio implemented
- Save/load functionality

**Verification:**
- Feature checklist 100% complete
- All user stories tested
- No critical features missing

### 27.2 Gameplay Quality

**Authentic Feel:**
- Original players confirm authenticity
- Gameplay loop matches original
- Difficulty curve feels right
- Rank system produces correct results

**Balance:**
- All difficulties beatable but challenging
- Energy management requires strategy
- Combat feels fair but intense
- Risk/reward decisions meaningful

### 27.3 Performance Metrics

**Frame Rate:**
- Maintains 60 FPS on recommended hardware
- No drops below 30 FPS on minimum hardware
- Consistent frame time (<16.67ms average)

**Load Times:**
- Game startup: <3 seconds
- Screen transitions: <0.5 seconds
- No perceptible lag

**Stability:**
- No crashes during normal gameplay
- No memory leaks over extended play
- No save corruption issues

### 27.4 Quality Metrics

**Bug Density:**
- <1 critical bug per 10,000 lines of code
- <5 major bugs in final release
- <20 minor bugs in final release

**Code Coverage:**
- Unit tests: >80% coverage
- Integration tests: All major systems
- Edge cases handled properly

**User Satisfaction:**
- Beta tester approval: >85%
- Authenticity rating: >90%
- Would recommend: >80%

### 27.5 Platform Coverage

**Successful Builds:**
- Windows (x64) executable
- macOS (Universal) app bundle
- Linux (AppImage) package
- Web (WASM) version (if applicable)

**All Platforms:**
- Pass compatibility testing
- Meet performance targets
- No platform-specific bugs

---

## 28. Risk Analysis

### 28.1 Technical Risks

**Risk: Performance Issues**
- Probability: Medium
- Impact: High
- Mitigation: Early profiling, optimization focus, object pooling
- Contingency: Reduce particle count, simplify effects

**Risk: Cross-Platform Compatibility**
- Probability: Medium
- Impact: Medium
- Mitigation: Test on all platforms early, use cross-platform libraries
- Contingency: Drop problematic platforms, focus on main targets

**Risk: Save File Corruption**
- Probability: Low
- Impact: High
- Mitigation: Checksums, validation, extensive testing
- Contingency: Multiple save slots, auto-backup

**Risk: AI Pathfinding Lag**
- Probability: Low
- Impact: Medium
- Mitigation: Simple pathfinding, spread over frames
- Contingency: Pre-compute paths, simplify AI

### 28.2 Design Risks

**Risk: Difficulty Balance**
- Probability: Medium
- Impact: Medium
- Mitigation: Extensive playtesting, iterative tuning
- Contingency: Additional balance pass, community feedback

**Risk: Authenticity Concerns**
- Probability: Medium
- Impact: High
- Mitigation: Reference original game constantly, beta test with veterans
- Contingency: Adjust mechanics based on feedback

**Risk: New Player Accessibility**
- Probability: Low
- Impact: Medium
- Mitigation: Clear tutorial, Novice difficulty properly tuned
- Contingency: Add help screens, tooltips

### 28.3 Schedule Risks

**Risk: Feature Creep**
- Probability: Medium
- Impact: High
- Mitigation: Strict scope control, prioritized backlog
- Contingency: Cut non-essential features, focus on core

**Risk: Team Availability**
- Probability: Low
- Impact: High
- Mitigation: Clear roles, overlap on critical systems
- Contingency: Adjust timeline, descope if necessary

**Risk: Third-Party Dependencies**
- Probability: Low
- Impact: Medium
- Mitigation: Use stable, maintained libraries
- Contingency: Have fallback options for critical dependencies

### 28.4 Market Risks

**Risk: Limited Audience**
- Probability: Low
- Impact: Medium
- Mitigation: Not applicable (preservation project)
- Contingency: Open source, community support

**Risk: Legal Issues (Trademark)**
- Probability: Low
- Impact: High
- Mitigation: Clear disclaimers, tribute/recreation framing
- Contingency: Rename if necessary, emphasize non-commercial

---

## 29. Future Enhancements (Post-V1.0)

### 29.1 Potential Features

**Not in Initial Scope:**
- Online leaderboards
- Multiplayer co-op mode
- Additional galaxy sizes (32×32)
- New enemy types
- Campaign mode with story
- Ship upgrades/customization
- VR support
- Mobile ports (iOS/Android)
- Speedrun timer mode
- Practice mode (unlimited energy)

### 29.2 Community Features

**If Successful:**
- Modding support
- Level editor (galaxy generator)
- Custom enemy patterns
- Skin/texture packs
- Translation support (i18n)
- Steam Workshop integration

### 29.3 Technical Improvements

**Continuous Improvement:**
- Performance optimization
- Additional accessibility features
- Enhanced graphics options
- More robust save system
- Better debugging tools
- Automated testing expansion

---

## 30. Appendices

### 30.1 Glossary

**Terms and Definitions:**
- **Centon:** Time unit, approximately 1 minute (100 centons)
- **Metron:** Distance unit used in the game
- **PESCLR:** Acronym for six ship systems
- **Zylon:** Enemy alien race
- **Starbase:** Friendly repair/refuel station
- **Squadron:** Group of enemy ships
- **Sector:** One grid square in 16×16 galaxy
- **Hyperspace:** Fast travel between sectors
- **Lock Indicator:** Targeting assistance symbol (⊕)

### 30.2 References

**Original Game:**
- Star Raiders (1980), Atari 400/800
- Designer: Doug Neubauer
- Publisher: Atari, Inc.
- Manual: 38 pages (comprehensive reference)

**Documentation:**
- Original game manual
- AtariAge forums and discussions
- Retro gaming preservation sites
- Historical reviews and analyses

### 30.3 Document History

**Version 1.0 (December 17, 2025):**
- Initial complete PRD
- 28 comprehensive sections
- All features specified
- Development timeline defined
- Testing strategy outlined
- Success criteria established

**Future Updates:**
- Changes based on development feedback
- Clarifications as needed
- Scope adjustments if required
- Post-release feature additions

### 30.4 Approval Signatures

**Required Approvals:**

Product Owner: _________________ Date: _______

Lead Developer: _________________ Date: _______

Technical Lead: _________________ Date: _______

QA Lead: _________________ Date: _______

---

## Document Summary

**Total Sections:** 30
**Total Pages:** ~50
**Target Audience:** Development team, stakeholders, testers
**Status:** Final specification, ready for development
**Next Steps:** Begin Phase 1 development, assemble team, set up development environment

---

**END OF PRODUCT REQUIREMENTS DOCUMENT**

This PRD provides complete specifications for creating an authentic Star Raiders recreation. Combined with the technical notes, visual mockups, and other supporting documents, this package contains everything needed to successfully develop the game.

For questions or clarifications, contact the project lead or refer to the supporting documentation:
- QUICKSTART_DEVELOPER_GUIDE.md
- star_raiders_technical_notes.txt
- star_raiders_visual_mockups.txt
- star_raiders_visual_reference.txt
- TEAM_ROLES_AND_TASKS.md

**Ready to begin development!** 🚀⭐


