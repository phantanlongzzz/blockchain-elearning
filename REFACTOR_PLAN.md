# KẾ HOẠCH TÁI CẤU TRÚC KIẾN TRÚC TOÀN DIỆN (REFACTOR PLAN)
**Dự án:** Blockchain E-Learning & Simulation Laboratory  
**Tác giả:** Senior Frontend Architect  
**Nhánh Git:** `refactor/phase-1-plan`  
**Mục tiêu:** Chuyển đổi từ mô hình *Monolithic Single-Page Scroll (25,000+ px, 28 components chồng chéo, 10,946 LOC)* sang mô hình **Phân cấp Học phần Chuẩn mực (Curriculum & Laboratory Architecture)** với cấu trúc định tuyến phân luồng rõ ràng, tối ưu hóa hiệu năng, giảm tải nhận thức (cognitive load) và triệt tiêu trùng lặp.

---

## 1. MAPPING TOÀN BỘ COMPONENT HIỆN TẠI VÀO KIẾN TRÚC ĐÍCH
Hệ thống được chuẩn hóa theo mô hình phân cấp đào tạo 6 bậc:
$$\text{Course} \longrightarrow \text{Module} \longrightarrow \text{Lesson} \longrightarrow \text{Interactive Unit} \longrightarrow \text{Simulation} \longrightarrow \text{Checkpoint}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               COURSE: BLOCKCHAIN MASTERY                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ├── MODULE 0: TRANG CHỦ (Home & Overview)                                              │
│ │   └── Lesson 0.1: Introduction & Live SHA-256 Playground                             │
│ ├── MODULE 1: HASH (Mã hóa & Hàm Băm Mật mã học)                                      │
│ │   ├── Lesson 1.1: Trình tạo Hash SHA-256 & Tính đơn ánh                              │
│ │   ├── Lesson 1.2: 5 Đặc tính Mật mã học cốt lõi                                      │
│ │   ├── Lesson 1.3: Hiệu ứng Thác lũ (Avalanche Effect)                                │
│ │   ├── Lesson 1.4: Pipeline Nội bộ 64 Vòng Băm (FIPS 180-4)                           │
│ │   └── Lesson 1.5: Phòng Thí nghiệm Băm Nâng cao (Brute-force & Collision)            │
│ ├── MODULE 2: LÝ THUYẾT (Cơ sở Dữ liệu, Cấu trúc Khối & Phi tập trung)                │
│ │   ├── Lesson 2.1: Cấu trúc Dữ liệu Nền tảng (Array vs Linked List vs Blockchain)     │
│ │   ├── Lesson 2.2: Kiến trúc Khối & Vòng đời Khối (Block Architecture & Lifecycle)    │
│ │   ├── Lesson 2.3: Sự tiến hóa Mạng: Tập trung -> Phân tán -> Phi tập trung           │
│ │   └── Lesson 2.4: Tiến hóa Cơ chế Đồng thuận & Bài toán Tướng Byzantine             │
│ ├── MODULE 3: PHÒNG MÔ PHỎNG (Phòng Thực nghiệm Đồng thuận & Khai thác)               │
│ │   ├── Lesson 3.1: Xác thực Giao dịch, Cặp Khóa ECDSA & Mempool                       │
│ │   ├── Lesson 3.2: Phòng Khai thác Proof of Work (Đa luồng Web Workers & Longest Chain)│
│ │   ├── Lesson 3.3: Phòng Đặt cọc Proof of Stake (Validators, Slots & Slashing)        │
│ │   └── Lesson 3.4: Mô phỏng Đồng thuận Toàn trình End-to-End (Mempool -> Finality)    │
│ ├── MODULE 4: BLOCKCHAIN (Sổ cái Phân tán, Cây Merkle & Đánh giá Học tập)             │
│ │   ├── Lesson 4.1: Khám phá Trực quan Chuỗi Khối & Cơ chế Tamper-and-Heal             │
│ │   ├── Lesson 4.2: Cây Merkle & Bằng chứng Xác thực Merkle Proof                      │
│ │   ├── Lesson 4.3: Trung tâm Đánh giá & Thi Trắc nghiệm (Quiz Hub)                    │
│ │   └── Lesson 4.4: Ngân hàng Câu hỏi Học thuật, Nghiên cứu & Tác giả                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Bảng Chi Tiết Mapping Từng Thành Phần Hiện Tại:

