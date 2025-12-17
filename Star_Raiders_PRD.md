# Star Raiders - Product Requirements Document
## Full-Featured Clone Specification

**Version:** 1.0  
**Date:** December 17, 2025  
**Status:** Final Specification  
**Project:** Star Raiders Recreation

## Executive Summary

Star Raiders is a comprehensive space combat simulator that bridges arcade action with strategic gameplay. Originally created by Doug Neubauer for Atari in 1980, Star Raiders represents a landmark in video game history—it was the first killer app for the Atari 400/800 computers and established foundational conventions for the space simulation genre that would influence Elite, Wing Commander, and Star Control.

This PRD defines the complete specification for a faithful full-featured clone that captures the essence of the original while leveraging modern development practices.

---

## 1. Game Overview

### 1.1 Core Concept
Star Raiders is a first-person space combat simulator set during a galactic war between the Atarian Federation and the Zylon Empire. The player assumes the role of a starship captain who must defend friendly starbases from invading Zylon forces while managing limited energy resources, equipment damage, and strategic objectives.

### 1.2 Key Design Philosophy
- **Action + Strategy**: Real-time combat combined with tactical map overview
- **Resource Management**: Energy is a precious commodity consumed by movement, shields, and weapons
- **Dynamic Threat**: Enemy AI operates in real-time across the entire galaxy; threats persist whether you're looking at them or not
- **Emergent Difficulty**: Same game mechanics at different difficulty levels create vastly different experiences
- **Accessibility Through Complexity**: Deep mechanics with accessible controls

### 1.3 Historical Context
- **Original Developer**: Doug Neubauer (Atari)
- **Original Platform**: Atari 400/800 (1980)
- **Legacy**: Influenced the space simulation genre; included in Library of Congress game canon (2007)
- **Acclaim**: Described by Byte magazine as "probably the single greatest contributor to the sales of Atari's 400 and 800 series computers"

---

## 2. Game Modes & Structure

### 2.1 Main Menu
Entry point allowing players to:
- Start a new game
- Select difficulty level
- Access controls/options
- View high scores/rankings
- Exit game

### 2.2 Difficulty Levels
Four distinct difficulty settings, each affecting game balance, enemy behavior, and final ranking:

#### **Novice**
- Fewer Zylon ships (patrol groups, reduced task forces)
- More starbases available for refueling
- Slower, more predictable enemy movement
- Easier to achieve beginner ranks
- **Ideal for**: Learning the game

#### **Pilot**
- Moderate number of Zylon ships
- Standard starbase distribution
- Standard enemy movement patterns
- **Ideal for**: Intermediate players

#### **Warrior**
- More Zylon ships and task forces
- Fewer starbases to locate and refuel
- Faster, more aggressive enemy behavior
- Manual hyperspace navigation required
- Zylons show deliberate attack patterns with less randomness
- **Ideal for**: Experienced players

#### **Commander**
- Maximum Zylon threat
- Minimum starbases
- Fastest, most intelligent enemy behavior
- Complex hyperspace navigation
- **Ideal for**: Mastery and ranking

### 2.3 Play Session Structure

```
1. Difficulty Selection
   ↓
2. Game Initialization (random galaxy generation)
   ↓
3. Main Gameplay Loop (real-time)
   ├── Monitor threats on Galactic Chart
   ├── Engage in combat with Zylon forces
   ├── Manage energy and equipment
   ├── Defend starbases
   └── Refuel at friendly starbases
   ↓
4. End Conditions
   ├── All Zylons destroyed → Victory + Rank
   ├── Starship destroyed → Game Over
   └── All starbases destroyed → Failure
   ↓
5. Final Ranking Screen
```

---

## 3. Core Gameplay Mechanics

### 3.1 Objective
**Primary Goal**: Destroy all Zylon ships before they destroy your starship or eliminate all Atarian starbases.

**Secondary Goals**:
- Defend starbases from Zylon attack
- Minimize energy consumption
- Minimize time to completion
- Achieve highest rank possible

### 3.2 Real-Time Galaxy System

The galaxy consists of a **16×16 galactic chart** divided into **256 sectors**. Enemy movement operates in real-time:

- **Patrol Groups**: Move every 30 seconds of real-time
- **Task Forces**: Move every 60 seconds (1 minute)
- **Fleet Groups**: Move every 120 seconds (2 minutes)

