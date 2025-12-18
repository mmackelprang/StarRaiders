# TS_PROJECTPLAN – Phases 10-18 Detailed Guide

**Parent Document**: TS_PROJECTPLAN.md  
**Phases Covered**: 10-18 (Combat Systems, Damage, Energy, AI, Hyperspace, Starbases, Scanning, Polish)  
**Version**: 1.0

---

## Phase 10 – Combat System & Torpedoes (Summary)

### Status: ✅ Completed

### Dependencies
- Phase 9 completed (Combat Views)

### Context
From **Star_Raiders_PRD.md Section 12** (Combat System):
- Photon torpedoes: Primary weapon
- Firing costs energy
- Lock indicators (3) determine accuracy
- Range affects damage
- Optimal range: 30-70 metrons

### Key Deliverables
- Torpedo entity class with physics
- Collision detection system
- Hit/miss calculation based on locks
- Explosion particle effects
- Damage application to enemies
- Energy consumption per shot

---

## Phase 11 – PESCLR Damage System (Summary)

### Status: ✅ Completed

### Dependencies
- Phase 10 completed (Combat)

### Context
From **Star_Raiders_PRD.md Section 11** (Ship Systems - PESCLR):
- P = Photon Torpedoes
- E = Engines
- S = Shields
- C = Computer
- L = Long-Range Scan
- R = Radio

Each system has 3 states: Operational (Cyan), Damaged (Yellow), Destroyed (Red)

### Key Deliverables
- PESCLRSystem class managing all 6 systems
- Damage probability calculation
- System degradation on taking hits
- Effects of each system being damaged/destroyed
- Visual indicators on HUD
- Repair mechanics (at starbase)

---

## Phase 12 – Energy Management (Summary)

### Status: ⬜ Not Started

### Dependencies
- Phase 10, 11 completed

### Context
From **Star_Raiders_PRD.md Section 16** (Energy Management):
- Starting energy: ~7000 metrons
- Energy consumed by: Movement, shields, torpedoes, computer
- Critical energy: < 500 (warning)
- Low energy: < 1000
- Game over if energy reaches 0

From **QUICKSTART Section 1.3** (Speed & Energy):
- Speed 0: 0 energy/sec
- Speed 6: 8 energy/sec (optimal cruise)
- Speed 9: 30 energy/sec
- Shield cost: +10 energy/sec when active
- Torpedo cost: 50 energy per shot

### Key Deliverables
- EnergySystem class
- Energy consumption tracking
- Warning system for low energy
- Visual energy bar on HUD
- Energy regeneration at starbases

---

## Phase 13 – Enemy AI - Basic (Summary)

### Status: ⬜ Not Started

### Dependencies
- Phase 4 (Galaxy), Phase 8 (3D Rendering)

### Context
From **star_raiders_technical_notes.txt Section 13** (Enemy AI):
- Fighters: Aggressive, fast, attack player directly
- Cruisers: Defensive, slower, guard sectors
- Basestars: Slow, powerful, attack starbases

### Key Deliverables
- Enemy base class with behavior tree
- Fighter AI: Chase player, fire when in range
- Cruiser AI: Patrol, intercept player
- Basestar AI: Move toward starbases
- Basic pathfinding (sector-to-sector)
- Firing logic for enemies

---

## Phase 14 – Enemy AI - Advanced (Summary)

### Status: ⬜ Not Started

### Dependencies
- Phase 13 completed (Basic AI)

### Context
From **star_raiders_technical_notes.txt Section 13.4** (Advanced Behaviors):
- Group coordination (squadrons)
- Strategic galaxy-level movement
- Starbase attack coordination
- Difficulty scaling (aggression multipliers)

### Key Deliverables
- Squadron system (enemies move in groups)
- Strategic AI: enemies converge on starbases
- Attack coordination: surround and destroy starbases
- Difficulty-based AI tuning
- Dynamic threat assessment

---

## Phase 15 – Hyperspace Navigation (Summary)

### Status: ⬜ Not Started

### Dependencies
- Phase 4 (Galaxy), Phase 6 (Galactic Chart)

### Context
From **Star_Raiders_PRD.md Section 15** (Navigation and Hyperspace):
- Novice/Pilot: Auto-pilot (automatic navigation)
- Warrior/Commander: Manual piloting (player must center crosshairs)
- Energy cost: 100 + (distance × 10) metrons
- Travel time: ~3 seconds animation

### Key Deliverables
- Hyperspace scene with tunnel animation
- Auto-pilot mode (animated progress bar)
- Manual mode (drift correction mini-game)
- Energy cost calculation
- Sector transition

---

## Phase 16 – Starbase System (Summary)

### Status: ⬜ Not Started

### Dependencies
- Phase 4 (Galaxy), Phase 14 (Advanced AI)

### Context
From **Star_Raiders_PRD.md Section 14** (Starbase System):
- Docking: Repairs all systems, refuels energy
- Under attack: 100 centon countdown
- Destroyed: Permanent loss
- Lose condition: All starbases destroyed

### Key Deliverables
- Docking mechanics (proximity detection)
- Repair animation and system restoration
- Attack countdown system
- Visual warning when starbase under attack
- Victory/defeat condition checking

---

## Phase 17 – Long-Range Scan & Ranking (Summary)

### Status: ⬜ Not Started

### Dependencies
- Phase 4 (Galaxy), Phase 6 (Galactic Chart)

### Context
From **Star_Raiders_PRD.md Section 18** (Ranking and Scoring):
- 20 ranks from "Galactic Cook" to "Star Commander Class 4"
- Score = enemies destroyed + starbases saved - time penalty
- Difficulty multiplier applied