| Module / Nhóm đích | Lesson / Đơn vị bài học | Component Hiện tại | Interactive Unit / Simulation Engine | Checkpoint / Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **0. TRANG CHỦ** | **0.1** Tổng quan & Khởi động | `Hero.tsx` | Interactive Hero Hash Input (`SHA-256`) + Metric Cards | Quick Hash Tryout |
| **1. HASH** | **1.1** Trình tạo Hash | `HashGenerator.tsx` | Real-time text-to-hash converter + Copyable hex | 1-way verify |
| | **1.2** Đặc tính Hàm Băm | `PropertiesSection.tsx` | 5 Card trực quan (Đơn hướng, Quyết định, Kháng tiền ảnh...) | Mini-quiz check |
| | **1.3** Hiệu ứng Thác lũ | `AvalancheVisualizer.tsx` | Bit-level diffing matrix (256-bit flips) | Avalanche % counter |
| | **1.4** Pipeline Nội bộ | `InternalPipelineVisualizer.tsx` | Animation 64 round SHA-256 ($W_t, K_t, Ch, Maj, \Sigma$) | Step-by-step debugger |
| | **1.5** Lab Thực nghiệm Băm | `ExperimentLab.tsx`<br>`BruteForceSimulator.tsx`<br>`CollisionVisualizer.tsx` | • Brute-force Nonce finder<br>• Birthday Attack Collision search | Benchmark challenge |
| **2. LÝ THUYẾT** | **2.1** Cấu trúc Nền tảng | `DataStructuresFoundations.tsx`<br>`LinkedListPlayground.tsx`<br>`DataToBlockchainPipeline.tsx` | • Array vs Linked List pointer visualizer<br>• Genesis-to-Chain transformation | Pointer comparison |
| | **2.2** Kiến trúc Khối | `BlockArchitectureLab.tsx`<br>`InteractiveBlockHandsOnLab.tsx`<br>`FullBlockLifecycleSimulation.tsx` | • Block Header anatomy inspector<br>• Interactive Mining simulator<br>• Lifecycle state machine | Valid Block test |
| | **2.3** Phi tập trung | `DecentralizationEvolutionLab.tsx`<br>`NetworkTopologyExplorer.tsx`<br>`BitcoinEcosystemLab.tsx` | • Topology packet flow simulator<br>• Centralized vs P2P failure injection | Fault-tolerance test |
| | **2.4** Tiến hóa Đồng thuận | `ConsensusEvolutionLab.tsx`<br>`ConsensusFundamentals.tsx`<br>`ByzantineGeneralsLab.tsx`<br>`OralMessagesSimulation.tsx`<br>`PoWVsPoSInteractive.tsx` | • Interactive $OM(1)$ Byzantine Generals<br>• Traitor Node toggling<br>• PoW vs PoS comparison matrix | Consensus challenge |
| **3. PHÒNG MÔ PHỎNG** | **3.1** Xác thực Giao dịch | `TransactionVerification.tsx`<br>`MempoolDashboard.tsx`<br>`DigitalSignatureLab.tsx`<br>`KeyGenerationLab.tsx` | • ECDSA Key Pair generator (Secp256k1)<br>• Signature sign/verify sandbox<br>• Mempool priority queuing | Signature forgery test |
| | **3.2** Phòng Khai thác PoW | `ProofOfWorkLab.tsx`<br>`MiningRaceArena.tsx`<br>`ForkAndLongestChainLab.tsx`<br>`ForkTreeVisualizer.tsx` | • Multi-threaded Web Worker mining race<br>• Nonce collision & target prefix matching<br>• Longest Chain Rule & Orphan block engine | Multi-block Race result |
| | **3.3** Phòng Đặt cọc PoS | `ProofOfStakeLab.tsx`<br>`PoSCodeModal.tsx` | • Slot election (Stake-weighted probability)<br>• Validator staking & slashing simulator | Slashing penalty test |
| | **3.4** Mô phỏng Toàn trình | `EndToEndConsensusLab.tsx`<br>`ConcurrentMiningArena.tsx`<br>`TransactionMempoolBuilder.tsx`<br>`ConsensusEventLog.tsx`<br>`FinalLedgerExplorer.tsx` | • Complete Transaction Lifecycle (Broadcast $\rightarrow$ Mempool $\rightarrow$ Web Worker Race $\rightarrow$ Block Assembly $\rightarrow$ P2P Broadcast $\rightarrow$ Finality) | Full pipeline certification |
| **4. BLOCKCHAIN** | **4.1** Sổ cái & Toàn vẹn | `BlockchainVisualizer.tsx` | • 5-block chain with cryptographic linkage<br>• Real-time Tamper-and-Heal cascade | Tamper detection check |
| | **4.2** Cây Merkle | `MerkleTreeLab.tsx`<br>`MerkleProofModal.tsx`<br>`TransactionList.tsx`<br>`NodeDetailModal.tsx` | • Dynamic leaf-to-root SHA-256 tree builder<br>• $O(\log N)$ Merkle Audit Proof validator | Merkle Proof verification |
| | **4.3** Trung tâm Trắc nghiệm | `QuizSection.tsx`<br>`QuizPlayer.tsx`<br>`QuizReviewModal.tsx` | • Timed exam engine with 4 topic banks<br>• Detailed rationale review & scores | Certificate eligibility |
| | **4.4** Học thuật & Hồ sơ | `AcademicQuestions.tsx`<br>`AboutResearch.tsx`<br>`ResearcherProfile.tsx` | • University syllabus Q&A<br>• Researcher credits & citations | Academic reference |

