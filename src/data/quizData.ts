import { QuizModule, QuizQuestion } from '../types';

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==========================================
  // TOPIC 0: LESSON 1 — DATA STRUCTURES & CRYPTOGRAPHY FOUNDATIONS
  // ==========================================
  {
    id: 'foundations-001',
    lessonId: 'lesson-1',
    category: 'python-list',
    topic: 'foundations',
    difficulty: 'easy',
    question: {
      en: 'What unique characteristic allows Python Lists to store numbers, strings, and booleans in a single collection?',
      vi: 'Đặc điểm nào cho phép Python List lưu trữ đồng thời số nguyên, chuỗi và giá trị logic trong cùng một danh sách?',
    },
    options: [
      { id: 'opt-a', en: 'Dynamic typing & heterogeneous elements support', vi: 'Hỗ trợ kiểu dữ liệu động và các phần tử đa hình' },
      { id: 'opt-b', en: 'Mandatory static memory allocation', vi: 'Cấp phát bộ nhớ tĩnh bắt buộc' },
      { id: 'opt-c', en: 'Cryptographic hash enforcement', vi: 'Cơ chế bắt buộc mã băm mật mã' },
      { id: 'opt-d', en: 'Binary tree pointer serialization', vi: 'Tuần tự hóa con trỏ cây nhị phân' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'In Python, Lists are dynamic arrays capable of holding references to heterogeneous data types (e.g. [10, 3.14, "Alice", True]) simultaneously.',
      vi: 'Trong Python, List là một mảng động cho phép lưu trữ tham chiếu tới nhiều kiểu dữ liệu khác nhau cùng một lúc (ví dụ: [10, 3.14, "Alice", True]).',
    },
  },
  {
    id: 'foundations-002',
    lessonId: 'lesson-1',
    category: 'linked-list',
    topic: 'foundations',
    difficulty: 'easy',
    question: {
      en: 'In a standard Linked List, what are the two core components of a single Node object?',
      vi: 'Trong một Danh Sách Liên Kết chuẩn, hai thành phần cốt lõi của một đối tượng Node là gì?',
    },
    options: [
      { id: 'opt-a', en: 'DATA (payload) and NEXT (pointer to next node)', vi: 'DATA (dữ liệu payload) và NEXT (con trỏ trỏ tới Node kế tiếp)' },
      { id: 'opt-b', en: 'KEY (public key) and SIGNATURE (digital signature)', vi: 'KEY (khóa công khai) và SIGNATURE (chữ ký số)' },
      { id: 'opt-c', en: 'INDEX (integer) and NONCE (proof of work)', vi: 'INDEX (số thứ tự) và NONCE (bằng chứng công việc)' },
      { id: 'opt-d', en: 'MERKLE_ROOT and TIMESTAMP', vi: 'MERKLE_ROOT và TIMESTAMP' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'A Node in a singly linked list is composed of a data field (DATA) and a reference pointer (NEXT) pointing to the subsequent node or None.',
      vi: 'Một Node trong danh sách liên kết đơn gồm 2 trường chính: DATA (lưu trữ thông tin) và NEXT (con trỏ tham chiếu đến nút kế tiếp hoặc None).',
    },
  },
  {
    id: 'foundations-003',
    lessonId: 'lesson-1',
    category: 'linked-list',
    topic: 'foundations',
    difficulty: 'easy',
    question: {
      en: 'What do the HEAD and TAIL pointers represent in a Linked List?',
      vi: 'Con trỏ HEAD và TAIL đại diện cho điều gì trong một Danh Sách Liên Kết?',
    },
    options: [
      { id: 'opt-a', en: 'HEAD points to the first Node; TAIL points to the last Node', vi: 'HEAD trỏ tới Node đầu tiên; TAIL trỏ tới Node cuối cùng' },
      { id: 'opt-b', en: 'HEAD is the longest chain; TAIL is the orphaned block', vi: 'HEAD là chuỗi dài nhất; TAIL là khối mồ côi' },
      { id: 'opt-c', en: 'HEAD points to the largest integer; TAIL points to the smallest', vi: 'HEAD trỏ tới số lớn nhất; TAIL trỏ tới số nhỏ nhất' },
      { id: 'opt-d', en: 'HEAD is the validator; TAIL is the miner', vi: 'HEAD là validator; TAIL là thợ đào miner' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'HEAD holds the reference to the entry/first node of the list, while TAIL points to the terminal/last node whose NEXT pointer is None.',
      vi: 'HEAD là con trỏ lưu địa chỉ của nút đầu tiên trong danh sách, còn TAIL trỏ đến nút cuối cùng (nơi có trường NEXT = None).',
    },
  },
  {
    id: 'foundations-004',
    lessonId: 'lesson-1',
    category: 'linked-list',
    topic: 'foundations',
    difficulty: 'medium',
    question: {
      en: 'When executing insert_at_beginning(data), what pointer assignment takes place first?',
      vi: 'Khi thực thi thao tác insert_at_beginning(data), phép gán con trỏ nào được thực hiện đầu tiên?',
    },
    options: [
      { id: 'opt-a', en: 'new_node.next = self.head, then self.head = new_node', vi: 'new_node.next = self.head, sau đó cập nhật self.head = new_node' },
      { id: 'opt-b', en: 'self.head = None, then new_node.next = self.tail', vi: 'self.head = None, sau đó new_node.next = self.tail' },
      { id: 'opt-c', en: 'self.tail.next = new_node, then self.head = new_node', vi: 'self.tail.next = new_node, sau đó self.head = new_node' },
      { id: 'opt-d', en: 'new_node.data = None, then self.head = new_node', vi: 'new_node.data = None, sau đó self.head = new_node' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'To insert at the beginning without losing the chain reference, new_node.next is set to the current head, then self.head is redirected to new_node.',
      vi: 'Để chèn vào đầu mà không làm mất liên kết với chuỗi hiện có, con trỏ next của nút mới được gán bằng head hiện tại, sau đó cập nhật head trỏ vào nút mới.',
    },
  },
  {
    id: 'foundations-005',
    lessonId: 'lesson-1',
    category: 'linked-list',
    topic: 'foundations',
    difficulty: 'medium',
    question: {
      en: 'In the Sushi preparation example: after insert_at_end("prepare"), insert_at_end("roll"), and insert_at_beginning("assemble"), what is the resulting sequence from HEAD to TAIL?',
      vi: 'Trong ví dụ chuẩn bị Sushi: sau khi chèn cuối "prepare", chèn cuối "roll", rồi chèn đầu "assemble", thứ tự chuỗi từ HEAD đến TAIL là gì?',
    },
    options: [
      { id: 'opt-a', en: 'HEAD -> assemble -> prepare -> roll -> None', vi: 'HEAD -> assemble -> prepare -> roll -> None' },
      { id: 'opt-b', en: 'HEAD -> prepare -> roll -> assemble -> None', vi: 'HEAD -> prepare -> roll -> assemble -> None' },
      { id: 'opt-c', en: 'HEAD -> roll -> prepare -> assemble -> None', vi: 'HEAD -> roll -> prepare -> assemble -> None' },
      { id: 'opt-d', en: 'HEAD -> prepare -> assemble -> roll -> None', vi: 'HEAD -> prepare -> assemble -> roll -> None' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: '"prepare" and "roll" were appended at the end. Then "assemble" was inserted at the beginning, making it the new HEAD of the sequence.',
      vi: '"prepare" và "roll" được chèn vào cuối. Sau đó "assemble" được chèn vào đầu (insert_at_beginning), đưa nó trở thành nút đầu tiên (HEAD) của chuỗi.',
    },
  },
  {
    id: 'foundations-006',
    lessonId: 'lesson-1',
    category: 'python-list',
    topic: 'foundations',
    difficulty: 'medium',
    question: {
      en: 'What is the key limitation of Python Lists and standard Linked Lists regarding data integrity in Blockchain?',
      vi: 'Hạn chế cốt lõi của Python List và Linked List thông thường đối với tính toàn vẹn dữ liệu trong Blockchain là gì?',
    },
    options: [
      { id: 'opt-a', en: 'Elements can be mutated freely in memory without triggering tamper detection or breaking downstream links', vi: 'Các phần tử có thể bị sửa đổi tùy ý trong RAM mà không để lại dấu vết giả mạo hay làm đứt gãy liên kết các phần tử sau' },
      { id: 'opt-b', en: 'Linked Lists cannot store string values', vi: 'Linked List không thể lưu trữ kiểu chuỗi ký tự' },
      { id: 'opt-c', en: 'Python Lists require Proof of Work to modify elements', vi: 'Python List bắt buộc phải chạy Proof of Work mới sửa được phần tử' },
      { id: 'opt-d', en: 'Linked Lists cannot be traversed in linear time', vi: 'Linked List không thể duyệt theo thời gian tuyến tính' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Traditional data structures in memory allow in-place modification. Changing data in one node does not alter memory addresses or alert subsequent nodes, lacking immutability.',
      vi: 'Cấu trúc dữ liệu trong bộ nhớ cho phép sửa đổi tùy ý. Sửa dữ liệu của một nút không làm thay đổi địa chỉ ô nhớ RAM của nút đó, do đó các nút phía sau không hề hay biết sự giả mạo.',
    },
  },
  {
    id: 'foundations-007',
    lessonId: 'lesson-1',
    category: 'hash-pointer',
    topic: 'foundations',
    difficulty: 'hard',
    question: {
      en: 'How does a Blockchain transform an ordinary Linked List into a tamper-evident cryptographic ledger?',
      vi: 'Blockchain biến đổi Danh Sách Liên Kết thông thường thành sổ cái mật mã chống giả mạo như thế nào?',
    },
    options: [
      { id: 'opt-a', en: 'By replacing volatile RAM memory pointers with Cryptographic Hash Pointers (SHA-256 digests of prior blocks)', vi: 'Bằng cách thay thế con trỏ địa chỉ RAM thông thường bằng Con Trỏ Băm Mật Mã (mã băm SHA-256 của toàn bộ khối trước)' },
      { id: 'opt-b', en: 'By sorting all node elements in alphabetical order', vi: 'Bằng cách sắp xếp tất cả các phần tử node theo thứ tự bảng chữ cái' },
      { id: 'opt-c', en: 'By storing the entire linked list in an SQL relational table', vi: 'Bằng cách lưu trữ toàn bộ linked list vào một bảng cơ sở dữ liệu quan hệ SQL' },
      { id: 'opt-d', en: 'By restricting the list to a maximum of 10 nodes', vi: 'Bằng cách giới hạn danh sách chỉ được chứa tối đa 10 node' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'A Blockchain replaces memory reference pointers with cryptographic Hash Pointers. Each block contains the SHA-256 hash of its predecessor, creating mathematical dependency.',
      vi: 'Blockchain thay thế con trỏ tham chiếu bộ nhớ bằng Con Trỏ Băm (Hash Pointer). Mỗi khối lưu trữ mã băm SHA-256 của khối liền trước, tạo ra sự ràng buộc toán học chặt chẽ.',
    },
  },
  {
    id: 'foundations-008',
    lessonId: 'lesson-1',
    category: 'blockchain-basics',
    topic: 'foundations',
    difficulty: 'hard',
    question: {
      en: 'What immediately happens if an attacker modifies the data inside Block #1 in a Hash Pointer blockchain?',
      vi: 'Điều gì xảy ra ngay lập tức nếu kẻ tấn công sửa đổi dữ liệu bên trong Khối #1 trong chuỗi con trỏ băm?',
    },
    options: [
      { id: 'opt-a', en: 'Block #1 SHA-256 hash changes, causing Block #2 Previous Hash to no longer match Block #1, breaking the chain', vi: 'Mã băm SHA-256 của Khối #1 lập tức thay đổi, khiến trường Previous Hash ở Khối #2 không còn khớp với Khối #1, làm đứt gãy toàn bộ chuỗi' },
      { id: 'opt-b', en: 'Block #2 automatically deletes itself from the hard drive', vi: 'Khối #2 tự động bị xóa khỏi ổ đĩa cứng' },
      { id: 'opt-c', en: 'The miner difficulty resets to zero', vi: 'Độ khó đào của thợ đào tự động đặt về 0' },
      { id: 'opt-d', en: 'Block #0 (Genesis Block) changes its index to 99', vi: 'Khối #0 (Genesis Block) tự đổi chỉ số index thành 99' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Because SHA-256 is deterministic and avalanche-sensitive, altering Block #1 data changes its hash. Block #2 still contains the old hash in its previousHash field, making the chain invalid.',
      vi: 'Vì hàm băm SHA-256 có tính xác định và hiệu ứng thác đổ, thay đổi dữ liệu Khối #1 sẽ làm đổi bản băm của nó. Khối #2 vẫn lưu bản băm cũ trong previousHash, làm chuỗi mất tính hợp lệ.',
    },
  },
  {
    id: 'foundations-009',
    lessonId: 'lesson-1',
    category: 'cryptography',
    topic: 'foundations',
    difficulty: 'medium',
    question: {
      en: 'What is the fundamental difference between a Symmetric Key and an Asymmetric Key Pair (Public/Private Key)?',
      vi: 'Sự khác biệt cốt lõi giữa Mật mã đối xứng (Symmetric) và Cặp khóa bất đối xứng (Public/Private Key) là gì?',
    },
    options: [
      { id: 'opt-a', en: 'Symmetric uses one shared key for both encryption and decryption; Asymmetric uses a Public Key to verify/encrypt and Private Key to sign/decrypt', vi: 'Mật mã đối xứng dùng chung 1 khóa để mã hóa và giải mã; Mật mã bất đối xứng dùng Khóa Công Khai để xác minh/mã hóa và Khóa Bí Mật để ký số/giải mã' },
      { id: 'opt-b', en: 'Symmetric keys are 256 bits, while asymmetric keys are only 8 bits', vi: 'Khóa đối xứng luôn là 256 bit, còn khóa bất đối xứng chỉ có 8 bit' },
      { id: 'opt-c', en: 'Asymmetric cryptography does not require mathematical functions', vi: 'Mật mã bất đối xứng không cần sử dụng hàm toán học' },
      { id: 'opt-d', en: 'Symmetric cryptography is only used in Python lists', vi: 'Mật mã đối xứng chỉ dùng trong danh sách Python' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Asymmetric cryptography solves key exchange: Public Key is shared openly for address creation and signature verification, while Private Key is kept secret to generate valid signatures.',
      vi: 'Mật mã bất đối xứng giải quyết bài toán trao đổi khóa: Khóa công khai được chia sẻ rộng rãi để nhận diện địa chỉ và xác minh chữ ký, trong khi Khóa bí mật được giữ kín để ký duyệt giao dịch.',
    },
  },
  {
    id: 'foundations-010',
    lessonId: 'lesson-1',
    category: 'sha256',
    topic: 'foundations',
    difficulty: 'easy',
    question: {
      en: 'Why is the Avalanche Effect critical for Blockchain ledger security?',
      vi: 'Tại sao Hiệu Ứng Thác Đổ lại quan trọng đối với bảo mật sổ cái Blockchain?',
    },
    options: [
      { id: 'opt-a', en: 'Even changing a single character or punctuation mark produces an entirely unrecognizable and distinct hash output', vi: 'Ngay cả khi chỉ thay đổi một ký tự hoặc dấu chấm, bản băm đầu ra sẽ thay đổi hoàn toàn và không thể dự đoán' },
      { id: 'opt-b', en: 'It speeds up Python memory allocation by 50%', vi: 'Nó tăng tốc độ cấp phát bộ nhớ Python lên 50%' },
      { id: 'opt-c', en: 'It compresses files down to zero bytes', vi: 'Nó nén dung lượng tệp về 0 byte' },
      { id: 'opt-d', en: 'It removes the need for Genesis Blocks', vi: 'Nó loại bỏ sự cần thiết của Khối Khởi Nguyên Genesis Block' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'The Strict Avalanche Criterion guarantees that flipping a single bit results in roughly ~50% output bit changes, preventing any subtle, stealthy tampering.',
      vi: 'Hiệu ứng thác đổ nghiêm ngặt đảm bảo rằng chỉ cần lật 1 bit đầu vào, khoảng 50% số bit đầu ra sẽ thay đổi ngẫu nhiên, ngăn chặn mọi hành vi gian lận dữ liệu tinh vi.',
    },
  },
  // ==========================================
  // TOPIC 1: SHA-256 & CRYPTOGRAPHIC HASH
  // ==========================================
  {
    id: 'sha256-001',
    topic: 'sha256',
    difficulty: 'easy',
    question: {
      en: 'What is the fixed output size of the SHA-256 cryptographic algorithm?',
      vi: 'Độ dài đầu ra cố định của thuật toán băm mật mã SHA-256 là bao nhiêu?',
    },
    options: [
      { id: 'opt-a', en: '128 bits (16 bytes)', vi: '128 bit (16 byte)' },
      { id: 'opt-b', en: '256 bits (32 bytes / 64 hex characters)', vi: '256 bit (32 byte / 64 ký tự thập lục phân hex)' },
      { id: 'opt-c', en: '512 bits (64 bytes)', vi: '512 bit (64 byte)' },
      { id: 'opt-d', en: 'Variable length depending on the input size', vi: 'Độ dài thay đổi tùy thuộc vào kích thước đầu vào' },
    ],
    correctOptionId: 'opt-b',
    explanation: {
      en: 'SHA-256 always produces a deterministic 256-bit (32-byte) digest, commonly displayed as 64 hexadecimal characters, regardless of input length.',
      vi: 'SHA-256 luôn tạo ra một bản băm xác định có độ dài đúng 256 bit (32 byte), thường được hiển thị dưới dạng chuỗi 64 ký tự thập lục phân (hex), bất kể thông điệp đầu vào dài bao nhiêu.',
    },
  },
  {
    id: 'sha256-002',
    topic: 'sha256',
    difficulty: 'medium',
    question: {
      en: 'Why does changing a single character in the input modify approximately 50% of output bits in SHA-256?',
      vi: 'Tại sao việc thay đổi chỉ 1 ký tự ở đầu vào lại làm thay đổi xấp xỉ 50% số bit đầu ra trong SHA-256?',
    },
    options: [
      { id: 'opt-a', en: 'Because SHA-256 encrypts the input with a private key', vi: 'Vì SHA-256 mã hóa đầu vào bằng một khóa bí mật' },
      { id: 'opt-b', en: 'Because of the Strict Avalanche Criterion (SAC) in 64 non-linear compression rounds', vi: 'Vì Tiêu chuẩn Thác đổ Nghiêm ngặt qua 64 vòng nén phi tuyến tính' },
      { id: 'opt-c', en: 'Because the input length increases with each character', vi: 'Vì độ dài thông điệp tăng lên theo từng ký tự' },
      { id: 'opt-d', en: 'Because SHA-256 randomly shuffles output bytes on each run', vi: 'Vì SHA-256 hoán vị ngẫu nhiên các byte đầu ra trong mỗi lần chạy' },
    ],
    correctOptionId: 'opt-b',
    explanation: {
      en: 'The Avalanche Effect (SAC) ensures that any single-bit input change cascades non-linearly across the 64 compression rounds, flipping roughly 50% of the 256 output bits.',
      vi: 'Hiệu ứng Thác đổ (Strict Avalanche Criterion - SAC) đảm bảo rằng bất kỳ sự thay đổi dù chỉ 1 bit ở đầu vào cũng sẽ lan truyền phi tuyến tính qua 64 vòng nén, làm đảo ngẫu nhiên xấp xỉ 50% trong tổng số 256 bit đầu ra.',
    },
  },
  {
    id: 'sha256-003',
    topic: 'sha256',
    difficulty: 'hard',
    question: {
      en: 'What mathematical property ensures that it is computationally infeasible to find ANY input x such that H(x) = y for a given hash y?',
      vi: 'Đặc tính toán học nào đảm bảo không thể tìm ngược lại đầu vào x sao cho H(x) = y khi đã biết trước giá trị băm y?',
    },
    options: [
      { id: 'opt-a', en: 'First Pre-image Resistance (One-Way property)', vi: 'Tính Kháng Tiền Ảnh Thứ Nhất (Tính chất Một Chiều / Pre-image Resistance)' },
      { id: 'opt-b', en: 'Second Pre-image Resistance (Weak Collision Resistance)', vi: 'Tính Kháng Tiền Ảnh Thứ Hai (Kháng Va Chạm Yếu / Second Pre-image Resistance)' },
      { id: 'opt-c', en: 'Symmetric Decryption property', vi: 'Đặc tính Giải mã Đối xứng' },
      { id: 'opt-d', en: 'Commutative Associativity property', vi: 'Đặc tính Giao hoán Kết hợp' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'First Pre-image Resistance makes it computationally impossible (requiring ~2^256 operations) to reverse a hash output back into its original preimage.',
      vi: 'Tính Kháng Tiền Ảnh Thứ Nhất (Pre-image Resistance) bảo đảm rằng khi cho trước một giá trị băm y, việc tìm ra bất kỳ thông điệp x nào để H(x) = y là bất khả thi về mặt tính toán (đòi hỏi trung bình 2^256 phép thử).',
    },
  },

  // ==========================================
  // TOPIC 2: TRANSACTION
  // ==========================================
  {
    id: 'tx-001',
    topic: 'transaction',
    difficulty: 'easy',
    question: {
      en: 'What fundamental elements comprise a standard blockchain transaction?',
      vi: 'Những thành phần cơ bản nào cấu thành một giao dịch blockchain tiêu chuẩn?',
    },
    options: [
      { id: 'opt-a', en: 'Sender address/public key, receiver address, transfer amount, timestamp, and digital signature', vi: 'Địa chỉ/khóa công khai người gửi, địa chỉ người nhận, số lượng chuyển, nhãn thời gian và chữ ký số' },
      { id: 'opt-b', en: 'Sender password, receiver email, credit card number, and banking routing number', vi: 'Mật khẩu người gửi, email người nhận, số thẻ tín dụng và mã định tuyến ngân hàng' },
      { id: 'opt-c', en: 'A single text string with no cryptographic signature', vi: 'Một chuỗi văn bản đơn thuần không có chữ ký mật mã' },
      { id: 'opt-d', en: 'Only the transaction hash and a timestamp', vi: 'Chỉ gồm mã băm giao dịch và nhãn thời gian' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'A blockchain transaction contains the sender identity (public key/address), recipient address, transferred value, timestamp, and cryptographic proof of authorization (ECDSA signature).',
      vi: 'Một giao dịch blockchain bao gồm danh tính người gửi (khóa công khai/địa chỉ), địa chỉ người nhận, giá trị chuyển giao, nhãn thời gian và bằng chứng xác thực ủy quyền mật mã (chữ ký số ECDSA).',
    },
  },
  {
    id: 'tx-002',
    topic: 'transaction',
    difficulty: 'medium',
    question: {
      en: 'How does a blockchain transaction ID (TxID) get derived?',
      vi: 'Mã định danh giao dịch (TxID) trong blockchain được tạo ra như thế nào?',
    },
    options: [
      { id: 'opt-a', en: 'By hashing the serialized canonical binary data of the transaction with SHA-256', vi: 'Bằng cách băm dữ liệu nhị phân chuẩn hóa của giao dịch thông qua thuật toán SHA-256' },
      { id: 'opt-b', en: 'By an auto-incrementing integer assigned by a central database server', vi: 'Bằng một số nguyên tự tăng được cấp phát từ máy chủ cơ sở dữ liệu trung tâm' },
      { id: 'opt-c', en: 'By combining the sender’s phone number with the receiver’s name', vi: 'Bằng cách ghép số điện thoại người gửi với tên người nhận' },
      { id: 'opt-d', en: 'By generating a random 4-digit PIN code', vi: 'Bằng cách sinh mã PIN 4 chữ số ngẫu nhiên' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'The TxID is the cryptographic hash (e.g., double SHA-256 in Bitcoin) of the serialized transaction fields, uniquely identifying it across the network.',
      vi: 'TxID là bản băm mật mã (ví dụ SHA-256 kép trong Bitcoin) của toàn bộ dữ liệu giao dịch đã được chuẩn hóa, tạo thành mã định danh duy nhất trên toàn mạng lưới.',
    },
  },
  {
    id: 'tx-003',
    topic: 'transaction',
    difficulty: 'hard',
    question: {
      en: 'What immediately happens if an attacker modifies the transferred amount from 5.0 ETH to 500.0 ETH on an unmined transaction?',
      vi: 'Điều gì sẽ xảy ra ngay lập tức nếu kẻ tấn công sửa số tiền chuyển từ 5.0 ETH thành 500.0 ETH trên một giao dịch chưa được đào?',
    },
    options: [
      { id: 'opt-a', en: 'The transaction is executed successfully because the network does not verify signatures', vi: 'Giao dịch vẫn được thực thi thành công vì mạng không kiểm tra lại chữ ký' },
      { id: 'opt-b', en: 'The cryptographic signature verification fails instantly against the sender’s public key, causing nodes to reject it', vi: 'Việc xác thực chữ ký mật mã sẽ thất bại ngay lập tức khi đối chiếu với khóa công khai người gửi, khiến các node từ chối giao dịch' },
      { id: 'opt-c', en: 'The sender’s wallet automatically tops up the missing funds', vi: 'Ví của người gửi sẽ tự động nạp thêm số tiền còn thiếu' },
      { id: 'opt-d', en: 'The receiver gets 5.0 ETH while the remaining 495.0 ETH is burned', vi: 'Người nhận chỉ nhận 5.0 ETH và 495.0 ETH còn lại sẽ bị tiêu hủy' },
    ],
    correctOptionId: 'opt-b',
    explanation: {
      en: 'Because the original digital signature was computed over the hash of the 5.0 ETH message, modifying the amount to 500.0 ETH changes the message hash and invalidates the ECDSA signature.',
      vi: 'Vì chữ ký số ban đầu được tạo trên bản băm của thông điệp chứa 5.0 ETH, việc sửa thành 500.0 ETH làm đổi bản băm thông điệp và khiến phép xác minh chữ ký ECDSA thất bại hoàn toàn.',
    },
  },

  // ==========================================
  // TOPIC 3: DIGITAL SIGNATURE
  // ==========================================
  {
    id: 'sig-001',
    topic: 'signature',
    difficulty: 'easy',
    question: {
      en: 'Which key is used to SIGN a transaction, and which key is used by network nodes to VERIFY it?',
      vi: 'Khóa nào được dùng để KÝ giao dịch, và khóa nào được các node dùng để XÁC THỰC chữ ký đó?',
    },
    options: [
      { id: 'opt-a', en: 'Sign with Private Key; Verify with Public Key', vi: 'Ký bằng Khóa Bí Mật (Private Key); Xác thực bằng Khóa Công Khai (Public Key)' },
      { id: 'opt-b', en: 'Sign with Public Key; Verify with Private Key', vi: 'Ký bằng Khóa Công Khai (Public Key); Xác thực bằng Khóa Bí Mật (Private Key)' },
      { id: 'opt-c', en: 'Sign with Password; Verify with Email', vi: 'Ký bằng Mật khẩu; Xác thực bằng Email' },
      { id: 'opt-d', en: 'Sign with Symmetric Secret Key; Verify with the same Secret Key', vi: 'Ký bằng Khóa Đối Xứng; Xác thực bằng chính Khóa Đối Xứng đó' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Asymmetric cryptography dictates that only the owner possessing the Private Key can produce a valid signature, while anyone on the network can verify it using the Public Key.',
      vi: 'Mật mã bất đối xứng quy định: chỉ người nắm giữ Khóa Bí Mật mới tạo được chữ ký hợp lệ, trong khi bất kỳ ai trong mạng đều có thể kiểm tra chữ ký đó bằng Khóa Công Khai.',
    },
  },
  {
    id: 'sig-002',
    topic: 'signature',
    difficulty: 'medium',
    question: {
      en: 'Which elliptic curve standard is prominently used in Bitcoin and Ethereum for digital signatures?',
      vi: 'Chuẩn đường cong elip (Elliptic Curve) nào được sử dụng phổ biến trong Bitcoin và Ethereum để tạo chữ ký số?',
    },
    options: [
      { id: 'opt-a', en: 'SECP256K1 (y² = x³ + 7 over GF(p))', vi: 'SECP256K1 (phương trình y² = x³ + 7 trên trường GF(p))' },
      { id: 'opt-b', en: 'RSA-4096', vi: 'RSA-4096' },
      { id: 'opt-c', en: 'Curve25519 exclusively for symmetry', vi: 'Curve25519 chuyên dùng cho mã hóa đối xứng' },
      { id: 'opt-d', en: 'DES-56', vi: 'DES-56' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Bitcoin and Ethereum both utilize the Koblitz curve SECP256K1 for ECDSA digital signatures, offering 128-bit security level with efficient 256-bit keys.',
      vi: 'Cả Bitcoin và Ethereum đều sử dụng đường cong Koblitz chuẩn SECP256K1 cho chữ ký số ECDSA, cung cấp độ an toàn 128-bit với độ dài khóa gọn gàng 256-bit.',
    },
  },
  {
    id: 'sig-003',
    topic: 'signature',
    difficulty: 'hard',
    question: {
      en: 'Why is it mathematically impossible to deduce the Private Key from an observed ECDSA signature (r, s) and Public Key?',
      vi: 'Vì sao về mặt toán học không thể suy ngược ra Khóa Bí Mật từ cặp chữ ký ECDSA (r, s) và Khóa Công Khai đã công bố?',
    },
    options: [
      { id: 'opt-a', en: 'Because of the Elliptic Curve Discrete Logarithm Problem (ECDLP)', vi: 'Do Bài toán Logarit Rời Rạc trên Đường cong Elip (ECDLP) là nan giải' },
      { id: 'opt-b', en: 'Because the blockchain deletes the signature after verification', vi: 'Vì blockchain sẽ xóa chữ ký ngay sau khi xác thực xong' },
      { id: 'opt-c', en: 'Because private keys are encrypted with SHA-256', vi: 'Vì khóa bí mật đã được mã hóa bằng SHA-256' },
      { id: 'opt-d', en: 'Because ECDSA signatures do not use numbers', vi: 'Vì chữ ký ECDSA không sử dụng các con số' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'ECDSA security relies on the hardness of the Elliptic Curve Discrete Logarithm Problem (ECDLP): given point P and Q = k·P, computing k is computationally infeasible for 256-bit curve groups.',
      vi: 'Độ an toàn của ECDSA dựa trên độ khó của Bài toán Logarit Rời rạc trên Đường cong Elip (ECDLP): biết điểm P và điểm Q = k·P, việc tìm lại số nguyên k là bất khả thi về mặt tính toán đối với nhóm đường cong 256-bit.',
    },
  },

  // ==========================================
  // TOPIC 4: MEMPOOL
  // ==========================================
  {
    id: 'mempool-001',
    topic: 'mempool',
    difficulty: 'easy',
    question: {
      en: 'What is the role of the Bể Giao Dịch Chờ in a blockchain node?',
      vi: 'Vai trò của Bể Giao Dịch Chờ trong một node blockchain là gì?',
    },
    options: [
      { id: 'opt-a', en: 'A waiting staging area for verified but unconfirmed transactions awaiting inclusion in a block', vi: 'Vùng đệm lưu trữ tạm thời các giao dịch đã được xác thực nhưng chưa được đóng gói vào block' },
      { id: 'opt-b', en: 'A permanent archival storage for historical blocks', vi: 'Kho lưu trữ vĩnh viễn các khối dữ liệu lịch sử' },
      { id: 'opt-c', en: 'A database of user passwords and account credentials', vi: 'Cơ sở dữ liệu lưu mật khẩu và thông tin tài khoản người dùng' },
      { id: 'opt-d', en: 'A hardware cache inside the CPU', vi: 'Bộ nhớ đệm phần cứng bên trong chip xử lý CPU' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'The Mempool is an in-memory holding queue on each node where valid broadcasted transactions wait until miners or validators select them into candidate blocks.',
      vi: 'Mempool là hàng đợi bộ nhớ tạm trên mỗi node, nơi các giao dịch hợp lệ sau khi được phát sóng sẽ chờ cho đến khi thợ đào hoặc validator chọn để đóng gói vào khối mới.',
    },
  },
  {
    id: 'mempool-002',
    topic: 'mempool',
    difficulty: 'medium',
    question: {
      en: 'How do miners and validators typically prioritize which transactions to include first from the Mempool?',
      vi: 'Các thợ đào và validator thường ưu tiên chọn những giao dịch nào trong Mempool trước?',
    },
    options: [
      { id: 'opt-a', en: 'Transactions offering the highest fee rate (gas price per byte / satoshi per vByte)', vi: 'Các giao dịch trả mức phí cao nhất (gas price trên mỗi byte / satoshi trên vByte)' },
      { id: 'opt-b', en: 'Transactions with the shortest recipient names', vi: 'Các giao dịch có tên người nhận ngắn nhất' },
      { id: 'opt-c', en: 'Transactions submitted in alphabetical order', vi: 'Các giao dịch được sắp xếp theo thứ tự bảng chữ cái' },
      { id: 'opt-d', en: 'Transactions with the oldest sender accounts', vi: 'Các giao dịch của những tài khoản người gửi lâu đời nhất' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Miners maximize their revenue by ordering transactions based on fee density (fee per unit of block space/gas) rather than arrival time.',
      vi: 'Thợ đào tối đa hóa lợi nhuận kinh tế bằng cách ưu tiên các giao dịch có mật độ phí cao nhất (phí trên mỗi đơn vị dung lượng khối/gas) thay vì thứ tự gửi.',
    },
  },
  {
    id: 'mempool-003',
    topic: 'mempool',
    difficulty: 'hard',
    question: {
      en: 'What happens if a node receives two conflicting transactions spending the exact same UTXO / account nonce?',
      vi: 'Điều gì xảy ra nếu một node nhận được hai giao dịch xung đột cùng tiêu một UTXO hoặc cùng số nonce tài khoản?',
    },
    options: [
      { id: 'opt-a', en: 'The node enforces double-spend protection: only the first valid transaction is kept, or replaced only under explicit rules like Replace-By-Fee (RBF)', vi: 'Node thực thi cơ chế chống chi tiêu kép (Double-Spend): chỉ giữ giao dịch hợp lệ đến trước, hoặc thay thế nếu áp dụng quy tắc Replace-By-Fee (RBF)' },
      { id: 'opt-b', en: 'Both transactions are executed and the user’s balance is doubled', vi: 'Cả hai giao dịch đều được thực hiện và số dư của người dùng được nhân đôi' },
      { id: 'opt-c', en: 'The entire blockchain network halts immediately', vi: 'Toàn bộ mạng blockchain sẽ dừng hoạt động ngay lập tức' },
      { id: 'opt-d', en: 'The node automatically splits the funds 50/50 between both recipients', vi: 'Node sẽ tự động chia đôi số tiền 50/50 cho cả hai người nhận' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Nodes reject conflicting double-spend transactions. Under Replace-By-Fee (RBF), a newer transaction can replace a pending one only if it pays a substantially higher fee.',
      vi: 'Các node sẽ từ chối giao dịch chi tiêu kép. Với cơ chế Replace-By-Fee (RBF), giao dịch mới chỉ được phép thay thế giao dịch cũ đang chờ nếu nó trả mức phí cao hơn đáng kể.',
    },
  },

  // ==========================================
  // TOPIC 5: MERKLE TREE
  // ==========================================
  {
    id: 'merkle-001',
    topic: 'merkle-tree',
    difficulty: 'easy',
    question: {
      en: 'What is the primary purpose of a Merkle Tree in a blockchain block?',
      vi: 'Mục đích chính của Cây Merkle trong một khối blockchain là gì?',
    },
    options: [
      { id: 'opt-a', en: 'To summarize all block transactions into a single 32-byte cryptographic root (Merkle Root) and enable efficient verification', vi: 'Tóm tắt toàn bộ giao dịch trong khối thành một gốc Merkle 32-byte duy nhất và cho phép xác minh giao dịch hiệu quả' },
      { id: 'opt-b', en: 'To compress images and videos inside the block', vi: 'Để nén hình ảnh và video lưu trữ trong khối' },
      { id: 'opt-c', en: 'To generate private keys for smart contracts', vi: 'Để tạo khóa bí mật cho các hợp đồng thông minh' },
      { id: 'opt-d', en: 'To encrypt user transaction amounts', vi: 'Để mã hóa số tiền trong các giao dịch của người dùng' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'A Merkle Tree builds a cryptographic binary tree of transaction hashes, providing a single Merkle Root in the block header that commits to all included transactions.',
      vi: 'Cây Merkle xây dựng cấu trúc cây nhị phân mật mã từ các bản băm giao dịch, tạo ra một giá trị Merkle Root duy nhất trong tiêu đề khối nhằm chứng thực toàn bộ các giao dịch.',
    },
  },
  {
    id: 'merkle-002',
    topic: 'merkle-tree',
    difficulty: 'medium',
    question: {
      en: 'What is the computational complexity of verifying if a transaction exists in a block containing N transactions using a Merkle Proof?',
      vi: 'Độ phức tạp tính toán để xác minh một giao dịch có nằm trong khối chứa N giao dịch thông qua Bằng chứng Merkle là bao nhiêu?',
    },
    options: [
      { id: 'opt-a', en: 'O(log₂ N) — logarithmic complexity', vi: 'O(log₂ N) — độ phức tạp logarit' },
      { id: 'opt-b', en: 'O(N) — linear complexity', vi: 'O(N) — độ phức tạp tuyến tính' },
      { id: 'opt-c', en: 'O(N²) — quadratic complexity', vi: 'O(N²) — độ phức tạp bậc hai' },
      { id: 'opt-d', en: 'O(2^N) — exponential complexity', vi: 'O(2^N) — độ phức tạp hàm mũ' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'A Merkle proof only requires the sibling hashes along the branch from the leaf to the root, which requires only log₂(N) hash operations (e.g. only 10 hashes for 1,024 transactions).',
      vi: 'Bằng chứng Merkle chỉ cần tập hợp các hash anh em (siblings) trên nhánh từ lá lên gốc, do đó chỉ mất log₂(N) phép băm (ví dụ chỉ cần 10 phép băm để xác minh 1 trong 1.024 giao dịch).',
    },
  },
  {
    id: 'merkle-003',
    topic: 'merkle-tree',
    difficulty: 'hard',
    question: {
      en: 'If an odd number of transactions exist at a level in a binary Merkle tree, how is the unpaired leaf handled standardly?',
      vi: 'Nếu số lượng giao dịch ở một tầng trong cây Merkle nhị phân là số lẻ, node lẻ cuối cùng sẽ được xử lý chuẩn mực như thế nào?',
    },
    options: [
      { id: 'opt-a', en: 'The unpaired hash is duplicated and hashed with itself to form the parent pair', vi: 'Bản băm lẻ sẽ được nhân bản (duplicate) và tự băm với chính nó để tạo thành cặp node cha' },
      { id: 'opt-b', en: 'The tree is discarded and rebuilt with empty dummy transactions', vi: 'Cây Merkle bị hủy và phải tạo lại từ đầu với các giao dịch giả rỗng' },
      { id: 'opt-c', en: 'The unpaired hash is concatenated with 0x00000000', vi: 'Bản băm lẻ được ghép thêm chuỗi 0x00000000' },
      { id: 'opt-d', en: 'The unpaired transaction is dropped from the block', vi: 'Giao dịch lẻ sẽ bị loại bỏ khỏi khối' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'In Bitcoin and standard binary Merkle trees, an odd node at any level is duplicated so it pairs with itself: Parent = Hash(OddHash || OddHash).',
      vi: 'Trong chuẩn Bitcoin và cây Merkle nhị phân, node lẻ tại bất kỳ tầng nào sẽ được nhân đôi để ghép đôi với chính nó: Parent = Hash(OddHash || OddHash).',
    },
  },

  // ==========================================
  // TOPIC 6: BLOCKCHAIN & BLOCK STRUCTURE
  // ==========================================
  {
    id: 'chain-001',
    topic: 'blockchain',
    difficulty: 'easy',
    question: {
      en: 'What cryptographic field links each block securely to the preceding block in a blockchain?',
      vi: 'Trường thông tin mật mã nào liên kết chặt chẽ mỗi khối với khối liền trước trong blockchain?',
    },
    options: [
      { id: 'opt-a', en: 'Previous Hash (prevHash pointer)', vi: 'Mã băm khối trước (Previous Hash / con trỏ prevHash)' },
      { id: 'opt-b', en: 'Server IP Address', vi: 'Địa chỉ IP máy chủ' },
      { id: 'opt-c', en: 'Master Password', vi: 'Mật khẩu Quản trị Master' },
      { id: 'opt-d', en: 'Database Primary Key ID', vi: 'Khóa chính ID trong cơ sở dữ liệu' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'The previousHash pointer in the block header embeds the cryptographic hash of the previous block, creating an immutable cryptographic chain.',
      vi: 'Trường previousHash trong tiêu đề khối chứa bản băm mật mã của khối trước đó, tạo thành chuỗi liên kết mật mã không thể chối cãi.',
    },
  },
  {
    id: 'chain-002',
    topic: 'blockchain',
    difficulty: 'medium',
    question: {
      en: 'Why is the Genesis Block (Block #0) unique in a blockchain?',
      vi: 'Tại sao Khối Khởi Nguyên (Genesis Block / Block #0) lại có tính chất đặc biệt nhất trong blockchain?',
    },
    options: [
      { id: 'opt-a', en: 'It is hardcoded as the root of trust with its previousHash set to all zeros (000...000)', vi: 'Khối được lập trình cứng làm gốc tin cậy ban đầu với giá trị previousHash gồm toàn số 0 (000...000)' },
      { id: 'opt-b', en: 'It contains no data and is discarded after 1 year', vi: 'Khối không chứa dữ liệu gì và sẽ tự bị xóa sau 1 năm' },
      { id: 'opt-c', en: 'It has an infinite number of transactions', vi: 'Khối chứa vô số lượng giao dịch' },
      { id: 'opt-d', en: 'It is the only block that requires no consensus', vi: 'Là khối duy nhất không cần tuân theo bất kỳ cơ chế đồng thuận nào' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'The Genesis Block is the foundational first block of the chain with no parent block, so its previousHash pointer is populated with all zeros.',
      vi: 'Khối Genesis là khối đầu tiên của toàn bộ mạng lưới, không có khối cha, do đó con trỏ previousHash của nó được gán bằng chuỗi toàn số 0.',
    },
  },
  {
    id: 'chain-003',
    topic: 'blockchain',
    difficulty: 'hard',
    question: {
      en: 'If an adversary secretly modifies a transaction in Block #3 of an 8-block chain, what happens to the subsequent blocks?',
      vi: 'Nếu kẻ tấn công lén lút sửa một giao dịch trong Khối #3 của chuỗi gồm 8 khối, điều gì sẽ xảy ra với các khối tiếp theo?',
    },
    options: [
      { id: 'opt-a', en: 'Block #3 hash changes, causing mismatch with Block #4 prevHash, instantly breaking cryptographic validity for Block #4 through #8', vi: 'Bản băm của Khối #3 bị đổi, làm sai lệch trường prevHash của Khối #4, phá vỡ tính hợp lệ mật mã của toàn bộ các Khối từ #4 đến #8' },
      { id: 'opt-b', en: 'The blockchain automatically self-corrects without anyone noticing', vi: 'Chuỗi blockchain sẽ tự động sửa đổi mà không ai phát hiện được' },
      { id: 'opt-c', en: 'Only Block #3 becomes invalid while Blocks #4 to #8 remain completely valid', vi: 'Chỉ riêng Khối #3 bị hỏng còn Khối #4 đến #8 vẫn hoàn toàn hợp lệ' },
      { id: 'opt-d', en: 'The whole network balance is frozen permanently', vi: 'Toàn bộ số dư của mạng lưới sẽ bị đóng băng vĩnh viễn' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Tampering changes Block #3 hash due to the Avalanche effect. Because Block #4 still holds the original prevHash pointer, the link breaks, invalidating all subsequent blocks unless the attacker recomputes work for all downstream blocks.',
      vi: 'Gian lận làm thay đổi hash của Khối #3 do hiệu ứng thác đổ. Vì Khối #4 vẫn giữ prevHash cũ, chuỗi liên kết bị đứt gãy và làm vô hiệu toàn bộ các khối phía sau.',
    },
  },

  // ==========================================
  // TOPIC 7: PROOF OF WORK (PoW)
  // ==========================================
  {
    id: 'pow-001',
    topic: 'proof-of-work',
    difficulty: 'easy',
    question: {
      en: 'What mathematical condition must a block hash satisfy in Proof of Work mining?',
      vi: 'Mã băm của khối phải thỏa mãn điều kiện toán học nào trong quá trình khai thác Proof of Work?',
    },
    options: [
      { id: 'opt-a', en: 'The computed hash must be strictly less than or equal to a target value (starting with a required number of leading zeros)', vi: 'Bản băm tính toán được phải nhỏ hơn hoặc bằng giá trị mục tiêu Target (bắt đầu bằng một số lượng số 0 nhất định)' },
      { id: 'opt-b', en: 'The computed hash must be an odd number', vi: 'Bản băm tính ra phải là một số lẻ' },
      { id: 'opt-c', en: 'The hash must equal the miner’s public key', vi: 'Bản băm phải trùng khớp với khóa công khai của thợ đào' },
      { id: 'opt-d', en: 'The hash must contain all 26 English letters', vi: 'Bản băm phải chứa đầy đủ 26 chữ cái tiếng Anh' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'In PoW, miners iterate a 32-bit `nonce` field until Hash(Block Header) <= Target Difficulty, resulting in a hash with required leading zeros.',
      vi: 'Trong PoW, thợ đào liên tục thay đổi giá trị `nonce` 32-bit cho đến khi Hash(Tiêu đề khối) <= Mục tiêu Độ khó (Target), tạo ra bản băm có số lượng số 0 ở đầu theo yêu cầu.',
    },
  },
  {
    id: 'pow-002',
    topic: 'proof-of-work',
    difficulty: 'medium',
    question: {
      en: 'Why is verifying a mined Proof of Work block nearly instantaneous even though finding it required trillions of computations?',
      vi: 'Tại sao việc xác thực một khối PoW chỉ mất chưa tới 1 mili giây trong khi việc tìm ra nó tốn hàng nghìn tỷ phép tính?',
    },
    options: [
      { id: 'opt-a', en: 'Asymmetry of PoW: finding the nonce is brute-force trial-and-error, but checking the hash with the discovered nonce requires only a single SHA-256 computation', vi: 'Tính bất đối xứng của PoW: tìm nonce đòi hỏi thử sai hàng tỷ lần, nhưng kiểm tra lại chỉ cần đúng 1 lần băm SHA-256 với nonce đã cho' },
      { id: 'opt-b', en: 'Because miners send the answer via email to validators', vi: 'Vì thợ đào gửi kết quả qua email cho validator' },
      { id: 'opt-c', en: 'Because the node uses quantum shortcuts', vi: 'Vì node sử dụng lối tắt máy tính lượng tử' },
      { id: 'opt-d', en: 'Because verifying blocks bypasses cryptographic rules', vi: 'Vì việc xác thực khối được phép bỏ qua các quy tắc mật mã' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'PoW is computationally asymmetric: difficult to solve (proof), but trivially easy to verify with a single evaluation: Hash(Header + Nonce) < Target.',
      vi: 'PoW có tính bất đối xứng tính toán: cực kỳ tốn công sức để tìm lời giải, nhưng bất kỳ node nào cũng có thể kiểm chứng ngay tức thì bằng 1 phép tính băm duy nhất.',
    },
  },
  {
    id: 'pow-003',
    topic: 'proof-of-work',
    difficulty: 'hard',
    question: {
      en: 'What security threshold must an attacker control in Proof of Work to execute a reorganization / double-spend attack with majority certainty?',
      vi: 'Kẻ tấn công cần kiểm soát ngưỡng sức mạnh tính toán nào trong PoW để thực hiện cuộc tấn công viết lại lịch sử / chi tiêu kép với xác suất thành công áp đảo?',
    },
    options: [
      { id: 'opt-a', en: 'More than 50% of the entire network hashrate (the 51% Attack)', vi: 'Hơn 50% tổng tốc độ băm của toàn mạng lưới (Cuộc tấn công 51%)' },
      { id: 'opt-b', en: 'At least 10% of network nodes', vi: 'Ít nhất 10% số lượng node trong mạng' },
      { id: 'opt-c', en: 'Only 1 ASIC mining machine', vi: 'Chỉ cần 1 máy đào ASIC chuyên dụng' },
      { id: 'opt-d', en: '100% of all software wallets', vi: '100% tất cả các ví phần mềm của người dùng' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Controlling over 50% of computational hashrate allows an attacker to outpace the honest chain, enabling block reorganizations and double-spending.',
      vi: 'Nắm giữ hơn 50% tổng tốc độ băm cho phép kẻ tấn công tạo chuỗi bí mật dài nhanh hơn chuỗi trung thực, từ đó đảo ngược các giao dịch đã xác nhận (chi tiêu kép).',
    },
  },

  // ==========================================
  // TOPIC 8: PROOF OF STAKE (PoS)
  // ==========================================
  {
    id: 'pos-001',
    topic: 'proof-of-stake',
    difficulty: 'easy',
    question: {
      en: 'In Proof of Stake, how are block proposers (validators) selected rather than using energy-intensive mining?',
      vi: 'Trong Proof of Stake, người đề xuất khối (validator) được chọn dựa trên yếu tố nào thay vì đào coin tiêu tốn điện năng?',
    },
    options: [
      { id: 'opt-a', en: 'Pseudo-randomly with probability proportional to the amount of cryptocurrency locked as stake', vi: 'Ngẫu nhiên có trọng số tỷ lệ thuận với lượng tiền mã hóa được thế chấp (Staking)' },
      { id: 'opt-b', en: 'Based on the fastest internet connection speed', vi: 'Dựa vào tốc độ đường truyền internet nhanh nhất' },
      { id: 'opt-c', en: 'In strict alphabetical order of user real names', vi: 'Theo đúng thứ tự bảng chữ cái họ tên người dùng' },
      { id: 'opt-d', en: 'By whoever clicks the propose button first', vi: 'Bất kỳ ai bấm nút đề xuất nhanh nhất' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'PoS replaces hardware hashing power with economic capital: validators lock coins into a staking contract, and the protocol selects proposers proportional to their stake.',
      vi: 'PoS thay thế sức mạnh phần cứng bằng vốn kinh tế: các validator ký quỹ tiền (stake) vào mạng lưới và giao thức sẽ chọn người đề xuất khối với xác suất tỷ lệ với lượng tiền ký quỹ.',
    },
  },
  {
    id: 'pos-002',
    topic: 'proof-of-stake',
    difficulty: 'medium',
    question: {
      en: 'What is the "Slashing" penalty mechanism in Proof of Stake?',
      vi: 'Cơ chế xử phạt "Slashing" (cắt cổ phần) trong Proof of Stake là gì?',
    },
    options: [
      { id: 'opt-a', en: 'A cryptographic penalty where a validator’s staked funds are permanently destroyed/burned if they act maliciously (e.g. double signing or proposing invalid blocks)', vi: 'Hình phạt kinh tế tự động trừ hoặc thiêu hủy một phần/toàn bộ số tiền đã stake của validator nếu phát hiện hành vi gian lận (như ký 2 khối cùng lượt hoặc đề xuất khối sai)' },
      { id: 'opt-b', en: 'Turning off the validator’s computer monitor', vi: 'Tắt màn hình máy tính của validator' },
      { id: 'opt-c', en: 'Increasing the validator’s transaction fees by 10%', vi: 'Tăng 10% phí giao dịch của validator đó' },
      { id: 'opt-d', en: 'Sending a warning email to the validator', vi: 'Gửi một bức thư cảnh cáo qua email' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Slashing provides economic security ("nothing-at-stake" solution) by destroying staked coins if a validator signs conflicting blocks or violates protocol consensus rules.',
      vi: 'Slashing mang lại động lực bảo mật kinh tế (giải quyết bài toán nothing-at-stake) bằng cách tịch thu số tiền ký quỹ nếu validator có hành vi phá hoại hoặc ký gian lận.',
    },
  },
  {
    id: 'pos-003',
    topic: 'proof-of-stake',
    difficulty: 'hard',
    question: {
      en: 'In Byzantine Fault Tolerant (BFT) Proof of Stake, what voting threshold of active stake is required to finalize a block safely?',
      vi: 'Trong mô hình PoS chịu lỗi Byzantine (BFT), tỷ lệ bỏ phiếu xác nhận tối thiểu của tổng lượng stake trực tuyến để chốt hạ (finalize) một khối là bao nhiêu?',
    },
    options: [
      { id: 'opt-a', en: 'At least 2/3 (supermajority >= 66.67% of total active stake attestations)', vi: 'Tối thiểu 2/3 (đa số tuyệt đối >= 66.67% tổng lượng stake xác thực trực tuyến)' },
      { id: 'opt-b', en: 'Exactly 50.01% of online computers', vi: 'Đúng 50.01% số máy tính đang mở mạng' },
      { id: 'opt-c', en: '100% unanimous approval with zero offline validators', vi: '100% tất cả các node phải đồng thuận tuyệt đối' },
      { id: 'opt-d', en: 'Only 33.33% of total stake', vi: 'Chỉ cần 33.33% tổng lượng stake' },
    ],
    correctOptionId: 'opt-a',
    explanation: {
      en: 'Classical BFT consensus guarantees safety against up to 1/3 Byzantine actors as long as more than 2/3 of validator stake attests and reaches supermajority consensus.',
      vi: 'Đồng thuận BFT kinh điển chứng minh rằng hệ thống duy trì tính an toàn trước tối đa 1/3 kẻ phá hoại miễn là đạt được sự đồng thuận của hơn 2/3 tổng lượng stake đang hoạt động.',
    },
  },
];

// ==========================================
// PRE-CONFIGURED MODULAR QUIZ SUITES (v1.0)
// ==========================================

export const QUIZ_MODULES: QuizModule[] = [
  {
    quizId: 'foundations-v1',
    version: '1.0',
    title: {
      en: 'Data Structures to Blockchain Foundations v1.0',
      vi: 'Chuyên Đề Cấu Trúc Dữ Liệu & Nền Tảng Blockchain v1.0',
    },
    description: {
      en: 'Foundational assessment on Python dynamic lists, Linked Lists, Node reference pointers, and Hash Pointer integrity.',
      vi: 'Bài đánh giá nền tảng về Python List động, Danh Sách Liên Kết, con trỏ tham chiếu Node và tính toàn vẹn Con Trỏ Băm.',
    },
    topic: 'foundations',
    difficulty: 'all',
    passingScore: 70,
    createdAt: '2026-08-22',
    questions: ALL_QUIZ_QUESTIONS.filter((q) => q.topic === 'foundations'),
  },
  {
    quizId: 'comprehensive-v1',
    version: '1.0',
    title: {
      en: 'Blockchain Knowledge Certification Quiz v1.0',
      vi: 'Bài Kiểm Tra Tổng Hợp Kiến Thức Blockchain v1.0',
    },
    description: {
      en: 'Comprehensive 20-question assessment covering SHA-256, Transactions, Signatures, Mempool, Merkle Trees, Blockchain, PoW, and PoS.',
      vi: 'Bài đánh giá toàn diện gồm 20 câu hỏi bao quát SHA-256, Giao Dịch, Chữ Ký Số, Mempool, Cây Merkle, Cấu Trúc Khối, PoW và PoS.',
    },
    topic: 'comprehensive',
    difficulty: 'all',
    passingScore: 75,
    createdAt: '2026-08-21',
    questions: ALL_QUIZ_QUESTIONS.slice(0, 20), // 20 structured questions
  },
  {
    quizId: 'sha256-hash-v1',
    version: '1.0',
    title: {
      en: 'SHA-256 & Cryptographic Hash Primitives v1.0',
      vi: 'Chuyên Đề SHA-256 & Hàm Băm Mật Mã v1.0',
    },
    description: {
      en: 'Focused quiz on NIST FIPS 180-4 standard, Avalanche effect, pre-image resistance, and compression pipeline.',
      vi: 'Bài kiểm tra chuyên sâu về tiêu chuẩn NIST FIPS 180-4, hiệu ứng thác đổ, tính kháng tiền ảnh và quy trình nén 64 vòng.',
    },
    topic: 'sha256',
    difficulty: 'all',
    passingScore: 70,
    createdAt: '2026-08-21',
    questions: ALL_QUIZ_QUESTIONS.filter((q) => q.topic === 'sha256'),
  },
  {
    quizId: 'tx-signature-v1',
    version: '1.0',
    title: {
      en: 'Transactions & ECDSA Digital Signatures v1.0',
      vi: 'Chuyên Đề Giao Dịch & Chữ Ký Số ECDSA v1.0',
    },
    description: {
      en: 'Test your knowledge on public-private key cryptography, SECP256K1 elliptic curves, and tamper detection.',
      vi: 'Kiểm tra hiểu biết về mật mã khóa công khai, đường cong elip SECP256K1 và cơ chế phát hiện giả mạo giao dịch.',
    },
    topic: 'transaction',
    difficulty: 'all',
    passingScore: 70,
    createdAt: '2026-08-21',
    questions: ALL_QUIZ_QUESTIONS.filter(
      (q) => q.topic === 'transaction' || q.topic === 'signature'
    ),
  },
  {
    quizId: 'merkle-mempool-v1',
    version: '1.0',
    title: {
      en: 'Merkle Trees & Mempool Architecture v1.0',
      vi: 'Chuyên Đề Cây Merkle & Kiến Trúc Mempool v1.0',
    },
    description: {
      en: 'Assess your grasp of binary hash trees, logarithmic Merkle proofs, and unconfirmed transaction prioritization.',
      vi: 'Đánh giá năng lực về cấu trúc cây băm nhị phân, bằng chứng Merkle logarit và cơ chế sắp xếp ưu tiên hàng đợi Mempool.',
    },
    topic: 'merkle-tree',
    difficulty: 'all',
    passingScore: 70,
    createdAt: '2026-08-21',
    questions: ALL_QUIZ_QUESTIONS.filter(
      (q) => q.topic === 'merkle-tree' || q.topic === 'mempool'
    ),
  },
  {
    quizId: 'consensus-blockchain-v1',
    version: '1.0',
    title: {
      en: 'Consensus Mechanisms & Blockchain Immutability v1.0',
      vi: 'Chuyên Đề Cơ Chế Đồng Thuận & Tính Bất Biến Khối v1.0',
    },
    description: {
      en: 'In-depth evaluation of PreviousHash linking, Proof of Work mining dynamics, and Proof of Stake validation with slashing.',
      vi: 'Đánh giá toàn diện về liên kết chuỗi PreviousHash, động lực học đào Proof of Work và cơ chế validator Proof of Stake với Slashing.',
    },
    topic: 'blockchain',
    difficulty: 'all',
    passingScore: 70,
    createdAt: '2026-08-21',
    questions: ALL_QUIZ_QUESTIONS.filter(
      (q) =>
        q.topic === 'blockchain' ||
        q.topic === 'proof-of-work' ||
        q.topic === 'proof-of-stake'
    ),
  },
];
