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
  Compass,
  Sliders,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
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

  // Modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  const timerRef = useRef<number[]>([]);
  const tickerIntervalRef = useRef<number | null>(null);

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
      className="space-y-5 pt-3 text-slate-100 max-w-7xl mx-auto scroll-mt-24 font-sans"
    >
      {/* 1. Header Bar with Mode Toggles and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#1C2430]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[rgba(0,201,141,0.08)] text-[#00C98D] border border-[rgba(0,201,141,0.35)] font-semibold tracking-wide">
              {isVi ? 'CƠ CHẾ ĐỒNG THUẬN HIỆN ĐẠI' : 'MODERN CONSENSUS MECHANISM'}
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#0F131A] text-[#A5AFBF] border border-[#1C2430]">
              {isVi ? 'BẰNG CHỨNG CỔ PHẦN' : 'PROOF OF STAKE'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[#F2F4F7] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#00C98D] shrink-0" />
            <span>
              {isVi
                ? 'MÔ PHỎNG PROOF OF STAKE (BẰNG CHỨNG CỔ PHẦN)'
                : 'PROOF OF STAKE (PoS) SIMULATION'}
            </span>
          </h2>
        </div>

        {/* Mode Switcher & Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Mode Switcher: Guided vs Free */}
          <div className="flex items-center bg-[#0F131A] p-1 rounded-xl border border-[#1C2430]">
            <button
              type="button"
              id="pos-mode-guided-btn"
              onClick={() => setGuideMode('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                guideMode === 'guided'
                  ? 'bg-[#00C98D] text-[#090A0F] shadow-sm'
                  : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
              title={isVi ? 'Chế độ có hướng dẫn từng bước' : 'Step-by-step guided mode'}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isVi ? 'HƯỚNG DẪN' : 'GUIDED'}</span>
            </button>

            <button
              type="button"
              id="pos-mode-free-btn"
              onClick={() => setGuideMode('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                guideMode === 'free'
                  ? 'bg-[#00C98D] text-[#090A0F] shadow-sm'
                  : 'text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
              title={isVi ? 'Chế độ tự do khám phá' : 'Free exploration mode'}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isVi ? 'TỰ DO' : 'FREE'}</span>
            </button>
          </div>

          {/* Quick Help Dialog Trigger (Replaces permanent 4-Question block) */}
          <button
            type="button"
            id="pos-help-btn"
            onClick={() => setIsHelpModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#00C98D] hover:text-[#00B982] border border-[#1C2430] font-sans font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title={isVi ? 'Xem 4 câu hỏi định hướng tư duy' : 'View 4 core framework questions'}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00C98D]" />
            <span>{isVi ? 'ⓘ Trợ giúp' : 'ⓘ Help'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            id="pos-fullscreen-btn"
            onClick={() => handleToggleSimulationMode(true)}
            className="px-3 py-2 rounded-xl bg-[rgba(0,201,141,0.08)] hover:bg-[rgba(0,201,141,0.15)] text-[#00C98D] border border-[rgba(0,201,141,0.35)] font-sans font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title={isVi ? 'Mở chế độ mô phỏng toàn màn hình' : 'Open fullscreen simulation mode'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isVi ? 'Toàn màn hình' : 'Fullscreen'}
            </span>
          </button>

          {/* Code Modal Button */}
          <button
            type="button"
            id="pos-view-code-btn"
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] font-sans font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title={isVi ? 'Xem mã nguồn Python mô phỏng Proof of Stake' : 'View Proof-of-Stake Python code'}
          >
            <Code className="w-3.5 h-3.5 text-[#00C98D]" />
            <span className="hidden sm:inline">{strings.proofOfStake.viewCodeBtn}</span>
          </button>

          {/* Reset State Button */}
          <button
            type="button"
            id="pos-reset-btn"
            onClick={handleResetState}
            className="p-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] transition-colors cursor-pointer"
            title={strings.proofOfStake.resetStateBtn}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Compact Interactive Terminology Bar (Replaces bulky concept cards) */}
      <PoSTerminologyBar />

      {/* 3. The 3-Step Lifecycle Visual Guide */}
      <SimulationTimeline
        activeStep={activeStep}
        onSelectStep={(step) => setActiveStep(step)}
        selectedProposerName={selectedValidator?.name}
        scenarioOutcome={scenarioOutcome}
      />

      {/* 4. Streamlined Just-in-Time Guided Mode Guidance Banner (when guided mode active) */}
      {guideMode === 'guided' && (
        <div
          id="pos-guided-banner"
          className="p-3.5 sm:p-4 rounded-xl bg-[#0C0F14] border border-[rgba(0,201,141,0.35)] flex items-start sm:items-center gap-3 shadow-sm animate-in fade-in duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,201,141,0.12)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D] shrink-0 mt-0.5 sm:mt-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(0,201,141,0.15)] text-[#00C98D]">
                {isVi ? `BƯỚC ${activeStep}/3` : `STEP ${activeStep}/3`}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-[#F2F4F7] font-display">
                {isVi ? currentStepGuide.titleVi : currentStepGuide.titleEn}
              </h4>
            </div>
            <p className="text-xs text-[#A5AFBF] font-sans mt-0.5 leading-snug">
              {isVi ? currentStepGuide.instructionVi : currentStepGuide.instructionEn}
            </p>
          </div>
        </div>
      )}

      {/* 5. Main Simulation Workspace: Clean Step View */}
      <div className="space-y-5">
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

      {/* 6. Secondary Collapsible Educational Section: 💡 TẠI SAO CƠ CHẾ NÀY HOẠT ĐỘNG? (Collapsed by default) */}
      <PoSWhyAccordion />

      {/* 7. Secondary Collapsible Educational Section: ⚖️ SO SÁNH PoW VÀ PoS (Collapsed by default) */}
      <PoWVsPoSComparison />

      {/* 8. Quick Help 4-Questions Modal */}
      <PoSHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        questions={posQuestions}
      />

      {/* 9. Dedicated Fullscreen Proof of Stake Simulation Mode */}
      {isSimulationMode && (
        <div
          id="pos-fullscreen-simulation-modal"
          className="fixed inset-0 z-50 bg-[#090A0F] p-4 sm:p-8 overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Fullscreen Header */}
          <div className="sticky top-0 z-40 bg-[#090A0F]/95 backdrop-blur-xl pb-4 border-b border-[#1C2430] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[rgba(0,201,141,0.12)] border border-[rgba(0,201,141,0.35)] flex items-center justify-center text-[#00C98D]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black font-display text-[#F2F4F7]">
                    {isVi ? 'CHẾ ĐỘ MÔ PHỎNG PROOF OF STAKE' : 'PROOF OF STAKE SIMULATION MODE'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(0,201,141,0.15)] text-[#00C98D] border border-[rgba(0,201,141,0.35)]">
                    FULLSCREEN LAB
                  </span>
                </div>
                <p className="text-xs text-[#A5AFBF]">
                  {isVi
                    ? 'Mô phỏng quy trình Proof of Stake trực quan qua 3 bước: Đặt cọc ETH, Chọn người giải khối, Kiểm tra khối.'
                    : 'Visual 3-step Proof of Stake lifecycle: Deposit ETH, Block Solver selection, Block verification.'}
                </p>
              </div>
            </div>

            {/* Simulation Mode Action Buttons & Exit */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#00C98D] border border-[#1C2430] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isVi ? 'ⓘ Trợ giúp' : 'ⓘ Help'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCodeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#F2F4F7] border border-[#1C2430] text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-[#00C98D]" />
                <span>{strings.proofOfStake.viewCodeBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleResetState}
                className="p-2 rounded-xl bg-[#0F131A] hover:bg-[#11161E] text-[#A5AFBF] hover:text-[#F2F4F7] border border-[#1C2430] cursor-pointer"
                title={strings.proofOfStake.resetStateBtn}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="pos-exit-fullscreen-btn"
                onClick={handleExitSimulationMode}
                className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{isVi ? 'Thoát toàn màn hình' : 'Exit Fullscreen'}</span>
              </button>
            </div>
          </div>

          {/* Compact Terminology in Fullscreen */}
          <PoSTerminologyBar />

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


