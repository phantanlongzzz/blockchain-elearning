/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useProgressStore } from '../stores/progressStore';
import { useSimulationStore } from '../stores/simulationStore';


export type ModuleId = 'home' | 'hash' | 'theory' | 'simulation' | 'blockchain';

export type LessonId =
  // Home
  | 'overview'
  // Hash
  | 'generator'
  | 'properties'
  | 'avalanche'
  | 'pipeline'
  | 'experiment'
  // Theory
  | 'data-structures'
  | 'block-architecture'
  | 'decentralization'
  | 'consensus-evolution'
  // Simulation
  | 'transactions'
  | 'transaction-lifecycle'
  | 'proof-of-work'
  | 'proof-of-stake'
  | 'end-to-end'
  // Blockchain
  | 'ledger'
  | 'merkle-tree'
  | 'quiz'
  | 'academic';

export interface LessonMeta {
  id: LessonId;
  moduleId: ModuleId;
  titleVi: string;
  titleEn: string;
  shortTitleVi: string;
  shortTitleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  badge?: string;
  estimatedMinutes: number;
  iconName: string;
}

export interface ModuleMeta {
  id: ModuleId;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  iconName: string;
  lessons: LessonMeta[];
}

export const MODULES_REGISTRY: ModuleMeta[] = [
  {
    id: 'home',
    titleVi: 'Trang chủ',
    titleEn: 'Home',
    descriptionVi: 'Giới thiệu tổng quan & Thử nghiệm trực tiếp SHA-256',
    descriptionEn: 'Introduction & Live SHA-256 Playground',
    iconName: 'Home',
    lessons: [
      {
        id: 'overview',
        moduleId: 'home',
        titleVi: '0.1 Tổng quan Nền tảng & Thử nghiệm SHA-256',
        titleEn: '0.1 Platform Overview & Interactive SHA-256 Sandbox',
        shortTitleVi: 'Tổng quan & Khởi động',
        shortTitleEn: 'Overview & Demo',
        descriptionVi: 'Trải nghiệm nhập liệu thời gian thực và xem mã băm SHA-256 thay đổi ngay lập tức.',
        descriptionEn: 'Type real-time text and watch the 256-bit hash transform instantly.',
        estimatedMinutes: 3,
        iconName: 'Sparkles',
      },
    ],
  },
  {
    id: 'hash',
    titleVi: 'Hash',
    titleEn: 'Hash',
    descriptionVi: 'Mã hóa, Hàm băm Mật mã học & Phòng thực nghiệm 64 vòng băm',
    descriptionEn: 'Cryptography, Hash Functions & 64-Round Pipeline Lab',
    iconName: 'Cpu',
    lessons: [
      {
        id: 'generator',
        moduleId: 'hash',
        titleVi: '1.1 Trình tạo Hash SHA-256 & Tính Đơn Ánh',
        titleEn: '1.1 SHA-256 Hash Generator & Determinism',
        shortTitleVi: 'Trình tạo SHA-256',
        shortTitleEn: 'SHA-256 Generator',
        descriptionVi: 'Khám phá tính chất xác định: Cùng một đầu vào luôn tạo ra đúng 64 ký tự hex.',
        descriptionEn: 'Explore determinism: identical inputs always produce exact 64 hex characters.',
        estimatedMinutes: 5,
        iconName: 'Cpu',
      },
      {
        id: 'properties',
        moduleId: 'hash',
        titleVi: '1.2 5 Đặc tính Mật mã học Cốt lõi',
        titleEn: '1.2 Five Core Cryptographic Properties',
        shortTitleVi: '5 Đặc tính Mật mã',
        shortTitleEn: '5 Properties',
        descriptionVi: 'Tính toán nhanh, Tính đơn hướng, Kháng tiền ảnh, Kháng va chạm & Hiệu ứng thác lũ.',
        descriptionEn: 'One-way, Pre-image resistance, Collision resistance & Determinism.',
        estimatedMinutes: 6,
        iconName: 'Sparkles',
      },
      {
        id: 'avalanche',
        moduleId: 'hash',
        titleVi: '1.3 Hiệu ứng Thác Lũ (Avalanche Effect)',
        titleEn: '1.3 Avalanche Effect (Bit-Level Diffing)',
        shortTitleVi: 'Hiệu ứng Thác lũ',
        shortTitleEn: 'Avalanche Effect',
        descriptionVi: 'Thay đổi chỉ 1 bit đầu vào làm thay đổi ~50% toàn bộ 256 bit đầu ra.',
        descriptionEn: 'Changing a single input bit inverts ~50% of the entire 256-bit output array.',
        estimatedMinutes: 7,
        iconName: 'GitCompare',
      },
      {
        id: 'pipeline',
        moduleId: 'hash',
        titleVi: '1.4 Pipeline Nội bộ 64 Vòng Băm (NIST FIPS 180-4)',
        titleEn: '1.4 Internal 64-Round Compression Pipeline',
        shortTitleVi: 'Pipeline 64 Vòng',
        shortTitleEn: '64-Round Pipeline',
        descriptionVi: 'Quan sát chi tiết 8 thanh ghi A-H, các hàm Ch, Maj, Sigma và hằng số vòng Kt.',
        descriptionEn: 'Inspect working registers A-H, logical functions, and round schedule Wt.',
        estimatedMinutes: 10,
        iconName: 'Layers',
      },
      {
        id: 'experiment',
        moduleId: 'hash',
        titleVi: '1.5 Phòng Thí nghiệm Băm Nâng cao (Brute-Force & Collision)',
        titleEn: '1.5 Advanced Hash Lab (Brute-Force & Collision)',
        shortTitleVi: 'Thử sai Vét cạn',
        shortTitleEn: 'Advanced Lab',
        descriptionVi: 'Thử thách tìm tiền ảnh bằng vét cạn và mô phỏng tấn công ngày sinh nhật (Birthday Attack).',
        descriptionEn: 'Challenge preimage search via brute-force and birthday collision simulations.',
        estimatedMinutes: 8,
        iconName: 'FlaskConical',
      },
    ],
  },
  {
    id: 'theory',
    titleVi: 'Lý thuyết',
    titleEn: 'Theory',
    descriptionVi: 'Cơ sở Dữ liệu, Cấu trúc Khối, Mạng Phi tập trung & Đồng thuận',
    descriptionEn: 'Data Structures, Block Architecture, Decentralization & Consensus',
    iconName: 'BookOpen',
    lessons: [
      {
        id: 'data-structures',
        moduleId: 'theory',
        titleVi: '2.1 Cấu trúc Dữ liệu Nền tảng',
        titleEn: '2.1 Foundational Data Structures',
        shortTitleVi: 'Cấu trúc Nền tảng',
        shortTitleEn: 'Data Structures',
        descriptionVi: 'So sánh con trỏ bộ nhớ (RAM Pointers) với con trỏ mật mã học (Hash Pointers).',
        descriptionEn: 'Compare classical RAM memory pointers with cryptographic hash pointers.',
        estimatedMinutes: 6,
        iconName: 'ListTree',
      },
      {
        id: 'block-architecture',
        moduleId: 'theory',
        titleVi: '2.2 Kiến trúc Khối & Vòng đời Khối',
        titleEn: '2.2 Block Anatomy & Lifecycle',
        shortTitleVi: 'Kiến trúc Khối',
        shortTitleEn: 'Block Anatomy',
        descriptionVi: 'Mổ xẻ chi tiết Block Header, Merkle Root, Nonce, Difficulty Target và Transaction Body.',
        descriptionEn: 'Dissect Block Header, Merkle Root, Nonce, Target and Transaction Payload.',
        estimatedMinutes: 8,
        iconName: 'Boxes',
      },
      {
        id: 'decentralization',
        moduleId: 'theory',
        titleVi: '2.3 Sự tiến hóa Mạng: Tập trung → Phân tán → Phi tập trung',
        titleEn: '2.3 Network Evolution: Centralized → Distributed → Decentralized',
        shortTitleVi: 'Mạng Phi tập trung',
        shortTitleEn: 'Decentralization',
        descriptionVi: 'Mô phỏng khả năng chịu lỗi và điểm nghẽn đơn lẻ (Single Point of Failure).',
        descriptionEn: 'Simulate fault tolerance, partition resilience and zero single points of failure.',
        estimatedMinutes: 7,
        iconName: 'Coins',
      },
      {
        id: 'consensus-evolution',
        moduleId: 'theory',
        titleVi: '2.4 Tiến hóa Cơ chế Đồng thuận & Bài toán Tướng Byzantine',
        titleEn: '2.4 Consensus Evolution & Byzantine Generals Problem',
        shortTitleVi: 'Tiến hóa Đồng thuận',
        shortTitleEn: 'Consensus Evolution',
        descriptionVi: 'Thực hành thuật toán OM(1), nút phản bội (Traitor Nodes) và lịch sử phát triển PoW/PoS.',
        descriptionEn: 'Interactive OM(1) Byzantine agreement, traitor nodes, and PoW vs PoS foundations.',
        estimatedMinutes: 10,
        iconName: 'Network',
      },
    ],
  },
  {
    id: 'simulation',
    titleVi: 'Mô phỏng',
    titleEn: 'Simulation',
    descriptionVi: 'Phòng Thực nghiệm Khai thác PoW, Đặt cọc PoS & Đồng thuận Toàn trình',
    descriptionEn: 'Multi-threaded PoW Mining, PoS Staking & End-to-End Consensus Arena',
    iconName: 'FlaskConical',
    lessons: [
      {
        id: 'transactions',
        moduleId: 'simulation',
        titleVi: '3.1 Xác thực Giao dịch, Cặp Khóa ECDSA & Mempool',
        titleEn: '3.1 Transaction Verification, ECDSA Keypairs & Mempool',
        shortTitleVi: 'Xác thực & Mempool',
        shortTitleEn: 'Transactions & Mempool',
        descriptionVi: 'Tạo cặp khóa công khai/bí mật, ký số giao dịch và kiểm tra hàng đợi Mempool.',
        descriptionEn: 'Generate public/private keypairs, sign digital payloads, and manage mempools.',
        estimatedMinutes: 8,
        iconName: 'CheckCircle2',
      },
      {
        id: 'transaction-lifecycle',
        moduleId: 'simulation',
        titleVi: '3.2 Vòng đời Giao dịch UTXO Toàn trình',
        titleEn: '3.2 End-to-End UTXO Transaction Lifecycle',
        shortTitleVi: 'Vòng đời Giao dịch UTXO',
        shortTitleEn: 'UTXO Transaction Lifecycle',
        descriptionVi: 'Mô phỏng trực quan hành trình từ UTXO, Mempool, Cây Merkle đến khi khối gia nhập Blockchain.',
        descriptionEn: 'Visual journey of a transaction from UTXO, Mempool, Merkle Tree to Blockchain inclusion.',
        estimatedMinutes: 15,
        iconName: 'Activity',
      },
      {
        id: 'proof-of-work',
        moduleId: 'simulation',
        titleVi: '3.3 Phòng Khai thác Proof of Work (Đa luồng Web Workers & Longest Chain)',
        titleEn: '3.3 Proof of Work Mining Arena (Multi-threaded Web Workers & Longest Chain)',
        shortTitleVi: 'Khai thác PoW Đa luồng',
        shortTitleEn: 'PoW Mining Arena',
        descriptionVi: 'Cuộc đua đào khối thời gian thực liên tục, phân nhánh chuỗi (Fork) và quy tắc chuỗi dài nhất.',
        descriptionEn: 'Real-time multi-block continuous mining race, chain forks, and longest chain rule.',
        estimatedMinutes: 12,
        iconName: 'Pickaxe',
      },
      {
        id: 'proof-of-stake',
        moduleId: 'simulation',
        titleVi: '3.4 Phòng Đặt cọc Proof of Stake (Validators, Slots & Slashing)',
        titleEn: '3.4 Proof of Stake Staking Lab (Validators, Slots & Slashing)',
        shortTitleVi: 'Đặt cọc PoS',
        shortTitleEn: 'PoS Staking Lab',
        descriptionVi: 'Mô phỏng bầu chọn Validator theo tỷ lệ Stake, phần thưởng khối và cơ chế phạt Slashing.',
        descriptionEn: 'Simulate stake-weighted validator election, block rewards, and slashing penalties.',
        estimatedMinutes: 8,
        iconName: 'Award',
      },
      {
        id: 'end-to-end',
        moduleId: 'simulation',
        titleVi: '3.4 Mô phỏng Đồng thuận Toàn trình End-to-End (Mempool → Finality)',
        titleEn: '3.5 End-to-End Consensus Pipeline (Mempool → Finality)',
        shortTitleVi: 'Đồng thuận Toàn trình',
        shortTitleEn: 'End-to-End Consensus',
        descriptionVi: 'Quy trình 5 bước: Phát sinh → Mempool → Đua Worker → Đóng gói → Sổ cái.',
        descriptionEn: 'Full 5-phase execution: Broadcast → Mempool → Worker Race → Block Assembly → Finality.',
        estimatedMinutes: 15,
        iconName: 'Layers',
      },
    ],
  },
  {
    id: 'blockchain',
    titleVi: 'Blockchain',
    titleEn: 'Blockchain',
    descriptionVi: 'Sổ cái Chuỗi khối, Cây Merkle & Trung tâm Đánh giá Chứng chỉ',
    descriptionEn: 'Ledger Visualizer, Merkle Trees & Assessment Certification Hub',
    iconName: 'Boxes',
    lessons: [
      {
        id: 'ledger',
        moduleId: 'blockchain',
        titleVi: '4.1 Khám phá Trực quan Chuỗi Khối & Cơ chế Tamper-and-Heal',
        titleEn: '4.1 Interactive Blockchain Ledger & Tamper-and-Heal Cascade',
        shortTitleVi: 'Sổ cái Chuỗi khối',
        shortTitleEn: 'Blockchain Ledger',
        descriptionVi: 'Chuỗi 5 khối liên kết mật mã. Thử sửa đổi dữ liệu khối cũ để thấy toàn chuỗi bị vô hiệu.',
        descriptionEn: '5-block cryptographic chain. Tamper with past data to trigger cascading invalidation.',
        estimatedMinutes: 8,
        iconName: 'Boxes',
      },
      {
        id: 'merkle-tree',
        moduleId: 'blockchain',
        titleVi: '4.2 Cây Merkle Động & Bằng chứng Xác thực Merkle Proof',
        titleEn: '4.2 Dynamic Merkle Tree & Merkle Proof Audit Trail',
        shortTitleVi: 'Cây Merkle & Proof',
        shortTitleEn: 'Merkle Tree Lab',
        descriptionVi: 'Xây dựng cây Merkle nhị phân từ giao dịch và kiểm tra tính toàn vẹn với độ phức tạp O(log N).',
        descriptionEn: 'Construct binary Merkle trees and verify transaction inclusion in O(log N) steps.',
        estimatedMinutes: 9,
        iconName: 'GitFork',
      },
      {
        id: 'quiz',
        moduleId: 'blockchain',
        titleVi: '4.3 Trung tâm Đánh giá & Thi Trắc nghiệm (Quiz Hub)',
        titleEn: '4.3 Assessment Center & Certification Quiz Hub',
        shortTitleVi: 'Thi Trắc nghiệm & Chứng chỉ',
        shortTitleEn: 'Quiz & Certificate',
        descriptionVi: 'Ngân hàng đề trắc nghiệm có bấm giờ, giải thích chi tiết và cấp chứng chỉ hoàn thành.',
        descriptionEn: 'Timed multiple-choice exam bank with comprehensive rationales and certificates.',
        estimatedMinutes: 15,
        iconName: 'GraduationCap',
      },
      {
        id: 'academic',
        moduleId: 'blockchain',
        titleVi: '4.4 Ngân hàng Câu hỏi Học thuật, Đề tài Nghiên cứu & Tác giả',
        titleEn: '4.4 Academic Syllabus Q&A, Research Details & Author Profile',
        shortTitleVi: 'Học thuật & Tác giả',
        shortTitleEn: 'Academic & Credits',
        descriptionVi: 'Hỏi đáp giáo trình Đại học Đà Lạt, thông tin nghiên cứu khoa học và hồ sơ tác giả.',
        descriptionEn: 'University curriculum FAQ, research methodology and author credits.',
        estimatedMinutes: 5,
        iconName: 'HelpCircle',
      },
    ],
  },
];