---

## 2. PHÂN LOẠI XỬ LÝ COMPONENT (MOVE, MERGE, SPLIT, DELETE)

### 2.1. Nhóm GIỮ NGUYÊN LOGIC, CHỈ ĐỔI VỊ TRÍ (MOVE)
Các component có logic hoàn thiện, độc lập, chỉ cần chuyển vào cấu trúc thư mục mới và kết nối qua Tab/Route context:
1. `src/components/HashGenerator.tsx` $\rightarrow$ `src/modules/hash/components/HashGenerator.tsx`
2. `src/components/PropertiesSection.tsx` $\rightarrow$ `src/modules/hash/components/PropertiesSection.tsx`
3. `src/components/AvalancheVisualizer.tsx` $\rightarrow$ `src/modules/hash/components/AvalancheVisualizer.tsx`
4. `src/components/InternalPipelineVisualizer.tsx` $\rightarrow$ `src/modules/hash/components/InternalPipelineVisualizer.tsx`
5. `src/components/Foundations/LinkedListPlayground.tsx` $\rightarrow$ `src/modules/theory/components/LinkedListPlayground.tsx`
6. `src/components/ConsensusEvolution/ByzantineGeneralsLab.tsx` $\rightarrow$ `src/modules/theory/components/ByzantineGeneralsLab.tsx`
7. `src/components/BlockchainVisualizer.tsx` $\rightarrow$ `src/modules/blockchain/components/BlockchainVisualizer.tsx`
8. `src/components/Quiz/QuizSection.tsx` $\rightarrow$ `src/modules/blockchain/components/QuizSection.tsx`
9. `src/components/Auth/*` $\rightarrow$ `src/components/auth/*`
10. `src/components/Profile/*` $\rightarrow$ `src/components/profile/*`

### 2.2. Nhóm CẦN HỢP NHẤT (MERGE) ĐỂ TRIỆT TIÊU TRÙNG LẶP
1. **Hợp nhất Merkle Tree Simulations:**
   * Hiện trạng: Có 2 component Merkle Tree riêng biệt (`BlockArchitectureLab` chứa Merkle sub-tab và `MerkleTreeLab` chứa full visualizer).
   * Giải pháp: Hợp nhất vào một Merkle Core duy nhất tại `src/modules/blockchain/components/MerkleTree/`. `BlockArchitectureLab` sẽ nhúng view thu gọn của Merkle component này, tránh nhân đôi logic tính toán Merkle Root.
