
export enum UserRole {
  Admin = "Admin",
  HOD = "HOD",
  Scheduler = "Scheduler",
  Surveillance = "Surveillance",
  HR = "HR",
  Candidate = "Candidate",
}

export enum ApplicationStatus {
  New = "New",
  InterviewScheduled = "Interview Scheduled",
  InterviewCompleted = "Interview Completed",
  PendingSurveillance = "Pending Surveillance",
  SurveillanceCleared = "Surveillance Cleared",
  SurveillanceFlagged = "Surveillance Flagged",
  OfferAccepted = "Offer Accepted",
  JoiningScheduled = "Joining Scheduled",
  Joined = "Joined",
  Rejected = "Rejected",
}

export interface Interview {
  id: string;
  interviewer: string;
  date: string;
  time: string;
  type: "In-Person" | "Onboard";
  feedback: string;
  score: number;
  recommendation: "Pass" | "Fail";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details?: string;
}

export interface Rejection {
  reason: string;
  actor: UserRole;
  timestamp: string;
  evidence?: string;
}

export interface Comment {
  id: string;
  timestamp: string;
  user: string; // Name of the commenter
  empId: string;
  comment: string;
  role: UserRole;
}

export interface Candidate {
  id: string;
  photoUrl?: string;

  // Personal Details
  fullName: string;
  dob: string;
  age?: number;
  contact: {
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  address: string;
  medicalConditions?: string;
  religion?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';

  // Job & Compensation
  vacancy: string;
  positionOffered?: string;
  department?: string;
  expectedSalary: number;
  accommodationRequired: boolean;
  transportRequired: boolean;

  // Qualifications & Experience
  totalWorkExperience?: number;
  qualifications?: { name: string; institute: string; year: string }[];
  workExperience?: { company: string; role: string; from: string; to: string; responsibilities: string }[];
  languagesKnown?: string;

  // Interview & Ratings
  ratings?: {
    hr?: {
      score: number;
      interviewer: string;
      personality?: number;
      attitude?: number;
      presentable?: number;
      communication?: number;
      confidence?: number;
      evaluation?: string;
    };
    manager?: { score: number };
    cm?: { score: number };
    department?: { interviewer: string };
  };
  
  preEmploymentTest?: {
    score: number;
    answers: { [key: string]: string }; // questionId: answerKey
    completedAt: string;
  };

  // References
  references?: { name: string; relation: string; company: string; contact: string; email: string }[];
  
  // System fields
  status: ApplicationStatus;
  statusHistory: AuditLog[];
  comments?: Comment[];
  rejection?: Rejection;
  interview?: Interview;
  surveillanceReport?: {
    status: "Clear" | "Flagged";
    reportUrl: string;
    notes: string;
  };
  offer?: {
    salary: number;
    joiningDate: string;
    accommodationDetails: string;
  };
  employeeId?: string;
  createdAt: string;
}