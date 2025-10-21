import React from 'react';
import { ApplicationStatus } from '../../types';
import { Icon } from './Icon';

interface HiringStatusTrackerProps {
  status: ApplicationStatus;
}

const stages = [
  { name: 'Applied', icon: 'document-text' as const },
  { name: 'HOD Interview', icon: 'calendar' as const },
  { name: 'Surveillance Check', icon: 'shield-check' as const },
  { name: 'HR Offer', icon: 'briefcase' as const },
  { name: 'Hired', icon: 'user-plus' as const },
];

const stageLevels: Record<ApplicationStatus, number> = {
    [ApplicationStatus.New]: 0,
    [ApplicationStatus.InterviewScheduled]: 1,
    [ApplicationStatus.InterviewCompleted]: 1,
    [ApplicationStatus.PendingSurveillance]: 2,
    [ApplicationStatus.SurveillanceCleared]: 2,
    [ApplicationStatus.OfferAccepted]: 3,
    [ApplicationStatus.JoiningScheduled]: 3,
    [ApplicationStatus.Joined]: 4,
    // Failure states
    [ApplicationStatus.Rejected]: 1, // Assume failure at interview stage for generic rejection
    [ApplicationStatus.SurveillanceFlagged]: 2, // Failure at surveillance stage
};

export const HiringStatusTracker: React.FC<HiringStatusTrackerProps> = ({ status }) => {
  const currentLevel = stageLevels[status];
  const isFailed = status === ApplicationStatus.Rejected || status === ApplicationStatus.SurveillanceFlagged;
  
  return (
    <div className="w-full p-4 mb-6 bg-casino-secondary rounded-lg no-print">
      <div className="flex items-center">
        {stages.map((stage, index) => {
          let state: 'completed' | 'active' | 'pending' | 'failed' = 'pending';
          
          if (isFailed) {
            if (index < currentLevel) {
              state = 'completed';
            } else if (index === currentLevel) {
              state = 'failed';
            }
          } else {
             if (status === ApplicationStatus.Joined) {
                state = 'completed';
             } else if (index < currentLevel) {
                state = 'completed';
             } else if (index === currentLevel) {
                state = 'active';
             }
          }

          const stateClasses = {
            completed: {
              circle: 'bg-casino-success',
              icon: 'text-white',
              text: 'text-casino-text',
              line: 'bg-casino-success',
            },
            active: {
              circle: 'bg-casino-gold ring-2 ring-offset-2 ring-offset-casino-secondary ring-casino-gold animate-pulse',
              icon: 'text-casino-primary',
              text: 'text-casino-gold font-semibold',
              line: 'bg-gray-700',
            },
            pending: {
              circle: 'bg-casino-primary border-2 border-gray-600',
              icon: 'text-casino-text-muted',
              text: 'text-casino-text-muted',
              line: 'bg-gray-700',
            },
            failed: {
              circle: 'bg-casino-danger',
              icon: 'text-white',
              text: 'text-casino-danger font-semibold',
              line: 'bg-gray-700',
            }
          };

          const currentClasses = stateClasses[state];
          const isLastStage = index === stages.length - 1;
          
          const lineClass = (state === 'completed') ? stateClasses.completed.line : stateClasses.pending.line;

          return (
            <React.Fragment key={stage.name}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentClasses.circle} transition-all duration-300`}>
                  <Icon name={state === 'completed' ? 'check-circle' : state === 'failed' ? 'x-circle' : stage.icon} className={`w-6 h-6 ${currentClasses.icon}`} />
                </div>
                <p className={`mt-2 text-xs text-center w-20 ${currentClasses.text}`}>{stage.name}</p>
              </div>
              {!isLastStage && (
                <div className={`flex-1 h-1 mx-2 rounded ${lineClass}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
