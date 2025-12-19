# Starfield Movement Architecture

## System Flow Diagram

```mermaid
graph TD
    A[Player Input] --> B{Input Type}
    B -->|Arrow Keys| C[InputManager]
    B -->|Speed Keys 0-9| D[GameStateManager]
    
    C -->|navigation event| E[CombatView]
    D -->|velocity change| E
    
    E --> F[Calculate Rotation Velocity]
    E --> G[Calculate Forward Velocity]
    E --> H[Calculate Idle Drift]
    
    F --> I[Combine All Velocities]
    G --> I
    H --> I
    
    I --> J[StarfieldManager.update]
    J --> K[Update Each Star]
    K --> L[Apply Parallax by Layer]
    L --> M[Wrap at Screen Edges]
    M --> N[Render Stars]
```

## Data Flow

```mermaid
sequenceDiagram
    participant Player
    participant Input
    participant CombatView
    participant StarfieldMgr
    participant Stars
    
    Player->>Input: Press Arrow Key
    Input->>CombatView: emit navigation event
    CombatView->>CombatView: Update rotationVelocity
    
    loop Every Frame
        CombatView->>CombatView: Apply damping
        CombatView->>CombatView: Calculate idle drift
        CombatView->>CombatView: Get forward velocity
        CombatView->>StarfieldMgr: update(deltaTime, velX, velY)
        StarfieldMgr->>Stars: update each star
        Stars->>Stars: Apply layer speed multiplier
        Stars->>Stars: Move position
        Stars->>Stars: Wrap at edges
    end
```

## Velocity Composition

```mermaid
graph LR
    A[Total Velocity X] --> A1[Rotation X from Arrow Keys]
    A --> A2[Idle Drift X sine wave]
    
    B[Total Velocity Y] --> B1[Forward Velocity from Speed]
    B --> B2[Rotation Y from Arrow Keys]
    B --> B3[Idle Drift Y cosine wave]
    
    A --> C[StarfieldManager]
    B --> C
    C --> D[Star Layer 1 - 100% speed]
    C --> E[Star Layer 2 - 50% speed]
    C --> F[Star Layer 3 - 25% speed]
    C --> G[Star Layer 4 - 10% speed]
```

## Component Relationships

```mermaid
classDiagram
    class CombatView {
        -rotationVelocity {x, y}
        -ROTATION_SPEED
        -ROTATION_DAMPING
        -IDLE_DRIFT_SPEED
        +setupInput()
        +update()
    }
    
    class InputManager {
        -cursors
        +update()
        +emit(navigation, x, y)
    }
    
    class StarfieldManager {
        -stars Star[]
        +update(deltaTime, velX, velY)
    }
    
    class Star {
        -layer number
        -x, y position
        +update(deltaTime, velX, velY)
        +getLayerSpeedMultiplier()
    }
    
    InputManager --> CombatView : navigation events
    CombatView --> StarfieldManager : velocity commands
    StarfieldManager --> Star : update each
```

## State Transitions

```mermaid
stateDiagram-v2
    [*] --> Idle: Game Start
    Idle --> Drifting: Idle drift active
    Drifting --> Rotating: Arrow key pressed
    Rotating --> Decelerating: Arrow key released
    Decelerating --> Drifting: Velocity near zero
    
    Drifting --> MovingForward: Speed key pressed
    MovingForward --> RotatingAndMoving: Arrow key pressed
    RotatingAndMoving --> MovingForward: Arrow key released
    MovingForward --> Drifting: Speed set to 0
```

## Velocity Calculation Formula

### Rotation Velocity (from arrow keys)
```
rotationVelocity.x = navX × ROTATION_SPEED
rotationVelocity.y = navY × ROTATION_SPEED

Each frame:
rotationVelocity.x *= ROTATION_DAMPING
rotationVelocity.y *= ROTATION_DAMPING
```

### Idle Drift (constant subtle movement)
```
idleDriftX = sin(time × 0.0003) × IDLE_DRIFT_SPEED
idleDriftY = cos(time × 0.0005) × IDLE_DRIFT_SPEED
```

### Forward Velocity (from speed setting)
```
forwardVelocity = SPEED_TABLE[player.velocity]
```

### Total Combined Velocity
```
totalVelocityX = rotationVelocity.x + idleDriftX
totalVelocityY = forwardVelocity + rotationVelocity.y + idleDriftY
```

### Per-Star Movement (with parallax)
```
layerSpeed = getLayerSpeedMultiplier()  // 1.0, 0.5, 0.25, or 0.1

star.x -= totalVelocityX × layerSpeed × deltaTime × movementScale
star.y -= totalVelocityY × layerSpeed × deltaTime × movementScale
```

## Configuration Values

| Constant | Value | Purpose |
|----------|-------|---------|
| ROTATION_SPEED | 30 | Base pixels/sec when rotating |
| ROTATION_DAMPING | 0.92 | Deceleration factor per frame |
| IDLE_DRIFT_SPEED | 5 | Subtle constant drift speed |
| IDLE_DRIFT_FREQ_X | 0.0003 | Horizontal drift frequency |
| IDLE_DRIFT_FREQ_Y | 0.0005 | Vertical drift frequency |

## Layer Speed Multipliers

| Layer | Speed | Star Count | Purpose |
|-------|-------|------------|---------|
| 1 | 100% | 20 | Foreground - fast moving |
| 2 | 50% | 40 | Mid-range - medium speed |
| 3 | 25% | 60 | Background - slow moving |
| 4 | 10% | 80 | Deep space - very slow |

Total: 200 stars with parallax depth effect
