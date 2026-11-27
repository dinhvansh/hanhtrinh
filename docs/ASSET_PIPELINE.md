# Phoenix Asset Factory 0.1
## Usage
From repository root (dev/v2-adventure):
- node v2/tools/asset-factory.mjs
- python -m http.server 8000
- Open http://localhost:8000/v2/asset-studio.html for asset review, and /v2/ for game.
Factory generates self-contained glTF 2.0 and binary GLB locally; source-controlled glTF copies are used in game. Blender is optional, not required by current factory.
 
## Assets
| ID | Triangles per instance | Instances in V2 |
|---|---:|---:|
| tree-meadow | 768 | 12 |
| cottage-lavender | 2728 | 2 |
| rock-moss | 288 | 4 |
| phoenix-companion | 4936 | 1 |
Total glTF payload 104733 bytes; total asset instances 19; excludes terrain, player, engine and other gameplay meshes.
Original procedurally generated artwork, not third-party models. Phoenix is a stylized placeholder based on V1 visual motifs, not a final approved model.
 
## Integration
assets.js caches glTF scene templates by stable ID, clones them into existing game groups, preserves group transforms and obstacle settings. Existing procedural meshes remain fallback on load failure. GLTFLoader is already bundled in V1's Three.js vendor. No change to baseline V1.
 
## QA performed
All 4 committed glTF files reproduced exactly by generator and passed custom checks: buffer ranges/alignment, accessor counts, finite geometry, unit normals, valid node references and quaternions. JS syntax and script ordering checked. No official Khronos validator, GLB export runtime test, WebGL visual test, collision fit test or device FPS test performed in this session. Studio is implemented but not deployed or browser-verified. Container has no Blender and cannot reach GitHub directly.
 
## Next asset sprint
Review models visually; approve Phoenix identity; adjust collisions/camera and lighting; optimize repeated meshes/draw calls; build modular terrain/path/portal and science props. Then create a rigged player with idle/walk/run/jump animations (not included in 0.1), test device performance. Do not buy or incorporate external asset packs without license review and approval.
