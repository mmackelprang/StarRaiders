# UI/UX Design

## 1. Screen Overview

The game consists of 8 primary screens:

### 1. Title Screen
Difficulty selection (Novice, Pilot, Warrior, Commander).

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         ★  ★  ★  ★  ★  ★  ★                             │
│                                                                          │
│                      ███████╗████████╗ █████╗ ██████╗                   │
│                      ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗                  │
│                      ███████╗   ██║   ███████║██████╔╝                  │
│                      ╚════██║   ██║   ██╔══██║██╔══██╗                  │
│                      ███████║   ██║   ██║  ██║██║  ██║                  │
│                      ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝                  │
│                                                                          │
│                      ██████╗  █████╗ ██╗██████╗ ███████╗██████╗ ███████╗│
│                      ██╔══██╗██╔══██╗██║██╔══██╗██╔════╝██╔══██╗██╔════╝│
│                      ██████╔╝███████║██║██║  ██║█████╗  ██████╔╝███████╗│
│                      ██╔══██╗██╔══██║██║██║  ██║██╔══╝  ██╔══██╗╚════██║│
│                      ██║  ██║██║  ██║██║██████╔╝███████╗██║  ██║███████║│
│                      ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝│
│                                                                          │
│                         ★  ★  ★  ★  ★  ★  ★                             │
│                                                                          │
│                        SELECT DIFFICULTY LEVEL:                         │
│                                                                          │
│                          ▶ NOVICE                                       │
│                            PILOT                                        │
│                            WARRIOR                                      │
│                            COMMANDER                                    │
│                                                                          │
│                      [PRESS FIRE TO BEGIN MISSION]                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2. Galactic Chart
16x16 grid view for strategic planning.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ GALACTIC CHART                                    SECTOR: 07,12          │
├──────────────────────────────────────────────────────────────────────────┤
│    0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F                       │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                      │
│ 0│  │  │  │RR│  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 1│  │  │  │R │  │  │  │BB│  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 2│  │BB│  │  │  │  │  │  │  │  │  │  │R │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 3│  │  │  │  │  │  │  │  │  │RR│  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 4│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 5│  │  │  │  │  │  │  │  │  │  │  │  │  │  │BB│  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 6│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 7│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 8│  │  │  │  │  │  │  │RR│  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 9│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ A│  │  │  │  │  │  │  │  │  │  │  │RR│  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ B│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ C│  │  │  │  │  │>>│  │  │  │  │  │  │  │  │  │  │   V: 00  E: 5240    │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤   K: 03  T: --      │
│ D│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤   TIME: 0245        │
│ E│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤   DC: PESCLR        │
│ F│  │  │BB│  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                      │
│                                                                          │
│  LEGEND:  >> = Player    BB = Starbase    R = Enemy    Blank = Empty    │
│                                                                          │
│  [G] CHART  [F] FORE  [A] AFT  [L] SCAN  [H] HYPERSPACE                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3. Fore View
Main combat view (First-person).

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ V: 06    E: 4250    K: 03    T: F                                        │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │                    ·    ·        ·                                 │   │
│ │        ·                                  ·         ·              │   │
│ │   ·                       ▲                               ·        │   │
│ │              ·           /█\          ·                            │   │
│ │                         /███\                                      │   │
│ │    ·                   /█████\              ▲                ·     │   │
│ │                       /███████\            /█\                     │   │
│ │           ·                              /███\         ·           │   │
│ │                                         /█████\                    │   │
│ │ ·                                                                  │   │
│ │                                                         ·          │   │
│ │        ·                                                           │   │
│ │                  ═════════►                                  ·     │   │
│ │    ·                                                               │   │
│ │                          ·                     ·                   │   │
│ │              ·                                              ·      │   │
│ │   ·                                                                │   │
│ │                    ·              ·                   ·            │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│           ○                 R: 45                    ○                   │
│       (H-POS)                                     (V-POS)                │
│                                                                          │
│           ⊕                  ⊕                    ⊕                      │
│        (H-LOCK)           (RANGE)              (V-LOCK)                  │
│                                                                          │
│ [S] SHIELDS: ON   [T] COMPUTER: ON   [F] FORE  [A] AFT  [G] CHART       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4. Aft View
Rear combat view.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ V: 09    E: 3820    K: 05    T: F                                        │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │  ·                                           ·                     │   │
│ │             ·                    ·                                 │   │
│ │                                                      ·             │   │
│ │      ·                                                             │   │
│ │                                                                    │   │
│ │                          ▼                                   ·     │   │
│ │             ·           \█/                                        │   │
│ │                        \███/              ·                        │   │
│ │   ·                   \█████/                                      │   │
│ │                      \███████/                           ·         │   │
│ │                                  ·                                 │   │
│ │                                                                    │   │
│ │         ·                                                    ·     │   │
│ │                                           ▼                        │   │
│ │                                          \█/                 ·     │   │
│ │    ·                                    \███/                      │   │
│ │                                        \█████/                     │   │
│ │              ·                                         ·           │   │
│ │                           ·                                        │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│           ○                 R: 62                    ○                   │
│       (H-POS)                                     (V-POS)                │
│                                                                          │
│           ⊕                  ⊕                    ⊕                      │
│        (H-LOCK)           (RANGE)              (V-LOCK)                  │
│                                                                          │
│ [S] SHIELDS: ON   [T] COMPUTER: ON   [F] FORE  [A] AFT  [G] CHART       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5. Long-Range Scan
Top-down tactical radar view.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LONG-RANGE SECTOR SCAN                           SECTOR: 07,12          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                           RANGE CIRCLES                                  │
│                                                                          │
│                  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                           │
│              ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                         │
│           ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                      │
│         ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                     │
│       ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                    │
│     ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                   │
│    ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                 │
│   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                  │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                │
│  ·  ·  ·  ·  · F ·  ·  ·  ▲  ·  ·  ·  ·  ·  ·  ·  ·  ·                  │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · C ·  ·  ·  ·  ·                  │
│   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                  │
│    ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                 │
│     ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                   │
│       ·  ·  ·  ·  ·  ·  · F ·  ·  ·  ·  ·  ·  ·  ·  ·                   │
│         ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                     │
│           ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                      │
│              ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                         │
│                  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                           │
│                                                                          │
│                                                     V: 00  E: 4250       │
│  LEGEND:                                            K: 03  T: F          │
│  ▲ = Player (You)          F = Fighter                                  │
│  C = Cruiser               B = Basestar             ENEMIES: 3           │
│  · = Range Markers (10 metron intervals)                                │
│                                                                          │
│  [L] SCAN  [F] FORE  [A] AFT  [G] CHART                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6. Hyperspace View
Visual effect during sector transit.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                      ║ ║ ║ ║ ║ ║ ║ ║ ║                                 │
│                    ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                               │
│                  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                             │
│                ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                           │
│              ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                         │
│            ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                       │
│          ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                     │
│        ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                   │
│      ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                 │
│    ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ╳ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║               │
│  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ⊕ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║             │
│ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║          │
│  ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║             │
│    ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║               │
│      ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                 │
│        ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                   │
│          ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                     │
│            ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                       │
│              ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║ ║                         │
│                                                                          │
│         KEEP CROSSHAIRS CENTERED!          DESTINATION: 0B,05            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7. Game Over
Victory/Defeat summary.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                       ╔═══════════════════════════════╗                  │
│                       ║                               ║                  │
│                       ║      MISSION FAILED           ║                  │
│                       ║                               ║                  │
│                       ║   ALL STARBASES DESTROYED     ║                  │
│                       ║                               ║                  │
│                       ║   THE GALAXY HAS FALLEN       ║                  │
│                       ║   TO THE ZYLON EMPIRE         ║                  │
│                       ║                               ║                  │
│                       ╚═══════════════════════════════╝                  │
│                                                                          │
│                                                                          │
│                         ENEMIES REMAINING: 12                            │
│                         TIME SURVIVED: 0347 CENTONS                      │
│                                                                          │
│                                                                          │
│                    [PRESS FIRE FOR MISSION RATING]                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 8. Ranking
Mission performance evaluation.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                   MISSION PERFORMANCE EVALUATION                         │
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │                                                                    │   │
│ │  MISSION PARAMETERS:                                               │   │
│ │  ───────────────────                                               │   │
│ │  Difficulty Level:       COMMANDER                                 │   │
│ │  Starting Enemy Forces:  28 Ships                                  │   │
│ │  Starting Starbases:     2                                         │   │
│ │                                                                    │   │
│ │  PERFORMANCE METRICS:                                              │   │
│ │  ────────────────────                                              │   │
│ │  Enemies Destroyed:      28 / 28        ████████████████  100%    │   │
│ │  Starbases Remaining:    2  / 2         ████████████████  100%    │   │
│ │  Energy Efficiency:      EXCELLENT                                 │   │
│ │  Time Taken:             0412 Centons                              │   │
│ │  Damage Sustained:       MINIMAL                                   │   │
│ │                                                                    │   │
│ │  SCORE CALCULATION:                                                │   │
│ │  ──────────────────                                                │   │
│ │  Base Score:             +180 pts                                  │   │
│ │  Difficulty Bonus:       +90 pts  (Commander ×2.0)                 │   │
│ │  Starbase Bonus:         +40 pts  (2 saved)                        │   │
│ │  Efficiency Bonus:       +25 pts                                   │   │
│ │  ─────────────────────────────────                                 │   │
│ │  TOTAL SCORE:            335 pts                                   │   │
│ │                                                                    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                                                                          │
│                  ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★                          │
│                                                                          │
│                        YOUR RANK:                                        │
│                                                                          │
│                   ╔═════════════════════════════╗                        │
│                   ║                             ║                        │
│                   ║    STAR COMMANDER           ║                        │
│                   ║         CLASS 4             ║                        │
│                   ║                             ║                        │
│                   ╚═════════════════════════════╝                        │
│                                                                          │
│                  ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★                          │
│                                                                          │
│                                                                          │
│              [PRESS FIRE TO RETURN TO TITLE SCREEN]                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2. HUD Specifications