2. **Hợp nhất PoW Consensus Sections:**
   * Hiện trạng: `ConsensusEvolution/PoWConsensusSection.tsx` và `ProofOfWork/ProofOfWorkLab.tsx` đều có logic giải thích PoW và nút bấm đào khối.
   * Giải pháp: Chuyển toàn bộ phần mô phỏng thực hành của PoW sang `src/modules/simulation/components/ProofOfWork/`. Module Lý thuyết chỉ giữ vai trò so sánh lý thuyết ($OM(1)$ và Byzantine Fault Tolerance).
3. **Hợp nhất Mempool Builder & Transaction Verification:**
   * Hiện trạng: `TransactionVerification/MempoolDashboard.tsx` và `EndToEndConsensus/TransactionMempoolBuilder.tsx` có chung cấu trúc transaction item và mempool queue.
   * Giải pháp: Tạo một data model và visualizer dùng chung `src/components/common/MempoolViewer.tsx`.

### 2.3. Nhóm CẦN TÁCH NHỎ (SPLIT) DO ĐANG LÀM QUÁ NHIỀU VIỆC (GIẢM LOC)
1. **Tách `ProofOfWorkLab.tsx` (1,594 dòng $\rightarrow$ 4 sub-components < 350 dòng):**
   * `PoWRaceControls.tsx`: Quản lý chọn thời gian, chọn độ khó, thanh trượt hash power và nút Start/Stop.
   * `PoWMiningGrid.tsx`: Hiển thị card các thợ đào (Mining rigs), Nonce nhảy và animation GPU.
   * `PoWChainTrack.tsx`: Hiển thị chuỗi khối thời gian thực của từng thợ đào.
   * `PoWWinnerModal.tsx`: Bảng kết quả, so sánh hash attempts và phân tích Fork/Longest Chain.
2. **Tách `EndToEndConsensusLab.tsx` (1,412 dòng $\rightarrow$ 3 sub-components):**
   * `ConsensusLifecycleStepper.tsx`: Quản lý 5 trạng thái vòng đời giao dịch.
   * `MempoolToBlockAssembler.tsx`: Giao diện nhặt giao dịch vào candidate block header.
   * `ConsensusTelemetryPanel.tsx`: Bảng thông số đo lường Web Workers, TPS và Block propagation time.
3. **Tách `Navbar.tsx` (777 dòng $\rightarrow$ 3 sub-components):**
   * `NavbarBrand.tsx`: Logo trường, biểu tượng blockchain và subtitle.
   * `NavbarNavLinks.tsx`: Dropdown menu 5 module chính với chỉ báo hoàn thành (Progress indicator).
   * `NavbarUserControls.tsx`: Chuyển đổi ngôn ngữ (`VI/EN`), nút đăng nhập, avatar và điểm thưởng Quiz.

### 2.4. Nhóm CÓ THỂ XOÁ / DỌN DẸP (CLEANUP)
1. Dọn dẹp các biến debug, các mock timer không còn sử dụng trong các file thí nghiệm.
2. Gỡ bỏ các class Tailwind inline lặp lại không cần thiết sau khi áp dụng Design Tokens.

---

## 3. ĐỀ XUẤT ROUTE HIERARCHY CỤ THỂ
Dựa trên kiến trúc React 19 + Vite (không dùng router nặng nề bên ngoài để giữ tốc độ load tức thì và tương thích iframe sandbox), áp dụng cơ chế **Active Module & Tab State Routing** với đồng bộ hóa URL Hash (`window.location.hash` / custom lightweight navigation context).

### Cấu Trúc Phân Luồng Định Tuyến Bắt Buộc:

