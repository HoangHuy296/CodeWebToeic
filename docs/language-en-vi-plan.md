**Phương án Language EN/VI cho IVYTS 1998**

Ngày khảo sát: 25/09/2026. Đây là tài liệu thiết kế và lộ trình triển khai; chức năng chưa được cài đặt. Phương án mặc định dùng tiếng Việt **có dấu** cho `vi`, tiếng Anh cho `en`, áp dụng cho trang công khai và các khu vực student, teacher, admin.

**Hiện trạng đã kiểm tra**

- Frontend dùng React 19, Vite 7, TypeScript và React Query; chưa có thư viện hay kho bản dịch i18n trong `frontend/package.json` và `frontend/src`.
- Có 60 file trang TSX tại lần rà soát cuối, bên cạnh các component, layout và tính năng dùng chung. Chữ hiển thị được viết trực tiếp trong nhiều file, gồm tiếng Việt không dấu, có dấu và tiếng Anh. Riêng `portfolio-page.tsx` đã có nhiều nội dung tiếng Việt có dấu.
- `avatar-dropdown.tsx` có menu theo vai trò. `/student/settings` đã có các tab General, Appearance, Language; tab Language đang lưu khóa `ivyts-language` trên localStorage, nút English bị vô hiệu hóa và chưa có cơ chế dịch. Student/teacher có trang hồ sơ; `/admin/settings` hiện hiển thị thông tin vận hành, chưa phải cài đặt cá nhân chung.
- `PublicUser`, `User`, `UserAuthEntity` và `PublicUserResponse` chưa có ngôn ngữ ưu tiên. Backend đang lưu người dùng qua `MySqlUserStore`.
- `lib/format.ts` và một số màn hình cố định định dạng `vi-VN`; `frontend/index.html` lại đặt `lang="en"`.
- API lỗi đã có trường `code` nhưng có thể rỗng; lỗi từng trường chỉ có `field/message`. Thông báo hiện lưu `title/message` thành chuỗi. Bài viết, khóa học và bài học hiện có các trường nội dung một ngôn ngữ.
- Trang hồ sơ student/teacher dùng effect phụ thuộc toàn bộ `[user]` để nạp lại form. Nếu lưu ngôn ngữ làm đổi object user, dữ liệu người dùng đang nhập có thể bị ghi đè; đây là điểm cần sửa khi tích hợp.

**Trải nghiệm người dùng đề xuất**

Tận dụng tab **Language** hiện có ở `/student/settings`, thay phần lưu state cục bộ bằng component cài đặt ngôn ngữ dùng chung. Bổ sung trang cài đặt cá nhân tại `/teacher/settings` và `/admin/account-settings`, cùng dùng component này và được bảo vệ theo vai trò. Thêm liên kết **Cài đặt / Settings** tương ứng trong menu tài khoản. Hai lựa chọn luôn ghi bằng tên bản ngữ: `Tiếng Việt` và `English`. Mục `/admin/settings` được đặt tên rõ là `Cài đặt hệ thống / System settings`.

Khi chọn ngôn ngữ, giao diện cập nhật ngay tại trang đang xem và tự lưu vào tài khoản. Hiển thị trạng thái đang lưu, lưu thành công hoặc lỗi bằng ngôn ngữ phù hợp. Giữ nguyên URL, vị trí cuộn, form, câu trả lời, bộ đếm giờ và trạng thái phát media. Có bộ chọn EN/VI gọn trong header để khách chưa đăng nhập cũng có thể sử dụng; tất cả bộ chọn dùng chung một luồng xử lý.

Đề xuất quy tắc lựa chọn:

| Tình huống | Ngôn ngữ sử dụng |
| --- | --- |
| Khách lần đầu | `vi` |
| Khách quay lại | Lựa chọn khách đã lưu trên trình duyệt; nếu không có thì `vi` |
| Đăng nhập bằng mật khẩu hoặc Google | `preferredLanguage` của tài khoản được server trả về |
| Đăng ký tài khoản mới | Gửi lựa chọn hiện tại khi tạo tài khoản; thiếu giá trị thì `vi` |
| Tải lại khi còn phiên đăng nhập | Khôi phục tài khoản và ngôn ngữ trước khi mở giao diện tài khoản |
| Đăng nhập trên thiết bị khác | Đọc lại lựa chọn từ server |
| Đăng xuất | Trở về lựa chọn dành cho khách trên trình duyệt đó |

