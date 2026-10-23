---
name: github-push-guard
description: >-
  Kỹ năng bảo vệ an toàn Git cho toàn bộ dự án. Bắt buộc chặn mọi lệnh git push tự động.
  Tuyệt đối không tự ý đẩy mã nguồn lên GitHub sau khi sửa file, fix bug hay hoàn thiện tính năng.
  Mọi thao tác push hoặc deploy đều phải ở trạng thái chờ (blocked) và chỉ được thực thi khi có sự đồng ý rõ ràng từ người dùng.
---

# Kỹ Năng Bảo Vệ An Toàn Git (GitHub Push Guard)

Kỹ năng này thiết lập một chốt chặn bảo mật và an toàn dữ liệu bắt buộc (Hard Safety Gate) đối với mọi thao tác đẩy mã nguồn lên kho lưu trữ từ xa (Remote Repositories như GitHub, GitLab, Bitbucket...).

---

## 1. QUY TẮC CỐT LÕI (BẮT BUỘC & KHÔNG ĐƯỢC PHÁ VỠ)

- **Tuyệt đối KHÔNG BAO GIỜ** được tự ý chạy lệnh `git push` hoặc bất kỳ lệnh nào tự động đẩy mã nguồn lên GitHub sau khi chỉnh sửa file, fix bug hay hoàn thiện tính năng.
- **Mọi thao tác deploy, sync hay push lên GitHub đều phải ở trạng thái chờ (BLOCKED)** cho đến khi có sự cho phép rõ ràng từ người dùng.
- Việc commit cục bộ (`git commit`) có thể được thực hiện để lưu vết phát triển, nhưng việc đẩy lên remote (`git push`) là **vùng cấm tự động**.

---

## 2. QUY TRÌNH HỎI XÁC NHẬN (CONFIRMATION WORKFLOW)

Bất cứ khi nào bạn sửa xong và nhận thấy cần phải đẩy code lên GitHub, bạn **phải dừng lại ngay lập tức** và xuất ra thông báo theo đúng cấu trúc 3 phần sau:

1. **Tóm tắt các file và tính năng vừa thay đổi:** Liệt kê vắn tắt, rõ ràng những file đã sửa đổi, các tính năng mới hoặc bug đã được xử lý.
2. **Thông tin branch & remote:** Nêu rõ tên nhánh (`branch`) và địa chỉ kho lưu trữ (`remote repository`) chuẩn bị push (ví dụ: `origin/main`, `https://github.com/Tidu84/...`).
3. **Câu hỏi xác nhận trực tiếp:** 
   > *"Tôi đã hoàn thiện các thay đổi trên. Bạn có đồng ý cho phép chạy lệnh push lên GitHub không?"*

---

## 3. ĐIỀU KIỆN THỰC THI (EXECUTION CONDITIONS)

- **Chỉ khi người dùng gõ câu trả lời đồng ý** (ví dụ: `"ok"`, `"đồng ý"`, `"push đi"`, `"yes"`, `"tiến hành đi"` hoặc các câu khẳng định tương đương), bạn mới được phép thực thi lệnh `git push`.
- **Nếu người dùng chưa xác nhận, im lặng hoặc yêu cầu sửa thêm:** Tuyệt đối không được chạm vào lệnh `git push`.
- **Nếu người dùng từ chối:** Giữ nguyên trạng thái commit tại máy local, không đẩy lên remote.