```
/#/home (TRANG CHỦ)
├── #overview (Giới thiệu & Live SHA-256 Sandbox)
└── #modules-index (Bản đồ Lộ trình Học tập)

/#/hash (MÃ HÓA & HÀM BĂM)
├── #generator (Trình tạo Hash SHA-256)
├── #properties (5 Đặc tính Mật mã học)
├── #avalanche (Hiệu ứng Thác lũ 256-bit)
├── #pipeline (Mô phỏng 64 Vòng Băm Chi tiết)
└── #experiment (Thực nghiệm Brute-Force & Collision)

/#/theory (LÝ THUYẾT NỀN TẢNG)
├── #data-structures (Mảng vs Danh sách liên kết vs Chuỗi khối)
├── #block-architecture (Cấu trúc Khối, Header & Vòng đời Khối)
├── #decentralization (Mạng Tập trung vs Phân tán vs Phi tập trung)
└── #consensus-evolution (Tiến hóa Đồng thuận & Tướng Byzantine)

/#/simulation (PHÒNG MÔ PHỎNG THỰC HÀNH)
├── #transactions (Xác thực Giao dịch, Cặp Khóa ECDSA & Mempool)
├── #proof-of-work (Đua Khai thác PoW Đa luồng & Chuỗi Dài Nhất)
├── #proof-of-stake (Đặt cọc PoS, Bầu Slot & Phạt Slashing)
└── #end-to-end (Đồng thuận Toàn trình 5 Bước)

/#/blockchain (SỔ CÁI, CÂY MERKLE & ĐÁNH GIÁ)
├── #ledger (Trực quan hóa Sổ cái Chuỗi Khối & Tamper-and-Heal)
├── #merkle-tree (Cây Merkle Động & Xác thực Merkle Proof)
├── #quiz (Trung tâm Thi Trắc nghiệm & Chứng chỉ)
└── #academic (Hỏi đáp Học thuật, Đề tài & Tác giả)
```

**Ưu điểm kỹ thuật:**
* Chỉ render nội dung của 1 Module hoạt động tại một thời điểm (hoặc view chuyển tab mượt mà), giảm số lượng DOM node từ ~15,000 xuống < 3,000 nodes.
* Tự động dừng (`cleanup`) các timer của các Module không hiển thị, giúp CPU/RAM trình duyệt giải phóng hoàn toàn khi người dùng chuyển tab.

---

## 4. ĐỀ XUẤT FOLDER STRUCTURE CHUẨN CHO DỰ ÁN

```
src/
├── assets/                          # Static assets (images, logos)
├── components/                      # Shared global components
│   ├── auth/                        # AuthModal, Login, Register
│   ├── profile/                     # User Profile, History, Certificates
│   ├── common/                      # Reusable UI widgets
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── CodeViewer.tsx
│   │   ├── Modal.tsx
│   │   └── TabNav.tsx
│   ├── layout/                      # Application Shell
│   │   ├── Navbar/
│   │   │   ├── NavbarBrand.tsx
│   │   │   ├── NavbarNavLinks.tsx
│   │   │   └── NavbarUserControls.tsx
│   │   ├── Footer.tsx
│   │   └── BackToTop.tsx
│   └── ai-assistant/                # Floating Gemini Tutor
├── context/                         # React Contexts
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   ├── NavigationContext.tsx        # [MỚI] Điều hướng Module/Lesson
│   └── SimulationContext.tsx
├── data/                            # Static curriculum data & quiz banks
├── i18n/                            # Localization dictionaries (vi.ts, en.ts)
├── modules/                         # [KIẾN TRÚC MỚI] 5 Modules theo đúng Nav
│   ├── home/                        # MODULE 0: TRANG CHỦ
│   │   ├── components/HeroDemo.tsx
│   │   └── HomePage.tsx
│   ├── hash/                        # MODULE 1: HASH
│   │   ├── components/
│   │   │   ├── HashGenerator.tsx
│   │   │   ├── PropertiesSection.tsx
│   │   │   ├── AvalancheVisualizer.tsx
│   │   │   ├── InternalPipelineVisualizer.tsx
│   │   │   └── ExperimentLab.tsx
│   │   └── HashModulePage.tsx
│   ├── theory/                      # MODULE 2: LÝ THUYẾT
│   │   ├── components/
│   │   │   ├── DataStructuresFoundations.tsx
│   │   │   ├── BlockArchitectureLab.tsx
│   │   │   ├── DecentralizationEvolutionLab.tsx
│   │   │   └── ConsensusEvolutionLab.tsx
│   │   └── TheoryModulePage.tsx
│   ├── simulation/                  # MODULE 3: PHÒNG MÔ PHỎNG
│   │   ├── components/
│   │   │   ├── TransactionVerification/
│   │   │   ├── ProofOfWork/
│   │   │   ├── ProofOfStake/
│   │   │   └── EndToEndConsensus/
│   │   └── SimulationModulePage.tsx
│   └── blockchain/                  # MODULE 4: BLOCKCHAIN
│       ├── components/
│       │   ├── BlockchainVisualizer.tsx
│       │   ├── MerkleTree/
│       │   ├── Quiz/
│       │   ├── AcademicQuestions.tsx
│       │   └── ResearcherProfile.tsx
│       └── BlockchainModulePage.tsx
├── styles/                          # [MỚI] Design Tokens
│   └── tokens.ts                    # Semantic Color Palette & Spacing Rules
├── types.ts                         # Global TypeScript interfaces
└── utils/                           # Cryptographic & Web Worker helpers
    ├── crypto.ts                    # SHA-256, ECDSA helpers
    └── miningWorker.ts              # Web Worker Blob factory
```

