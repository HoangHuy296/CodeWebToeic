**Bàn giao tài nguyên i18n cho đợt 3 — student / teacher / admin**

Các tài nguyên dưới đây đã được thêm vào `frontend/src/i18n/locales/{vi,en}` và đăng ký trong `resources.ts`. Phần này cung cấp bản dịch để ghép vào component; không có nghĩa toàn bộ trang workspace đã được chuyển sang i18n. Claude tiếp tục thay chuỗi hiển thị trong các trang bằng khóa tương ứng.

| Namespace | Nhóm khóa | Nội dung |
| --- | --- | --- |
| `common` | `actions`, `states`, `fields`, `roles`, `statuses` | Nút bấm, trạng thái, tên trường và vai trò dùng chung |
| `common` | `levels`, `sections`, `testTypes` | Nhãn trình độ, kỹ năng, loại bài; giữ nguyên enum gửi API |
| `common` | `validation`, `pagination`, `counts` | Validation có tham số, phân trang, đơn vị và số lượng |
| `workspace` | `profile` | Hồ sơ, ảnh đại diện, mật khẩu, thay đổi email/số điện thoại và thông báo kết quả |
| `workspace` | `messages` | Hộp thư, bộ lọc, người gửi/nhận, soạn tin, trả lời và validation |
| `workspace` | `courses` | CRUD khóa học, thông tin, giá, tài liệu, duyệt và validation |
| `workspace` | `lessons` | Danh sách, tìm kiếm, sắp xếp, CRUD bài học và media |
| `workspace` | `assessments` | Trình sửa bài tập/bài thi, câu hỏi, phương án, kỹ năng, hướng dẫn |
| `workspace` | `results` | Bảng điểm, bộ lọc, chi tiết bài nộp và xem lại đáp án |
| `student` | `dashboard`, `myCourses`, `mockTests`, `learning`, `session`, `wordcheckResults`, `messages` | Nội dung riêng cho học viên |
| `teacher` | `dashboard`, `courses`, `students`, `messages` | Nội dung riêng cho giảng viên |
| `admin` | `dashboard`, `users`, `posts`, `exerciseTopics`, `messages`, `systemSettings` | Nội dung riêng cho quản trị viên |

Ví dụ ghép vào component:

```tsx
const { t } = useTranslation('workspace');
const { t: tCommon } = useTranslation('common');

// Tiêu đề và nút:
t('profile.editorTitle');
tCommon('actions.saveChanges');

// Tham số giữ nguyên tên ở cả hai ngôn ngữ:
t('profile.emailCodeRequested', { target: result.deliveryTarget });
tCommon('validation.minLength', { field: t('messages.subject'), min: 3 });

// count phải là số để i18next chọn số ít/số nhiều:
tCommon('counts.questions', { count: questions.length });

// Chỉ dịch nhãn; payload vẫn giữ nguyên "pending_review":
tCommon('statuses.pending_review');
```

Các khóa số lượng trong `common.counts` gồm `minutes`, `seconds`, `courses`, `lessons`, `questions`, `students`, `attempts`, `drafts`, `paidOrders`. Có khóa gốc để tương thích và biến thể `_one/_other` cho tiếng Anh, `_other` cho tiếng Việt. Component gọi khóa gốc với `count`, không tự chọn hậu tố. Hai ngôn ngữ vì vậy không cần có cùng số khóa vật lý.

Trong `wordcheck.json`, đã bổ sung số ít/số nhiều cho các nhãn luyện cả bộ, bắt đầu ôn, số cụm từ, ôn câu sai, số vòng còn lại và flashcard. `checkPhrase.flipToEn` đã được sửa thành hành động xem mặt tiếng Anh. Các khóa gốc vẫn tồn tại.

Quy ước khi tiếp tục tích hợp:

- Dịch tại render, bao gồm tiêu đề, placeholder, nhãn trợ năng, loading/empty/error, modal và thông báo đang hiển thị.
- Các hàm nhận `t` dùng `TFunction<'namespace'>` từ `i18next`; không khai báo `(key: string) => string`, vì khóa đã được kiểm tra kiểu theo resource.
- Bản đồ khóa động giữ union hoặc literal type. Không ép thành `Record<string, string>` rồi truyền một chuỗi bất kỳ vào `t`.
- Dữ liệu dùng làm React key, role/status gửi API, ID, slug, câu hỏi gốc, đáp án và nội dung người dùng nhập vẫn giữ giá trị gốc.
- `teacher.dashboard.totalEnrollments` thể hiện số lượt đăng ký: một người đăng ký hai khóa học được tính hai lượt. Dùng nhãn này nếu số liệu lấy từ tổng enrollments.
- `workspace.profile.devCode` và `devOtp` chỉ dành cho chỗ đã hiển thị mã thử nghiệm; không dùng chúng làm thông báo gửi mã thật.
- Những câu đặc thù chưa có trong tài nguyên phải bổ sung đồng thời EN/VI. Nhóm khóa này là nền tảng cho đợt 3, không thay thế việc rà soát từng trang.

Kiểm tra tài nguyên bằng:

```powershell
node scripts/check-i18n.mjs
npm.cmd run build:frontend
```

`check-i18n.mjs` tự đọc các file JSON của VI/EN và phát hiện JSON lỗi, thiếu namespace/khóa, giá trị rỗng hoặc sai kiểu, biến nội suy không khớp, dấu nội suy lỗi, ký tự Unicode thay thế và thiếu biến thể số ít/số nhiều trong nhóm đã khai báo. So sánh theo khóa logic để chấp nhận số lượng biến thể khác nhau giữa hai ngôn ngữ. Script trả mã lỗi khác 0 khi phát hiện vấn đề.

Script không kiểm chứng độ chính xác ngôn ngữ của mọi câu, không tìm toàn bộ chuỗi viết trực tiếp trong TSX và không phát hiện khóa JSON trùng. Vẫn cần đọc giao diện và rà soát các luồng sau khi ghép component. Build kiểm tra kiểu khóa trong những chỗ dùng `t` có khai báo kiểu.

Phần tích hợp đã sửa thêm: loại đăng ký namespace trùng trong `resources.ts`, dùng kiểu `TFunction` cho helper menu tài khoản và nhãn tiếp tục wordcheck, giới hạn kiểu khóa vai trò trong trang cài đặt chung.

Kết quả tại thời điểm bàn giao: kiểm tra 11 namespace với 1.998 chuỗi EN/VI đạt; 4.290 lượt dịch thử trong các nhóm common/workspace/student/teacher/admin/wordcheck với fallback tắt đạt; kiểm tra tình huống thiếu khóa, sai biến và thiếu biến thể số nhiều phát hiện lỗi đúng; `npm.cmd run build:frontend` hoàn tất thành công. Đây là kiểm tra tài nguyên và build, chưa phải nghiệm thu giao diện của toàn bộ đợt 3.