This hierarchy creates natural strategic tension: patrol groups threaten immediately, but larger forces are slower to converge.

### 3.3 Zylon Threat Assessment

**Starbase Under Attack**:
- Condition: Surrounded on 3 of 8 compass directions
- Alert: Radio message and visual indication on galactic chart
- Time Limit: 60 seconds to destroy surrounding enemy ships
- Failure: Starbase destroyed, two new enemy ships spawn from debris

**Strategic Implication**: Players must balance exploring sectors and gathering intelligence with defending threatened starbases.

---

## 4. Game Screens & UI

### 4.1 Main Combat View (Cockpit Perspective)
**Primary first-person view from the starship's cockpit**

#### Visual Elements:
- **3D Vector Graphics**: Forward-facing view of space with 3D rendered enemy ships and asteroids
- **Crosshair**: Center targeting reticle for weapon aiming
- **Velocity Indicator**: Current ship speed (0-31)
- **Energy Gauge**: Remaining ship energy (0-9999)
- **Kill Counter**: Number of Zylon ships destroyed
- **Targets Remaining**: Count of surviving Zylon ships
- **Status Display**: Equipment damage status (PESCLR)
- **Shields**: Visual indicator of shield status
- **Automatic Pilot Indicator**: Current autopilot setting

#### Controls:
- **Joystick**: Rotate view left/right/up/down
- **Thrust**: Increase/decrease velocity
- **Shields**: Toggle shield on/off
- **Fire**: Launch photon torpedoes
- **View Selection**: Switch between forward/rear viewing angles

#### Interactions:
- Enemy ships approach from all directions
- Asteroids move unpredictably, causing collision damage
- Real-time weapon tracking and firing
- Dodge and weave maneuvers required

### 4.2 Galactic Chart (Strategic Map)
**2D top-down view of the entire galaxy sector**

#### Visual Elements:
- **16×16 Grid**: Represents 256 sectors
- **Player Position**: Current starship location (highlighted)
- **Starbase Locations**: Friendly bases marked with distinctive symbol
- **Zylon Positions**: Enemy ships/groups marked with threat indicators
- **Sector Coordinates**: Grid reference for navigation
- **Radio Messages**: Subspace radio alerts when bases under attack
- **Warp Navigation**: Select target sector for hyperspace jump

#### Information Display:
- Current sector coordinates
- Energy level
- Number of kills
- Targets remaining
- Damaged equipment warnings
- Status of threatened starbases

#### Strategic Use:
- Plan navigation routes
- Assess overall threat distribution
- Identify safe refuel locations
- Monitor enemy movement patterns

### 4.3 Long-Range Scanner
**Advanced tactical display showing nearby threats**

#### Display Type:
- Bird's-eye view of immediate area around starship
- Shows objects and contacts within scanning range

#### Normal Operation:
- Clear radar blips for friendly starbases
- Clear radar blips for enemy contacts
- Accurate distance and bearing information

#### Damaged Mode:
- Display shows both real contacts and false reflections
- Makes navigation and targeting ambiguous
- Creates gameplay tension when scanner is damaged

### 4.4 Attack Computer Display
**Specialized targeting and weapon system interface**

#### Information:
- Precise coordinates of visible enemy ships
- Weapon status and ammunition
- Range to nearest target
- Targeting lead calculations
- Fire control parameters

#### Purpose:
- Provides targeting data during combat
- Allows precise aiming at distant Zylons
- Transforms raw combat into technical engagement

### 4.5 Status Panel
**Persistent HUD showing ship systems and current conditions**

#### PESCLR Status (Equipment Damage Tracking):
- **Photon Torpedoes**: Weapon system status
- **Engines**: Movement/velocity system status
- **Shields**: Defensive system status
- **Computer**: Navigation/targeting computer status
- **Long-Range Scan**: Scanner system status
- **Radio**: Communications system status

#### Status Indicators:
- ✓ (Check): System operational
- ✗ (Damage): System damaged or destroyed
- ⚠ (Warning): System showing stress

#### Impact on Gameplay:
- **Engine Damage**: Reduces maximum velocity, slows ship
- **Shield Damage**: Reduces shield effectiveness or removes shields entirely
- **Weapon Damage**: Reduces firing rate or accuracy
- **Computer Damage**: Degrades targeting precision
- **Scanner Damage**: Creates false radar images
- **Radio Damage**: Cannot receive starbase distress calls

