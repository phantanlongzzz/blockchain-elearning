# Hướng Dẫn Chuẩn Hóa Nội Dung, Thuật Ngữ & Mật Độ Thông Tin
# (Content, Terminology & Information Density Guidelines)

> **Tài liệu này là "Source of Truth" về UI copy, thuật ngữ tiếng Việt và cấu trúc thông tin cho toàn bộ 19 bài học và mô phỏng của dự án Blockchain Learning.** Mọi AI agent hoặc kỹ sư khi bổ sung hoặc chỉnh sửa giao diện đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

### 1.1. Một thông tin — Một nơi hiển thị chính
- **Không lặp lại:** Không hiển thị cùng một thông tin ở nhiều widget khác nhau để "cho đầy giao diện".
- **Phân định trách nhiệm rõ ràng giữa các thành phần:**
  - **Scenario Card:** Người học đang chọn tình huống nào?
  - **Pipeline / Stepper:** Tiến trình mô phỏng đang chạy đến bước nào?
  - **Transaction Details:** Thông số kỹ thuật chi tiết của giao dịch là gì?
  - **P2P Network:** Gói tin đang được lan truyền đến những nút nào?
  - **Node Verification Checklist:** Vì sao nút chấp nhận hoặc từ chối giao dịch?
  - **Mempool:** Giao dịch đã vào hàng đợi chờ thợ đào hay bị loại bỏ?

### 1.2. Tính giáo dục thay vì trang trí (Education > Decoration)
- UI của dự án là công cụ học tập tương tác mô phỏng kiến trúc hệ thống phân tán và mật mã học.
- Tránh xa các yếu tố quảng cáo, khẩu hiệu tiếp thị (marketing fluff) và ngôn từ sáo rỗng thường thấy ở giao diện do AI tạo ra hàng loạt.

---

## 2. Ngôn Ngữ & Thuật Ngữ (Language & Terminology)

### 2.1. Ngôn ngữ giao diện
- **Tiếng Việt chuẩn xác:** Giao diện mặc định sử dụng tiếng Việt tự nhiên, gãy gọn, đúng ngữ pháp.
- **Không pha trộn Anh - Việt tùy tiện:**
  - ❌ **Sai:** `Văn bản gốc (Original Text)`, `Chống phát lại (Replay Protection)`, `Verify Transaction`
  - ✅ **Đúng:** `Văn bản gốc`, `Chống phát lại`, `Xác thực giao dịch`

### 2.2. Thuật ngữ kỹ thuật được giữ nguyên
Các thuật ngữ kỹ thuật quốc tế chuẩn không cần dịch ép:
- **Mật mã & Cấu trúc:** `SHA-256`, `ECDSA`, `SECP256k1`, `Nonce`, `Mempool`, `P2P`, `Gossip Protocol`, `UTXO`, `PoW`, `PoS`, `Hash`, `Block`, `Full Node`, `Miner`, `Wallet`.

### 2.3. Bảng Từ Điển Thuật Ngữ Chuẩn (Official Glossary)

