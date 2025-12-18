# Galaxy and Navigation Systems

## 1. Galaxy Generation

### Grid Structure
The galaxy is a 16x16 grid (256 sectors).
*   **Coordinates:** X (0-15), Y (0-15).
*   **Sector Contents:** Empty, Starbase, or Enemy Squadron.

### Initialization Algorithm
1.  **Starbases:** 2-4 placed based on difficulty. Minimum distance of 3 sectors between bases.
2.  **Enemies:** 10-30 squadrons placed in 2-4 clusters. Clusters avoid starbases by at least 4 sectors.
3.  **Player Start:** Random empty sector (fallback to 8,8).

```csharp
// Pseudocode: Galaxy Initialization
function InitializeGalaxy(difficulty):
    // Create 16x16 grid
    galaxy = new Sector[16][16]
    
    // Initialize all sectors as empty
    for x in 0 to 15:
        for y in 0 to 15:
            galaxy[x][y] = { type: EMPTY, enemies: [], starbase: null }

    // Place starbases
    starbaseCount = GetStarbaseCount(difficulty)
    PlaceStarbases(starbaseCount)

    // Place enemies
    enemyCount = GetEnemyCount(difficulty)
    PlaceEnemies(enemyCount)

    // Set player starting position
    playerSector = FindEmptySector()
    return galaxy
```

## 2. Starbase System

### Functionality
*   **Docking:** Repairs all systems and refuels energy (7000 units).
*   **Defense:** Starbases can be surrounded by enemies.
    *   **Under Attack:** If 2+ enemy squadrons are adjacent, the starbase is "Under Attack".
    *   **Destruction:** After a countdown (100 centons), the starbase is destroyed if not defended.
    *   **Alerts:** Radio messages warn the player of attacks.

### Docking Procedure
1.  Enter starbase sector.
2.  Approach within 10 metrons.
3.  Reduce speed to < 2.
4.  Automatic docking sequence initiates.

## 3. Hyperspace Navigation

### Mechanics
*   **Energy Cost:** Distance * 100 * Difficulty Multiplier.
*   **Process:**
    1.  Select target sector on Galactic Chart.
    2.  Engage Hyperspace (Key 'H').
    3.  **Novice/Pilot:** Automatic travel (3 seconds).
    4.  **Warrior/Commander:** Manual navigation required.

### Manual Navigation (Warrior/Commander)
*   **Visuals:** "Hyperspace tunnel" effect with a drifting crosshair.
*   **Gameplay:** Player must keep the crosshair centered using joystick/keys.
*   **Drift:** Random drift vectors applied every 0.5s. Stronger on Commander.
*   **Outcome:**
    *   **Success (>80% accuracy):** Arrive at target sector.
    *   **Failure:** Arrive at random adjacent sector + "HYPERSPACE NAVIGATION ERROR".

```csharp
// Pseudocode: Manual Hyperspace Navigation
function UpdateManualHyperspace(deltaTime):
    // Apply random drift
    driftTimer += deltaTime
    if driftTimer >= 0.5:
        driftX = Random(-1, 1)
        driftY = Random(-1, 1)
        
        if difficultyLevel == COMMANDER:
            driftX *= 1.5
            driftY *= 1.5
        
        crosshairOffset.x += driftX
        crosshairOffset.y += driftY
        driftTimer = 0
    
    // Apply player corrections
    if input.left: crosshairOffset.x -= 5 * deltaTime
    if input.right: crosshairOffset.x += 5 * deltaTime
    if input.up: crosshairOffset.y -= 5 * deltaTime
    if input.down: crosshairOffset.y += 5 * deltaTime
    
    // Check completion
    if hyperspaceTimer >= 3.0:
        centeringAccuracy = CalculateCenteringAccuracy()
        if centeringAccuracy > 0.8:
            ArriveAtSector(hyperspaceDestination)
        else:
            randomSector = GetRandomAdjacentSector(hyperspaceDestination)
            ArriveAtSector(randomSector)
            ShowMessage("HYPERSPACE NAVIGATION ERROR")
```
