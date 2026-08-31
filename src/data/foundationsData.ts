import {
  PythonListItem,
  LinkedListNodeItem,
  HashPointerBlockItem,
  CryptoConceptItem,
  LessonMeta,
} from '../types';

// Scalable Lesson Metadata Architecture
export const LESSONS_REGISTRY: LessonMeta[] = [
  {
    id: 'lesson-1',
    lessonNumber: 1,
    slug: 'foundations-and-cryptography',
    title: {
      vi: 'BUỔI 1 — CƠ SỞ DỮ LIỆU & MẬT MÃ HỌC TRONG BLOCKCHAIN',
      en: 'LESSON 1 — DATA STRUCTURES & CRYPTOGRAPHY IN BLOCKCHAIN',
    },
    subtitle: {
      vi: 'Từ Python List & Danh Sách Liên Kết đến Con Trỏ Băm và Hàm Băm Mật Mã',
      en: 'From Python Lists & Linked Lists to Hash Pointers and Cryptographic Hashing',
    },
    badge: {
      vi: 'BUỔI 1 · NỀN TẢNG HỌC PHẦN',
      en: 'LESSON 1 · ACADEMIC FOUNDATIONS',
    },
    levelBadge: {
      vi: 'Level 1 · Cơ Bản',
      en: 'Level 1 · Beginner',
    },
    sections: [
      {
        id: 'python-list',
        title: { vi: '1. Python List & Hạn Chế', en: '1. Python List & Limits' },
        icon: 'Code2',
      },
      {
        id: 'linked-list',
        title: { vi: '2. Danh Sách Liên Kết', en: '2. Linked List' },
        icon: 'ListTree',
      },
      {
        id: 'transition-compare',
        title: { vi: '3. Linked List → Blockchain', en: '3. Linked List → Blockchain' },
        icon: 'GitCompare',
      },
      {
        id: 'tamper-lab',
        title: { vi: '4. Vì Sao Linked List Không Phải Blockchain', en: '4. Why Linked List ≠ Blockchain' },
        icon: 'ShieldAlert',
      },
      {
        id: 'fundamental-crypto',
        title: { vi: '5. Mật Mã Nền Tảng', en: '5. Fundamental Cryptography' },
        icon: 'KeyRound',
      },
      {
        id: 'theory-to-practice',
        title: { vi: '6. Từ Lý Thuyết Đến Thực Hành', en: '6. Theory to Practice' },
        icon: 'Workflow',
      },
    ],
    quizModuleId: 'quiz-lesson-1',
    isAvailable: true,
  },
  {
    id: 'lesson-2',
    lessonNumber: 2,
    slug: 'merkle-trees-and-transactions',
    title: {
      vi: 'BUỔI 2 — CẤU TRÚC KHỐI, CÂY MERKLE & GIAO DỊCH',
      en: 'LESSON 2 — BLOCK STRUCTURE, MERKLE TREES & TRANSACTIONS',
    },
    subtitle: {
      vi: 'Đóng gói giao dịch, kiểm chứng SPV và tính toán Merkle Root',
      en: 'Transaction packaging, SPV proof validation, and Merkle Root calculation',
    },
    badge: {
      vi: 'BUỔI 2 · SẮP RA MẮT',
      en: 'LESSON 2 · UPCOMING',
    },
    levelBadge: {
      vi: 'Level 2 · Trung Cấp',
      en: 'Level 2 · Intermediate',
    },
    sections: [],
    quizModuleId: 'quiz-lesson-2',
    isAvailable: false,
  },
  {
    id: 'lesson-3',
    lessonNumber: 3,
    slug: 'consensus-mechanisms',
    title: {
      vi: 'BUỔI 3 — CƠ CHẾ ĐỒNG THUẬN: PROOF OF WORK & PROOF OF STAKE',
      en: 'LESSON 3 — CONSENSUS MECHANISMS: PROOF OF WORK & PROOF OF STAKE',
    },
    subtitle: {
      vi: 'Đào khối, Nonce, Target Difficulty, Đặt cọc Validator và Chống Tấn Công 51%',
      en: 'Mining, Nonce, Target Difficulty, Validator Staking, and 51% Attack Defense',
    },
    badge: {
      vi: 'BUỔI 3 · SẮP RA MẮT',
      en: 'LESSON 3 · UPCOMING',
    },
    levelBadge: {
      vi: 'Level 3 · Nâng Cao',
      en: 'Level 3 · Advanced',
    },
    sections: [],
    quizModuleId: 'quiz-lesson-3',
    isAvailable: false,
  },
];