| Thuật ngữ gốc | Bản dịch tiếng Việt chuẩn | Từ ngữ CẤM DÙNG (Không nhất quán) |
|---|---|---|
| **Transaction** | Giao dịch | Trao đổi, lệnh chuyển |
| **Amount** | Số tiền | Giá trị chuyển, lượng |
| **Balance** | Số dư | Tiền còn lại, quỹ |
| **Available Balance**| Số dư khả dụng | Tiền có thể dùng |
| **Replay Transaction**| Phát lại giao dịch | Gửi lại lệnh, lặp giao dịch |
| **Public Key** | Khóa công khai | Mã công khai |
| **Private Key** | Khóa riêng (hoặc Khóa bí mật) | Khóa cá nhân, mã bảo mật |
| **Signature** | Chữ ký (hoặc Chữ ký số) | Mã ký, dấu ký |
| **Validation / Verify**| Xác thực / Kiểm định | Check, phê duyệt, soi xét |
| **Integrity** | Tính toàn vẹn | Độ nguyên bản, tính vẹn toàn |
| **Tamper / Alter** | Sửa đổi dữ liệu | Can thiệp trái phép, phá hoại |
| **Broadcast** | Truyền phát (hoặc Lan truyền) | Phát sóng, bắn dữ liệu |
| **Payload** | Dữ liệu giao dịch | Gói tin thô, nội dung gửi |
| **Digest / Hash** | Giá trị băm (hoặc Mã băm) | Chuỗi hash, mã hóa băm |
| **Restore / Revert** | Khôi phục gốc / Đặt lại | Reset, quay xe |
| **Rejected** | Bị từ chối | Thất bại, hỏng |
| **Accepted / Valid** | Hợp lệ / Chấp nhận | Thành công, duyệt |

---

## 3. Quy Tắc Viết Scenario Card

Scenario Card giúp người học nhanh chóng lựa chọn ngữ cảnh thử nghiệm. Cần tuân thủ cấu trúc 3 phần tối giản:
1. **Icon đại diện**
2. **Tiên đề ngắn (Title)**
3. **Một câu mô tả cực ngắn (Short description)**

### Tiêu chuẩn nội dung cho bài Transaction Validation:
- **Giao dịch hợp lệ:** Đủ số dư và chữ ký hợp lệ
- **Sửa dữ liệu sau khi ký:** Dữ liệu thay đổi sau khi ký
- **Vượt số dư:** Số tiền vượt số dư khả dụng
- **Phát lại giao dịch:** Nonce đã được sử dụng

### ❌ KHÔNG LÀM:
- Không gắn thêm badge trạng thái trùng lặp với tiêu đề (ví dụ: Title là "Giao dịch hợp lệ" lại gắn thêm badge "Hợp lệ").
- Không viết thành đoạn văn dài dòng giải thích thuật toán bên trong card.

---

## 4. Quy Tắc Trạng Thái (Status Rules)

- **Tối đa 2 tín hiệu thị giác (visual cues):**
  - Đã dùng viền nổi bật (Border accent) + Màu nền (Background tint) thì **không** thêm icon nhấp nháy, text in hoa toàn bộ, viền kép và badge phụ.
  - Khuyến nghị: **Màu sắc + Nhãn ngắn gọn** (hoặc Icon + Nhãn).

### Các trạng thái chuẩn:
- **Đang xử lý:** `Đang tạo...`, `Đang ký số...`, `Đang truyền phát...`, `Đang kiểm định...`
- **Thành công:** `Hợp lệ` hoặc `Đã chấp nhận` (Màu xanh lục - Emerald/Green)
- **Từ chối / Lỗi:** `Bị từ chối` hoặc `Không hợp lệ` (Màu đỏ/hồng - Rose)
- **Chờ:** `Sẵn sàng` (Màu xám/slate)

---

## 5. Quy Tắc Thông Báo Lỗi (Error Message Rules)

Thông báo lỗi phải trả lời trực tiếp câu hỏi: **"Điều gì sai?"** mà không dùng thuật ngữ mơ hồ hoặc câu mắng người dùng.

### Các mẫu lỗi chuẩn:
- **Lỗi chữ ký:** `Chữ ký không hợp lệ: Dữ liệu bị thay đổi sau khi ký`
- **Lỗi số dư:** `Số tiền vượt số dư khả dụng`
- **Lỗi Nonce:** `Nonce đã được sử dụng`
- **Lỗi toàn vẹn tệp/văn bản:** `Mã băm không khớp — Dữ liệu đã bị thay đổi`

### ❌ KHÔNG LÀM:
- ❌ `Giao dịch thất bại do kiểm tra mật mã elliptic curve secp256k1 trả về false ở điểm R.`
- ❌ `Lỗi không xác định vui lòng thử lại sau.`

