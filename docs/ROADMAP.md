# Roadmap Phoenix World
Cập nhật 27/11/2026 — tài liệu định hướng, chưa triển khai tính năng mới.

## Tầm nhìn đã thống nhất
Game phiêu lưu khoa học 3D cho trẻ, chạy nhảy tự do trong các vùng nhỏ, Phoenix dẫn nhiệm vụ chính. Game, YouTube và gia đình bổ trợ nhau. Hòn đảo cá nhân, Family Quest, phần thưởng thực tế và AI companion là hướng phát triển dài hạn.

## Thứ tự phát hành đề xuất (scope MVP cần chốt)
| Release | Phạm vi | Điều kiện nghiệm thu |
|---|---|---|
| R0 — V1 baseline | Giữ nguyên 8 trạm; kiểm thử hồi quy, mobile, WebGL | Luồng chơi gốc hoạt động |
| R1 — Playable adventure (MVP) | 1 đảo nhỏ, nhân vật góc nhìn thứ ba chạy/nhảy, camera, va chạm, Phoenix dẫn đường bằng script, 1 nhiệm vụ khoa học hoàn chỉnh, phần thưởng và lưu local | Từ tạo nhân vật tới hoàn thành quest, nhận thưởng, tải lại vẫn chơi tiếp; desktop/mobile |
| R2 — Science expansion | Đưa 8 trạm V1 vào trải nghiệm mới theo từng lát cắt; mở rộng dần tới 30 trạm với nội dung đã duyệt | Thêm trạm bằng dữ liệu/module; không phá tiến trình cũ |
| R3 — Phoenix Family | Tài khoản phụ huynh, hồ sơ trẻ, giao nhiệm vụ ngoài đời, xác nhận hoàn thành, đổi và xác nhận trao quà; backend phân quyền và ledger chống nhận trùng | Một vòng giao nhiệm vụ đến trao quà chạy xuyên suốt, quyền phụ huynh được kiểm thử |
| R4 — Phoenix AI | Hỏi đáp khoa học đã duyệt, game context, tool gateway giới hạn, text trước rồi voice; phụ huynh opt-in, tối thiểu dữ liệu; script fallback | Kiểm thử an toàn và chi phí; AI không tự phê duyệt hoặc cộng thưởng |
| R5 — Island Creative | Mở khóa công trình, sưu tập, trang trí đảo; mở rộng theo nội dung | Lưu/khôi phục đảo, không bắt buộc quà thật để tiến bộ |
| R6 — Family Multiplayer (backlog dài hạn) | Đảo riêng cho anh chị em, thăm đảo gia đình, avatar phụ huynh, nhiệm vụ chung | Chỉ gia đình được xác nhận; không chat người lạ; đánh giá chi phí realtime, quyền truy cập và an toàn trước khi làm |

## Quy tắc chống scope creep
- Chỉ triển khai một vertical slice tại một thời điểm, nghiệm thu rồi mới mở slice tiếp.
- MVP không cần AI online, backend, multiplayer, 30 trạm, xây dựng tự do hay hệ thống kinh tế phức tạp.
- V1 là baseline; không xóa hoặc thay thế trước khi bản mới đạt kiểm thử.
- Không đặt deadline khi chưa prototype và đo hiệu năng thiết bị thật.
- Tính năng phát sinh ghi backlog, không chen vào release đang làm trừ lỗi chặn hoặc an toàn.
- Các tên release, thứ tự R2–R5 và số lượng nhiệm vụ MVP là đề xuất để chủ dự án duyệt, không phải cam kết thời gian.