// Linear flat list of all lessons for sequential next/prev navigation
export const ALL_LESSONS_FLAT: LessonMeta[] = MODULES_REGISTRY.flatMap((m) => m.lessons);

interface NavigationContextType {
  currentModuleId: ModuleId;
  currentLessonId: LessonId;
  currentModule: ModuleMeta;
  currentLesson: LessonMeta;
  currentLessonIndex: number;
  totalLessons: number;
  progressPercent: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  nextLessonMeta: LessonMeta | null;
  prevLessonMeta: LessonMeta | null;
  navigateTo: (moduleId: ModuleId, lessonId?: LessonId) => void;
  nextLesson: () => void;
  prevLesson: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

function parseHash(hashStr: string): { moduleId: ModuleId; lessonId: LessonId } {
  // Strip leading '#' or '#/'
  const cleaned = hashStr.replace(/^#\/?/, '').trim();
  if (!cleaned) {
    return { moduleId: 'home', lessonId: 'overview' };
  }

  const parts = cleaned.split('/').filter(Boolean);
  const rawMod = parts[0] as ModuleId;
  const rawLesson = parts[1] as LessonId;

  // Check if valid module
  const matchedMod = MODULES_REGISTRY.find((m) => m.id === rawMod);
  if (!matchedMod) {
    // Check if user passed a legacy section ID like #hash-generator or #proof-of-work
    for (const mod of MODULES_REGISTRY) {
      const matchedLesson = mod.lessons.find((l) => (l.id as string) === cleaned || (l.id as string) === rawMod);
      if (matchedLesson) {
        return { moduleId: mod.id, lessonId: matchedLesson.id };
      }
    }
    return { moduleId: 'home', lessonId: 'overview' };
  }

  // Check if valid lesson in this module
  if (rawLesson) {
    const matchedLesson = matchedMod.lessons.find((l) => l.id === rawLesson);
    if (matchedLesson) {
      return { moduleId: matchedMod.id, lessonId: matchedLesson.id };
    }
  }

  // Default to first lesson of module
  return { moduleId: matchedMod.id, lessonId: matchedMod.lessons[0].id };
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routeState, setRouteState] = useState<{ moduleId: ModuleId; lessonId: LessonId }>(() => {
    if (typeof window !== 'undefined') {
      return parseHash(window.location.hash);
    }
    return { moduleId: 'home', lessonId: 'overview' };
  });

  // Listen to browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      setRouteState(parsed);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync route changes: record visited lesson in progressStore & reset ephemeral simulationStore
  useEffect(() => {
    if (routeState.lessonId) {
      useProgressStore.getState().markLessonVisited(routeState.lessonId);
      useSimulationStore.getState().resetSimulationState();
    }
  }, [routeState.lessonId]);

  // Update hash when routeState changes programmatically
  const navigateTo = useCallback((moduleId: ModuleId, lessonId?: LessonId) => {
    const targetMod = MODULES_REGISTRY.find((m) => m.id === moduleId) || MODULES_REGISTRY[0];
    const targetLessonId =
      lessonId && targetMod.lessons.some((l) => l.id === lessonId)
        ? lessonId
        : targetMod.lessons[0].id;

    const newHash = `#/${moduleId}/${targetLessonId}`;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    setRouteState({ moduleId, lessonId: targetLessonId });

    // Scroll smoothly to top of main workspace on lesson change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Find active metadata
  const currentModule = useMemo(() => {
    return MODULES_REGISTRY.find((m) => m.id === routeState.moduleId) || MODULES_REGISTRY[0];
  }, [routeState.moduleId]);

  const currentLesson = useMemo(() => {
    return (
      currentModule.lessons.find((l) => l.id === routeState.lessonId) ||
      currentModule.lessons[0] ||
      ALL_LESSONS_FLAT[0]
    );
  }, [currentModule, routeState.lessonId]);

  // Index in flat curriculum
  const currentLessonIndex = useMemo(() => {
    const idx = ALL_LESSONS_FLAT.findIndex((l) => l.id === currentLesson.id);
    return idx >= 0 ? idx : 0;
  }, [currentLesson.id]);

  const totalLessons = ALL_LESSONS_FLAT.length;
  const progressPercent = Math.round(((currentLessonIndex + 1) / totalLessons) * 100);

  const canGoPrev = currentLessonIndex > 0;
  const canGoNext = currentLessonIndex < totalLessons - 1;

  const prevLessonMeta = canGoPrev ? ALL_LESSONS_FLAT[currentLessonIndex - 1] : null;
  const nextLessonMeta = canGoNext ? ALL_LESSONS_FLAT[currentLessonIndex + 1] : null;

  const nextLesson = useCallback(() => {
    if (canGoNext && nextLessonMeta) {
      navigateTo(nextLessonMeta.moduleId, nextLessonMeta.id);
    }
  }, [canGoNext, nextLessonMeta, navigateTo]);

  const prevLesson = useCallback(() => {
    if (canGoPrev && prevLessonMeta) {
      navigateTo(prevLessonMeta.moduleId, prevLessonMeta.id);
    }
  }, [canGoPrev, prevLessonMeta, navigateTo]);

  const contextValue = useMemo<NavigationContextType>(
    () => ({
      currentModuleId: currentModule.id,
      currentLessonId: currentLesson.id,
      currentModule,
      currentLesson,
      currentLessonIndex,
      totalLessons,
      progressPercent,
      canGoNext,
      canGoPrev,
      nextLessonMeta,
      prevLessonMeta,
      navigateTo,
      nextLesson,
      prevLesson,
    }),
    [
      currentModule,
      currentLesson,
      currentLessonIndex,
      totalLessons,
      progressPercent,
      canGoNext,
      canGoPrev,
      nextLessonMeta,
      prevLessonMeta,
      navigateTo,
      nextLesson,
      prevLesson,
    ]
  );

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
