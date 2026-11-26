# Hành Trình Khám Phá Cùng Phoenix
Web game khoa học đời sống dành cho trẻ, dựa trên series của kênh Văn Công Nghệ.

## Baseline V1 — 26/11/2026
Mở index.html bằng trình duyệt hoặc phục vụ bằng máy chủ web tĩnh. Không cần build hay backend. Three.js và hình ảnh được nhúng; Google Fonts và video YouTube cần mạng.
- 4 vùng: Cơ Thể, Nhà Bếp, Trong Nhà, Thiên Nhiên; 8 trạm, 2 câu đố/trạm.
- Tạo nhân vật, 6 avatar, chọn màu, bản đồ 3D, góc nhìn thứ nhất, Phoenix dẫn đường.
- Sao, huy hiệu, 2 mini-game, Web Audio, chứng nhận PNG.
- Chưa lưu tiến trình; trạm Nước Biển và Cầu Vồng chưa có link video theo tài liệu bàn giao.

## Kiến trúc hiện tại
Một file HTML chứa CSS, dữ liệu ZONES/STATIONS, state.done theo index, profile, renderMap/renderProgress/renderBadges, openStation/renderStory/renderQuiz/answer/completeStation, createPhoenix3D/createMap3D, SFX, showCertificate và mini-game. Một số text và LEVELS gắn cứng với 8 trạm.

## Roadmap V2 (đề xuất, chưa triển khai)
1. Baseline: kiểm thử toàn bộ 8 trạm, mobile, WebGL fallback, âm thanh, chứng nhận; giữ nguyên V1.
2. Tách dữ liệu, game state, UI, 3D, audio, mini-game thành module; giữ gameplay. Dùng ID trạm ổn định, bỏ số 8 hardcode.
3. Lưu hồ sơ và tiến trình bằng localStorage có schema version, kiểm tra dữ liệu, reset có xác nhận; không yêu cầu tài khoản trẻ.
4. Mở rộng 30 trạm theo nội dung được duyệt; kiểm tra bố trí 3D, điều hướng, chứng nhận và cấp bậc khi số trạm tăng. Không tự tạo link video chưa xác minh.
5. Nâng trải nghiệm khám phá và tối ưu mobile; chỉ thay đổi thiết kế khi scope được duyệt.
6. Deploy web tĩnh HTTPS và kiểm thử hồi quy.
 
## Quy tắc phát triển
Mỗi tính năng đi trọn luồng dữ liệu → logic → UI → test. Không thay đổi nhiều tính năng cùng lúc. Không đưa thông tin cá nhân trẻ lên máy chủ mặc định. Dùng branch riêng và review trước merge. Chưa kiểm thử runtime trong phiên import.
