import { Candidate, ApplicationStatus, UserRole } from './types';

export const USER_ROLES: UserRole[] = [
  UserRole.HR,
  UserRole.Scheduler,
  UserRole.CasinoManager,
  UserRole.Surveillance,
  UserRole.Admin,
];

export const ROLE_PASSWORDS: Record<UserRole, string> = {
    [UserRole.HR]: 'hr123',
    [UserRole.Scheduler]: 'scheduler123',
    [UserRole.CasinoManager]: 'cm123',
    [UserRole.Surveillance]: 'surv123',
    [UserRole.Admin]: 'admin123',
};

export const JOB_ROLES = ['Senior Croupier', 'Bartender', 'Security Officer', 'HR Executive', 'Casino Manager', 'Surveillance Operator', 'Chef', 'Housekeeping Staff'];
export const DEPARTMENTS = ['Gaming', 'F&B', 'Security', 'HR', 'Management', 'Surveillance', 'Kitchen', 'Housekeeping'];
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];


export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand_001',
    photoUrl: 'https://picsum.photos/seed/cand_001/200/300',
    fullName: 'Rajesh Kumar',
    dob: '1995-08-15',
    contact: { phone: '+91 9876543210', email: 'rajesh.k@example.com' },
    emergencyContact: { name: 'Sunita Kumar', phone: '+91 9876543211' },
    address: '123, MG Road, Panaji, Goa',
    vacancy: 'Senior Croupier',
    expectedSalary: 60000,
    accommodationRequired: true,
    transportRequired: false,
    status: ApplicationStatus.New,
    createdAt: '2023-10-26T10:00:00Z',
    statusHistory: [
      { id: 'log_001', timestamp: '2023-10-26T10:00:00Z', user: 'HR Aparna', role: UserRole.HR, action: 'Application Created' },
    ],
  },
  {
    id: 'cand_002',
    photoUrl: 'https://picsum.photos/seed/cand_002/200/300',
    fullName: 'Priya Sharma',
    dob: '1998-02-20',
    contact: { phone: '+91 9988776655', email: 'priya.s@example.com' },
    emergencyContact: { name: 'Anil Sharma', phone: '+91 9988776650' },
    address: '456, Calangute Beach Road, Goa',
    vacancy: 'Bartender',
    expectedSalary: 45000,
    accommodationRequired: false,
    transportRequired: true,
    status: ApplicationStatus.InterviewScheduled,
    createdAt: '2023-10-25T11:30:00Z',
    interview: {
      id: 'int_001',
      interviewer: 'John Doe (CM)',
      date: '2023-10-28',
      time: '14:00',
      type: 'In-Person',
      feedback: '',
      score: 0,
      recommendation: "Pass",
    },
    statusHistory: [
      { id: 'log_002a', timestamp: '2023-10-25T11:30:00Z', user: 'HR Aparna', role: UserRole.HR, action: 'Application Created' },
      { id: 'log_002b', timestamp: '2023-10-25T14:00:00Z', user: 'Scheduler Jane', role: UserRole.Scheduler, action: 'Interview Scheduled for 2023-10-28 14:00' },
    ],
  },
  {
    id: 'cand_003',
    photoUrl: 'https://picsum.photos/seed/cand_003/200/300',
    fullName: 'Amit Patel',
    dob: '1993-11-05',
    contact: { phone: '+91 8877665544', email: 'amit.p@example.com' },
    emergencyContact: { name: 'Rekha Patel', phone: '+91 8877665540' },
    address: '789, Baga Creek, Goa',
    vacancy: 'Security Officer',
    expectedSalary: 55000,
    accommodationRequired: true,
    transportRequired: true,
    status: ApplicationStatus.PendingSurveillance,
    createdAt: '2023-10-24T09:00:00Z',
    interview: {
      id: 'int_002',
      interviewer: 'Michael (Surveillance Lead)',
      date: '2023-10-26',
      time: '11:00',
      type: 'Onboard',
      feedback: 'Strong candidate, good awareness.',
      score: 8,
      recommendation: 'Pass',
    },
    statusHistory: [
      { id: 'log_003a', timestamp: '2023-10-24T09:00:00Z', user: 'HR Aparna', role: UserRole.HR, action: 'Application Created' },
      { id: 'log_003b', timestamp: '2023-10-24T12:00:00Z', user: 'Scheduler Jane', role: UserRole.Scheduler, action: 'Interview Scheduled' },
      { id: 'log_003c', timestamp: '2023-10-26T12:00:00Z', user: 'CM Mike', role: UserRole.CasinoManager, action: 'Interview Completed, Selected for Surveillance' },
    ],
  },
  {
    id: 'cand_004',
    photoUrl: 'https://picsum.photos/seed/cand_004/200/300',
    fullName: 'Sunita Rao',
    dob: '1999-05-12',
    contact: { phone: '+91 7766554433', email: 'sunita.r@example.com' },
    emergencyContact: { name: 'Suresh Rao', phone: '+91 7766554430' },
    address: '101, Candolim, Goa',
    vacancy: 'HR Executive',
    expectedSalary: 70000,
    accommodationRequired: false,
    transportRequired: false,
    status: ApplicationStatus.SurveillanceCleared,
    createdAt: '2023-10-22T15:00:00Z',
    interview: { id: 'int_003', interviewer: 'HR Head', date: '2023-10-25', time: '10:00', type: 'In-Person', feedback: 'Excellent communication skills.', score: 9, recommendation: 'Pass' },
    surveillanceReport: { status: 'Clear', reportUrl: 'surv_report_sunita.pdf', notes: 'No flags found.' },
    offer: { salary: 72000, joiningDate: '2023-11-15', accommodationDetails: 'N/A' },
    statusHistory: [
        { id: 'log_004a', timestamp: '2023-10-22T15:00:00Z', user: 'HR Aparna', role: UserRole.HR, action: 'Application Created'},
        { id: 'log_004b', timestamp: '2023-10-26T10:00:00Z', user: 'Surveillance Ops', role: UserRole.Surveillance, action: 'Surveillance Cleared'},
    ]
  },
    {
    id: 'cand_005',
    photoUrl: 'https://picsum.photos/seed/cand_005/200/300',
    fullName: 'Vikram Singh',
    dob: '1990-01-30',
    contact: { phone: '+91 6655443322', email: 'vikram.s@example.com' },
    emergencyContact: { name: 'Geeta Singh', phone: '+91 6655443320' },
    address: '222, Anjuna, Goa',
    vacancy: 'Casino Manager',
    expectedSalary: 120000,
    accommodationRequired: true,
    transportRequired: true,
    status: ApplicationStatus.Joined,
    employeeId: 'EMP7890',
    createdAt: '2023-09-01T10:00:00Z',
    interview: { id: 'int_004', interviewer: 'Admin', date: '2023-09-10', time: '11:00', type: 'In-Person', feedback: 'Very experienced.', score: 10, recommendation: 'Pass' },
    surveillanceReport: { status: 'Clear', reportUrl: 'surv_report_vikram.pdf', notes: 'Clean record.' },
    offer: { salary: 125000, joiningDate: '2023-10-01', accommodationDetails: 'Villa 2B' },
    statusHistory: [
        { id: 'log_005a', timestamp: '2023-09-01T10:00:00Z', user: 'HR Aparna', role: UserRole.HR, action: 'Application Created'},
        { id: 'log_005b', timestamp: '2023-09-20T10:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Offer Accepted'},
        { id: 'log_005d', timestamp: '2023-09-22T11:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Joining Scheduled'},
        { id: 'log_005e', timestamp: '2023-10-01T09:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Marked as Joined'},
    ]
  },
   {
    id: 'cand_006',
    photoUrl: 'https://picsum.photos/seed/cand_006/200/300',
    fullName: 'Anita Desai',
    dob: '1996-07-21',
    contact: { phone: '+91 5544332211', email: 'anita.d@example.com' },
    emergencyContact: { name: 'Rohan Desai', phone: '+91 5544332210' },
    address: '333, Vasco, Goa',
    vacancy: 'Surveillance Operator',
    expectedSalary: 50000,
    accommodationRequired: true,
    transportRequired: false,
    status: ApplicationStatus.Rejected,
    rejection: {
        reason: "ID Mismatch during background check.",
        actor: UserRole.Surveillance,
        timestamp: '2023-10-27T16:00:00Z',
        evidence: 'discrepancy_report.pdf'
    },
    createdAt: '2023-10-23T13:00:00Z',
     interview: { id: 'int_005', interviewer: 'Michael', date: '2023-10-25', time: '15:00', type: 'Onboard', feedback: 'Seemed competent.', score: 7, recommendation: 'Pass' },
     surveillanceReport: { status: 'Flagged', reportUrl: 'surv_report_anita.pdf', notes: 'ID provided does not match government records.' },
    statusHistory: [
        { id: 'log_006a', timestamp: '2023-10-23T13:00:00Z', user: 'HR Bot', role: UserRole.HR, action: 'Application Created'},
        { id: 'log_006b', timestamp: '2023-10-27T16:00:00Z', user: 'Surveillance Ops', role: UserRole.Surveillance, action: 'Application Rejected'},
    ]
  },
];

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