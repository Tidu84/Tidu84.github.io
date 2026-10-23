---
name: quy-tac-co-lap-3-phan-khu
description: >-
  Quy tắc bất di bất dịch về kiến trúc 3 phân khu độc lập của diễn đàn choipoker.vercel.app:
  (1) Trạm Tình Báo Quốc Tế, (2) Bàn Mổ Xẻ & AI Trọng Tài, (3) Lò Luyện Từ Gà Hóa Sói.
  Kích hoạt khi nhận bất kỳ lệnh chỉnh sửa giao diện, bố cục, dữ liệu hoặc tính năng trên trang choipoker.vercel.app.
  Bảo đảm nguyên tắc cô lập tuyệt đối: chỉ tác động vào đúng phân khu được chỉ định, giữ nguyên 100% bố cục và tính năng của 2 phân khu còn lại, luôn hiển thị sẵn tiêu đề/tóm tắt khi chia sẻ link.
---

# Quy Tắc Cô Lập 3 Phân Khu - choipoker.vercel.app

## 1. Kiến Trúc Cốt Lõi 3 Phân Khu Độc Lập

Trang web `choipoker.vercel.app` được xây dựng và duy trì theo mô hình 3 phân khu độc lập tách rời về logic hiển thị, dữ liệu và giao diện:

| STT | Tên Phân Khu | Mã Định Danh (`mainSection`) | Chức Năng Cốt Lõi | Nguồn Dữ Liệu & Tài Liệu |
| :--- | :--- | :--- | :--- | :--- |
| **Phân khu 1** | **Trạm Tình Báo Quốc Tế** | `tong-hop-dien-dan` | Tổng hợp thông tin, kinh nghiệm, chiến thuật quốc tế nóng bỏng nhất trong 365 ngày qua | TwoPlusTwo, CardsChat, PokerStrategy |
| **Phân khu 2** | **Bàn Mổ Xẻ & AI Trọng Tài** | `trao-doi-chinh` | Không gian sinh hoạt, thảo luận hand history, mổ xẻ chiến thuật cash game/tournaments, tích hợp AI Cố Vấn Trọng Tài | Kế thừa diễn đàn cũ `hocpoker.forumvi.com` |
| **Phân khu 3** | **Lò Luyện Từ Gà Hóa Sói** | `giang-day-nghien-cuu` | Học bài bản: Giáo trình nội bộ CLB, Sách 2016 Tidu (PDF 16 trang), Sit & Go, Lối chơi TAG, Video Kênh YouTube "Chơi Poker", Nghiên cứu GTO | Sách Tidu 2016, Kênh YouTube "Chơi Poker", Solver GTO |

---

## 2. Nguyên Tắc Cô Lập Tuyệt Đối (Zero Side-Effects)

Khi nhận bất kỳ yêu cầu chỉnh sửa, nâng cấp hoặc gỡ lỗi (debug):

1. **Xác định chính xác phân khu mục tiêu:** Xác định yêu cầu thuộc Phân khu 1, 2 hay 3.
2. **Chỉ tác động vào đúng phân khu đó:** Tuyệt đối chỉ chỉnh sửa các thành phần (components, API endpoint logic, data block) của phân khu được yêu cầu.
3. **Bảo toàn 100% hai phân khu còn lại:**
   - Không thay đổi bố cục (layout) của 2 phân khu còn lại.
   - Không làm xáo trộn dữ liệu bài viết (threads), bình luận, thẻ hay định dạng của 2 phân khu còn lại.
   - Không xóa hoặc di dời các tính năng đã hoạt động ổn định (PDF reader, video YouTube button, AI chat).
4. **Kiểm tra tương thích di động (Mobile Responsive):**
   - Đảm bảo thanh menu luôn dùng `.menu-container`, `.nav-bar`, `.category-bar` với `flex-wrap: wrap; gap: 8px; overflow-x: visible`.
   - Các nút bấm `.menu-item`, `.nav-button` giữ `flex: 0 1 auto; white-space: nowrap;`.

---

## 3. Quy Định Về Chia Sẻ Link (Social Preview & OpenGraph)

Khi chia sẻ đường dẫn bài viết hoặc link diễn đàn:
- **Luôn hiển thị sẵn tiêu đề bài viết** (`og:title`, `<title>`).
- **Luôn hiển thị sẵn tóm tắt nội dung** (`og:description`, `meta[name="description"]`).
- Khi người dùng bấm xem bài viết hoặc bấm nút copy/chia sẻ link, hệ thống phải cập nhật metadata và sinh liên kết kèm tóm tắt đầy đủ để preview đẹp mắt trên Facebook, Zalo, Telegram, Skype.
