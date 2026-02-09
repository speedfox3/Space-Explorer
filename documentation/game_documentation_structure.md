# Space Explorer – Documentation Structure

This directory contains the official design and systems documentation for **Space Explorer**.
All files are written in **Markdown** so they can be versioned, reviewed, and discussed directly in GitHub.

---

## 📁 Folder Tree

```
/docs
  /00_vision
    vision.md
    core_principles.md

  /01_game_design
    overview.md
    player_roles.md
    core_gameplay_loop.md

  /02_systems
    exploration_system.md
    discovery_and_claims.md
    economy.md
    minigames.md

  /03_progression
    ships_and_upgrades.md
    player_progression.md

  /99_appendix
    glossary.md
    open_questions.md
```

---

## 📌 How to use this documentation

- **00_vision** → Why the game exists, what it tries to be, and what it deliberately avoids.
- **01_game_design** → Player-facing design: roles, loops, fantasy, and high-level mechanics.
- **02_systems** → Concrete systems and rules that power the game (exploration, economy, claims).
- **03_progression** → Long-term growth: ships, upgrades, player advancement.
- **99_appendix** → Supporting material, terminology, and unresolved design questions.

This structure is intended to:
- Be readable by designers, programmers, and producers
- Allow parallel work by multiple team members
- Avoid mixing vision, rules, and implementation details

---

## 📄 File Responsibilities (Summary)

### `/00_vision/vision.md`
High-level vision statement, target experience, and design intent.

### `/00_vision/core_principles.md`
Non-negotiable design rules that guide all decisions.

---

### `/01_game_design/overview.md`
What kind of game Space Explorer is, core fantasy, and player expectations.

### `/01_game_design/player_roles.md`
Detailed description of each player role (Explorer, Miner, Trader, Pirate, Engineer).

### `/01_game_design/core_gameplay_loop.md`
Primary gameplay loops and how players spend their time.

---

### `/02_systems/exploration_system.md`
Proximity-based exploration, signals, uncertainty, and discovery mechanics.

### `/02_systems/discovery_and_claims.md`
How objects are discovered, claimed, sold, or leased.

### `/02_systems/economy.md`
Economic flows, markets, money sinks, and role interdependence.

### `/02_systems/minigames.md`
Minigame philosophy and concrete examples (scanning, claiming, recovery).

---

### `/03_progression/ships_and_upgrades.md`
Ship classes, modules, upgrades, and trade-offs.

### `/03_progression/player_progression.md`
Long-term player growth, specialization, and advancement paths.

---

### `/99_appendix/glossary.md`
Shared vocabulary and definitions used across all documents.

### `/99_appendix/open_questions.md`
Known unknowns, unresolved design decisions, and future exploration.

---

## ✅ Next Step

The recommended starting point is:
1. `00_vision/vision.md`
2. `01_game_design/player_roles.md`
3. `02_systems/exploration_system.md`

Each file should remain concise, clear, and focused on intent rather than implementation.