---

## 5. Display Views & Navigation

### 5.1 Cockpit View Selection

Players can toggle between views:

#### **Forward View** (Nose Camera)
- Look ahead in direction of travel
- Primary combat orientation
- Most intuitive for pursuing enemies

#### **Rear View** (Tail Camera)
- Look backward to pursue fleeing enemies
- Monitor threats approaching from behind
- Tactical withdrawal view

#### Switching Views:
- Keyboard toggle (typically SPACE or VIEW key)
- Rotary menu in modern implementations
- Instant transition with no time penalty

### 5.2 Map Views & Overlays

#### **Galactic Chart Toggle** (MAP key):
- Replaces 3D view with 2D strategic overview
- Time-slowed but not paused (enemies continue moving)
- Return to 3D combat view with automatic targeting

#### **Long-Range Scanner Toggle** (SCAN key):
- Shows tactical area around starship
- Identifies nearby threats and friendly units
- Supplementary to 3D view awareness

#### **Attack Computer Toggle** (SELECT key):
- Displays targeting computer interface
- Shows precise enemy coordinates
- Weapon system status

---

## 6. Navigation & Hyperspace

### 6.1 Sector Navigation
**Hyperspace Warp System**

#### Operation:
- Use Galactic Chart to identify target sector
- Enter hyperspace warp coordinates
- Activate warp drive

#### Energy Cost:
- Energy consumed proportional to warp distance
- Longer warps drain more energy
- Must plan fuel consumption

#### Transition Animation:
- Hyperspace tunnel effect (visual representation of warp)
- Disorientation phase during warp
- Emergence in target sector at random position

#### Skill Level Variation:
- **Novice/Pilot**: Automatic hyperspace navigation
- **Warrior/Commander**: Manual crosshair navigation required
- At higher difficulties, player must pilot ship through warp tunnel using crosshairs
- Failure to navigate correctly can result in collision damage

### 6.2 Warp Position Variables
Starship emerges at random position within target sector:
- **Center proximity**: Enemy ships more likely to attack immediately
- **Edge proximity**: More time for assessment but longer to clear sector
- **Tactical implications**: Landing in sector center is risky but strategically superior

---

## 7. Combat System

### 7.1 Enemy Types

#### **Zylon Fighters** (Fast Attack Ships)
- **Behavior**: Aggressive, pursue player actively
- **Characteristics**: Fast, maneuverable
- **Tactics**: Close-range strafing runs
- **Weakness**: Poor armor, destroyed with moderate firepower
- **Threat Level**: ⭐⭐⭐

#### **Zylon Cruisers** (Patrol Ships)
- **Behavior**: Passive, only attack if provoked
- **Characteristics**: Moderate speed, cruising patterns
- **Tactics**: Patrol assigned sectors
- **Weakness**: Not combat-optimized
- **Threat Level**: ⭐⭐

#### **Zylon Basestars** (Capital Ships)
- **Behavior**: Highly aggressive, coordinated attacks
- **Characteristics**: Slow but heavily armored
- **Special Feature**: Shield generators protect from long-range fire
- **Destruction Method**: Must close to close range or damage shields first
- **Threat Level**: ⭐⭐⭐⭐⭐

### 7.2 Photon Torpedo System

#### Weapon Characteristics:
- Limited ammunition (regenerates with energy)
- Velocity-dependent trajectory
- Lead-based targeting (must aim ahead of moving targets)
- Travel time before detonation

#### Firing Mechanics:
- Manual aim and fire
- Attack Computer Display provides targeting data
- Tracers show projectile path
- Adjustable firing lead based on relative velocity

#### Energy Cost:
- Each shot consumes energy
- Affects total available energy budget
- Must balance aggressive fire with maintaining shields and movement

### 7.3 Shield System

#### Shield Properties:
- Absorbs incoming damage
- Consumes energy when active
- Can be turned on/off for energy management
- Disabled by Computer damage
- Damaged by heavy enemy fire

#### Strategic Use:
- Raise shields when under fire
- Lower shields during peaceful traversal to conserve energy
- Balance shield strength against movement capability

---

## 8. Energy Management

