
import { Candidate, ApplicationStatus, UserRole } from './types';

export const USER_ROLES: UserRole[] = [
  UserRole.HR,
  UserRole.Scheduler,
  UserRole.HOD,
  UserRole.Surveillance,
  UserRole.Admin,
];

export const ROLE_PASSWORDS: Record<UserRole, string> = {
  [UserRole.Admin]: "admin123",
  [UserRole.HOD]: "hod123",
  [UserRole.Scheduler]: "scheduler123",
  [UserRole.Surveillance]: "surv123",
  [UserRole.HR]: "hr123",
  [UserRole.Candidate]: "", // Not used for login
};

export const JOB_ROLES = ['Senior Croupier', 'Bartender', 'Security Officer', 'HR Executive', 'Casino Manager', 'Surveillance Operator', 'Chef', 'Housekeeping Staff'];
export const DEPARTMENTS = ['Gaming', 'F&B', 'Security', 'HR', 'Management', 'Surveillance', 'Kitchen', 'Housekeeping'];
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];


export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.New]: "bg-blue-500",
  [ApplicationStatus.InterviewScheduled]: "bg-cyan-500",
  [ApplicationStatus.InterviewCompleted]: "bg-indigo-500",
  [ApplicationStatus.PendingSurveillance]: "bg-yellow-600",
  [ApplicationStatus.SurveillanceCleared]: "bg-teal-500",
  [ApplicationStatus.SurveillanceFlagged]: "bg-orange-600",
  [ApplicationStatus.OfferAccepted]: "bg-pink-500",
  [ApplicationStatus.JoiningScheduled]: "bg-lime-600",
  [ApplicationStatus.Joined]: "bg-casino-success",
  [ApplicationStatus.Rejected]: "bg-casino-danger",
};