// 1. Python List Initial Data (Sushi curriculum example + heterogeneous types)
export const INITIAL_PYTHON_LIST_ITEMS: PythonListItem[] = [
  { id: 'item-1', value: 'prepare', type: 'str' },
  { id: 'item-2', value: 'roll', type: 'str' },
  { id: 'item-3', value: 'assemble', type: 'str' },
];

export const INITIAL_HETEROGENEOUS_LIST_ITEMS: PythonListItem[] = [
  { id: 'item-h1', value: 10, type: 'int' },
  { id: 'item-h2', value: 3.14, type: 'float' },
  { id: 'item-h3', value: 'Alice', type: 'str' },
  { id: 'item-h4', value: true, type: 'bool' },
];

// 2. Linked List Initial Data (Sushi curriculum example: assemble -> prepare -> roll -> NULL)
export const INITIAL_LINKED_LIST_NODES: LinkedListNodeItem[] = [
  { id: 'node-1', data: 'assemble', nextId: 'node-2' },
  { id: 'node-2', data: 'prepare', nextId: 'node-3' },
  { id: 'node-3', data: 'roll', nextId: null },
];

export const PYTHON_NODE_CLASS_CODE = `# 1. Định nghĩa Nút (Node) trong Python
class Node:
    def __init__(self, data):
        self.data = data    # Chứa dữ liệu (chuỗi, số, object...)
        self.next = None    # Con trỏ tham chiếu đến Node kế tiếp trong RAM

# 2. Định nghĩa Danh Sách Liên Kết (LinkedList)
class LinkedList:
    def __init__(self):
        self.head = None    # Con trỏ quản lý Nút đầu tiên (HEAD)
        self.tail = None    # Con trỏ quản lý Nút cuối cùng (TAIL)

    # Thêm vào đầu danh sách (O(1))
    def insert_at_beginning(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
        if self.tail is None:
            self.tail = new_node

    # Thêm vào cuối danh sách (O(1) khi có TAIL)
    def insert_at_end(self, data):
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
            return
        self.tail.next = new_node
        self.tail = new_node

    # Tìm kiếm phần tử tuần tự (O(N))
    def search(self, target):
        current = self.head
        position = 0
        while current is not None:
            if current.data == target:
                return position  # Tìm thấy tại vị trí index
            current = current.next
            position += 1
        return -1  # Không tìm thấy trong danh sách`;

