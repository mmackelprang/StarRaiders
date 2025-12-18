# Ship Systems (PESCLR)

## 1. PESCLR System Overview

The Star Cruiser's status is tracked via the PESCLR acronym. Each system has three states: **OPERATIONAL**, **DAMAGED**, **DESTROYED**.

| System | Code | Function | Damaged Effect | Destroyed Effect |
| :--- | :--- | :--- | :--- | :--- |
| **P**hotons | P | Torpedo firing | Misfires, reduced rate | Cannot fire |
| **E**ngines | E | Movement | Reduced speed/turning | Crawl speed only |
| **S**hields | S | Damage mitigation | 50% protection | 0% protection |
| **C**omputer | C | Targeting/Lock-on | Inaccurate locks | No locks/auto-target |
| **L**ong Range | L | Sector scan | False echoes | Static/No data |
| **R**adio | R | Starbase alerts | Garbled messages | No alerts |

## 2. Energy Management

### Energy Bank
*   **Capacity:** 7000 units (Centons/Energy units).
*   **Depletion:** Game Over if energy reaches 0.

### Consumption Rates
*   **Movement:** Scales with speed (0-30 units/sec).
*   **Shields:** 10 units/sec (if active).
*   **Computer:** 2 units/sec (if active).
*   **Firing:** 5 units per torpedo.
*   **Hyperspace:** Distance-based cost.
*   **Damage:** Engine damage increases consumption (1.5x - 2.0x).

```csharp
// Pseudocode: Energy Update
function UpdateEnergy(deltaTime):
    energyConsumed = 0
    
    // Velocity consumption
    speedEnergy = GetSpeedEnergyCost(playerVelocity)
    energyConsumed += speedEnergy * deltaTime
    
    // Shield consumption
    if shieldsActive and systems.shields != DESTROYED:
        energyConsumed += 10 * deltaTime
    
    // Computer consumption
    if computerActive and systems.computer != DESTROYED:
        energyConsumed += 2 * deltaTime
    
    // Apply difficulty multiplier
    energyConsumed *= GetEnergyMultiplier(difficultyLevel)
    
    // Apply engine damage penalty
    if systems.engines == DAMAGED:
        energyConsumed *= 1.5
    else if systems.engines == DESTROYED:
        energyConsumed *= 2.0
    
    // Deduct energy
    playerEnergy -= energyConsumed
    
    if playerEnergy <= 0:
        GameOver(ENERGY_DEPLETED)
```

## 3. Physics and Movement

### Player Physics
*   **Movement:** 6DOF-lite (Pitch/Yaw, forward velocity).
*   **Speed Settings:** 0-9 (Stop to Warp 9).
*   **Inertia:** Instant acceleration (arcade style) but turn rate is finite.
*   **Boundaries:** Sector is effectively infinite, but gameplay centers on 100x100x100 metron box.

```csharp
// Pseudocode: Player Physics
function UpdatePlayerPhysics(deltaTime):
    // Convert speed setting to actual velocity
    actualSpeed = GetSpeedInMetronsPerSecond(speed)
    
    // Apply engine damage modifier
    if systems.engines == DAMAGED:
        actualSpeed *= 0.6
    else if systems.engines == DESTROYED:
        actualSpeed *= 0.3
    
    // Calculate velocity vector
    velocity.x = cos(rotation.yaw) * actualSpeed
    velocity.y = sin(rotation.yaw) * actualSpeed
    velocity.z = sin(rotation.pitch) * actualSpeed
    
    // Update position
    position.x += velocity.x * deltaTime
    position.y += velocity.y * deltaTime
    position.z += velocity.z * deltaTime
    
    // Keep player centered (sector is 100x100x100 metrons)
    position.x = Clamp(position.x, -50, 50)
    position.y = Clamp(position.y, -50, 50)
    position.z = Clamp(position.z, -50, 50)

function UpdatePlayerRotation(input, deltaTime):
    // Get turn rate (affected by engine damage)
    turnSpeed = 1.5 // radians per second
    
    if systems.engines == DAMAGED: turnSpeed *= 0.6
    else if systems.engines == DESTROYED: turnSpeed *= 0.3
    
    // Apply joystick/arrow key input
    if input.left: rotation.yaw += turnSpeed * deltaTime
    if input.right: rotation.yaw -= turnSpeed * deltaTime
    if input.up: rotation.pitch += turnSpeed * deltaTime
    if input.down: rotation.pitch -= turnSpeed * deltaTime
    
    // Clamp pitch to prevent gimbal lock
    rotation.pitch = Clamp(rotation.pitch, -PI/2, PI/2)
```
```

### Collision
*   **Broad Phase:** Spatial grid partitioning.
*   **Narrow Phase:** Sphere-sphere intersection.
*   **Ship Collision:** Catastrophic damage (Energy loss, multiple system failures).
