import React from 'react';
import { ApplicationStatus, Candidate, AuditLog, UserRole } from '../../types';
import { Icon } from './Icon';

interface HiringStatusTrackerProps {
  candidate: Candidate;
}

const stages = [
  { name: 'Applied', icon: 'document-text' as const },
  { name: 'Interview Scheduled', icon: 'calendar' as const },
  { name: 'HOD Interview', icon: 'users' as const },
  { name: 'Surveillance Check', icon: 'shield-check' as const },
  { name: 'HR Offer', icon: 'briefcase' as const },
  { name: 'Joining Scheduled', icon: 'clock' as const },
  { name: 'Hired', icon: 'user-plus' as const },
];

const stageLevels: Record<ApplicationStatus, number> = {
    [ApplicationStatus.New]: 0,
    [ApplicationStatus.InterviewScheduled]: 1,
    [ApplicationStatus.InterviewCompleted]: 2,
    [ApplicationStatus.PendingSurveillance]: 3,
    [ApplicationStatus.SurveillanceCleared]: 4,
    [ApplicationStatus.OfferAccepted]: 4,
    [ApplicationStatus.JoiningScheduled]: 5,
    [ApplicationStatus.Joined]: 6,
    // Failure states
    [ApplicationStatus.Rejected]: 2,
    [ApplicationStatus.SurveillanceFlagged]: 3,
};

const findLogForStage = (stageName: string, history: AuditLog[]): AuditLog | undefined => {
    const reversedHistory = [...history].reverse();
    switch (stageName) {
        case 'Applied':
            return reversedHistory.find(log => log.action.includes('Application Created'));
        case 'Interview Scheduled':
            return reversedHistory.find(log => log.action.includes('Interview Scheduled'));
        case 'HOD Interview':
            return reversedHistory.find(log => log.action.includes('Interview Completed'));
        case 'Surveillance Check':
            return reversedHistory.find(log => log.action.includes('Cleared') || log.action.includes('Flagged') || (log.action.includes('Rejected') && log.role === UserRole.Surveillance));
        case 'HR Offer':
            return reversedHistory.find(log => log.action.includes('Offer Accepted'));
        case 'Joining Scheduled':
            return reversedHistory.find(log => log.action.includes('Joining Scheduled'));
        case 'Hired':
            return reversedHistory.find(log => log.action.includes('Marked as Joined'));
        default:
            return undefined;
    }
}


export const HiringStatusTracker: React.FC<HiringStatusTrackerProps> = ({ candidate }) => {
  const { status, statusHistory } = candidate;
  const currentLevel = stageLevels[status];
  const isFailed = status === ApplicationStatus.Rejected || status === ApplicationStatus.SurveillanceFlagged;
  
  return (
    <div className="w-full p-4 mb-6 bg-casino-secondary rounded-lg no-print">
      <div className="flex items-start">
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
          const log = findLogForStage(stage.name, statusHistory);

          return (
            <React.Fragment key={stage.name}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentClasses.circle} transition-all duration-300 flex-shrink-0`}>
                  <Icon name={state === 'completed' ? 'check-circle' : state === 'failed' ? 'x-circle' : stage.icon} className={`w-6 h-6 ${currentClasses.icon}`} />
                </div>
                <p className={`mt-2 text-xs text-center w-24 ${currentClasses.text}`}>{stage.name}</p>
                 {log && state !== 'pending' && (
                  <div className="text-center text-[10px] leading-tight text-casino-text-muted mt-1 w-24">
                    <p className="font-semibold truncate" title={log.user}>{log.user}</p>
                    <p>{new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
              {!isLastStage && (
                <div className={`flex-1 h-1 mx-2 rounded ${lineClass} mt-6`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};