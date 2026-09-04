import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { PoSValidator } from '../../types';
import { ValidatorDashboard } from './ValidatorDashboard';
import { StakeDistributionBar } from './StakeDistributionBar';
import { ConsensusAttestationArena } from './ConsensusAttestationArena';
import { SimulationTimeline } from './SimulationTimeline';
import { PoSTerminologyBar } from './PoSTerminologyBar';
import { PoSHelpModal } from './PoSHelpModal';
import { PoSWhyAccordion } from './PoSWhyAccordion';
import { PoWVsPoSComparison } from './PoWVsPoSComparison';
import { PoSCodeModal } from './PoSCodeModal';
import { GuideStep, SimulationQuestions } from '../common/SimulationGuidePanel';
import {
  Layers,
  RotateCcw,
  Code,
  Sparkles,
  Maximize2,
  X,
  HelpCircle,
  MoreHorizontal,
} from 'lucide-react';
import {
  INITIAL_POS_VALIDATORS,
  PARTICIPANT_PRESETS,
  ParticipantPreset,
} from './posConstants';

export const ProofOfStakeLab: React.FC = () => {
  const { strings, language } = useLanguage();
  const isVi = language === 'vi';
  const { setSimulationActive } = useSimulation();

  // 3-Step Lifecycle State
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [validators, setValidators] = useState<PoSValidator[]>(INITIAL_POS_VALIDATORS);
  const [selectedProposerId, setSelectedProposerId] = useState<string | null>('bob');
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [scenarioOutcome, setScenarioOutcome] = useState<'honest' | 'fraud' | null>('honest');

  // Guided vs Free Mode
  const [guideMode, setGuideMode] = useState<'guided' | 'free'>('guided');

  // Modals & Overflow Menu
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number[]>([]);
  const tickerIntervalRef = useRef<number | null>(null);

  // Click outside to close overflow menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timerRef.current.forEach((t) => clearTimeout(t));
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
      setSimulationActive(false);
    };
  }, [setSimulationActive]);

  // Sync simulation mode with global SimulationContext
  const handleToggleSimulationMode = (enable: boolean) => {
    setIsSimulationMode(enable);
    setSimulationActive(
      enable,
      enable
        ? isVi
          ? 'MÔ PHỎNG PROOF OF STAKE'
          : 'PROOF OF STAKE SIMULATION'
        : undefined
    );
  };

  const handleExitSimulationMode = () => {
    handleToggleSimulationMode(false);
  };

  // Add next participant from sequence
  const handleAddParticipant = () => {
    setValidators((prev) => {
      // Find next unused preset
      const currentIds = new Set(prev.map((v) => v.id.toLowerCase()));
      let nextPreset: ParticipantPreset | null = null;

      for (const preset of PARTICIPANT_PRESETS) {
        if (!currentIds.has(preset.id.toLowerCase())) {
          nextPreset = preset;
          break;
        }
      }

      // If all presets used, generate a dynamic one
      if (!nextPreset) {
        const charCode = 65 + (prev.length % 26);
        const letter = String.fromCharCode(charCode);
        const name = `Validator ${letter}`;
        const id = `validator_${letter.toLowerCase()}_${Date.now()}`;
        const defaultStake = ((prev.length * 70) % 350) + 50;
        nextPreset = {
          id,
          name,
          defaultStake,
          color: '#00C98D',
          glow: 'rgba(0, 201, 141, 0.3)',
          textClass: 'text-emerald-400',
        };
      }

      const newValidator: PoSValidator = {
        id: nextPreset.id,
        name: nextPreset.name,
        avatarColor: `bg-emerald-700`,
        stake: nextPreset.defaultStake,
        isOnline: nextPreset.defaultStake > 0,
        isActive: nextPreset.defaultStake > 0,
        isMalicious: false,
        votingPower: 0,
        totalBlocksProposed: 0,
        totalRewards: 0,
        slashedAmount: 0,
      };

      const updated = [...prev, newValidator];
      const totalStake = updated.reduce((sum, v) => sum + v.stake, 0);

      return updated.map((v) => ({
        ...v,
        votingPower: totalStake > 0 ? (v.stake / totalStake) * 100 : 0,
      }));
    });
  };

  // Adjust stake with immediate recalculation of voting power and total stake
  const handleUpdateStake = (id: string, delta: number) => {
    setValidators((prev) => {
      const updated = prev.map((v) => {
        if (v.id === id) {
          const newStake = Math.max(0, v.stake + delta);
          return {
            ...v,
            stake: newStake,
            isOnline: newStake > 0,
            isActive: newStake > 0,
          };
        }
        return v;
      });

      const totalStake = updated.reduce((sum, v) => sum + v.stake, 0);

      // If the selected proposer now has 0 stake, fallback to another active validator if possible
      if (selectedProposerId === id && delta < 0) {
        const currentSelected = updated.find((v) => v.id === id);
        if (currentSelected && currentSelected.stake === 0) {
          const fallback = updated.find((v) => v.stake > 0);
          if (fallback) {
            setSelectedProposerId(fallback.id);
          }
        }
      }

      return updated.map((v) => ({
        ...v,
        votingPower: totalStake > 0 ? (v.stake / totalStake) * 100 : 0,
      }));
    });
  };

  // Remove the most recently added participant (keep minimum 2)
  const handleRemoveParticipant = () => {
    if (validators.length <= 2) return;

    setValidators((prev) => {
      const removed = prev[prev.length - 1];
      const updated = prev.slice(0, prev.length - 1);
      const totalStake = updated.reduce((sum, v) => sum + v.stake, 0);

      // If the removed validator was the selected proposer, reset to the first available active validator
      if (selectedProposerId === removed.id) {
        const fallback = updated.find((v) => v.stake > 0) || updated[0];
        setSelectedProposerId(fallback.id);
      }

      return updated.map((v) => ({
        ...v,
        votingPower: totalStake > 0 ? (v.stake / totalStake) * 100 : 0,
      }));
    });
  };

  // Step 2: Start Weighted Selection Animation
  const handleStartSelection = () => {
    const activeNodes = validators.filter((v) => v.stake > 0);
    if (activeNodes.length === 0) return;

    setHasSpun(true);
    setIsSelecting(true);
    setSelectedProposerId(null);

    // Rapid selection ticker
    if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    let counter = 0;
    tickerIntervalRef.current = window.setInterval(() => {
      const randomCandidate = activeNodes[counter % activeNodes.length];
      setSelectedProposerId(randomCandidate.id);
      counter++;
    }, 100);

    const timer = window.setTimeout(() => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }

      // Perform real weighted lottery
      const totalStake = activeNodes.reduce((sum, v) => sum + v.stake, 0);
      let randomVal = Math.random() * totalStake;
      let winner = activeNodes[activeNodes.length - 1];

      for (const node of activeNodes) {
        if (randomVal < node.stake) {
          winner = node;
          break;
        }
        randomVal -= node.stake;
      }

      setSelectedProposerId(winner.id);
      setIsSelecting(false);
    }, 1200);

    timerRef.current.push(timer);
  };

  // Reset entire simulation to initial state
  const handleResetState = () => {
    timerRef.current.forEach((t) => clearTimeout(t));
    timerRef.current = [];
    if (tickerIntervalRef.current) {
      clearInterval(tickerIntervalRef.current);
      tickerIntervalRef.current = null;
    }

    setValidators(INITIAL_POS_VALIDATORS);
    setSelectedProposerId('bob');
    setHasSpun(false);
    setIsSelecting(false);
    setScenarioOutcome('honest');
    setActiveStep(1);
  };

  const selectedValidator = validators.find((v) => v.id === selectedProposerId) || validators[1] || validators[0];

  // Guided Steps for PoS
  const posGuideSteps: GuideStep[] = [
    {
      stepNumber: 1,
      titleVi: 'Bước 1: Quản lý Validator & Đặt Cọc (Stake)',
      titleEn: 'Step 1: Validator Management & Staking',
      instructionVi: 'Người xác thực (Validator) ký gửi tài sản (ETH) vào hợp đồng Staking để nhận quyền biểu quyết tương ứng.',
      instructionEn: 'Validators deposit collateral into the staking contract to gain proportional voting weight.',
      targetActionVi: 'Thử tăng/giảm Stake hoặc thêm Validator, sau đó bấm "Tiếp tục: Chọn người giải khối".',
      targetActionEn: 'Adjust stakes or add validators, then click "Continue: Select Block Solver".',
      isCompleted: activeStep >= 1,
    },
    {
      stepNumber: 2,
      titleVi: 'Bước 2: Chọn Người Giải Khối',
      titleEn: 'Step 2: Select Block Solver',
      instructionVi: 'Thuật toán ngẫu nhiên có trọng số (Weighted Lottery) chọn 1 Validator giải khối tiếp theo.',
      instructionEn: 'A weighted pseudo-random lottery selects a single validator to solve the next block.',
      targetActionVi: 'Bấm nút "Quay chọn người giải khối", sau đó bấm "Tiếp tục: Ghi & Kiểm tra khối".',
      targetActionEn: 'Click "Select Block Solver", then click "Continue: Verify Block".',
      isCompleted: (activeStep === 2 && hasSpun && !isSelecting) || activeStep > 2,
    },
    {
      stepNumber: 3,
      titleVi: 'Bước 3: Bỏ Phiếu Chứng Thực (Attestation) & Phạt Slashing',
      titleEn: 'Step 3: Attestation & Slashing Mechanism',
      instructionVi: 'Hội đồng các Validator còn lại kiểm tra và bỏ phiếu chứng thực (Attest). Nếu phát hiện gian lận, tiền cọc bị tịch thu (Slash).',
      instructionEn: 'The committee verifies and signs attestations. Fraudulent blocks trigger automatic stake slashing.',
      targetActionVi: 'Chọn kịch bản "✓ Làm đúng" hoặc "⚠ Gian lận" để xem cách Slashing vận hành.',
      targetActionEn: 'Select "✓ Honest" or "⚠ Cheat" to see slashing in action.',
      isCompleted: activeStep === 3,
    },
  ];

  const posQuestions: SimulationQuestions = {
    whatAmILookingAtVi: 'Bạn đang quan sát cơ chế Proof of Stake (PoS) nơi mạng lưới bảo mật bằng vốn đặt cọc (Stake) thay vì tiêu hao điện năng giải toán (PoW).',
    whatAmILookingAtEn: 'You are observing Proof of Stake (PoS) where network security is backed by deposited collateral (Stake) rather than energy-intensive computation.',
    whatShouldIClickVi: 'Nhấp điều chỉnh tiền cọc ở Bước 1, quay số chọn người đề xuất ở Bước 2, và chọn kịch bản khối ở Bước 3 để quan sát biểu quyết của hội đồng.',
    whatShouldIClickEn: 'Adjust stake in Step 1, run the weighted proposer selection in Step 2, and trigger validation scenarios in Step 3.',
    whatJustHappenedVi: 'Người đề xuất đưa khối ra, hội đồng Validator ký xác nhận hoặc phạt tịch thu tiền cọc (Slashing) nếu phát hiện hành vi gian lận.',
    whatJustHappenedEn: 'The proposer submitted a candidate block, and the committee either signed attestations or triggered slashing on fraud detection.',
    whyDidItHappenVi: 'Proof of Stake dùng đòn bẩy kinh tế: Làm đúng nhận thưởng phí giao dịch, gian lận sẽ mất toàn bộ tiền đặt cọc (Economic Finality).',
    whyDidItHappenEn: 'Proof of Stake enforces security through economic game theory: honest behavior earns rewards while malicious acts result in slashing.',
  };

  const currentStepGuide = posGuideSteps[activeStep - 1];

  return (
    <section
      id="proof-of-stake"
      className="space-y-6 pt-3 text-slate-100 max-w-7xl mx-auto scroll-mt-24 font-sans"
    >
      {/* 1. Header Bar: Clean Hierarchy (Level 1: Title, Level 2: Controls) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F4F7] flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#00C98D] shrink-0" />
            <span>Proof of Stake</span>
          </h2>
        </div>

        {/* Action Controls: Primary (Guided vs Free) & Secondary Overflow [ ⋯ ] */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Primary Controls: Mode Switcher */}
          <div className="flex items-center bg-[#0C0F14] p-1 rounded-lg border border-white/[0.08]">
            <button
              type="button"
              id="pos-mode-guided-btn"
              onClick={() => setGuideMode('guided')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                guideMode === 'guided'
                  ? 'bg-[#00C98D] text-[#090A0F] font-bold shadow-sm'
                  : 'text-[#9AA5B5] hover:text-[#F2F4F7]'
              }`}
              title={isVi ? 'Chế độ có hướng dẫn từng bước' : 'Step-by-step guided mode'}
            >
              {isVi ? 'HƯỚNG DẪN' : 'GUIDED'}
            </button>

            <button
              type="button"
              id="pos-mode-free-btn"
              onClick={() => setGuideMode('free')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                guideMode === 'free'
                  ? 'bg-[#00C98D] text-[#090A0F] font-bold shadow-sm'
                  : 'text-[#9AA5B5] hover:text-[#F2F4F7]'
              }`}
              title={isVi ? 'Chế độ tự do khám phá' : 'Free exploration mode'}
            >
              {isVi ? 'TỰ DO' : 'FREE'}
            </button>
          </div>

          {/* Secondary / Utility Controls: Overflow Menu [ ⋯ ] */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              id="pos-more-options-btn"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0C0F14] hover:bg-white/[0.04] text-[#9AA5B5] hover:text-[#F2F4F7] border border-white/[0.08] transition-colors cursor-pointer"
              title={isVi ? 'Tùy chọn khác' : 'More options'}
              aria-label={isVi ? 'Tùy chọn khác' : 'More options'}
              aria-expanded={isMoreMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-48 bg-[#0C0F14] backdrop-blur-md border border-white/[0.08] rounded-xl shadow-2xl p-1.5 z-40 font-sans text-xs animate-in fade-in slide-in-from-top-1 duration-150"
                role="menu"
              >
                {/* Help Modal */}
                <button
                  type="button"
                  id="pos-help-btn"
                  role="menuitem"
                  onClick={() => {
                    setIsHelpModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#00C98D]" />
                  <span>{isVi ? 'Trợ giúp' : 'Help'}</span>
                </button>

                {/* Fullscreen Simulation */}
                <button
                  type="button"
                  id="pos-fullscreen-btn"
                  role="menuitem"
                  onClick={() => {
                    handleToggleSimulationMode(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#00C98D]" />
                  <span>{isVi ? 'Toàn màn hình' : 'Fullscreen'}</span>
                </button>

                {/* Code View */}
                <button
                  type="button"
                  id="pos-view-code-btn"
                  role="menuitem"
                  onClick={() => {
                    setIsCodeModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-[#00C98D]" />
                  <span>{strings.proofOfStake.viewCodeBtn}</span>
                </button>

                <div className="my-1 border-t border-white/[0.08]" />

                {/* Reset State */}
                <button
                  type="button"
                  id="pos-reset-btn"
                  role="menuitem"
                  onClick={() => {
                    handleResetState();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 text-left transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Progress Stepper: Flat Minimalist Stepper */}
      <SimulationTimeline
        activeStep={activeStep}
        onSelectStep={(step) => setActiveStep(step)}
        selectedProposerName={selectedValidator?.name}
        scenarioOutcome={scenarioOutcome}
      />

      {/* 3. Step Instruction: Contextual Left-accent Area (No Heavy Box) */}
      {guideMode === 'guided' && (
        <div
          id="pos-guided-banner"
          className="border-l-2 border-[#00C98D] pl-3.5 py-1 bg-white/[0.015] rounded-r-lg animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#00C98D] uppercase tracking-wider">
              {isVi ? `BƯỚC ${activeStep} / 3` : `STEP ${activeStep} / 3`}
            </span>
            <span className="text-[#1C2430]">·</span>
            <h4 className="text-xs sm:text-sm font-semibold text-[#F2F4F7]">
              {isVi
                ? currentStepGuide.titleVi.replace(/^Bước \d+:\s*/i, '')
                : currentStepGuide.titleEn.replace(/^Step \d+:\s*/i, '')}
            </h4>
          </div>
          <p className="text-xs text-[#9AA5B5] mt-0.5 max-w-3xl leading-relaxed">
            {isVi ? currentStepGuide.instructionVi : currentStepGuide.instructionEn}
          </p>
        </div>
      )}

      {/* 4. Main Simulation Workspace */}
      <div className="space-y-6">
        {activeStep === 1 && (
          <ValidatorDashboard
            validators={validators}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onUpdateStake={handleUpdateStake}
            canAddMore={validators.length < PARTICIPANT_PRESETS.length}
            canRemove={validators.length > 2}
            onProceedToStep2={() => setActiveStep(2)}
          />
        )}

        {activeStep === 2 && (
          <StakeDistributionBar
            validators={validators}
            selectedProposerId={hasSpun ? selectedProposerId : null}
            isSelecting={isSelecting}
            onStartSelection={handleStartSelection}
            onProceedToStep3={() => setActiveStep(3)}
            onBackToStep1={() => setActiveStep(1)}
          />
        )}

        {activeStep === 3 && (
          <ConsensusAttestationArena
            proposer={selectedValidator}
            validators={validators}
            scenarioOutcome={scenarioOutcome}
            onSelectScenario={(outcome) => setScenarioOutcome(outcome)}
            onBackToStep2={() => setActiveStep(2)}
            onResetAll={handleResetState}
          />
        )}
      </div>

      {/* 5. Educational Collapsible Sections */}
      <PoSWhyAccordion />
      <PoWVsPoSComparison />

      {/* 6. Help Modal */}
      <PoSHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        questions={posQuestions}
      />

      {/* 7. Dedicated Fullscreen Proof of Stake Simulation Mode */}
      {isSimulationMode && (
        <div
          id="pos-fullscreen-simulation-modal"
          className="fixed inset-0 z-50 bg-[#090A0F] p-4 sm:p-8 overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Fullscreen Header */}
          <div className="sticky top-0 z-40 bg-[#090A0F]/95 backdrop-blur-xl pb-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00C98D]/10 border border-[#00C98D]/30 flex items-center justify-center text-[#00C98D]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#F2F4F7]">
                    {isVi ? 'CHẾ ĐỘ MÔ PHỎNG PROOF OF STAKE' : 'PROOF OF STAKE SIMULATION MODE'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30">
                    FULLSCREEN LAB
                  </span>
                </div>
                <p className="text-xs text-[#9AA5B5]">
                  {isVi
                    ? 'Mô phỏng quy trình Proof of Stake trực quan qua 3 bước: Đặt cọc ETH, Chọn người giải khối, Kiểm tra khối.'
                    : 'Visual 3-step Proof of Stake lifecycle: Deposit ETH, Block Solver selection, Block verification.'}
                </p>
              </div>
            </div>

            {/* Simulation Mode Action Buttons & Exit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-[#0C0F14] hover:bg-white/[0.04] text-[#00C98D] border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isVi ? 'Trợ giúp' : 'Help'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCodeModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#0C0F14] hover:bg-white/[0.04] text-[#F2F4F7] border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-[#00C98D]" />
                <span>{strings.proofOfStake.viewCodeBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleResetState}
                className="p-2 rounded-lg bg-[#0C0F14] hover:bg-white/[0.04] text-[#9AA5B5] hover:text-[#F2F4F7] border border-white/[0.08] cursor-pointer transition-colors"
                title={strings.proofOfStake.resetStateBtn}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="pos-exit-fullscreen-btn"
                onClick={handleExitSimulationMode}
                className="px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{isVi ? 'Thoát toàn màn hình' : 'Exit Fullscreen'}</span>
              </button>
            </div>
          </div>

          {/* Timeline in Simulation Mode */}
          <SimulationTimeline
            activeStep={activeStep}
            onSelectStep={(step) => setActiveStep(step)}
            selectedProposerName={selectedValidator?.name}
            scenarioOutcome={scenarioOutcome}
          />

          {/* Dynamic Step View in Simulation Mode */}
          <div className="space-y-6">
            {activeStep === 1 && (
              <ValidatorDashboard
                validators={validators}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                onUpdateStake={handleUpdateStake}
                canAddMore={validators.length < PARTICIPANT_PRESETS.length}
                canRemove={validators.length > 2}
                onProceedToStep2={() => setActiveStep(2)}
              />
            )}

            {activeStep === 2 && (
              <StakeDistributionBar
                validators={validators}
                selectedProposerId={hasSpun ? selectedProposerId : null}
                isSelecting={isSelecting}
                onStartSelection={handleStartSelection}
                onProceedToStep3={() => setActiveStep(3)}
                onBackToStep1={() => setActiveStep(1)}
              />
            )}

            {activeStep === 3 && (
              <ConsensusAttestationArena
                proposer={selectedValidator}
                validators={validators}
                scenarioOutcome={scenarioOutcome}
                onSelectScenario={(outcome) => setScenarioOutcome(outcome)}
                onBackToStep2={() => setActiveStep(2)}
                onResetAll={handleResetState}
              />
            )}
          </div>
        </div>
      )}

      {/* Code Modal for Python PoS Engine */}
      <PoSCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        highlightedSection="sec1"
      />
    </section>
  );
};
