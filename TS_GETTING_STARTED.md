# Getting Started with TypeScript/Phaser 3 Star Raiders

**Quick Start Guide for Coding Assistants**  
**Version**: 1.0  
**Last Updated**: December 18, 2025

---

## 🎯 Purpose

This document provides a quick-start guide for coding assistants beginning implementation of Star Raiders using TypeScript and Phaser 3. It answers common questions and provides immediate next steps.

---

## 📋 Prerequisites

### What You Need to Know
1. **Context Documents**: Read these first (in order):
   - `README.md` - Project overview
   - `TS_PROJECTPLAN.md` - Main implementation plan
   - `Star_Raiders_PRD.md` - Complete game specifications
   - `QUICKSTART_DEVELOPER_GUIDE.md` - Quick reference

2. **Technical Requirements**:
   - TypeScript 5.0+
   - Phaser 3.80+
   - Node.js 20+ (for npm)
   - Modern browser (Chrome, Firefox, Edge, Safari)

3. **Key Concepts**:
   - **Metron**: Distance unit in the game
   - **Centon**: Time unit (100 centons ≈ 1 minute)
   - **PESCLR**: Ship systems (Photon, Engines, Shields, Computer, Long-range, Radio)
   - **Galaxy**: 16×16 sectors = 256 total
   - **Difficulty**: Novice, Pilot, Warrior, Commander

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start with Phase 0
Open **TS_PROJECTPLAN.md** and go to **Phase 0 – Project Setup & Structure**

### Step 2: Understand What Phase 0 Delivers
- `/ts_src` folder structure (8 subfolders)
- `package.json` with dependencies
- `tsconfig.json` for TypeScript
- `vite.config.ts` for build system
- Basic type definitions in `Constants.ts` and `Types.ts`
- Minimal `main.ts` entry point

### Step 3: Create the Files
Follow the Phase 0 deliverables section and create each file listed with the provided code samples.

### Step 4: Initialize Project
```bash
cd /home/runner/work/StarRaiders/StarRaiders
npm install
npm run dev
```

### Step 5: Verify Setup
- Browser opens automatically
- Black Phaser canvas appears
- No console errors
- DevTools shows Phaser initialized

### Step 6: Mark Phase 0 Complete
In `TS_PROJECTPLAN.md`, change:
```
### Status: ⬜ Not Started
```
to:
```
### Status: ✅ Completed
```

---

## 📖 How to Use the Plan

### Phase Structure
Every phase follows this pattern:

1. **Status**: Current state (⬜ Not Started, 🔄 In Progress, ✅ Completed)
2. **Dependencies**: Which phases must be done first
3. **Context**: Key information from reference documents
4. **Objectives**: What this phase accomplishes
5. **Deliverables**: Specific files and code to create
6. **Testing Requirements**: How to verify it works
7. **Documentation**: What to document

### Working Through Phases

**DO:**
- ✅ Complete phases in order (dependencies matter!)
- ✅ Read the Context section carefully
- ✅ Use the provided code samples as templates
- ✅ Run tests after each phase
- ✅ Update status markers as you go
- ✅ Commit frequently with descriptive messages

**DON'T:**
- ❌ Skip phases (dependencies will break)
- ❌ Modify earlier phases without reason
- ❌ Add features not in the PRD
- ❌ Ignore testing requirements
- ❌ Forget to update status markers

### Multi-Session Work

