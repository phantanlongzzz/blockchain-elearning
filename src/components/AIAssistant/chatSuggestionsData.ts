export interface SectionSuggestion {
  sectionId: string;
  sectionTitleVi: string;
  sectionTitleEn: string;
  questionsVi: string[];
  questionsEn: string[];
}

export const SECTION_SUGGESTIONS: Record<string, SectionSuggestion> = {
  'proof-of-stake': {
    sectionId: 'proof-of-stake',
    sectionTitleVi: 'Proof of Stake (PoS)',
    sectionTitleEn: 'Proof of Stake (PoS)',
    questionsVi: [
      'Vì sao Bob được chọn làm người giải khối?',
      'ETH đặt cọc có tác dụng gì trong mạng lưới?',
      'Nếu người giải khối cố tình gian lận thì chuyện gì xảy ra?',
      'Proof of Stake tiết kiệm năng lượng hơn Proof of Work thế nào?',
    ],
    questionsEn: [
      'Why was Bob selected as the block solver?',
      'What is the purpose of staked ETH in the network?',
      'What happens if a block solver acts fraudulently?',
      'How does Proof of Stake save energy compared to Proof of Work?',
    ],
  },
  'blockchain': {
    sectionId: 'blockchain',
    sectionTitleVi: 'Chuỗi Khối (Blockchain)',
    sectionTitleEn: 'Blockchain Structure',
    questionsVi: [
      'Mã băm trước (Previous Hash) liên kết và bảo vệ chuỗi khối thế nào?',
      'Khối nguyên thủy (Genesis Block) là gì?',
      'Nếu sửa dữ liệu ở Khối 1 thì Khối 2 và 3 sẽ bị ảnh hưởng ra sao?',
      'Tại sao không thể bí mật thay đổi dữ liệu đã ghi vào Blockchain?',
    ],
    questionsEn: [
      'How does Previous Hash link and protect the chain?',
      'What is the Genesis Block (#0)?',
      'What happens to subsequent blocks if Block 1 is tampered with?',
      'Why is data in a blockchain considered immutable?',
    ],
  },
  'proof-of-work': {
    sectionId: 'proof-of-work',
    sectionTitleVi: 'Proof of Work (PoW)',
    sectionTitleEn: 'Proof of Work (PoW)',
    questionsVi: [
      'Tại sao thợ đào phải thử nhiều giá trị Nonce?',
      'Độ khó (Difficulty) ảnh hưởng đến thời gian đào khối thế nào?',
      'Vì sao chỉ có thợ đào tìm ra Nonce hợp lệ đầu tiên mới nhận thưởng?',
      'Tấn công 51% trong Proof of Work là gì?',
    ],
    questionsEn: [
      'Why do miners have to iterate through many Nonce values?',
      'How does difficulty affect block mining time?',
      'Why does only the first miner to find a valid Nonce receive the reward?',
      'What is a 51% attack in Proof of Work?',
    ],
  },
  'merkle-tree': {
    sectionId: 'merkle-tree',
    sectionTitleVi: 'Cây Merkle (Merkle Tree)',
    sectionTitleEn: 'Merkle Tree & SPV',
    questionsVi: [
      'Merkle Root trong tiêu đề khối giúp xác minh giao dịch ra sao?',
      'Tại sao dùng Cây Merkle lại tiết kiệm dung lượng và băng thông?',
      'Bằng chứng Merkle (Merkle Proof) hoạt động như thế nào?',
    ],
    questionsEn: [
      'How does the Merkle Root in the block header verify transactions?',
      'Why does a Merkle Tree save storage and network bandwidth?',
      'How does a Merkle Proof (SPV verification) work?',
    ],
  },
  'hash-generator': {
    sectionId: 'hash-generator',
    sectionTitleVi: 'Hàm Băm SHA-256',
    sectionTitleEn: 'SHA-256 Hash Generator',
    questionsVi: [
      'Mã băm SHA-256 là gì và có đặc tính gì quan trọng?',
      'Tại sao từ mã băm 64 ký tự không thể suy ngược lại chuỗi ban đầu?',
      '256-bit tạo ra không gian mã băm lớn cỡ nào?',
    ],
    questionsEn: [
      'What is a SHA-256 hash and what are its key properties?',
      'Why is it mathematically impossible to reverse-engineer a hash?',
      'How large is a 256-bit hash search space?',
    ],
  },
  'avalanche': {
    sectionId: 'avalanche',
    sectionTitleVi: 'Hiệu Ứng Tuyết Lở (Avalanche)',
    sectionTitleEn: 'Avalanche Effect',
    questionsVi: [
      'Hiệu ứng tuyết lở (Avalanche Effect) là gì?',
      'Vì sao chỉ đổi 1 ký tự mà mã băm lại thay đổi gần 50% số bit?',
      'Tính chất này giúp ích gì cho bảo mật Blockchain?',
    ],
    questionsEn: [
      'What is the Avalanche Effect?',
      'Why does flipping just 1 bit change approximately 50% of the output bits?',
      'How does the Avalanche Effect guarantee cryptographic integrity?',
    ],
  },
  'verification': {
    sectionId: 'verification',
    sectionTitleVi: 'Chữ Ký Số & Giao Dịch',
    sectionTitleEn: 'Digital Signatures & Transactions',
    questionsVi: [
      'Cặp khóa bí mật (Private Key) và khóa công khai (Public Key) dùng để làm gì?',
      'Làm thế nào chữ ký số chứng minh tôi là người gửi mà không lộ mật mã?',
      'Mempool chứa các giao dịch như thế nào trước khi vào khối?',
    ],
    questionsEn: [
      'How do private and public key pairs work in transactions?',
      'How does a digital signature prove transaction ownership without revealing the secret key?',
      'What is the Mempool and how do transactions wait to be mined?',
    ],
  },
  'foundations': {
    sectionId: 'foundations',
    sectionTitleVi: 'Nền Tảng Cấu Trúc Dữ Liệu',
    sectionTitleEn: 'Data Structures Foundations',
    questionsVi: [
      'Blockchain khác gì so với cơ sở dữ liệu truyền thống (SQL/NoSQL)?',
      'Con trỏ băm (Hash Pointer) khác con trỏ bộ nhớ thông thường ở đâu?',
      'Tại sao Blockchain lại cần mạng lưới ngang hàng (P2P)?',
    ],
    questionsEn: [
      'How does a Blockchain differ from a traditional database (SQL/NoSQL)?',
      'What is the difference between a Hash Pointer and a normal memory pointer?',
      'Why does Blockchain rely on a Peer-to-Peer (P2P) network?',
    ],
  },
};

export const DEFAULT_SUGGESTIONS = {
  vi: [
    'Blockchain hoạt động như thế nào một cách đơn giản?',
    'Khác biệt cốt lõi giữa Proof of Work và Proof of Stake là gì?',
    'Tại sao mã băm SHA-256 lại được ví như "dấu vân tay số"?',
    'Các giao dịch được đóng gói vào một khối (Block) như thế nào?',
  ],
  en: [
    'How does Blockchain work in simple terms?',
    'What is the core difference between Proof of Work and Proof of Stake?',
    'Why is a SHA-256 hash called a "digital fingerprint"?',
    'How are transactions packaged and verified in a block?',
  ],
};

export function getSuggestionsForSection(sectionId: string, language: 'vi' | 'en'): string[] {
  const match = SECTION_SUGGESTIONS[sectionId];
  if (match) {
    return language === 'vi' ? match.questionsVi : match.questionsEn;
  }
  return language === 'vi' ? DEFAULT_SUGGESTIONS.vi : DEFAULT_SUGGESTIONS.en;
}
