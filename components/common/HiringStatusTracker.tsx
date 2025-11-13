
import React from 'react';
import { ApplicationStatus, Candidate, AuditLog, UserRole } from '../../types';
import { Icon } from './Icon';
import { formatDateTime } from '../../constants';

interface HiringStatusTrackerProps {
  candidate: Candidate;
  currentRole: UserRole;
}

const stages = [
  { name: 'Applied', icon: 'document-text' as const },
  { name: 'HR Screening', icon: 'users' as const },
  { name: 'Interview Scheduled', icon: 'calendar' as const },
  { name: 'HOD Interview', icon: 'users' as const },
  { name: 'Surveillance Check', icon: 'shield-check' as const },
  { name: 'HR Offer', icon: 'briefcase' as const },
  { name: 'Joining Scheduled', icon: 'clock' as const },
  { name: 'Hired', icon: 'user-plus' as const },
];

const findLogForStage = (stageName: string, history: AuditLog[], status: ApplicationStatus): AuditLog | undefined => {
    const reversedHistory = [...history].reverse();
    switch (stageName) {
        case 'Applied':
            return reversedHistory.find(log => log.action.includes('Application Created'));
        case 'HR Screening':
            return reversedHistory.find(log => log.role === UserRole.HR && (log.action.includes('Ratings Hr') || log.action.includes('HR Interviewer') || log.action.includes('evaluation')));
        case 'Interview Scheduled':
            return reversedHistory.find(log => log.action.includes('Interview Scheduled'));
        case 'HOD Interview':
            if (status === ApplicationStatus.Rejected) {
                const isSurveillanceRejection = reversedHistory.some(log => log.action.includes('Rejected') && log.role === UserRole.Surveillance);
                if (!isSurveillanceRejection) {
                    return reversedHistory.find(log => (log.action.includes('Rejected')) && log.role === UserRole.HOD);
                }
            }
            return reversedHistory.find(log => log.action.includes('Interview Completed'));
        case 'Surveillance Check':
            if (status === ApplicationStatus.SurveillanceFlagged) {
                return reversedHistory.find(log => log.action.includes('Flagged'));
            }
            if (status === ApplicationStatus.Rejected) {
                return reversedHistory.find(log => log.action.includes('Rejected') && log.role === UserRole.Surveillance);
            }
            return reversedHistory.find(log => log.action.includes('Cleared') || log.action.includes('Flagged'));
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

const stageOwnership: Record<string, UserRole[]> = {
  'Applied': [UserRole.HR],
  'HR Screening': [UserRole.HR],
  'Interview Scheduled': [UserRole.Scheduler],
  'HOD Interview': [UserRole.HOD],
  'Surveillance Check': [UserRole.Surveillance],
  'HR Offer': [UserRole.HR, UserRole.Admin],
  'Joining Scheduled': [UserRole.Scheduler, UserRole.Admin],
  'Hired': [UserRole.HR, UserRole.Admin],
};


export const HiringStatusTracker: React.FC<HiringStatusTrackerProps> = ({ candidate, currentRole }) => {
  const { status, statusHistory, rejection } = candidate;
  
  const hasHrScreening = statusHistory.some(log => log.role === UserRole.HR && (log.action.includes('Ratings Hr') || log.action.includes('HR Interviewer')));

  const getLevel = () => {
    switch (status) {
      case ApplicationStatus.New:
        return hasHrScreening ? 1 : 0;
      case ApplicationStatus.InterviewScheduled:
        return 2;
      case ApplicationStatus.InterviewCompleted:
        return 3;
      case ApplicationStatus.PendingSurveillance:
        return 4;
      case ApplicationStatus.SurveillanceCleared:
        return 5;
      case ApplicationStatus.OfferAccepted:
        return 5;
      case ApplicationStatus.JoiningScheduled:
        return 6;
      case ApplicationStatus.Joined:
        return 7; // Will be handled by the special 'Joined' status case
      case ApplicationStatus.Rejected:
        const lastHistory = statusHistory[statusHistory.length - 1];
        if (lastHistory?.action.includes('Rejected')) {
            if(lastHistory.role === UserRole.Surveillance) return 4;
            if(lastHistory.role === UserRole.HOD) return 3;
        }
        if (rejection?.actor === UserRole.Surveillance) return 4;
        if (rejection?.actor === UserRole.HOD) return 3;
        return 3; 
      case ApplicationStatus.SurveillanceFlagged:
        return 4;
      default:
        return 0;
    }
  };

  const currentLevel = getLevel();
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
          
          const isUsersActiveTask = state === 'active' && stageOwnership[stage.name]?.includes(currentRole);

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
          
          const lineClass = (state === 'completed' || (isFailed && index < currentLevel)) ? stateClasses.completed.line : stateClasses.pending.line;
          const log = findLogForStage(stage.name, statusHistory, status);

          return (
            <React.Fragment key={stage.name}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentClasses.circle} ${isUsersActiveTask ? 'ring-4 ring-offset-2 ring-offset-casino-secondary ring-casino-accent' : ''} transition-all duration-300 flex-shrink-0`}>
                  <Icon name={state === 'completed' ? 'check-circle' : state === 'failed' ? 'x-circle' : stage.icon} className={`w-6 h-6 ${currentClasses.icon}`} />
                </div>
                <p className={`mt-2 text-xs text-center w-24 ${currentClasses.text} ${isUsersActiveTask ? '!text-casino-accent !font-bold' : ''}`}>{stage.name}</p>
                 {log && state !== 'pending' && (
                  <div className="text-center text-[10px] leading-tight text-casino-text-muted mt-1 w-24">
                    <p className="font-semibold truncate" title={log.user}>{log.user}</p>
                    <p>{formatDateTime(log.timestamp)}</p>
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