### General Layout
*   **Top-Left:** Velocity (`V: 00-09`), Energy (`E: 0000-7000`).
*   **Top-Right:** Kills (`K: 00-99`), Tracking Target (`T: F/C/B/--`).
*   **Bottom-Center:** Range (`R: 000-999`), Lock Indicators (3 Crosshairs).
*   **Sides:** Horizontal/Vertical alignment circles.
*   **Bottom Status:** Shields (`[S]`), Computer (`[T]`).

### Color Coding
*   **Green:** Normal/Safe/Operational.
*   **Yellow:** Warning/Damaged/Caution.
*   **Red:** Danger/Critical/Destroyed/Enemy.
*   **Cyan:** System Operational (PESCLR).
*   **Blue:** Starbase/Friendly.

## 3. Input Controls

### Input Manager Implementation

```csharp
// Pseudocode: Input Manager
class InputManager:
    keyState = {}  // Current frame key states
    previousKeyState = {}  // Previous frame key states
    joystickState = {x: 0, y: 0, fire: false}

function UpdateInput():
    // Copy current state to previous
    previousKeyState = Copy(keyState)
    
    // Poll current input
    PollKeyboard()
    PollJoystick()  // If gamepad present

function PollKeyboard():
    // Speed control (0-9)
    for i in 0 to 9:
        if IsKeyDown(KEY_0 + i):
            playerVelocity = i
    
    // View selection
    if IsKeyPressed(KEY_F): StateManager.ChangeState(PLAYING)  // Fore view
    if IsKeyPressed(KEY_A): currentView = AFT_VIEW
    if IsKeyPressed(KEY_G): StateManager.ChangeState(GALACTIC_CHART)
    if IsKeyPressed(KEY_L):
        if systems.longRange != DESTROYED: currentView = LONG_RANGE_SCAN
        else: ShowMessage("LONG RANGE SCAN DESTROYED")
    if IsKeyPressed(KEY_H):
        // Hyperspace (from Galactic Chart)
        if currentState == GALACTIC_CHART: InitiateHyperspace(cursorPosition)
    
    // System toggles
    if IsKeyPressed(KEY_S): ToggleShields()
    if IsKeyPressed(KEY_T): ToggleComputer()
    
    // Fire button
    if IsKeyDown(KEY_SPACE) or IsKeyDown(KEY_CTRL):
        FireTorpedo(playerPosition, GetPlayerFacingDirection(), PLAYER)
    
    // Arrow keys for steering
    if IsKeyDown(KEY_LEFT): input.left = true
    if IsKeyDown(KEY_RIGHT): input.right = true
    if IsKeyDown(KEY_UP): input.up = true
    if IsKeyDown(KEY_DOWN): input.down = true
    
    // Pause
    if IsKeyPressed(KEY_ESC):
        if currentState == PLAYING: StateManager.ChangeState(PAUSED)
        else if currentState == PAUSED: StateManager.ChangeState(PLAYING)

function ToggleShields():
    if systems.shields == DESTROYED:
        ShowMessage("SHIELDS DESTROYED")
        PlaySound("error")
        return
    
    shieldsActive = not shieldsActive
    
    if shieldsActive:
        PlaySound("shields_on")
        ShowMessage("SHIELDS ON")
    else:
        PlaySound("shields_off")
        ShowMessage("SHIELDS OFF")
```

