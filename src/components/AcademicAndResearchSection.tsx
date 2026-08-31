/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AcademicQuestions } from './AcademicQuestions';
import { AboutResearch } from './AboutResearch';
import { ResearcherProfile } from './ResearcherProfile';

export const AcademicAndResearchSection: React.FC = () => {
  return (
    <div className="space-y-12">
      <AcademicQuestions />
      <AboutResearch />
      <ResearcherProfile />
    </div>
  );
};