### 8.1 Energy Source & Capacity
- **Starting Energy**: 9999 units
- **Maximum Capacity**: 9999 units
- **Critical Threshold**: <1000 units (warning state)
- **Game Over**: Energy reaches 0

### 8.2 Energy Consumption

| Action | Energy Cost | Notes |
|--------|-------------|-------|
| Movement (per speed unit) | 1 unit/cycle | Higher speed = faster consumption |
| Shields (active) | 1 unit/cycle | Continuous drain while active |
| Photon Torpedo | 50 units | Per shot fired |
| Hyperspace Warp | 200-500 units | Varies with distance |
| Engine Burst | Variable | Acceleration boost |

### 8.3 Energy Refueling
- **Method**: Dock with Atarian starbase
- **Process**: Align ship coordinates with starbase location
- **Result**: Energy restored to full 9999 units
- **Time Required**: Instantaneous upon docking
- **Strategic Role**: Forces return to base for recharge; bases become refuel waypoints

### 8.4 Strategic Energy Planning
- Plan routes between starbases
- Consider warp distance vs. available energy
- Aggressive combat drains energy faster
- Conservative play extends game duration

---

## 9. Asteroid Interactions

### 9.1 Asteroid Physics
- **Appearance**: Random floating objects in sector
- **Movement**: Linear trajectories through space
- **Collision Damage**: Impacts damage player ship
- **Avoidance**: Requires skilled maneuvering

### 9.2 Collision Mechanics
- **Shield Absorption**: Active shields absorb asteroid impacts with energy cost
- **Hull Damage**: Without shields, asteroids cause direct damage
- **Multiple Collisions**: Rapid asteroid strikes can destroy ship
- **Equipment Damage**: Can trigger PESCLR status degradation

---

## 10. Ranking & Score System

### 10.1 Final Ranking System
Instead of numeric scores, players receive humorous military ranks based on performance:

#### Rank Hierarchy (Best to Worst):
1. **Star Commander (Class 1)**
2. **Star Commander (Class 2)**
3. **Star Commander (Class 3)**
4. **Starship Captain**
5. **Starship Pilot**
6. **Fighter Ace**
7. **Weapons Officer**
8. **Navigation Officer**
9. **Tactical Officer**
10. **Starship Medic**
11. **Repair Specialist**
12. **Supply Officer**
13. **Communications Officer**
14. **Galactic Troubleshooter**
15. **Galactic Diplomat**
16. **Planetary Officer**
17. **Satellite Officer**
18. **Asteroid Miner**
19. **Garbage Scow Captain**
20. **Galactic Cook**

### 10.2 Ranking Factors
Rank determined by combination of:
- **Difficulty Level**: Higher difficulty required for top ranks
- **Survival Rate**: Whether ship survived mission
- **Starbase Defense**: How many bases were protected
- **Enemy Destruction**: Total number of Zylons eliminated
- **Time Efficiency**: Time taken to complete objectives
- **Energy Efficiency**: Energy wasted vs. used effectively
- **Equipment Damage**: Number of systems that were damaged

### 10.3 Ranking Thresholds
- **Commander Difficulty**: Required to achieve top ranks
- **Perfect Mission**: All Zylons destroyed, all starbases defended, minimal waste → Star Commander (Class 1)
- **Poor Performance**: Many starbases destroyed, excessive time → Galactic Cook or Garbage Scow Captain

---

## 11. User Interface Design

### 11.1 Cockpit HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ◆ FORWARD VIEW ◆              VELOCITY: 15  ENERGY: 7453   │
│                                                              │
│          ⚔    ╱ ╲    ⚔                                      │
│             ╱     ╲                                         │
│           ╱         ╲                    ★ (Zylon)         │
│         ╱             ╲                                     │
│       ╱                 ╲                                   │
│     ╱                     ╲                                 │
│   ◆ ─────────────────────── ◆         ★ (Zylon)           │
│     ╲                     ╱                                 │
│       ╲                 ╱                                   │
│         ╲             ╱                                     │
│           ╲         ╱                                       │
│             ╲     ╱                   ✻ (Asteroid)         │
│               ╲ ╱                                          │
│                                                              │
│ KILLS: 7        TARGETS: 5              SHIELDS: ON        │
├─────────────────────────────────────────────────────────────┤
│ P✓ E✗ S✓ C✗ L✓ R✓  │  ALERT: BASESTAR APPROACHING       │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Galactic Chart Layout