---

## 5. MA TRẬN RỦI RO KỸ THUẬT & THỨ TỰ THỰC THI

| Mức độ Rủi ro | Tính năng / Module | Nguy cơ tiềm ẩn nếu làm sai thứ tự | Biện pháp Phòng ngừa & Thứ tự an toàn |
| :---: | :--- | :--- | :--- |
| 🔴 **RẤT CAO** | **Web Worker Mining Engine** (`miningWorker.ts`) | Đứt gãy kết nối MessageEvent giữa UI và Background Threads khi tách nhỏ `ProofOfWorkLab` hoặc `EndToEndConsensusLab`. Trình duyệt bị treo nếu Worker không được terminate khi chuyển tab. | **Thứ tự:** Tạo `NavigationContext` và `tokens.ts` trước $\rightarrow$ bao bọc an toàn cleanup worker lifecycle $\rightarrow$ mới thực hiện tách file nhỏ. |
| 🔴 **RẤT CAO** | **i18n Key Mapping** (`vi.ts` / `en.ts`) | Mất từ khóa dịch (translation key missing) hoặc hiển thị text raw khi di chuyển các file component vào thư mục `modules/`. | Giữ nguyên dictionary keys hiện tại, thực hiện refactor cấu trúc component theo từng module độc lập có test lint ngay sau mỗi bước. |
| 🟡 **TRUNG BÌNH** | **Quiz History & State Persistence** | Mất dữ liệu kết quả thi của người dùng trong `localStorage` khi tách `QuizSection` và các modal xem lại kết quả (`QuizReviewModal`). | Chuẩn hóa `types.ts` cho `QuizAttempt` trước khi tách component, đảm bảo `localStorage` key không thay đổi. |
| 🟡 **TRUNG BÌNH** | **Cascade CSS & Theme Inconsistency** | Khi thay thế 1,258 mã màu HEX hardcode, có thể làm hỏng độ tương phản WCAG AA ở một số bảng số liệu SHA-256 hoặc biểu đồ nhánh cây. | Định nghĩa rõ bảng token trong `styles/tokens.ts` (ví dụ `surface.card`, `accent.primary`, `status.valid`, `status.invalid`) và map theo từng module. |
| 🟢 **THẤP** | **Navbar Dropdown Scrolling** | Anchor tag không cuộn tới đúng section khi người dùng bấm vào sub-menu. | Kết nối Navbar trực tiếp với `NavigationContext` để vừa kích hoạt Module tương ứng vừa smooth-scroll tới Lesson ID. |

---

## 6. LỘ TRÌNH TRIỂN KHAI CHO CÁC GIAI ĐOẠN TIẾP THEO
* **Phase 2:** Thiết lập Design Tokens (`tokens.ts`) & Tạo `NavigationContext` (Bộ điều hướng 5 Module chuẩn mực).
* **Phase 3:** Chuyển đổi và tổ chức lại các thư mục theo chuẩn `src/modules/` (Modularization).
* **Phase 4:** Tách nhỏ các component dung lượng lớn (`ProofOfWorkLab`, `EndToEndConsensusLab`, `Navbar`).
* **Phase 5:** Tối ưu hóa UI/UX, chuẩn hóa màu sắc theo Tokens, hoàn thiện chuyển tab mượt mà và kiểm thử toàn diện (`lint_applet` & `compile_applet`).