### Keyboard
*   **0-9:** Set Speed.
*   **Arrow Keys:** Steering (Pitch/Yaw).
*   **Space:** Fire Torpedo.
*   **F:** Fore View.
*   **A:** Aft View.
*   **G:** Galactic Chart.
*   **L:** Long-Range Scan.
*   **H:** Hyperspace (from Chart).
*   **S:** Toggle Shields.
*   **T:** Toggle Computer.

### Gamepad (Modern)
*   **Left Stick:** Steering.
*   **A Button:** Fire.
*   **Bumpers:** Speed Up/Down.
*   **D-Pad:** View Switching.

## 4. Galactic Chart UI
*   **Grid:** 16x16 sectors.
*   **Symbols:**
    *   `>>`: Player (Pulsing).
    *   `BB`: Starbase (Blue).
    *   `R`/`RR`: Enemy Squadron (Red).
    *   `DC: PESCLR`: Damage Control Status (Cyan/Yellow/Red).

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ GALACTIC CHART                                    SECTOR: 07,12          │
├──────────────────────────────────────────────────────────────────────────┤
│    0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F                       │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐                      │
│ 0│  │  │  │RR│  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 1│  │  │  │R │  │  │  │BB│  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 2│  │BB│  │  │  │  │  │  │  │  │  │  │R │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 3│  │  │  │  │  │  │  │  │  │RR│  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 4│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 5│  │  │  │  │  │  │  │  │  │  │  │  │  │  │BB│  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 6│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 7│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 8│  │  │  │  │  │  │  │RR│  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ 9│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ A│  │  │  │  │  │  │  │  │  │  │  │RR│  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ B│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤                      │
│ C│  │  │  │  │  │>>│  │  │  │  │  │  │  │  │  │  │   V: 00  E: 5240    │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤   K: 03  T: --      │
│ D│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤   TIME: 0245        │
│ E│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤   DC: PESCLR        │
│ F│  │  │BB│  │  │  │  │  │  │  │  │  │  │  │  │  │                      │
│  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘                      │
│                                                                          │
│  LEGEND:  >> = Player    BB = Starbase    R = Enemy    Blank = Empty    │
│                                                                          │
│  [G] CHART  [F] FORE  [A] AFT  [L] SCAN  [H] HYPERSPACE                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## 5. Combat View (Fore)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ V: 06    E: 4250    K: 03    T: F                                        │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │                    ·    ·        ·                                 │   │
│ │        ·                                  ·         ·              │   │
│ │   ·                       ▲                               ·        │   │
│ │              ·           /█\          ·                            │   │
│ │                         /███\                                      │   │
│ │    ·                   /█████\              ▲                ·     │   │
│ │                       /███████\            /█\                     │   │
│ │           ·                              /███\         ·           │   │
│ │                                         /█████\                    │   │
│ │ ·                                                                  │   │
│ │                                                         ·          │   │
│ │        ·                                                           │   │
│ │                  ═════════►                                  ·     │   │
│ │    ·                                                               │   │
│ │                          ·                     ·                   │   │
│ │              ·                                              ·      │   │
│ │   ·                                                                │   │
│ │                    ·              ·                   ·            │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│           ○                 R: 45                    ○                   │
│       (H-POS)                                     (V-POS)                │
│                                                                          │
│           ⊕                  ⊕                    ⊕                      │
│        (H-LOCK)           (RANGE)              (V-LOCK)                  │
│                                                                          │
│ [S] SHIELDS: ON   [T] COMPUTER: ON   [F] FORE  [A] AFT  [G] CHART       │
└──────────────────────────────────────────────────────────────────────────┘
```

## 6. Long Range Scan

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LONG-RANGE SECTOR SCAN                           SECTOR: 07,12          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                           RANGE CIRCLES                                  │
│                                                                          │
│                  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                           │
│              ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                         │
│           ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                      │
│         ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                     │
│       ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                    │
│     ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                   │
│    ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                 │
│   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                  │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                │
│  ·  ·  ·  ·  · F ·  ·  ·  ▲  ·  ·  ·  ·  ·  ·  ·  ·  ·                  │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · C ·  ·  ·  ·  ·                  │
│   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                  │
│    ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                 │
│     ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                   │
│       ·  ·  ·  ·  ·  ·  · F ·  ·  ·  ·  ·  ·  ·  ·  ·                   │
│         ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                     │
│           ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                      │
│              ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                         │
│                  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·                           │
│                                                                          │
│                                                     V: 00  E: 4250       │
│  LEGEND:                                            K: 03  T: F          │
│  ▲ = Player (You)          F = Fighter                                  │
│  C = Cruiser               B = Basestar             ENEMIES: 3           │
│  · = Range Markers (10 metron intervals)                                │
│                                                                          │
│  [L] SCAN  [F] FORE  [A] AFT  [G] CHART                                 │
└──────────────────────────────────────────────────────────────────────────┘
```