From **star_raiders_visual_mockups.txt Section 5** (Long-Range Scan):
- Top-down radar view
- Concentric range circles (10 metron intervals)
- Player always at center
- Enemies shown as letters (F, C, B)
- Damaged L system = false echoes or static

### Key Deliverables
- Long-Range Scan scene
- Radar visualization
- Enemy detection and display
- Damage effects (false echoes, static)
- Score calculation system
- 20-rank progression table
- Ranking screen display

---

## Phase 18 – Audio, Polish & Testing

### Status: ⬜ Not Started

### Dependencies
- All previous phases

### Context
From **Star_Raiders_PRD.md Section 20** (Audio Design):
- Sound effects: Torpedo fire, explosion, hyperspace, shields, damage, alerts
- Background music: Minimalist synthesized (optional)
- Warning sounds: Low energy beep, starbase alert

From **Star_Raiders_PRD.md Section 27** (Success Criteria):
- Complete mission on all 4 difficulty levels
- All 20 ranks achievable
- 60 FPS performance maintained
- < 512MB memory usage

### Key Deliverables

#### Audio System
- AudioManager class
- Sound effect loading and playback
- Volume controls
- Background music (optional)
- Positional audio (3D sound)

#### Visual Polish
- Particle effects for explosions
- Screen shake on damage
- Shield shimmer effect
- Muzzle flash on torpedo fire
- Smooth transitions between screens

#### Performance Optimization
- Object pooling for all frequently created objects
- Render culling for off-screen objects
- Texture atlasing
- Memory profiling and leak detection
- FPS monitoring

#### Comprehensive Testing
**Unit Tests:**
- All systems tested independently
- Mock Phaser dependencies where needed
- 70%+ code coverage

**Integration Tests:**
- Complete gameplay loops
- Scene transitions
- Save/load functionality
- Input handling

**Manual Playtesting:**
- Complete mission on Novice
- Complete mission on Pilot
- Complete mission on Warrior
- Complete mission on Commander
- Verify all 20 ranks achievable
- Test all 8 screens
- Verify all controls
- Performance profiling

**Bug Fixes:**
- Address all critical bugs
- Address high-priority bugs
- Document known minor bugs

#### Documentation
- Complete README with gameplay guide
- Developer documentation
- API documentation (JSDoc)
- Build and deployment instructions

---

## Final Implementation Checklist

### Core Systems (Phases 0-3)
- ✅ Project structure
- ✅ Build system
- ✅ Game state machine
- ✅ Input system

### Galaxy & Navigation (Phases 4-6)
- ✅ Galaxy data model
- ✅ Starfield rendering
- ✅ Galactic chart screen

### UI & Rendering (Phases 7-9)
- ✅ Title screen
- ✅ 3D vector rendering
- ✅ Combat views (fore/aft)

### Combat & Systems (Phases 10-12)
- ✅ Torpedo combat
- ✅ PESCLR damage system
- ✅ Energy management

### AI (Phases 13-14)
- ✅ Basic enemy AI
- ✅ Advanced AI (groups, strategy)

### Advanced Features (Phases 15-17)
- ✅ Hyperspace navigation
- ✅ Starbase system
- ✅ Long-range scan & ranking

### Polish & Release (Phase 18)
- ✅ Audio system
- ✅ Visual effects
- ✅ Performance optimization
- ✅ Comprehensive testing
- ✅ Documentation

---

## Post-Implementation: Next Steps

### Immediate Post-Release
1. Monitor for critical bugs
2. Gather player feedback
3. Performance profiling on various hardware
4. Browser compatibility testing

### Future Enhancements (Out of Scope for V1.0)
- Multiplayer mode
- Additional difficulty levels
- New game modes
- Leaderboards
- Mobile touch controls
- VR support
- Mod support

---

## Appendix: Quick Implementation Tips

### Phaser 3 Best Practices
1. **Scene Management**: Keep scenes focused and single-purpose
2. **Update Loop**: Use `update(time, delta)` for game logic, not `create()`
3. **Memory**: Destroy unused objects with `.destroy()`
4. **Performance**: Use object pools for frequently created/destroyed objects
5. **Input**: Use Phaser's input system, not raw DOM events

### TypeScript Tips
1. **Strict Mode**: Always compile with `strict: true`
2. **Type Safety**: Define interfaces for all data structures
3. **Null Safety**: Use `?` and `!` operators carefully
4. **Generics**: Use for reusable systems
5. **Modules**: Keep files focused, one class per file

### Debugging Tips
1. Use browser dev tools (Chrome DevTools recommended)
2. Add FPS counter: `this.game.config.fps.target`
3. Memory profiling: Chrome Performance tab
4. Network tab for asset loading issues
5. Console logging with categorization

### Common Pitfalls to Avoid
1. **Not cleaning up**: Always destroy unused objects
2. **Frame-rate dependent logic**: Always use `delta` time
3. **Memory leaks**: Remove event listeners when scene stops
4. **Blocking operations**: Don't use synchronous operations in update loop
5. **Over-optimization**: Profile first, optimize second

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 18, 2025 | Initial release - all 18 phases defined |

---

## Contact & Support

For questions or issues with this implementation plan:
1. Refer to parent document: `TS_PROJECTPLAN.md`
2. Check context documents in repository root
3. Consult Phaser 3 documentation: https://photonstorm.github.io/phaser3-docs/

---

**End of Phases 10-18 Guide**
