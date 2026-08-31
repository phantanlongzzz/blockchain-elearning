/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Cpu,
  Boxes,
  Pickaxe,
  Award,
  GitFork,
  Layers,
  Network,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation, ModuleId, LessonId } from '../context/NavigationContext';

export interface PaletteItem {
  id: string;
  moduleId: ModuleId;
  lessonId: LessonId;
  titleVi: string;
  titleEn: string;
  categoryVi: string;
  categoryEn: string;
  descriptionVi: string;
  descriptionEn: string;
  keywords: string[];
  icon: React.ElementType;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { navigateTo } = useNavigation();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const items: PaletteItem[] = useMemo(
    () => [
      {
        id: 'hash-generator',
        moduleId: 'hash',
        lessonId: 'generator',
        titleVi: 'Trình tạo SHA-256 (Tính đơn ánh)',
        titleEn: 'SHA-256 Hash Generator (Determinism)',
        categoryVi: 'Mật mã học & Hash',
        categoryEn: 'Cryptography & Hash',
        descriptionVi: 'Nhập dữ liệu bất kỳ và tính toán mã băm 256-bit chuẩn NIST FIPS 180-4.',
        descriptionEn: 'Type arbitrary text and compute 256-bit cryptographic digest.',
        keywords: ['hash', 'sha256', 'sha-256', 'ma bam', 'bam', 'generator', 'digest'],
        icon: Cpu,
      },
      {
        id: 'hash-properties',
        moduleId: 'hash',
        lessonId: 'properties',
        titleVi: 'Tính chất Hàm băm (1 chiều & Kháng tiền ảnh)',
        titleEn: 'Cryptographic Hash Properties (One-Way & Pre-image)',
        categoryVi: 'Mật mã học & Hash',
        categoryEn: 'Cryptography & Hash',
        descriptionVi: 'Khám phá tính một chiều, kháng va chạm và tính xác định.',
        descriptionEn: 'Explore one-way, collision resistance, and determinism.',
        keywords: ['hash', 'properties', 'tinh chat', '1 chieu', 'preimage', 'collision'],
        icon: Sparkles,
      },
      {
        id: 'hash-avalanche',
        moduleId: 'hash',
        lessonId: 'avalanche',
        titleVi: 'Hiệu ứng Thác đổ (Avalanche Effect)',
        titleEn: 'Avalanche Effect (Bit-diff Analysis)',
        categoryVi: 'Mật mã học & Hash',
        categoryEn: 'Cryptography & Hash',
        descriptionVi: 'Thay đổi 1 bit đầu vào làm thay đổi ~50% bit băm đầu ra.',
        descriptionEn: '1-bit input flip flips ~50% of the output digest bits.',
        keywords: ['avalanche', 'thac do', 'bit diff', 'hamming', 'diffusion'],
        icon: Cpu,
      },
      {
        id: 'hash-pipeline',
        moduleId: 'hash',
        lessonId: 'pipeline',
        titleVi: 'Quy trình 64 Vòng băm SHA-256',
        titleEn: '64-Round SHA-256 Pipeline Execution',
        categoryVi: 'Mật mã học & Hash',
        categoryEn: 'Cryptography & Hash',
        descriptionVi: 'Giải mã chi tiết 64 vòng nén với các hàm logic Ch, Maj, Sigma0, Sigma1.',
        descriptionEn: 'Step through 64 compression rounds with bitwise operators.',
        keywords: ['pipeline', '64 vong', 'rounds', 'compression', 'schedule', 'w', 'k'],
        icon: Cpu,
      },
      {
        id: 'merkle-tree',
        moduleId: 'blockchain',
        lessonId: 'merkle-tree',
        titleVi: 'Cây Merkle (Merkle Tree & Merkle Proof)',
        titleEn: 'Dynamic Merkle Tree & Inclusion Proof',
        categoryVi: 'Cấu trúc Dữ liệu',
        categoryEn: 'Data Structures',
        descriptionVi: 'Cấu trúc cây nhị phân băm và kiểm tra bằng chứng xác thực với O(log N).',
        descriptionEn: 'Binary hash tree structure and cryptographic membership proof.',
        keywords: ['merkle', 'tree', 'cay merkle', 'merkle root', 'proof', 'bang chung'],
        icon: GitFork,
      },
      {
        id: 'blockchain-ledger',
        moduleId: 'blockchain',
        lessonId: 'ledger',
        titleVi: 'Sổ cái Chuỗi khối & Mô phỏng Tấn công',
        titleEn: 'Blockchain Ledger & Tamper Cascade Lab',
        categoryVi: 'Chuỗi khối',
        categoryEn: 'Blockchain',
        descriptionVi: 'Mô phỏng 5 khối liên kết mật mã, tấn công sửa dữ liệu và phục hồi chuỗi.',
        descriptionEn: '5-block cryptographic chain, historical tampering and re-mining cascade.',
        keywords: ['blockchain', 'so cai', 'ledger', 'chuoi khoi', 'block', 'tamper', 'tan cong', 'dao lai'],
        icon: Boxes,
      },
      {
        id: 'network-centralized',
        moduleId: 'theory',
        lessonId: 'decentralization',
        titleVi: 'Mô hình Mạng Tập trung (Centralized)',
        titleEn: 'Centralized Star Network Model',
        categoryVi: 'Mô hình Mạng',
        categoryEn: 'Network Topologies',
        descriptionVi: 'Máy chủ trung tâm điều phối tất cả các máy khách, điểm lỗi đơn (SPOF).',
        descriptionEn: 'Single central server coordinating all clients, single point of failure.',
        keywords: ['tap trung', 'centralized', 'star', 'server', 'may chu trung tam', 'mang tap trung'],
        icon: Network,
      },
      {
        id: 'network-distributed',
        moduleId: 'theory',
        lessonId: 'decentralization',
        titleVi: 'Mô hình Mạng Phân tán (Distributed)',
        titleEn: 'Distributed Worker Coordination Model',
        categoryVi: 'Mô hình Mạng',
        categoryEn: 'Network Topologies',
        descriptionVi: 'Nhiều nút xử lý chia sẻ tải trọng dưới quyền điều phối, chịu lỗi tốt.',
        descriptionEn: 'Multiple worker nodes sharing workload with dynamic failover.',
        keywords: ['phan tan', 'distributed', 'worker', 'dieu phoi', 'failover', 'mang phan tan'],
        icon: Network,
      },
      {
        id: 'network-decentralized',
        moduleId: 'theory',
        lessonId: 'decentralization',
        titleVi: 'Mô hình Mạng Phi tập trung (Decentralized P2P)',
        titleEn: 'Decentralized Peer-to-Peer Mesh Model',
        categoryVi: 'Mô hình Mạng',
        categoryEn: 'Network Topologies',
        descriptionVi: 'Mạng ngang hàng không có cơ quan trung ương, định tuyến lại tự động.',
        descriptionEn: 'P2P mesh topology without central authority, self-healing routing.',
        keywords: ['phi tap trung', 'decentralized', 'p2p', 'peer', 'mesh', 'mang phi tap trung'],
        icon: Network,
      },
      {
        id: 'proof-of-work',
        moduleId: 'simulation',
        lessonId: 'proof-of-work',
        titleVi: 'Đồng thuận Proof of Work (Khai thác & Nonce)',
        titleEn: 'Proof of Work Consensus (Mining Race & Nonce)',
        categoryVi: 'Cơ chế Đồng thuận',
        categoryEn: 'Consensus Mechanisms',
        descriptionVi: 'Cuộc đua đào khối của các máy đào (Miners), độ khó động và quy tắc chuỗi dài nhất.',
        descriptionEn: 'Miner hash race, dynamic difficulty target, and longest chain rule.',
        keywords: ['pow', 'proof of work', 'mining', 'dao khoi', 'miner', 'nonce', 'do kho', 'difficulty'],
        icon: Pickaxe,
      },
      {
        id: 'proof-of-stake',
        moduleId: 'simulation',
        lessonId: 'proof-of-stake',
        titleVi: 'Đồng thuận Proof of Stake (Đặt cọc & Validator)',
        titleEn: 'Proof of Stake Consensus (Staking & Slashing)',
        categoryVi: 'Cơ chế Đồng thuận',
        categoryEn: 'Consensus Mechanisms',
        descriptionVi: 'Cơ chế chọn người kiểm định theo cổ phần, phần thưởng và hình phạt Slashing.',
        descriptionEn: 'Stake-weighted validator selection, slot proposals, and slashing penalty.',
        keywords: ['pos', 'proof of stake', 'stake', 'dat coc', 'validator', 'slashing', 'slot'],
        icon: Award,
      },
      {
        id: 'end-to-end',
        moduleId: 'simulation',
        lessonId: 'end-to-end',
        titleVi: 'Mô phỏng Đồng thuận Toàn trình (Mempool → Sổ cái)',
        titleEn: 'End-to-End Consensus Pipeline (Mempool → Finality)',
        categoryVi: 'Quy trình Toàn trình',
        categoryEn: 'End-to-End Pipeline',
        descriptionVi: '5 giai đoạn hoàn chỉnh: Phát sinh → Mempool → Đua Worker → Đóng gói → Sổ cái.',
        descriptionEn: 'Full 5-phase execution: Broadcast → Mempool → Worker Race → Assembly → Finality.',
        keywords: ['end to end', 'toan trinh', 'mempool', 'giao dich', 'finality', 'dong thuan'],
        icon: Layers,
      },
      {
        id: 'quiz-hub',
        moduleId: 'blockchain',
        lessonId: 'quiz',
        titleVi: 'Trung tâm Đánh giá & Thi Trắc nghiệm',
        titleEn: 'Assessment Center & Certification Quiz',
        categoryVi: 'Đánh giá & Chứng chỉ',
        categoryEn: 'Assessment & Certificate',
        descriptionVi: 'Ngân hàng câu hỏi trắc nghiệm bấm giờ và cấp chứng chỉ trực tuyến.',
        descriptionEn: 'Timed multi-choice assessment bank and completion certificates.',
        keywords: ['quiz', 'thi', 'trac nghiem', 'chung chi', 'certificate', 'test', 'kiem tra'],
        icon: GraduationCap,
      },
      {
        id: 'academic-syllabus',
        moduleId: 'blockchain',
        lessonId: 'academic',
        titleVi: 'Ngân hàng Câu hỏi Học thuật & Nghiên cứu',
        titleEn: 'Academic Syllabus Q&A & Research Details',
        categoryVi: 'Học thuật & Đề tài',
        categoryEn: 'Academic & Syllabus',
        descriptionVi: 'Đề cương học phần, hỏi đáp học thuật chuyên sâu và thông tin tác giả.',
        descriptionEn: 'Curriculum syllabus, academic Q&A, and project credits.',
        keywords: ['academic', 'hoc thuat', 'nghien cuu', 'de cuong', 'phan tan long', 'dai hoc da lat', 'dlu'],
        icon: BookOpen,
      },
    ],
    []
  );

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      const matchTitle = (item.titleVi + ' ' + item.titleEn).toLowerCase().includes(q);
      const matchDesc = (item.descriptionVi + ' ' + item.descriptionEn).toLowerCase().includes(q);
      const matchCategory = (item.categoryVi + ' ' + item.categoryEn).toLowerCase().includes(q);
      const matchKeyword = item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCategory || matchKeyword;
    });
  }, [items, query]);

  // Reset selectedIndex when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  // Navigation handler
  const handleSelectItem = useCallback(
    (item: PaletteItem) => {
      onClose();
      navigateTo(item.moduleId, item.lessonId);
    },
    [navigateTo, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Body scroll locking and focus lifecycle management
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      setQuery('');
      setSelectedIndex(0);

      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Restore focus when closing
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function'
      ) {
        previousActiveElementRef.current.focus();
      }
    }
  }, [isOpen, triggerRef]);

  // Keyboard navigation inside Palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelectItem(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelectItem, onClose]);

  // Tab key focus trap inside modal dialog
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isVi ? 'Bảng lệnh điều hướng' : 'Command Palette'}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onKeyDown={handleDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[680px] max-w-[calc(100vw-32px)] bg-[#0C0F14] border border-[#1C2430] rounded-xl shadow-2xl overflow-hidden text-[#F2F4F7] flex flex-col max-h-[70vh] animate-palette-in"
      >
        {/* Search Input Bar & Close Button */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1C2430] bg-[#090A0F] gap-3 shrink-0">
          <Search className="w-4 h-4 text-[#00C98D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isVi
                ? 'Tìm kiếm bài học, cơ chế đồng thuận, mã băm...'
                : 'Search lessons, consensus mechanisms, hashing...'
            }
            className="w-full bg-transparent text-sm text-[#F2F4F7] placeholder-[#717B8C] focus:outline-none font-sans"
            aria-label={isVi ? 'Tìm kiếm bài học' : 'Search lessons'}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-[#717B8C] hover:text-[#F2F4F7] hover:bg-[#11161E] cursor-pointer transition-colors"
              title={isVi ? 'Xóa nội dung' : 'Clear input'}
              aria-label={isVi ? 'Xóa nội dung' : 'Clear input'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close "×" Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#717B8C] hover:text-[#F2F4F7] hover:bg-[#11161E] transition-colors cursor-pointer shrink-0 ml-0.5"
            title={isVi ? 'Đóng' : 'Close'}
            aria-label={isVi ? 'Đóng' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="overflow-y-auto p-2 space-y-1 flex-1 max-h-[calc(70vh-120px)] scrollbar-thin"
          role="listbox"
          aria-label={isVi ? 'Danh sách kết quả' : 'Search results'}
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#717B8C] text-xs font-sans">
              {isVi ? 'Không tìm thấy kết quả phù hợp' : 'No matching laboratory module found'}
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg text-left transition-colors cursor-pointer group font-sans ${
                    isSelected
                      ? 'bg-[#11161E] text-white border border-[#1C2430] shadow-sm'
                      : 'hover:bg-[#0F131A] text-[#A5AFBF] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#00C98D]/20 text-[#00C98D] border border-[#00C98D]/30'
                          : 'bg-[#0F131A] text-[#717B8C] border border-[#1C2430]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-[#F2F4F7] truncate">
                          {isVi ? item.titleVi : item.titleEn}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#090A0F] border border-[#1C2430] text-[#717B8C] font-mono shrink-0">
                          {isVi ? item.categoryVi : item.categoryEn}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717B8C] truncate mt-0.5">
                        {isVi ? item.descriptionVi : item.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-[#00C98D] translate-x-0.5 opacity-100'
                        : 'text-[#717B8C] opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Navigation Instructions */}
        <div className="px-4 py-2.5 bg-[#090A0F] border-t border-[#1C2430] flex items-center justify-between text-[11px] text-[#717B8C] font-sans shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#0C0F14] border border-[#1C2430] rounded font-mono text-[10px]">↑↓</kbd>
              <span>{isVi ? 'Điều hướng' : 'Navigate'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#0C0F14] border border-[#1C2430] rounded font-mono text-[10px]">↵</kbd>
              <span>{isVi ? 'Chọn' : 'Select'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#0C0F14] border border-[#1C2430] rounded font-mono text-[10px]">ESC</kbd>
              <span>{isVi ? 'Đóng' : 'Close'}</span>
            </span>
          </div>

          <span className="text-[#717B8C] font-mono text-[10px]">
            {filteredItems.length} {isVi ? 'mục' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
};
