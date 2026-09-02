/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { useNavigation } from '../../context/NavigationContext';

// Home
const Hero = lazy(() => import('../Hero').then(m => ({ default: m.Hero })));

// Hash
const HashGenerator = lazy(() => import('../HashGenerator').then(m => ({ default: m.HashGenerator })));
const PropertiesSection = lazy(() => import('../PropertiesSection').then(m => ({ default: m.PropertiesSection })));
const AvalancheVisualizer = lazy(() => import('../AvalancheVisualizer').then(m => ({ default: m.AvalancheVisualizer })));
const InternalPipelineVisualizer = lazy(() => import('../InternalPipelineVisualizer').then(m => ({ default: m.InternalPipelineVisualizer })));
const ExperimentLab = lazy(() => import('../ExperimentLab').then(m => ({ default: m.ExperimentLab })));

// Theory
const DataStructuresFoundations = lazy(() => import('../Foundations/DataStructuresFoundations').then(m => ({ default: m.DataStructuresFoundations })));
const BlockArchitectureLab = lazy(() => import('../BlockArchitecture/BlockArchitectureLab').then(m => ({ default: m.BlockArchitectureLab })));
const DecentralizationEvolutionLab = lazy(() => import('../DecentralizationEvolution/DecentralizationEvolutionLab').then(m => ({ default: m.DecentralizationEvolutionLab })));
const ConsensusEvolutionLab = lazy(() => import('../ConsensusEvolution/ConsensusEvolutionLab').then(m => ({ default: m.ConsensusEvolutionLab })));

// Simulation
const TransactionVerification = lazy(() => import('../TransactionVerification/TransactionVerification').then(m => ({ default: m.TransactionVerification })));
const ProofOfWorkLab = lazy(() => import('../ProofOfWork/ProofOfWorkLab').then(m => ({ default: m.ProofOfWorkLab })));
const ProofOfStakeLab = lazy(() => import('../ProofOfStake/ProofOfStakeLab').then(m => ({ default: m.ProofOfStakeLab })));
const EndToEndConsensusLab = lazy(() => import('../EndToEndConsensus/EndToEndConsensusLab').then(m => ({ default: m.EndToEndConsensusLab })));

// Blockchain
const BlockchainVisualizer = lazy(() => import('../BlockchainVisualizer').then(m => ({ default: m.BlockchainVisualizer })));
const MerkleTreeLab = lazy(() => import('../MerkleTree/MerkleTreeLab').then(m => ({ default: m.MerkleTreeLab })));
const QuizSection = lazy(() => import('../Quiz/QuizSection').then(m => ({ default: m.QuizSection })));
const AcademicAndResearchSection = lazy(() => import('../AcademicAndResearchSection').then(m => ({ default: m.AcademicAndResearchSection })));

const LessonLoadingFallback: React.FC = () => (
  <div className="w-full min-h-[400px] flex items-center justify-center py-16">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      <span className="text-xs font-mono text-slate-500">Loading module...</span>
    </div>
  </div>
);

export const LessonContentRenderer: React.FC = () => {
  const { currentLessonId } = useNavigation();

  const renderContent = () => {
    switch (currentLessonId) {
      // 0. HOME
      case 'overview':
        return <Hero key="hero-overview" />;

      // 1. HASH
      case 'generator':
        return <HashGenerator key="hash-generator" />;
      case 'properties':
        return <PropertiesSection key="hash-properties" />;
      case 'avalanche':
        return <AvalancheVisualizer key="hash-avalanche" />;
      case 'pipeline':
        return <InternalPipelineVisualizer key="hash-pipeline" />;
      case 'experiment':
        return <ExperimentLab key="hash-experiment" />;

      // 2. THEORY
      case 'data-structures':
        return <DataStructuresFoundations key="theory-data-structures" />;
      case 'block-architecture':
        return <BlockArchitectureLab key="theory-block-architecture" />;
      case 'decentralization':
        return <DecentralizationEvolutionLab key="theory-decentralization" />;
      case 'consensus-evolution':
        return <ConsensusEvolutionLab key="theory-consensus-evolution" />;

      // 3. SIMULATION
      case 'transactions':
        return <TransactionVerification key="sim-transactions" />;
      case 'proof-of-work':
        return <ProofOfWorkLab key="sim-proof-of-work" />;
      case 'proof-of-stake':
        return <ProofOfStakeLab key="sim-proof-of-stake" />;
      case 'end-to-end':
        return <EndToEndConsensusLab key="sim-end-to-end" />;

      // 4. BLOCKCHAIN
      case 'ledger':
        return <BlockchainVisualizer key="bc-ledger" />;
      case 'merkle-tree':
        return <MerkleTreeLab key="bc-merkle-tree" />;
      case 'quiz':
        return <QuizSection key="bc-quiz" />;
      case 'academic':
        return <AcademicAndResearchSection key="bc-academic" />;

      default:
        return <Hero key="fallback-hero" />;
    }
  };

  return <Suspense fallback={<LessonLoadingFallback />}>{renderContent()}</Suspense>;
};