Bản đầu đồng bộ giữa các thiết bị khi đăng nhập hoặc tải lại hồ sơ, không cần bổ sung kênh đồng bộ thời gian thực. Giá trị không hợp lệ phải được xử lý rõ: API ghi trả lỗi; dữ liệu cache lỗi bị bỏ qua và dùng `vi`.

**Cách render đa ngôn ngữ**

Đề xuất dùng `i18next` và `react-i18next`. Mỗi component lấy bản dịch bằng `useTranslation`; bộ chọn gọi `i18n.changeLanguage`. Các component đăng ký dịch cập nhật theo ngôn ngữ hiện hành. Cần chuyển toàn bộ chữ hiển thị sang khóa dịch thì cơ chế này mới bao phủ toàn site. Xem [tài liệu useTranslation](https://react.i18next.com/latest/usetranslation-hook) và [cơ chế languageChanged](https://react.i18next.com/latest/i18next-instance).

Tạo cấu trúc dự kiến:

```text
frontend/src/i18n/
  index.ts                   # Cấu hình và khởi tạo một instance
  resources.ts               # Tập hợp bản dịch
  types.d.ts                 # Khai báo kiểu khóa dịch
  locales/
    vi/*.json
    en/*.json
frontend/src/app/providers/language-provider.tsx
frontend/src/components/common/language-select.tsx
frontend/src/components/settings/language-settings-section.tsx
frontend/src/pages/student/student-settings-page.tsx  # Tích hợp tab đã có
frontend/src/pages/shared/user-settings-page.tsx
```

Chia bản dịch thành các nhóm `common`, `navigation`, `auth`, `settings`, `public`, `portfolio`, `learning`, `wordcheck`, `student`, `teacher`, `admin`, `notifications`, `errors`. Hai ngôn ngữ dùng cùng hệ thống khóa có ý nghĩa, ví dụ `navigation.myCourses`: `Khóa học của tôi` / `My courses`.

Cấu hình `supportedLngs: ['vi', 'en']`, `fallbackLng: 'vi'`, namespace mặc định `common`. Khởi tạo và chờ i18n sẵn sàng trong `main.tsx` trước khi render. Đóng gói sẵn hai bộ bản dịch ở lần triển khai đầu để thao tác chuyển không phụ thuộc tải thêm file. Nếu dung lượng đo được lớn, mới tách tải theo nhóm trang và nạp trước bản dịch cần thiết. Các tùy chọn được mô tả trong [tài liệu cấu hình i18next](https://www.i18next.com/overview/configuration-options).

`LanguageProvider` nằm dưới `AuthProvider`, phía trên `NotificationProvider` và router để đồng bộ tài khoản, cache và trạng thái lưu. i18next là nguồn ngôn ngữ hiện hành; provider không duy trì một giá trị ngôn ngữ độc lập dễ bị lệch. Instance đã được khởi tạo ở đầu ứng dụng nên cả thông báo lỗi đăng nhập cũng dùng được bản dịch.

Nguyên tắc chuyển đổi mã nguồn:

- Component dịch tại lúc render. Mảng menu, bảng thống kê, dữ liệu portfolio ở ngoài component giữ khóa dịch và ID ổn định; không gọi dịch một lần khi import module.
- Thông báo đang hiển thị và lỗi form lưu khóa/mã cùng tham số, sau đó dịch khi render. Nếu chỉ lưu chuỗi đã dịch trong state thì đổi ngôn ngữ sẽ để sót chuỗi cũ.
- Chuỗi có số lượng, tên hoặc số điểm dùng tham số và quy tắc số ít/số nhiều. Tránh ghép các mảnh câu theo trật tự tiếng Việt.
- Dịch cả placeholder, tooltip, tiêu đề trang, trạng thái tải/rỗng/lỗi, nhãn biểu đồ, xác nhận thao tác, `aria-label`, mô tả ảnh và nhãn tùy chọn. Mã role, status, ID, slug vẫn ổn định; chỉ dịch nhãn hiển thị.
- Với đoạn có liên kết hoặc chữ đậm, dùng cấu trúc dịch hỗ trợ component. Nội dung động vẫn cần cơ chế xử lý HTML an toàn riêng.
- Khi đổi ngôn ngữ, cập nhật `document.documentElement.lang`, tiêu đề và mô tả trang do ứng dụng quản lý. HTML ban đầu dùng `vi`.
- Hàm định dạng nhận locale hiện tại: `vi → vi-VN`, `en → en-US`. Thay các chỗ cố định `vi-VN`, kể cả trong wordcheck và hồ sơ. Đổi cách trình bày tiền nhưng giữ đơn vị VND, số tiền và múi giờ nghiệp vụ.
- Không đặt `key={language}` lên app/router/trang, không tải lại trang. Rà soát effect, memo và callback để đổi bản dịch không khởi tạo lại phiên học hoặc gửi lại bài.
- Effect nạp form hồ sơ chỉ khởi tạo theo tài khoản và dữ liệu hồ sơ phù hợp, có bảo vệ draft đang sửa; thay đổi `preferredLanguage` không được reset form.

**Lưu lựa chọn vào tài khoản**

Thêm `preferredLanguage: 'vi' | 'en'` vào hợp đồng người dùng frontend/backend và cột `users.preferred_language` với mặc định `vi`, không cho null. Migration bổ sung mới phải chọn số phiên bản còn trống lúc triển khai; cây mã hiện có tới V13. Cập nhật cả hai chiều ánh xạ trong `MySqlUserStore` và mọi nơi tạo/trả người dùng, gồm login, Google, đăng ký, refresh-token, `/auth/me` và cập nhật hồ sơ.

Đề xuất endpoint chuyên biệt:

```http
PATCH /api/auth/me/preferences
Content-Type: application/json

{ "preferredLanguage": "en" }
```

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": { "preferredLanguage": "en" }
}
```

Endpoint xác thực người dùng hiện tại, chỉ cập nhật ngôn ngữ của chính họ, chỉ chấp nhận `vi/en`. Việc cập nhật cần giới hạn ở cột preference để không ghi đè thay đổi hồ sơ hoặc refresh token từ request đồng thời. Response preference gọn giúp frontend gộp trường này vào cache `['auth', 'me']` mà không thay bằng snapshot hồ sơ cũ.

Luồng xử lý khi đổi:

1. Xác thực lựa chọn, ghi nhớ ngôn ngữ đã lưu trước đó, cập nhật giao diện ngay.
2. Với khách, lưu cache khách. Với tài khoản, gọi endpoint và khóa tạm bộ chọn trong khi ghi để tránh nhiều request ghi ngược thứ tự.
3. Thành công: gộp preference vào cache người dùng và cache trình duyệt theo user ID; hoàn tất trạng thái lưu.
4. Thất bại: khôi phục ngôn ngữ đã lưu, hiện lỗi được dịch và cho thử lại. Không báo đã lưu khi server chưa ghi thành công.
5. Nếu tài khoản đã thay đổi trong khi request chạy, bỏ qua response đối với giao diện tài khoản mới. Kết quả ghi của A không được áp dụng sang B.

Cache khách và cache từng tài khoản dùng khóa tách biệt, ví dụ `ivyts.language.guest` và `ivyts.language.user:<id>`. Khóa cũ `ivyts-language` chỉ được đọc một lần như gợi ý cho cache khách sau khi kiểm tra `vi/en`; không tự gán nó thành preference của mọi tài khoản trên máy. Đọc/ghi localStorage có xử lý ngoại lệ; khi storage bị chặn, giao diện vẫn hoạt động và tài khoản vẫn lưu được trên server. Server là nguồn quyết định sau khi xác thực; hiệu ứng đồng bộ không được lấy preference cũ ghi đè một lựa chọn đang chờ lưu. Chỉ dùng màn hình chờ lúc khởi tạo phiên, không tháo cây trang khi đổi ngôn ngữ trong phiên.

**Nội dung từ API và dữ liệu học tập**

Phần này bắt buộc nếu yêu cầu là toàn bộ nội dung do IVYTS xuất bản, không chỉ menu và nút bấm.

| Loại nội dung | Cách xử lý |
| --- | --- |
| Nội dung giới thiệu cố định, portfolio | Dịch trong các file locale; giữ tên riêng, thông tin liên hệ, điểm số và ảnh gốc |
| Tên/mô tả khóa học, bài học, bài viết, danh mục/chủ đề do IVYTS biên soạn | Bổ sung bản EN/VI trong dữ liệu và giao diện biên tập |
| Hướng dẫn làm bài, giải thích đáp án, phản hồi hệ thống | Có phiên bản EN/VI |
| Câu hỏi TOEIC, phương án trả lời, từ/cụm từ cần học, transcript và audio tiếng Anh | Giữ ngôn ngữ học tập để không làm thay đổi bài thi hoặc gợi ý đáp án; dịch phần hướng dẫn bao quanh |
| Tên người, email, tin nhắn, nội dung người dùng tự nhập | Giữ nguyên nội dung tác giả |
| Ảnh có chữ, PDF, video hoặc dịch vụ nhúng bên ngoài | Cần asset/phụ đề hoặc khả năng đổi locale tương ứng; thư viện dịch giao diện không tự dịch được nội dung này |

Mô hình đề xuất là các bảng bản dịch theo loại nội dung (`course_translations`, `lesson_translations`, `post_translations`, bảng tương ứng cho chủ đề và phần giải thích), khóa duy nhất `(entity_id, locale)`, có khóa ngoại tới nội dung gốc. Chỉ đặt trường văn bản cần dịch trong bảng bản dịch. ID, slug, thứ tự bài, điểm, đáp án đúng, giá, quyền truy cập và trạng thái xuất bản nghiệp vụ nằm ở dữ liệu gốc.

Thêm tab Việt/Anh trong màn hình biên tập và trạng thái hoàn tất bản dịch. API đọc nội dung nhận `lang=vi|en`, trả các trường văn bản theo locale cùng `contentLanguage` cho biết bản thực tế. API biên tập đọc/ghi từng bản dịch rõ ràng; ngôn ngữ giao diện editor không quyết định ngầm ngôn ngữ nội dung đang sửa. Hợp đồng cũ vẫn có dữ liệu mặc định trong giai đoạn chuyển tiếp.

Các query nội dung phụ thuộc ngôn ngữ phải có locale trong khóa cache, ví dụ `['courses', slug, language]`, và gửi đúng locale cho API. Cache đề thi, đáp án và tiến độ không bị đổi khóa chỉ vì đổi ngôn ngữ giao diện. Các nhãn/hướng dẫn phiên thi được dịch riêng, tránh lấy lại đề hoặc tạo lại phiên. Việc tìm kiếm/lọc theo văn bản hiển thị cần truy vấn bản dịch của locale đang chọn.

Dữ liệu hiện tại cần được phân loại ngôn ngữ nguồn, khôi phục tiếng Việt có dấu và biên tập bản Anh; không thể khẳng định mọi trường hiện có đều là tiếng Việt. Trong thời gian chuyển tiếp, nội dung thiếu bản dịch có thể dùng bản nguồn kèm thông báo rõ. Điều này chỉ là phương án dự phòng: để nghiệm thu “toàn bộ EN/VI”, nội dung đã xuất bản trong phạm vi phải có đủ hai bản hoặc có ngoại lệ nội dung gốc được ghi nhận cụ thể.

**Lỗi và thông báo**

- Chuẩn hóa mã lỗi ổn định trong backend, gồm cả lỗi validation từng trường và tham số cần thiết. Frontend dịch theo mã, với thông báo chung được dịch cho mã chưa biết; không dựa vào câu tiếng Anh server trả về để so khớp.
- Bổ sung khóa sự kiện/thông báo và tham số vào dữ liệu thông báo, inbox, WebSocket và cache cục bộ. Dịch tại `notification-bell`/nơi hiển thị để thông báo đã nhận cũng đổi ngôn ngữ.
- Trong giai đoạn chuyển tiếp có thể giữ `title/message` để tương thích client cũ. Thông báo cũ chỉ có chuỗi cần kế hoạch bổ sung metadata từ sự kiện gốc hoặc chuyển đổi mẫu đã biết; chuỗi tự do không có metadata không thể tự chuyển chính xác. Đánh giá tồn đọng này trước khi tuyên bố phủ hết thông báo.
- Giọng đọc từ vựng/cụm từ tiếp tục theo ngôn ngữ mục tiêu của bài học; lựa chọn VI của giao diện không đổi giọng đọc tiếng Anh thành tiếng Việt.

**Thứ tự triển khai và đầu ra**

| Đợt | Công việc | Điều kiện hoàn tất |
| --- | --- | --- |
| 1. Nền tảng và cài đặt | i18n, bộ chọn chung, tab Language hiện có và cài đặt cá nhân các vai trò, persistence tài khoản, migration, đồng bộ auth, format | Đổi/lưu/khôi phục EN/VI chạy đúng; form và phiên học không reset |
| 2. Giao diện công khai | Header/footer, đăng nhập/đăng ký, trang chủ, portfolio, danh sách/chi tiết khóa học, blog, hub bài tập, wordcheck, checkphrase, review, 404 | Toàn bộ chữ tĩnh của các luồng công khai có hai bản |
| 3. Khu vực tài khoản | Layout và toàn bộ trang student/teacher/admin/shared; CRUD, bảng, modal, validation, kết quả, thông báo | Toàn bộ chữ giao diện có hai bản; kiểm thử theo từng vai trò |
| 4. Nội dung xuất bản | Bảng bản dịch, API theo locale, editor hai ngôn ngữ, chuyển đổi dữ liệu, rà soát media | Nội dung thuộc phạm vi đã xuất bản có EN/VI đầy đủ |
| 5. Nghiệm thu | Kiểm tra độ phủ khóa, bản dịch thực tế, lưu tài khoản, mất mạng, mobile và hồi quy học tập | Đạt các tiêu chí bên dưới trước khi công bố toàn site hỗ trợ EN/VI |

Các đợt là cách chia công việc, không phải giảm phạm vi cuối cùng. Khối lượng dịch nội dung từ database cần kiểm kê thực tế trước khi ước lượng thời gian; số file trang chưa phản ánh số câu hoặc số bài viết cần dịch.

**Kiểm thử và tiêu chí nghiệm thu**

- Kiểm tra khóa dịch và placeholder của hai bộ tài nguyên; xử lý các biến thể số ít/số nhiều theo từng ngôn ngữ. Fallback giúp tránh lỗi hiển thị nhưng không được che thiếu bản dịch khi nghiệm thu.
- Dùng khai báo kiểu khóa để phát hiện khóa không tồn tại khi build. Rà soát chuỗi trực tiếp theo từng route, cả chuỗi không dấu và tiếng Anh; kiểm tra bằng regex chỉ hỗ trợ, không thay thế đọc giao diện và soát ngôn ngữ.
- Kiểm thử API preference: cả ba vai trò, thiếu xác thực, giá trị sai/null, ghi/đọc lại, dữ liệu người dùng cũ mặc định `vi`, mọi luồng auth trả cùng trường và cập nhật không đè dữ liệu khác.
- Kiểm thử trình duyệt: VI → EN → VI, điều hướng giữa trang công khai và workspace, tải lại, đăng xuất/đăng nhập, thiết bị mới, đổi tài khoản A/B, request lưu lỗi và storage bị chặn.
- Kiểm thử giữ trạng thái: đang sửa hồ sơ, đang trả lời đề, bộ đếm giờ đang chạy, phiên wordcheck và media. Chuyển ngôn ngữ không mất draft, tạo phiên mới, nộp bài hay phát lại âm thanh.
- Kiểm thử nội dung và cache: đổi locale tải đúng bản, response cũ không ghi đè locale mới, bản dịch thiếu có fallback rõ, editor lưu đúng ngôn ngữ và không thay đề gốc.
- Kiểm tra thông báo/lỗi đã hiện trước lúc đổi, ngày giờ, tiền, tiêu đề, `html.lang`, bàn phím, nhãn trợ năng và layout mobile với câu tiếng Anh dài hơn.
- Chạy build frontend, kiểm thử backend phù hợp và bổ sung luồng EN/VI vào bộ Playwright hiện có. Tài liệu này chưa thực thi các kiểm thử triển khai vì chưa thay đổi mã chạy.

Đầu ra hoàn chỉnh là lựa chọn Language thực sự lưu theo người dùng, toàn bộ giao diện và nội dung xuất bản thuộc phạm vi chuyển EN/VI, tiếng Việt có dấu nhất quán, đồng thời giữ đúng hành vi của nền tảng học và thi TOEIC.
