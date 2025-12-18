# Combat and AI Systems

## 1. Enemy AI System

### Architecture
The AI is divided into two layers:
1.  **Strategic AI (Galaxy Level):** Manages squadron movement across the 16x16 grid.
2.  **Tactical AI (Sector Level):** Manages individual ship behavior during combat.

### Strategic AI
*   **Goal:** Destroy all starbases.
*   **Movement:** Squadrons move toward the nearest vulnerable starbase.
*   **Surcirclement:** If a starbase is surrounded by 2+ enemy squadrons, it enters an "Under Attack" state and will be destroyed after a timer expires.

```csharp
// Pseudocode: Strategic AI
function StrategicMove(squadron):
    // Find target (nearest vulnerable starbase)
    target = FindTargetStarbase()
    
    if target == null:
        PatrolRandomly(squadron)
        return
    
    // Calculate path toward target
    currentPos = squadron.position
    nextPos = GetNextSectorToward(currentPos, target)
    
    // Move squadron
    MoveSquadronToSector(squadron, nextPos)
    
    // Check if surrounded starbase
    CheckStarbaseSurround(target)
```

### Tactical AI (Combat Behavior)
Behaviors vary by ship type:

*   **Fighter (Zylon):** Aggressive. Approaches player, circles at close range, fires frequently.
*   **Cruiser:** Defensive. Maintains distance, fires while retreating if provoked.
*   **Basestar:** Heavy platform. Slow movement, stops to fire continuously.

```csharp
// Pseudocode: Tactical AI (Fighter)
function FighterBehavior(ship, deltaTime):
    playerDist = DistanceToPlayer(ship)
    
    if playerDist > 80:
        // Approach player aggressively
        MoveToward(ship, playerPosition, ship.speed * deltaTime)
    else if playerDist > 30:
        // In combat range, circle and fire
        CirclePlayer(ship, deltaTime)
        if CanFire(ship):
            FireAtPlayer(ship)
    else:
        // Too close, back off slightly then fire
        MoveAway(ship, playerPosition, ship.speed * 0.5 * deltaTime)
        if CanFire(ship):
            FireAtPlayer(ship)
```

### Difficulty Scaling
AI parameters scale with difficulty (Novice, Pilot, Warrior, Commander):
*   **Speed:** 0.5x to 1.25x
*   **Fire Rate:** Slower to Faster
*   **Accuracy:** Lower to Higher

## 2. Combat System Implementation

### Torpedo Mechanics
*   **Velocity:** 50 metrons/second.
*   **Lifetime:** 3.0 seconds.
*   **Energy Cost:** 5 units per shot (Player).
*   **Damage:** 
    *   Player: 1.0 (Normal), 0.8 (Damaged Photons).
    *   Enemy: 1 system damage per hit.

### Targeting
*   **Lock-on:** Requires Computer system.
*   **Firing Cone:** Enemies fire if player is within ~30 degrees.
*   **Misfire:** If Photons are damaged, torpedoes have a 50% chance to veer off course.

```csharp
// Pseudocode: Lock Indicators
function CalculateLockIndicators():
    if systems.computer == DESTROYED:
        return { horizontalLock: false, verticalLock: false, rangeLock: false }
    
    target = GetCurrentTarget()
    if target == null:
        return { horizontalLock: false, verticalLock: false, rangeLock: false }
    
    // Calculate relative position
    dx = target.position.x - playerPosition.x
    dy = target.position.y - playerPosition.y
    dz = target.position.z - playerPosition.z
    
    // Calculate angles
    horizontalAngle = atan2(dy, dx) - playerRotation.yaw
    verticalAngle = atan2(dz, sqrt(dx*dx + dy*dy)) - playerRotation.pitch
    
    // Calculate distance
    distance = sqrt(dx*dx + dy*dy + dz*dz)
    
    // Determine locks (tolerance based on damage)
    tolerance = systems.computer == DAMAGED ? 15 : 10  // degrees
    
    horizontalLock = abs(horizontalAngle) < tolerance
    verticalLock = abs(verticalAngle) < tolerance
    rangeLock = distance >= 30 and distance <= 70  // Optimal range
    
    return { horizontalLock, verticalLock, rangeLock, range: distance }
```

```csharp
// Pseudocode: Fire Torpedo
function FireTorpedo(position, direction, owner):
    if owner == PLAYER:
        if playerEnergy < 5: return null
        playerEnergy -= 5
        
        if systems.photon == DESTROYED: return null
        if systems.photon == DAMAGED:
            if Random(0, 1) < 0.5:
                direction = AddRandomOffset(direction, 20) // Misfire
    
    torpedo = new Torpedo()
    torpedo.position = position
    torpedo.velocity = direction * 50
    torpedo.owner = owner
    torpedo.lifetime = 3.0
    
    activeTorpedoes.append(torpedo)
    return torpedo
```

### Collision Detection

```csharp
// Pseudocode: Collision System
function CheckCollisions():
    // Broad Phase: Spatial Grid
    spatialGrid.Clear()
    for enemy in currentSectorEnemies: spatialGrid.Insert(enemy)
    for torpedo in activeTorpedoes: spatialGrid.Insert(torpedo)
    
    // Narrow Phase: Torpedo vs Enemy
    for torpedo in activeTorpedoes:
        if torpedo.owner == PLAYER:
            nearbyEnemies = spatialGrid.GetNearby(torpedo.position, 10)
            for enemy in nearbyEnemies:
                if PreciseCollisionCheck(torpedo, enemy):
                    HandleCollision(torpedo, enemy)
                    break

function PreciseCollisionCheck(torpedo, enemy):
    // Sphere-sphere collision
    dx = enemy.position.x - torpedo.position.x
    dy = enemy.position.y - torpedo.position.y
    dz = enemy.position.z - torpedo.position.z
    
    distanceSquared = dx*dx + dy*dy + dz*dz
    radiusSum = torpedo.radius + enemy.radius
    
    return distanceSquared <= radiusSum * radiusSum
```

## 3. Pathfinding

### Galaxy Navigation
*   **Algorithm:** A* Pathfinding or simple greedy movement toward target.
*   **Movement Rules:** Horizontal/Vertical movement only (Manhattan distance logic).

### Local Movement
*   **Collision Avoidance:** Ships apply repulsion vectors when too close to others.
*   **Smooth Movement:** Interpolation towards target positions.