```
┌────────────────────────────────────────┐
│ GALACTIC CHART  [SECTOR 7,9]           │
├────────────────────────────────────────┤
│  0 1 2 3 4 5 6 7 8 9 A B C D E F      │
│0 . . . . . . . . . . . . . . . .      │
│1 . . . . ◆ . . . . . . . . . . .      │
│2 . . . . . . . . . . . . . . . .      │
│3 . . . . . . . ★ . . . . . . . .      │
│4 . . . . . . . . . . . . . . . .      │
│5 . . . ⭐ . . . . . . ⭐ . . . . .      │
│6 . . . . . . . ★ . . . . . . . .      │
│7 . . . . . . . . . . . . . . . .      │
│8 . . . . . . . . . . . . . . . .      │
│9 . . . ⭐ . . . . . . . . . . . .      │
│A . . . . . . . . . . . . . . . .      │
│B . . . . . . . . . . . . . . . .      │
│C . . . . . . . . . . . . . . . .      │
│D . ★ . . . . . . . . . . . . . .      │
│E . . . . . . . . . . . . . . . .      │
│F . . . . . . . . . . . . . . . .      │
├────────────────────────────────────────┤
│ ◆=SHIP ⭐=BASE ★=ENEMY                 │
│ ENERGY: 7453  KILLS: 7  TARGETS: 5   │
│ ⚠ BASE [5,9] UNDER ATTACK!           │
└────────────────────────────────────────┘
```

### 11.3 Status Panel Components

Each status element:
- **Label**: System name (P/E/S/C/L/R)
- **Status Indicator**: ✓ (OK) / ✗ (Damaged) / ⚠ (Warning)
- **Visual Distinction**: Color coding optional (green/yellow/red)

---

## 12. Control Scheme

### 12.1 Joystick Controls
- **Up/Down/Left/Right**: Rotate 3D view (pitch & yaw)
- **Button 1 (Fire)**: Launch photon torpedo
- **Button 2 (Alternate)**: Context-sensitive (varies by mode)

### 12.2 Keyboard Controls
Standard mapping (customizable):

| Function | Key |
|----------|-----|
| Thrust Increase | W or ↑ |
| Thrust Decrease | S or ↓ |
| Rotate Left | A or ← |
| Rotate Right | D or → |
| Rotate Up | Q or PageUp |
| Rotate Down | Z or PageDown |
| Fire Weapon | SPACE or Ctrl |
| Toggle Shields | X |
| Toggle Forward/Rear View | V |
| Show Galactic Chart | M (Map) |
| Show Long-Range Scan | R (Radar) |
| Show Attack Computer | T (Target) |
| Select Hyperspace Destination | G (Go/Goto) |
| Confirm/Enter | RETURN |
| Menu/Escape | ESC |

### 12.3 Modern Input Adaptations
- **Mouse**: Alternative aiming in 3D view
- **Gamepad**: Analog sticks for smooth rotation
- **Touch**: On-screen button controls for mobile

---

## 13. Audio Design

### 13.1 Sound Effects

| Event | Sound Description |
|-------|-------------------|
| **Photon Torpedo Fire** | Electronic beep/zap sound |
| **Enemy Attack/Explosions** | Buzzing electronic explosion |
| **Shield Impact** | Metallic tone with resonance |
| **Asteroid Collision** | Harsh electronic crash |
| **Starbase Destroyed** | Mournful electronic wail |
| **Hyperspace Warp** | Distinctive whooshing tone |
| **Radio Distress Call** | Beeping alert pattern |
| **System Damage** | Warning alarm sound |
| **Energy Low** | Rapid beeping alert |

### 13.2 Music
- **Title Screen**: Theme music (memorable, ominous)
- **Gameplay Loop**: Atmospheric background score
- **Combat Intensity**: Dynamic music increases with threat level
- **Victory/Defeat**: Respective endings with distinctive audio

### 13.3 Voice/Text
- **Subspace Radio Messages**: Text-based (no voice acting initially)
- **Example Messages**:
  - "STARBASE [LOCATION] UNDER ATTACK"
  - "STARBASE [LOCATION] DESTROYED"
  - "SECTOR CLEARED"