When resuming in a new session:
1. Open `TS_PROJECTPLAN.md`
2. Find the last completed phase (✅ Completed)
3. Start with the next phase
4. Read the Context section (prevents hallucinations)
5. Review Dependencies (ensure they're all complete)
6. Begin implementation

---

## 🗺️ Phase Roadmap

### Foundation Phases (Start Here)
- **Phase 0**: Project Setup (⬜ Not Started)
- **Phase 1**: Build System & Config (⬜ Not Started)
- **Phase 2**: Game Loop & State Machine (⬜ Not Started)
- **Phase 3**: Input System (⬜ Not Started)

**After Foundation:** You'll have a working Phaser app with state management and input handling.

### Core Gameplay Phases
- **Phase 4**: Galaxy Data Model
- **Phase 5**: Starfield Rendering
- **Phase 6**: Galactic Chart Screen
- **Phase 7**: Title & UI Screens
- **Phase 8**: 3D Vector Rendering
- **Phase 9**: Combat Views

**After Core:** You'll have all 8 screens and basic rendering.

### Combat & Systems Phases
- **Phase 10**: Combat & Torpedoes
- **Phase 11**: PESCLR Damage System
- **Phase 12**: Energy Management

**After Combat:** You'll have a playable combat system.

### AI & Advanced Phases
- **Phase 13**: Enemy AI - Basic
- **Phase 14**: Enemy AI - Advanced
- **Phase 15**: Hyperspace Navigation
- **Phase 16**: Starbase System
- **Phase 17**: Long-Range Scan & Ranking

**After Advanced:** You'll have a complete game.

### Polish Phase
- **Phase 18**: Audio, Polish & Testing

**After Polish:** You'll have a release-ready game!

---

## 🔍 Quick Reference

### File Locations
- **All TypeScript code**: `/ts_src/`
- **Game config**: `/ts_src/config/GameConfig.ts`
- **Constants**: `/ts_src/utils/Constants.ts`
- **Type definitions**: `/ts_src/utils/Types.ts`
- **Scenes**: `/ts_src/scenes/`
- **Systems**: `/ts_src/systems/`
- **Entities**: `/ts_src/entities/`

### Key Constants (from QUICKSTART)
```typescript
GALAXY_SIZE = 16              // 16×16 grid
TOTAL_SECTORS = 256           // Total sectors
CENTONS_PER_MINUTE = 100      // Time conversion
MAX_ENERGY = 7000             // Starting energy
CRITICAL_ENERGY = 500         // Warning threshold
LOW_ENERGY = 1000             // Low energy warning
STARBASE_ATTACK_TIMER = 100   // Centons until starbase destroyed
```

### Speed Table (metrons/second)
```typescript
SPEED_TABLE = [0, 2, 4, 8, 10, 11, 12, 20, 30, 43]
```

### Energy Costs (per second)
```typescript
ENERGY_COST_TABLE = [0, 2, 2, 2, 5, 5, 8, 12, 18, 30]
```

### Difficulty Configs
- **Novice**: 10 enemies, 4 starbases, auto hyperspace
- **Pilot**: 15 enemies, 3 starbases, auto hyperspace
- **Warrior**: 20 enemies, 2 starbases, manual hyperspace
- **Commander**: 28 enemies, 2 starbases, manual hyperspace

### Enemy Distribution
- 60% Fighters (fast, 1 hit kill)
- 30% Cruisers (medium, 2 hits)
- 10% Basestars (slow, 3 hits)

---

## 🧪 Testing Guidelines

### After Each Phase
1. **Build Check**: `npm run build` succeeds
2. **Dev Server**: `npm run dev` runs without errors
3. **Browser Check**: No console errors
4. **Visual Check**: Expected visuals appear
5. **Feature Test**: Test the new functionality
6. **Unit Tests** (if applicable): `npm test` passes

### Performance Checks
- **FPS**: Should maintain 60 FPS
- **Memory**: Check DevTools memory profiler
- **Network**: Asset loading times < 1 second
- **Input Lag**: Response time < 16ms

### Common Issues
- **Black screen**: Check console for errors
- **Assets not loading**: Check paths in AssetLoader
- **Input not working**: Verify InputManager initialization
- **State transitions failing**: Check GameStateManager events
- **FPS drops**: Profile with Chrome DevTools Performance tab

---

## 💡 Tips for Success

### Code Quality
1. **Type Everything**: Use strict TypeScript types
2. **Document Public APIs**: Add JSDoc comments
3. **Keep Functions Small**: Single responsibility principle
4. **Use Constants**: Don't hardcode values
5. **Clean Up**: Always destroy unused Phaser objects

### Performance
1. **Object Pooling**: Reuse objects (stars, torpedoes, particles)
2. **Culling**: Don't render off-screen objects
3. **Batch Rendering**: Group similar draw calls
4. **Profile First**: Use DevTools before optimizing

### Debugging
1. **Use Debug Class**: Centralized logging
2. **Chrome DevTools**: Your best friend
3. **Phaser Debug Draw**: Visual debugging
4. **Console Logging**: Categorize with prefixes
5. **Breakpoints**: Step through complex logic

### Common Pitfalls to Avoid
1. ❌ **Frame-rate dependent logic**: Always use `delta` time
2. ❌ **Memory leaks**: Remove event listeners in scene shutdown
3. ❌ **Blocking operations**: No synchronous waits in update loop
4. ❌ **Magic numbers**: Use constants instead
5. ❌ **Premature optimization**: Get it working first

---

## 📞 Getting Help

### When Stuck
1. **Check the Context**: Review Context section of current phase
2. **Check Reference Docs**: See Star_Raiders_PRD.md for specifications
3. **Check Phaser Docs**: https://photonstorm.github.io/phaser3-docs/
4. **Check Examples**: https://phaser.io/examples
5. **Review Code Samples**: Earlier phases have working examples

### Common Questions

**Q: Can I skip a phase?**
A: No. Dependencies ensure correct order. Skipping breaks later phases.

**Q: Can I add features not in the PRD?**
A: No. Stick to specifications. Extra features = scope creep.

**Q: What if I need to refactor earlier code?**
A: That's fine! Just update the phase documentation and re-run tests.

**Q: How do I know if my implementation is correct?**
A: Run the testing requirements for that phase. If all pass, you're good!

**Q: Can I use a different build tool than Vite?**
A: Technically yes, but Vite is recommended. You'd need to update Phase 1.

---

## 📊 Progress Tracking

### How to Track Your Progress
1. Open `TS_PROJECTPLAN.md`
2. Update status markers:
   - ⬜ Not Started
   - 🔄 In Progress
   - ✅ Completed
   - ⚠️ Blocked/Issues

### Recommended Commit Messages
- "Complete Phase 0: Project setup and structure"
- "Complete Phase 1: Build system configuration"
- "WIP Phase 2: Implementing game state machine"
- "Fix Phase 3: Resolve input binding issue"

### Milestones
- **Milestone 1**: Phases 0-3 complete (Foundation)
- **Milestone 2**: Phases 4-6 complete (Galaxy & Chart)
- **Milestone 3**: Phases 7-9 complete (Rendering & Combat Views)
- **Milestone 4**: Phases 10-12 complete (Combat Systems)
- **Milestone 5**: Phases 13-14 complete (Enemy AI)
- **Milestone 6**: Phases 15-17 complete (Advanced Features)
- **Milestone 7**: Phase 18 complete (Polish & Release)

---

## 🎯 Success Criteria

### Phase Completion
A phase is complete when:
- ✅ All deliverables created
- ✅ Code compiles without errors
- ✅ All tests pass
- ✅ Manual testing successful
- ✅ Performance targets met
- ✅ Documentation updated

### Project Completion
The project is complete when:
- ✅ All 18 phases completed
- ✅ Can complete mission on all 4 difficulties
- ✅ All 20 ranks achievable
- ✅ All 8 screens functional
- ✅ 60 FPS maintained
- ✅ All tests passing
- ✅ Code coverage > 70%

---

## 🚀 You're Ready!

**Next Step**: Open `TS_PROJECTPLAN.md` and start with Phase 0!

**Remember**:
- Work sequentially through phases
- Read Context sections carefully
- Use provided code samples
- Test frequently
- Update status markers
- Commit often

**Good luck building Star Raiders!** 🌟🚀

---

**Document Version**: 1.0  
**Last Updated**: December 18, 2025  
**For Questions**: Refer to TS_PROJECTPLAN.md or Star_Raiders_PRD.md
