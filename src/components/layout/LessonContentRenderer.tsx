/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigation, LessonId } from '../../context/NavigationContext';

// Home
import { Hero } from '../Hero';

// Hash
import { HashGenerator } from '../HashGenerator';
import { PropertiesSection } from '../PropertiesSection';
import { AvalancheVisualizer } from '../AvalancheVisualizer';
import { InternalPipelineVisualizer } from '../InternalPipelineVisualizer';
import { ExperimentLab } from '../ExperimentLab';

// Theory
import { DataStructuresFoundations } from '../Foundations/DataStructuresFoundations';
import { BlockArchitectureLab } from '../BlockArchitecture/BlockArchitectureLab';
import { DecentralizationEvolutionLab } from '../DecentralizationEvolution/DecentralizationEvolutionLab';
import { ConsensusEvolutionLab } from '../ConsensusEvolution/ConsensusEvolutionLab';

// Simulation
import { TransactionVerification } from '../TransactionVerification/TransactionVerification';
import { ProofOfWorkLab } from '../ProofOfWork/ProofOfWorkLab';
import { ProofOfStakeLab } from '../ProofOfStake/ProofOfStakeLab';
import { EndToEndConsensusLab } from '../EndToEndConsensus/EndToEndConsensusLab';

// Blockchain
import { BlockchainVisualizer } from '../BlockchainVisualizer';
import { MerkleTreeLab } from '../MerkleTree/MerkleTreeLab';
import { QuizSection } from '../Quiz/QuizSection';
import { AcademicAndResearchSection } from '../AcademicAndResearchSection';

export const LessonContentRenderer: React.FC = () => {
  const { currentLessonId } = useNavigation();

  // Switch-case ensures ONLY ONE lesson component is mounted in the DOM at any time.
  // When switching routes, React cleans up all intervals/workers of the unmounted component.
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