// 3. Comparison Matrix: Linked List vs. Blockchain
export const COMPARISON_ITEMS = [
  {
    feature: {
      vi: 'Đơn vị lưu trữ cơ bản',
      en: 'Basic Storage Unit',
    },
    linkedList: {
      vi: 'Node (Nút)',
      en: 'Node Object',
      desc: {
        vi: 'Thực thể độc lập nằm rời rạc trong bộ nhớ RAM',
        en: 'Independent heap-allocated object in RAM',
      },
    },
    blockchain: {
      vi: 'Block (Khối)',
      en: 'Block Container',
      desc: {
        vi: 'Khối dữ liệu chứa Block Header & tập hợp giao dịch',
        en: 'Container encapsulating Block Header & Transaction Set',
      },
    },
  },
  {
    feature: {
      vi: 'Dữ liệu chứa trong phần tử',
      en: 'Payload Content',
    },
    linkedList: {
      vi: 'DATA (Biến tùy ý)',
      en: 'DATA Field',
      desc: {
        vi: 'Bất kỳ giá trị số, chuỗi, hoặc object đơn giản',
        en: 'Any arbitrary primitive, string, or object',
      },
    },
    blockchain: {
      vi: 'Giao dịch + Merkle Root + Timestamp + Nonce',
      en: 'Transactions + Merkle Root + Timestamp + Nonce',
      desc: {
        vi: 'Tập hợp các giao dịch đã ký số, gốc cây Merkle và siêu dữ liệu',
        en: 'Digitally signed transaction batch, Merkle Root, and metadata',
      },
    },
  },
  {
    feature: {
      vi: 'Cơ chế liên kết mắt xích',
      en: 'Linking Mechanism',
    },
    linkedList: {
      vi: 'Con trỏ NEXT (Địa chỉ ô nhớ RAM)',
      en: 'NEXT Pointer (Memory Address)',
      desc: {
        vi: 'Địa chỉ tham chiếu ô nhớ (0x7ffd...) không có giá trị bảo mật',
        en: 'Volatile RAM address pointer (e.g. 0x7ffd...), mutable and unsecured',
      },
    },
    blockchain: {
      vi: 'Con Trỏ Băm (Cryptographic Hash Pointer)',
      en: 'Cryptographic Hash Pointer (PrevHash)',
      desc: {
        vi: 'Mã băm SHA-256 256-bit xác thực toàn bộ nội dung khối đứng trước',
        en: '256-bit SHA-256 hash mathematically binding all prior block content',
      },
    },
  },
  {
    feature: {
      vi: 'Phần tử khởi đầu',
      en: 'Starting Root Anchor',
    },
    linkedList: {
      vi: 'Con trỏ HEAD',
      en: 'HEAD Pointer',
      desc: {
        vi: 'Biến trỏ đến nút đầu tiên trong bộ nhớ',
        en: 'Pointer variable referencing the first allocated node',
      },
    },
    blockchain: {
      vi: 'Genesis Block (Khối #0 Khởi Nguyên)',
      en: 'Genesis Block (Block #0)',
      desc: {
        vi: 'Khối gốc cứng (Previous Hash = 000...000) được định nghĩa trước',
        en: 'Root hardcoded block with Previous Hash = 000...000',
      },
    },
  },
  {
    feature: {
      vi: 'Tính bất biến & Kháng giả mạo',
      en: 'Immutability & Tamper Detection',
    },
    linkedList: {
      vi: 'Có thể chỉnh sửa tự do trong RAM',
      en: 'Freely Mutable in Memory',
      desc: {
        vi: 'Sửa data của Node 1 không làm hỏng các liên kết Node kế tiếp',
        en: 'Modifying Node 1 payload does not invalidate downstream nodes',
      },
    },
    blockchain: {
      vi: 'Bất biến & Phát hiện giả mạo lan truyền tức thì',
      en: 'Immutable & Cascading Tamper Detection',
      desc: {
        vi: 'Sửa 1 byte ở Khối #1 làm gãy liên kết băm tới tất cả khối sau',
        en: 'Tampering 1 byte in Block #1 breaks the hash pointer to Block #2+',
      },
    },
  },
];

// 4. Initial Hash Pointer Blocks for Tamper Lab
export const INITIAL_HASH_POINTER_BLOCKS: HashPointerBlockItem[] = [
  {
    index: 0,
    data: 'Genesis Block · DLU Blockchain Academy',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: '0000a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
  },
  {
    index: 1,
    data: 'Alice chuyen 10 DLU COIN cho Bob',
    previousHash: '',
    hash: '',
  },
  {
    index: 2,
    data: 'Bob chuyen 5 DLU COIN cho Charlie',
    previousHash: '',
    hash: '',
  },
];

