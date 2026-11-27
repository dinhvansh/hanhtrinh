# Phoenix World V2 — Prototype 0.1
Open via static HTTP: clone repo, checkout dev/v2-adventure, run python -m http.server 8000 from repo root, open http://localhost:8000/v2/. V1 remains at /. No npm install or backend required.
Controls: WASD/arrows, Space jump, drag camera, E interact when near the purple crystal. Mobile: directional pad, jump/interact buttons, drag camera. Phoenix guide is optional.
Quest: approach the crystal, turn on light in a schematic droplet, answer two questions, get one star and badge. Replay doesn't duplicate reward. Progress stored locally (not authoritative for real-world rewards).
 
## Current status
- Implemented first draft: procedural island, cottage/tree/pond, third-person player, bounded movement and simple circular obstacle collision, camera, script-based companion, interactive lesson, quiz, reward, local storage, WebGL init fallback.
- Player and companion are placeholder low-poly meshes, not final character art. Guide uses simple steering, not pathfinding; camera collision and device performance need testing. No physics engine, audio, animation rig, advanced construction, backend, AI, or multiplayer yet.
- Automated verification in development session: syntax parsing of core.js and game.js; DOM ID cross-check; seven core logic checks passed (fresh state, reward once, save/reload, corrupt data, unknown quest, reset, storage failure).
- Browser smoke-test page: /v2/tests.html (six core checks). Full WebGL/browser gameplay and actual mobile performance not yet verified. Do not merge or release before QA.
- Original Three.js vendor extracted from V1, license notice retained. V1 content preserved; rainbow text adapted for the prototype and requires final science review.
- Roadmap: ../docs/ROADMAP.md. Design: ../docs/GAME_DESIGN_MVP.md.
