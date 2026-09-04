import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';

interface EducationalInsightBannerProps {
  currentStep: number;
  language: 'vi' | 'en';
}

export const EducationalInsightBanner: React.FC<EducationalInsightBannerProps> = ({
  currentStep,
  language,
}) => {
  const insights: {
    [step: number]: {
      titleVi: string;
      titleEn: string;
      descVi: string;
      descEn: string;
    };
  } = {
    1: {
      titleVi: 'Chữ ký số & Tính không thể chối bỏ',
      titleEn: 'Digital Signatures & Non-Repudiation',
      descVi:
        'Chữ ký số ECDSA cho phép người gửi xác thực quyền sở hữu mà không cần tiết lộ khóa bí mật. Bất kỳ thay đổi nào, dù chỉ một bit trong giao dịch, đều khiến chữ ký trở nên không hợp lệ.',
      descEn:
        'ECDSA signatures allow transaction authentication without exposing private keys. Modifying even 1 bit invalidates the signature immediately.',
    },
    2: {
      titleVi: 'Mempool & Động lực kinh tế phí giao dịch',
      titleEn: 'Mempool & Transaction Fee Economics',
      descVi:
        'Mempool là vùng đệm phi tập trung. Các thợ đào luôn ưu tiên các giao dịch có tỷ suất phí (Fee Density / Satoshis per byte) cao nhất để tối ưu hóa lợi nhuận kinh tế.',
      descEn:
        'The mempool is a decentralized buffer. Rational miners prioritize transactions with highest fee density to maximize mining yields.',
    },
    3: {
      titleVi: 'Cây Merkle: Nén O(N) giao dịch thành O(1) Root Hash',
      titleEn: 'Merkle Tree: Compressing O(N) Data to O(1) Root',
      descVi:
        'Cây Merkle cho phép tóm tắt hàng ngàn giao dịch thành một chuỗi 32-byte Merkle Root trong Block Header. Bất kỳ ai cũng có thể chứng minh sự tồn tại của 1 giao dịch với bằng chứng Merkle Proof cực nhẹ O(log N).',
      descEn:
        'Merkle trees compress thousands of transactions into a single 32-byte header root, enabling lightweight O(log N) SPV proofs.',
    },
    4: {
      titleVi: 'Bất đối xứng tính toán trong Proof of Work',
      titleEn: 'Computational Asymmetry in Proof of Work',
      descVi:
        'Khai thác PoW cực kỳ tốn kém về điện năng và thời gian tính toán (vét cạn hàng tỷ Nonce), nhưng bất kỳ máy tính nào cũng có thể kiểm tra kết quả ngay lập tức trong O(1) chỉ với 1 phép băm SHA-256.',
      descEn:
        'PoW is computationally costly to produce (brute-forcing nonces) but trivially instant (O(1)) for anyone to verify with a single SHA-256 hash.',
    },
    5: {
      titleVi: 'Giao thức lan truyền tin đồn (Gossip Protocol)',
      titleEn: 'P2P Gossip Relay & Independent Peer Validation',
      descVi:
        'Mạng Blockchain không có máy chủ trung tâm. Mỗi node tự xác minh độc lập cả 4 tiêu chuẩn (Mã băm khối trước, Cây Merkle, Chữ ký số, PoW) trước khi chuyển tiếp cho các nút bạn bè lân cận.',
      descEn:
        'Blockchain has no central server. Every peer independently validates previous hash, Merkle root, signatures, and PoW before gossiping to neighbor peers.',
    },
    6: {
      titleVi: 'Quy tắc Nakamoto: Chuỗi nặng nhất luôn chiến thắng',
      titleEn: 'Nakamoto Rule: Heaviest Chain Always Wins',
      descVi:
        'Khi xảy ra phân nhánh do độ trễ mạng, mạng giải quyết bằng quy tắc công việc tích lũy (Cumulative PoW). Nhánh nào nhận được nhiều sức mạnh băm tiếp nối hơn sẽ trở thành chuỗi chính thức.',
      descEn:
        'When network latency causes accidental forks, Nakamoto consensus resolves it naturally: the branch with the highest cumulative work becomes canonical.',
    },
    7: {
      titleVi: 'Tính bất biến của sổ cái & Con trỏ băm (Hash Pointer)',
      titleEn: 'Ledger Immutability & Hash Pointer Chaining',
      descVi:
        'Mỗi khối lưu trữ mã băm của khối trước đó. Muốn sửa đổi 1 giao dịch trong quá khứ, kẻ tấn công buộc phải đào lại toàn bộ các khối phía sau nhanh hơn cả 100% mạng lưới cộng lại.',
      descEn:
        'Each block cryptographically locks the previous hash. Tampering with past data breaks all subsequent pointers, requiring re-mining the entire chain.',
    },
    8: {
      titleVi: 'Tính minh bạch toàn phần & Nhật ký kiểm toán',
      titleEn: 'Full Transparency & Cryptographic Audit Trails',
      descVi:
        'Nhật ký sự kiện lưu lại toàn bộ dòng thời gian phát sinh của mạng. Bất kỳ ai cũng có thể tự chạy node để kiểm chứng toàn bộ lịch sử từ khối Genesis mà không cần đặt niềm tin vào bất kỳ ai.',
      descEn:
        'Telemetry event logs record complete timeline history. Anyone can verify the whole ledger from Genesis without trusting any authority.',
    },
  };

  const insight = insights[currentStep] || insights[1];

  return (
    <div
      id="e2e-educational-insight-banner"
      className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-3 text-xs font-sans animate-in fade-in duration-300"
    >
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
        <Lightbulb className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-emerald-300 text-xs flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{language === 'vi' ? insight.titleVi : insight.titleEn}</span>
        </h5>
        <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
          {language === 'vi' ? insight.descVi : insight.descEn}
        </p>
      </div>
    </div>
  );
};