// 5. 8 Fundamental Cryptography Concepts
export const FUNDAMENTAL_CRYPTO_CONCEPTS: CryptoConceptItem[] = [
  {
    id: 'hash-function',
    name: {
      vi: '1. Hàm Băm Mật Mã (Cryptographic Hash Function)',
      en: '1. Cryptographic Hash Function',
    },
    shortDef: {
      vi: 'Thuật toán toán học biến đổi dữ liệu đầu vào có kích thước bất kỳ thành một chuỗi bản băm có độ dài cố định. Cùng một đầu vào luôn tạo ra cùng một mã băm duy nhất (tính xác định), và chỉ 1 thay đổi nhỏ nhất sẽ làm đổi hoàn toàn kết quả.',
      en: 'A mathematical algorithm mapping arbitrary-length input data to a fixed-size cryptographic digest. The exact same input always produces the exact same hash (deterministic), and a tiny input change produces a completely different hash.',
    },
    example: {
      vi: 'Đầu vào "Hello" hoặc cuốn sách 1,000 trang đều được chuyển đổi thành chuỗi 256 bits (64 ký tự hex) duy nhất.',
      en: 'Inputting "Hello" or an entire 1,000-page book both produce a precise 256-bit (64 hex characters) digest.',
    },
    whyBlockchain: {
      vi: 'Blockchain sử dụng hàm băm để tạo mã định danh duy nhất (ID) cho khối, bảo vệ tính toàn vẹn dữ liệu (Integrity) và phát hiện ngay lập tức mọi hành vi sửa đổi.',
      en: 'Blockchain uses hashes to create unique block IDs, protect data integrity, and immediately flag any tampering attempt.',
    },
    badge: 'Core Primitive',
    ctaLabLabel: {
      vi: 'Mở Phòng Thí Nghiệm SHA-256',
      en: 'Open SHA-256 Lab',
    },
    ctaLabHref: '#hash-generator',
    iconName: 'Binary',
  },
  {
    id: 'sha-256',
    name: {
      vi: '2. Thuật Toán SHA-256 (Secure Hash Algorithm 256-bit)',
      en: '2. SHA-256 Algorithm',
    },
    shortDef: {
      vi: 'Thuật toán băm mật mã học tiêu chuẩn được ứng dụng xuyên suốt hệ thống và giao thức Bitcoin. Nhận dữ liệu đầu vào bất kỳ, chạy qua 64 vòng lặp nén phi tuyến tính và xuất ra đúng 256 bit (tương đương 64 ký tự Hexadecimal).',
      en: 'The standard cryptographic hashing algorithm demonstrated throughout the website and Bitcoin. It processes arbitrary input data through 64 non-linear compression rounds to produce a 256-bit hash (64 hexadecimal characters).',
    },
    example: {
      vi: 'Luồng xử lý: Dữ liệu đầu vào → SHA-256 (64 Vòng lặp) → 256 bit nhị phân → 64 ký tự Hex (0-9, a-f).',
      en: 'Process Flow: Input Data → SHA-256 (64 Compression Rounds) → 256-bit Binary → 64 Hex Characters (0-9, a-f).',
    },
    whyBlockchain: {
      vi: 'Đóng vai trò là động cơ băm cốt lõi trong cơ chế Proof of Work (đào khối), liên kết con trỏ băm Previous Hash và tính toán Merkle Root.',
      en: 'Acts as the core hashing engine in Proof of Work mining, Previous Hash block linkage, and Merkle Root computation.',
    },
    badge: 'NIST FIPS 180-4',
    ctaLabLabel: {
      vi: 'MỞ PHÒNG THÍ NGHIỆM SHA-256',
      en: 'OPEN SHA-256 LAB',
    },
    ctaLabHref: '#hash-generator',
    iconName: 'Cpu',
  },
  {
    id: 'one-way-property',
    name: {
      vi: '3. Tính Một Chiều / Kháng Tiền Ảnh (One-Way Property)',
      en: '3. One-Way Property (Pre-image Resistance)',
    },
    shortDef: {
      vi: 'Cực kỳ dễ dàng và nhanh chóng để tính toán: Dữ liệu (Data) → Bản băm (Hash). Nhưng bất khả thi về mặt tính toán để đảo ngược: Bản băm (Hash) → Dữ liệu gốc (Original Data).',
      en: 'It is trivially easy to calculate Data → Hash, but computationally infeasible to reverse Hash → Original Data.',
    },
    example: {
      vi: 'Tương tự như máy xay sinh tố: Rất dễ nghiền hoa quả thành ly sinh tố mịn màng, nhưng bất khả thi để tái tạo lại quả ban đầu từ ly sinh tố.',
      en: 'Like a blender or coffee grinder: extremely easy to blend fruit into a smoothie, but impossible to reconstruct the original fruit from the smoothie.',
    },
    whyBlockchain: {
      vi: 'Đảm bảo người ngoài không thể đảo ngược mã băm để khôi phục dữ liệu nhạy cảm hoặc tạo khối giả mạo mà không nắm dữ liệu gốc.',
      en: 'Guarantees adversaries cannot reverse-engineer hashes to expose private data or fabricate valid blocks without original data.',
    },
    badge: 'Pre-image Resistance',
    ctaLabLabel: {
      vi: 'Xem 4 Tính Chất Mật Mã',
      en: 'View 4 Security Properties',
    },
    ctaLabHref: '#properties',
    iconName: 'ArrowRightCircle',
  },
  {
    id: 'avalanche-effect',
    name: {
      vi: '4. Hiệu Ứng Thác Đổ',
      en: '4. Avalanche Effect (Strict Diffusion)',
    },
    shortDef: {
      vi: 'Chỉ cần một thay đổi nhỏ nhất ở đầu vào (dù chỉ là đổi 1 chữ hoa sang thường hay 1 bit), bản băm SHA-256 đầu ra sẽ biến đổi đột ngột và thay đổi khoảng 50% số bit ngẫu nhiên.',
      en: 'A tiny change in the input (such as flipping a single bit or changing uppercase to lowercase) produces a dramatically and completely different SHA-256 output digest.',
    },
    example: {
      vi: 'Đầu vào A: "Hello" → 185f8db32271fe25...\nĐầu vào B: "hello" → 2cf24dba5fb0a30e... (Khác biệt 100% về mặt thị giác!)',
      en: 'Input A: "Hello" → 185f8db32271fe25...\nInput B: "hello" → 2cf24dba5fb0a30e... (100% visually distinct digests!)',
    },
    whyBlockchain: {
      vi: 'Giúp mạng lưới Blockchain phát hiện ngay tức thì bất kỳ hành vi thay đổi dù chỉ 1 ký tự trong lịch sử giao dịch của khối.',
      en: 'Enables Blockchain to instantly detect even a 1-character unauthorized alteration in historical transaction blocks.',
    },
    badge: 'Diffusion & Confusion',
    ctaLabLabel: {
      vi: 'Mở Mô Phỏng Thác Đổ',
      en: 'Open Avalanche Lab',
    },
    ctaLabHref: '#avalanche',
    iconName: 'Sparkles',
  },
  {
    id: 'collision-resistance',
    name: {
      vi: '5. Tính Kháng Va Chạm',
      en: '5. Collision Resistance',
    },
    shortDef: {
      vi: 'Về mặt toán học lý thuyết, va chạm vẫn tồn tại (nguyên lý Dirichlet/chuồng bồ câu vì số đầu vào vô hạn nhưng không gian băm là 2^256). Tuy nhiên, việc tìm ra 2 đầu vào thực tế x ≠ y sao cho Hash(x) = Hash(y) là bất khả thi về mặt tính toán với mọi phương pháp hiện nay.',
      en: 'Mathematically, collisions exist by the Pigeonhole Principle (infinite inputs map to 2^256 hashes). However, finding a practical collision where distinct inputs x ≠ y produce Hash(x) = Hash(y) is computationally infeasible with known modern methods.',
    },
    example: {
      vi: 'Không gian 2^256 khả năng băm (~1.15 × 10^77) xấp xỉ số lượng nguyên tử trong toàn bộ vũ trụ quan sát được (10^80).',
      en: 'The 2^256 keyspace (~1.15 × 10^77) is comparable to the estimated total atomic count of the observable universe (10^80).',
    },
    whyBlockchain: {
      vi: 'Đảm bảo mỗi khối, mỗi giao dịch và mỗi cây Merkle sở hữu một dấu vân tay kỹ thuật số độc nhất, không thể bị tráo đổi.',
      en: 'Guarantees that every block, transaction, and Merkle tree has an absolutely unique cryptographic fingerprint.',
    },
    badge: 'Computational Bound',
    ctaLabLabel: {
      vi: 'Thực Nghiệm Kháng Va Chạm',
      en: 'Inspect Collision Resistance',
    },
    ctaLabHref: '#properties',
    iconName: 'ShieldCheck',
  },
  {
    id: 'digital-signature',
    name: {
      vi: '6. Chữ Ký Số',
      en: '6. Digital Signature',
    },
    shortDef: {
      vi: 'Cơ chế chứng minh hai điều then chốt: (1) Ai là người đã ủy quyền/khởi tạo giao dịch (Authentication), và (2) Giao dịch không bị chỉnh sửa sau khi đã ký (Integrity).',
      en: 'A cryptographic mechanism proving two critical facts: (1) Who authorized a transaction (Authentication), and (2) That the transaction was not modified after signing (Integrity).',
    },
    example: {
      vi: 'Khóa Bí Mật (Private Key) → KÝ (SIGN) → [Giao dịch + Chữ ký số] → XÁC MINH (VERIFY) ← Khóa Công Khai (Public Key).',
      en: 'Private Key → SIGN → [Transaction + Signature] → VERIFY ← Public Key.',
    },
    whyBlockchain: {
      vi: 'Cho phép người dùng chuyển tiền và tương tác hợp đồng thông minh mà không cần tiết lộ mật khẩu hay tài khoản ngân hàng trung gian.',
      en: 'Empowers users to authorize spends and smart contracts securely without revealing private secrets to intermediaries.',
    },
    badge: 'SECP256k1 ECDSA',
    ctaLabLabel: {
      vi: 'MỞ MODULE CHỮ KÝ SỐ & GIAO DỊCH',
      en: 'OPEN DIGITAL SIGNATURE LAB',
    },
    ctaLabHref: '#transactions',
    iconName: 'FileSignature',
  },
  {
    id: 'public-private-key',
    name: {
      vi: '7. Khóa Công Khai & Khóa Bí Mật (Public Key / Private Key)',
      en: '7. Public Key / Private Key',
    },
    shortDef: {
      vi: 'Cặp khóa bất đối xứng với vai trò phân định rạch ròi: KHÓA BÍ MẬT (giữ tuyệt mật, dùng để tạo chữ ký số phê duyệt giao dịch) vs. KHÓA CÔNG KHAI (chia sẻ cho mọi người, dùng để xác minh chữ ký và tạo địa chỉ ví). Khác hoàn toàn với Hàm băm!',
      en: 'Asymmetric keypair with distinct roles: PRIVATE KEY (kept secret, used to create signatures) vs. PUBLIC KEY (can be shared openly, used to verify signatures and derive wallet addresses). Completely distinct from Hashing!',
    },
    example: {
      vi: 'So sánh:\n• Băm (Hashing): Dữ liệu → Bản băm (1 chiều)\n• Chữ Ký Số: Dữ liệu + Khóa Bí Mật → Chữ ký; Chữ ký + Khóa Công Khai → Xác minh',
      en: 'Comparison:\n• Hashing: Data → Hash (One-way)\n• Digital Signature: Data + Private Key → Signature; Signature + Public Key → Verification',
    },
    whyBlockchain: {
      vi: 'Hình thành quyền sở hữu phi tập trung: "Not your keys, not your coins". Ai nắm khóa bí mật mới có quyền chi tiêu tài sản.',
      en: 'Enables decentralized self-custody: "Not your keys, not your coins". Only the private keyholder can spend funds.',
    },
    badge: 'Asymmetric Keypair',
    ctaLabLabel: {
      vi: 'Xem Tạo Cặp Khóa & Ký Số',
      en: 'Inspect Keypair & Signing',
    },
    ctaLabHref: '#transactions',
    iconName: 'Key',
  },
  {
    id: 'crypto-blockchain-map',
    name: {
      vi: '8. Sơ Đồ Kết Nối: Mật Mã → Blockchain',
      en: '8. Cryptography → Blockchain Connection',
    },
    shortDef: {
      vi: 'Blockchain không chỉ dựa vào một kỹ thuật mật mã đơn lẻ. Các cơ chế khác nhau hợp tác giải quyết các bài toán khác nhau: Hàm băm bảo toàn tính toàn vẹn (Integrity), Chữ ký số giải quyết xác thực (Authentication), và Con trỏ băm khóa chặt tính toàn vẹn chuỗi.',
      en: 'Blockchain does not rely on one cryptographic technique alone. Different mechanisms solve different problems: Hash ensures Integrity, Digital Signatures ensure Authentication, and Previous Hash links chain integrity to create decentralized trust.',
    },
    example: {
      vi: 'BLOCKCHAIN ──> [HASH (Integrity) | DIGITAL SIGNATURE (Authentication) | DATA] ──> TẠO LẬP NIỀM TIN PHI TẬP TRUNG',
      en: 'BLOCKCHAIN ──> [HASH (Integrity) | DIGITAL SIGNATURE (Authentication) | DATA] ──> TRUST WITHOUT MODIFYING DATA',
    },
    whyBlockchain: {
      vi: 'Tạo ra hệ thống sổ cái phân tán không thể sửa đổi, nơi các bên tham gia không cần tin tưởng lẫn nhau nhưng vẫn tin tưởng vào toán học.',
      en: 'Creates an immutable distributed ledger where untrusted participants can trust the mathematical integrity of the system.',
    },
    badge: 'Holistic Architecture',
    ctaLabLabel: {
      vi: 'Khám Phá Toàn Cảnh Blockchain',
      en: 'Explore Blockchain Architecture',
    },
    ctaLabHref: '#blockchain',
    iconName: 'Boxes',
  },
];