---

## 14. Progression & Difficulty Scaling

### 14.1 Game Pacing
- **Opening Phase**: Tutorial orientation, limited threats
- **Middle Phase**: Escalating pressure, multiple simultaneous threats
- **End Phase**: Critical defense situations, resource scarcity
- **Climax**: Final Zylon elimination or failure condition

### 14.2 Scaling by Difficulty

| Aspect | Novice | Pilot | Warrior | Commander |
|--------|--------|-------|---------|-----------|
| Enemy Groups | 2-4 | 4-6 | 6-8 | 8-12 |
| Starbases | 8-10 | 6-8 | 4-6 | 2-4 |
| Enemy Speed | Slow | Normal | Fast | Very Fast |
| AI Randomness | High | Medium | Low | Very Low |
| Manual Warp Nav | No | No | Yes | Yes |
| Ranking Available | Novice Only | Pilot+ | Warrior+ | Commander Only |

---

## 15. Visual Style & Aesthetics

### 15.1 Cockpit View Art Direction
- **3D Vector Graphics**: Simple geometric shapes representing space objects
- **Crosshair/Reticle**: Central aiming reference
- **Asteroid Shapes**: Varied geometric polygons
- **Enemy Ships**: Recognizable silhouettes (Fighters, Cruisers, Basestars)
- **Color Palette**: Sci-fi aesthetic (blues, cyans, oranges against black)
- **Animation**: Smooth real-time 3D rotation and object movement

### 15.2 Map/Chart Presentation
- **Galactic Chart**: Clean grid layout with symbolic markers
- **Long-Range Scan**: Radar-style display with blips
- **Visual Hierarchy**: Player at center, threats clearly marked
- **Information Density**: Clear without overwhelming player

### 15.3 HUD/Status Display
- **Font**: Clean, tech-forward typeface
- **Colors**: Contrasting (white text on dark backgrounds)
- **Status Indicators**: Clear ✓/✗ symbols
- **Hierarchy**: Critical info prominent, secondary info accessible

---

## 16. Technical Specifications

### 16.1 Platform Requirements
- **Web-Based**: HTML5 Canvas or WebGL
- **Desktop**: Electron wrapper for standalone builds
- **Mobile**: Touch-adapted interface
- **Performance**: 60 FPS target on modern devices
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)

### 16.2 Game Engine
- **Recommended**: WebGL for 3D rendering
- **Fallback**: Canvas 2D for compatibility
- **Physics**: Simple linear motion, collision detection
- **AI**: Pathfinding algorithm for enemy behavior

### 16.3 Data Persistence
- **High Scores**: Local storage or cloud sync
- **Settings**: User preference storage
- **Game State**: Session-based (optional save/resume)

---

## 17. Accessibility

### 17.1 Colorblind Support
- Alternative visual indicators beyond color alone
- Option to enable high-contrast modes
- Distinct symbols for different object types

### 17.2 Controls
- Fully customizable key bindings
- Support for various input devices (joystick, gamepad, mouse, keyboard)
- Adjustable sensitivity for aim/rotation

### 17.3 Difficulty Accessibility
- Adjustable game speed/pause options
- Optional tutorial/practice mode
- Clear on-screen instructions

---

## 18. Comparison to Original

### 18.1 Feature Parity
- ✅ 4 difficulty levels with distinct gameplay
- ✅ 256-sector galactic chart
- ✅ 3D first-person cockpit view
- ✅ Real-time enemy threat system
- ✅ Equipment damage (PESCLR)
- ✅ Starbase defense mechanic
- ✅ Ranking system with humorous titles
- ✅ Multiple game views (forward/rear/map/scanner)
- ✅ Hyperspace navigation
- ✅ Energy management system

### 18.2 Enhancements (Modern Quality-of-Life)
- High-resolution graphics (original was 160×96)
- Smooth frame rate (original was limited by hardware)
- Customizable controls
- Optional pause functionality
- Modern sound design (original POKEY chip emulation optional)
- Save/load game states
- Online leaderboards (optional)

---

## 19. Screen Flow Diagram

