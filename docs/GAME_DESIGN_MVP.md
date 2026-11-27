# Phoenix World — Game Design & MVP
Status: scope đề xuất để triển khai prototype; 27/11/2026.

## Product vision
Trẻ khám phá thế giới 3D tự do, Phoenix dẫn nhiệm vụ chính; kiến thức khoa học là gameplay. YouTube Văn Công Nghệ và game bổ trợ nhau, không bắt buộc xem video mới chơi được. Family Quest, quà ngoài đời, AI companion, đảo cá nhân phát triển và multiplayer gia đình đã thống nhất về tầm nhìn; nằm ngoài MVP, theo ROADMAP.md.

## MVP scope (vertical slice)
- Người chơi: trẻ em; tạm thiết kế cho 7–12 tuổi, chưa chốt nhóm tuổi bằng nghiên cứu.
- 1 đảo cá nhân nhỏ, phong cách Stylized Fantasy 3D ấm áp, pastel, hình khối mềm, camera third-person; không lấy chất lượng hoặc quy mô Genshin làm mục tiêu.
- Nhân vật chạy/nhảy, camera xoay, va chạm với môi trường, giới hạn đảo an toàn; bàn phím và điều khiển chạm.
- Phoenix có chế độ đi theo hoặc dẫn tới điểm nhiệm vụ bằng script, không gọi AI.
- Quest mẫu: Trạm Cầu Vồng (tập 11 từ V1): tìm trạm → tương tác mô phỏng ánh sáng qua giọt nước → trả lời câu hỏi → nhận sao/huy hiệu; chơi lại không cộng trùng.
- Lưu tiến trình và biệt danh local; cho phép reset có xác nhận. Không tài khoản, không dữ liệu trẻ lên server.
- V1 vẫn ở index.html; V2 thử nghiệm ở v2/index.html. Không merge tới khi nghiệm thu.

## Art Direction (đã chốt)
Stylized Fantasy 3D: hình khối tròn mềm, tỷ lệ chibi thân thiện, màu sắc tươi dịu, vật liệu đơn giản nhưng có chiều sâu, môi trường cổ tích ấm áp. Phoenix giữ nhận diện V1: mũ trùm kem, tai hồng, mắt có điểm sáng, nụ cười nhỏ, quả cầu tím. Không tạo hình quái vật, không đòi photorealism hay chất lượng AAA. Duyệt bằng ảnh render thật ở khoảng cách camera gameplay và cận cảnh, không dùng ảnh concept thay cho kết quả. Mục tiêu là đẹp và nhất quán trong ngân sách web/mobile.

## Gameplay / UX
Vào đảo → hướng dẫn ngắn → tự do khám phá → chọn Phoenix dẫn đường → tới gần trạm → tương tác → quan sát mô phỏng → trả lời → thưởng → tự do khám phá. HUD gọn: mục tiêu, sao, nút dẫn đường, tương tác, nhảy; thông báo rõ khi trạm quá xa. Không chiến đấu, không mất điểm khi sai, không countdown/streak thúc ép. Desktop WASD/mũi tên, Space nhảy, E tương tác, kéo chuột xoay camera; mobile joystick/bút điều khiển hướng, nút nhảy/tương tác, kéo nền xoay.

## Architecture
Giữ web tĩnh/Vanilla JS + Three.js bundle gốc V1, không thêm backend/framework trước khi có lý do.
v2/vendor/three.bundle.js: engine V1, MIT notice giữ nguyên.
v2/index.html: shell, HUD, controls, fallback.
v2/styles.css: responsive, touch UI.
v2/core.js: state/version, quest ID ổn định, tiến trình, reward idempotency, storage validation.
v2/game.js: world, camera/player/companion/input/interaction/render loop.
v2/tests.html: smoke test core. Tách module world, player, quest, content, UI khi slice được nghiệm thu; không dựng kiến trúc cho các tính năng chưa tới.
State: {version, name, completed: {questId: true}}; sao suy ra từ completed; không tin state local cho quà thực. Family backend sau này phải xác thực chủ thể, phân quyền, ghi ledger; AI không có quyền cộng thưởng, phê duyệt, sửa quyền.

## Localization / i18n (required from MVP)
- Vietnamese default and English selectable in game, including onboarding, HUD, instructions, quiz, rewards and accessibility labels. Locale preference saved separately from progress.
- All player-facing strings use stable translation keys; scientific question answers, quest IDs, saved progress and asset IDs are locale-independent. Add locales by extending dictionaries, without changing gameplay. Missing keys fall back to Vietnamese; avoid exposing incomplete languages in selector.
- Future localized scientific content, family portal, rewards, AI prompts/STT/TTS, subtitles and video links follow locale-specific editorial review. No automatic translation of child-safety policies or scientific content without review. Test expansion, font coverage, RTL if needed and localized audio when added.
- MVP initially vi/en; other languages are backlog until translations reviewed. V1 and internal asset studio are not localized by this change.
- QA: dictionary key coverage, locale persistence, quiz rules invariant and progress unchanged when switching. Browser UI/mobile layout still requires testing.

## Milestone
M0 — giữ baseline, docs, branch dev.
M1 — world/player/camera/companion + input.
M2 — quest tương tác + thưởng + save.
M3 — kiểm thử gameplay trên PC/mobile thật, tối ưu, polish và release preview.
M4 — chỉ sau khi MVP đạt: chuyển nội dung V1 từng trạm.
M5+ — family, AI, creative, multiplayer theo roadmap.

## Acceptance / QA
- Mở v2/index.html qua HTTP, WebGL hiện hoặc fallback về V1.
- PC/mobile: chạy 4 hướng, nhảy, camera không mất điều khiển, không xuyên vật cản/rơi khỏi đảo.
- Guide tới trạm, không khóa khả năng tự khám phá.
- Chỉ tương tác khi tới gần, mở/đóng modal không kẹt input, trả lời sai có thể thử lại.
- Quest hoàn thành một lần → đúng 1 sao; reload còn trạng thái; reset xóa đúng dữ liệu V2; storage hỏng không crash.
- Không thay đổi index.html V1. Không tuyên bố đạt hiệu năng/QA trước khi chạy trên thiết bị.
- Mục tiêu hiệu năng ban đầu: 30 FPS trên điện thoại tầm trung (thiết bị benchmark chưa chốt), 60 FPS desktop khi có thể. Đo thực tế trước khi nghiệm thu.
- Mô phỏng khoa học cần kiểm duyệt nội dung; cầu vồng minh họa sự tán sắc, khúc xạ và phản xạ trong giọt nước, không phải ray tracing vật lý.

## Working agreements
Mỗi thay đổi là một vertical slice (data → logic → UI → test), branch riêng, commit nhỏ, kiểm thử trước merge. Không đưa feature ngoài scope vào sprint; ghi backlog. Không dùng asset không có quyền sử dụng, không mở chat người lạ, không thu âm trẻ mặc định. Các mức tuổi, camera, quest mẫu và công nghệ là quyết định mặc định để thử nghiệm, có thể chỉnh sau feedback.