// 6. Progressive Evolutionary Roadmap (Python List -> Linked List -> Hash Pointer -> SHA-256 -> Block -> Blockchain -> Consensus)
export const EVOLUTION_STAGES = [
  {
    step: 1,
    id: 'python-list',
    title: {
      vi: 'Python List (Mảng động)',
      en: 'Python Dynamic List',
    },
    desc: {
      vi: 'Lưu trữ nhiều phần tử linh hoạt trong RAM. Nhược điểm: Dễ bị sửa đổi hoặc xóa tùy ý, không có cơ chế bảo toàn tính toàn vẹn.',
      en: 'Stores multiple flexible values in memory. Limitation: Freely mutable, lacks cryptographic tamper resistance.',
    },
    tag: 'Python Memory',
    color: 'emerald',
    icon: 'Code2',
  },
  {
    step: 2,
    id: 'linked-list',
    title: {
      vi: 'Linked List (Danh sách liên kết)',
      en: 'Linked List (Node + NEXT)',
    },
    desc: {
      vi: 'Các Node chứa [DATA | NEXT] liên kết bằng địa chỉ ô nhớ RAM rời rạc. Quản lý qua con trỏ HEAD và TAIL.',
      en: 'Nodes [DATA | NEXT] linked via heap memory addresses, orchestrated by HEAD and TAIL pointers.',
    },
    tag: 'Data Structures',
    color: 'blue',
    icon: 'ListTree',
  },
  {
    step: 3,
    id: 'hash-pointer',
    title: {
      vi: 'Con Trỏ Băm (Hash Pointer)',
      en: 'Hash Pointer',
    },
    desc: {
      vi: 'Thay thế con trỏ RAM thông thường bằng mã băm của khối trước lưu trữ trong khối kế tiếp.',
      en: 'Replaces raw volatile memory pointers with 256-bit cryptographic digest anchors.',
    },
    tag: 'Cryptographic Pointer',
    color: 'indigo',
    icon: 'Link2',
  },
  {
    step: 4,
    id: 'cryptographic-hash',
    title: {
      vi: 'Hàm Băm Mật Mã & SHA-256',
      en: 'Cryptographic Hash & SHA-256',
    },
    desc: {
      vi: 'Bảo đảm 3 tính chất cốt lõi: Kháng tiền ảnh (một chiều), Hiệu ứng thác đổ và Kháng va chạm.',
      en: 'Provides Pre-image Resistance (one-way), Avalanche Effect, and Collision Resistance.',
    },
    tag: 'Cryptography',
    color: 'purple',
    icon: 'Cpu',
  },
  {
    step: 5,
    id: 'blockchain-block',
    title: {
      vi: 'Cấu Trúc Khối & Chuỗi Khối',
      en: 'Block Anatomy & Blockchain',
    },
    desc: {
      vi: 'Mỗi khối gồm Block Header, Merkle Root và Previous Hash. Sửa 1 byte ở khối trước sẽ làm gãy toàn bộ chuỗi khối.',
      en: 'Blocks encapsulate Header, Merkle Root, and PrevHash. 1-byte alteration breaks downstream chain.',
    },
    tag: 'Distributed Ledger',
    color: 'amber',
    icon: 'Boxes',
  },
  {
    step: 6,
    id: 'consensus-layer',
    title: {
      vi: 'Cây Merkle, PoW & PoS',
      en: 'Merkle Tree & Consensus Layer',
    },
    desc: {
      vi: 'Cây Merkle giúp xác thực giao dịch nhanh gọn. Cơ chế Proof of Work và Proof of Stake đảm bảo đồng thuận mạng lưới.',
      en: 'Merkle Trees enable SPV validation; Proof of Work and Proof of Stake secure network consensus.',
    },
    tag: 'Consensus & Trees',
    color: 'emerald',
    icon: 'ShieldCheck',
  },
];