```
START
  ↓
MAIN MENU ──→ New Game
  │             ↓
  │         DIFFICULTY SELECT
  │             ↓
  │         GAME INIT (Random Galaxy)
  │             ↓
  ├────────→ COCKPIT VIEW (3D Combat)
  │             ↓
  │         Decision Point
  │         ├─→ View Galactic Chart (M) ─→ Plan/Warp
  │         ├─→ View Long-Range Scan (R)  ─→ Tactical Info
  │         ├─→ View Attack Computer (T) ─→ Targeting
  │         └─→ Continue Combat
  │             ↓
  │         Real-Time Gameplay Loop
  │         ├─→ Enemy Moves
  │         ├─→ Process Input
  │         ├─→ Update Physics
  │         ├─→ Check Collisions
  │         ├─→ Render Frame
  │             ↓
  │         Victory/Defeat Check
  │         ├─→ All Zylons Dead? → VICTORY
  │         ├─→ Ship Destroyed? → DEFEAT
  │         ├─→ All Bases Lost? → FAILURE
  │         └─→ Continue
  │             ↓
  ├────────→ FINAL RANKING SCREEN
  │             ↓
  │         New Game / Quit?
  └─────────────→ MAIN MENU or EXIT
```

---

## 20. Development Roadmap

### Phase 1: Core Systems (Weeks 1-4)
- [ ] Galactic chart and sector system
- [ ] Enemy AI and movement patterns
- [ ] Energy/resource management
- [ ] Equipment damage system (PESCLR)
- [ ] Starbase defense mechanics

### Phase 2: 3D Combat (Weeks 5-8)
- [ ] 3D cockpit view rendering
- [ ] Enemy ship models and animation
- [ ] Asteroid generation and collision
- [ ] Weapon system and targeting
- [ ] Shield mechanics

### Phase 3: UI & Polish (Weeks 9-10)
- [ ] HUD status panel
- [ ] Map/chart interface
- [ ] Long-range scanner display
- [ ] Attack computer interface
- [ ] Menu and flow screens

### Phase 4: Audio & Testing (Week 11-12)
- [ ] Sound effects
- [ ] Music/atmospheric audio
- [ ] Testing across platforms
- [ ] Balance adjustments
- [ ] Performance optimization

### Phase 5: Launch & Iteration (Week 13+)
- [ ] Release v1.0
- [ ] Community feedback
- [ ] Balance patches
- [ ] Optional: Leaderboards, social features

---

## 21. Success Criteria

### 21.1 Functional Requirements
- ✅ All 4 difficulty levels implemented and balanced
- ✅ Real-time galaxy system with accurate enemy movement
- ✅ Starbase defense mechanics functioning correctly
- ✅ 3D cockpit rendering at 60 FPS
- ✅ Complete PESCLR damage system
- ✅ Ranking system calculating scores correctly
- ✅ All control schemes fully functional

### 21.2 Quality Requirements
- ✅ No game-breaking bugs at launch
- ✅ Clear tutorial/onboarding
- ✅ Balanced gameplay across difficulty levels
- ✅ Responsive input handling
- ✅ Consistent frame rate performance
- ✅ Accessible UI at multiple resolutions

### 21.3 Experience Requirements
- ✅ Captures essence of original (player feedback)
- ✅ Deep, strategic gameplay rewarded
- ✅ Fair difficulty curve
- ✅ Satisfying combat feedback
- ✅ Compelling rank progression

---

## 22. Appendix: Reference Materials

### 22.1 Historical Sources
- Wikipedia: Star Raiders article
- GitHub: lwiest/StarRaiders (Reverse-engineered source code)
- Perplexity AI: Detailed gameplay analysis

### 22.2 Key Inspirations
- Battlestar Galactica (enemy naming, concept)
- Star Wars (visual style, action)
- Star Trek (galactic chart concept)
- 2001: A Space Odyssey (cockpit perspective)

### 22.3 Legacy Impact
- Influenced: Elite, Wing Commander, Star Control
- Recognized: Library of Congress game canon (2007)
- Status: First killer app for Atari computers

---

## Document Metadata
- **Version**: 1.0
- **Date Created**: December 2025
- **Status**: Complete
- **Audience**: Development Team, Stakeholders
- **Next Review**: Upon project completion

---

*This PRD serves as the comprehensive specification for the Star Raiders game clone. It captures the full scope of features, mechanics, and design principles that made the original a classic, while providing clear technical guidance for modern implementation.*