---

## 6. Quy Tắc Tiêu Đề & Cấu Trúc (Headings & Hierarchy)

### 6.1. Heading chuẩn
- **Tiêu đề:** Tên chức năng / nghiệp vụ chính, danh từ hoặc cụm danh từ trực tiếp.
  - Ví dụ: `Tiến trình xác thực`, `Kịch bản kiểm thử`, `Mạng P2P & Lan truyền`, `Hàng đợi Mempool`.
- **Mô tả phụ (Optional):** Chỉ thêm 1 câu ngắn nếu nghiệp vụ cần chỉ dẫn thao tác.
  - Ví dụ: `Chọn kịch bản để mô phỏng`

### 6.2. Loại bỏ hoàn toàn "AI Marketing Copy"
Nghiêm cấm xuất hiện các từ ngữ sau trên UI:
- ❌ `LIVE METRICS`
- ❌ `REAL-TIME VALIDATION ENGINE`
- ❌ `BLOCKCHAIN POWERED EXPERIENCE`
- ❌ `NEXT-GEN CRYPTOGRAPHIC PIPELINE`
- ❌ `ADVANCED VERIFICATION MATRIX`
- ❌ `SUPERCHARGED CONSENSUS`

---

## 7. Phân Tầng Thông Tin 3 Lớp (3-Tier Information Hierarchy)

1. **Lớp 1 (Nhận diện tức thì - Immediate):**
   - Người học nắm được trạng thái chính trong <1 giây: Giao dịch Hợp lệ hay Bị từ chối? Đang ở bước nào?
2. **Lớp 2 (Hiểu nguyên nhân - Understanding):**
   - 6 tiêu chí kiểm định (Định dạng, Khóa công khai, Chữ ký, Số dư, Nonce, Dữ liệu).
   - Nút nào trong mạng đã nhận gói tin.
3. **Lớp 3 (Đào sâu kỹ thuật - Deep Dive):**
   - Nằm trong modal chi tiết hoặc tab mở rộng: Chuỗi byte, tọa độ đường cong elliptic (r, s), cấu trúc gói tin thô.

---

## 8. Bảng Đối Chiếu Ví Dụ (GOOD vs. BAD Examples)

| Thành phần | ❌ BAD (Cần tránh) | ✅ GOOD (Chuẩn mực) |
|---|---|---|
| **Scenario Card** | Thẻ có Title: "Tình huống 1", Badge: "Valid", Description: "Đây là tình huống thực hiện giao dịch thông thường mà trong đó người gửi Alice có đầy đủ số dư khả dụng và tạo chữ ký số ECDSA chuẩn xác..." | Title: `Giao dịch hợp lệ`<br>Description: `Đủ số dư và chữ ký hợp lệ`<br>(Không badge thừa) |
| **Progress Line** | `Trạng thái hiện tại: Đang trong bước 4 của quy trình 5 bước kiểm tra chuyên sâu` | `Bước 4/5: Kiểm định nút` hoặc `5/5 — Hoàn tất` |
| **Status Badge** | `[✓ STATUS: COMPLETED VERIFIED OK]` viền phát sáng nhấp nháy 3 lớp | `✓ Hợp lệ` (Font mono, màu xanh lục tinh tế) |
| **Heading** | `LIVE TRANSACTION PIPELINE MATRIX // v2.4` kèm subtitle dài 3 dòng | `Tiến trình xác thực`<br>`0/5 Bước` |
| **File Check** | `Mã băm kỳ vọng để đối chiếu (Expected Checksum)` | `Mã băm kỳ vọng` |
| **Error Alert** | `Execution Exception: Nonce check failed for account 0x4f.` | `Nonce đã được sử dụng` |

---

*Ghi chú: Áp dụng thống nhất cho toàn bộ các mô-đun bài học của dự án Blockchain Learning.*
