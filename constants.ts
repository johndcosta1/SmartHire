
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

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  
  // Handle YYYY-MM-DD format explicitly to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  // Handle ISO strings and other formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
