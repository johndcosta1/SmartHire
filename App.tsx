


import React, { useState, createContext, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, set, push, get } from 'firebase/database';
import { db } from './firebaseConfig.ts';
import { UserRole, Candidate, ApplicationStatus } from './types.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ApplicantList } from './components/ApplicantList.tsx';
import { ApplicantProfile } from './components/ApplicantProfile.tsx';
import { CreateCandidateForm } from './components/CreateCandidateForm.tsx';
import { Login } from './components/Login.tsx';
import { InterviewCalendar } from './components/InterviewCalendar.tsx';
import { SurveillanceQueue } from './components/SurveillanceQueue.tsx';
import { HROffers } from './components/HROffers.tsx';
import { Reports } from './components/Reports.tsx';
import { Settings } from './components/Settings.tsx';
import { RoleSelection } from './components/RoleSelection.tsx';
import { PreEmploymentTest } from './components/test/PreEmploymentTest.tsx';
import { Card } from './components/common/Card.tsx';
import { Icon } from './components/common/Icon.tsx';

const MOCK_CANDIDATES: Candidate[] = [
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
    references: [
        { name: 'Suresh Menon', relation: 'Former Manager', company: 'Goa Grand Casino', contact: '+91 9876543212', email: 'suresh.m@ggc.com' }
    ],
    comments: [],
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
      interviewer: 'John Doe (HOD)',
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
    comments: [],
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
      { id: 'log_003c', timestamp: '2023-10-26T12:00:00Z', user: 'HOD Mike', role: UserRole.HOD, action: 'Interview Completed' },
      { id: 'log_003d', timestamp: '2023-10-26T12:00:01Z', user: 'HOD Mike', role: UserRole.HOD, action: 'Selected by HOD' },
    ],
    comments: [],
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
        { id: 'log_004b', timestamp: '2023-10-23T11:00:00Z', user: 'Scheduler Jane', role: UserRole.Scheduler, action: 'Interview Scheduled for 2023-10-25 10:00' },
        { id: 'log_004c', timestamp: '2023-10-25T11:00:00Z', user: 'HOD Mike', role: UserRole.HOD, action: 'Interview Completed' },
        { id: 'log_004d', timestamp: '2023-10-25T11:00:01Z', user: 'HOD Mike', role: UserRole.HOD, action: 'Selected by HOD' },
        { id: 'log_004e', timestamp: '2023-10-26T10:00:00Z', user: 'Surveillance Ops', role: UserRole.Surveillance, action: 'Surveillance Cleared'},
    ],
    comments: [],
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
        { id: 'log_005b', timestamp: '2023-09-08T16:00:00Z', user: 'Scheduler Jane', role: UserRole.Scheduler, action: 'Interview Scheduled for 2023-09-10 11:00'},
        { id: 'log_005c', timestamp: '2023-09-10T12:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Interview Completed' },
        { id: 'log_005d', timestamp: '2023-09-10T12:00:01Z', user: 'Admin', role: UserRole.Admin, action: 'Selected by Admin' },
        { id: 'log_005e', timestamp: '2023-09-18T10:00:00Z', user: 'Surveillance Ops', role: UserRole.Surveillance, action: 'Surveillance Cleared' },
        { id: 'log_005f', timestamp: '2023-09-20T10:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Offer Accepted'},
        { id: 'log_005g', timestamp: '2023-09-22T11:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Joining Scheduled'},
        { id: 'log_005h', timestamp: '2023-10-01T09:00:00Z', user: 'Admin', role: UserRole.Admin, action: 'Marked as Joined'},
    ],
    comments: [],
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
        { id: 'log_006b', timestamp: '2023-10-24T10:00:00Z', user: 'Scheduler Jane', role: UserRole.Scheduler, action: 'Interview Scheduled for 2023-10-25 15:00' },
        { id: 'log_006c', timestamp: '2023-10-25T16:00:00Z', user: 'HOD Mike', role: UserRole.HOD, action: 'Interview Completed' },
        { id: 'log_006d', timestamp: '2023-10-25T16:00:01Z', user: 'HOD Mike', role: UserRole.HOD, action: 'Selected by HOD' },
        { id: 'log_006e', timestamp: '2023-10-27T16:00:00Z', user: 'Surveillance Ops', role: UserRole.Surveillance, action: 'Application Rejected'},
    ],
    comments: [],
  },
];

export const AppContext = createContext<{
  currentRole: UserRole;
  candidates: Candidate[];
  updateCandidate: (updatedCandidate: Candidate) => Promise<void>;
  addCandidate: (newCandidateData: Partial<Candidate>) => Promise<Candidate>;
}>({
  currentRole: UserRole.Admin, // Default to a non-null role
  candidates: [],
  updateCandidate: async () => {},
  addCandidate: async () => ({} as Candidate),
});

type AppState = 'role_selection' | 'admin_login' | 'candidate_portal' | 'candidate_test_confirmation' | 'candidate_test' | 'main_app';

const CreateCandidateAdminView: React.FC = () => {
  const navigate = useNavigate();
  return (
    <CreateCandidateForm 
      onSubmissionSuccess={() => navigate('/applicants')}
      onCancel={() => navigate('/applicants')}
    />
  );
};

/**
 * Recursively removes keys with `undefined` values from an object.
 * Firebase does not support `undefined` and will throw an error.
 * @param obj The object to sanitize.
 * @returns A new object with `undefined` values removed.
 */
const cleanupForFirebase = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null; // RTDB stores null, so this is better than undefined.
    }
  
    if (Array.isArray(obj)) {
      return obj.map(v => cleanupForFirebase(v));
    } else if (typeof obj === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (value !== undefined) {
                    newObj[key] = cleanupForFirebase(value);
                }
            }
        }
        return newObj;
    }
    return obj;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('role_selection');
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [candidateTakingTest, setCandidateTakingTest] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const candidatesRef = ref(db, 'candidates');

    const setupListener = () => onValue(candidatesRef, (snapshot) => {
        const data = snapshot.val();
        const candidatesData = data ? Object.keys(data).map(key => ({
            id: key,
            ...data[key],
        })) : [];
        setCandidates(candidatesData as Candidate[]);
        setDbError(null);
    }, (error) => {
        console.error("Firebase Realtime Database connection error:", error);
        const errorMessage = `Failed to connect to the database.\n\nThis could be due to network issues or Firebase security rules restricting access from this website's domain (${window.location.hostname}).`;
        setDbError(errorMessage);
    });

    const initializeApp = async () => {
        try {
            const snapshot = await get(candidatesRef);
            if (!snapshot.exists()) {
                console.log("Empty database detected. Seeding with initial data...");
                const initialData = MOCK_CANDIDATES.reduce((acc, candidate) => {
                  const { id, ...data } = candidate;
                  acc[id] = data;
                  return acc;
                }, {} as any);
                await set(candidatesRef, initialData);
            }
        } catch (error) {
            console.error("Error during initial data check/seed:", error);
            const errorMessage = `Failed to initialize the database.\n\nThis could be due to network issues or Firebase security rules restricting access from this website's domain (${window.location.hostname}).`;
            setDbError(errorMessage);
        }
        return setupListener();
    };

    let unsubscribe: () => void;
    initializeApp().then(unsub => {
        if (unsub) unsubscribe = unsub;
    }).catch(err => {
        console.error("initializeApp failed:", err);
        const errorMessage = `Failed to initialize the database connection.\n\nPlease check your Firebase configuration and security rules.`;
        setDbError(errorMessage);
    });

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, []);


  const updateCandidate = useCallback(async (updatedCandidate: Candidate) => {
    try {
      const { id, ...data } = updatedCandidate;
      const candidateRef = ref(db, `candidates/${id}`);
      const cleanData = cleanupForFirebase(data);
      await set(candidateRef, cleanData);
    } catch (error) {
      console.error("Error updating candidate in Firebase: ", error);
      alert("Error: Could not save changes. Please try again.");
      throw error;
    }
  }, []);

  const addCandidate = useCallback(async (newCandidateData: Partial<Candidate>) => {
    const candidateWithDefaults = {
      status: ApplicationStatus.New,
      statusHistory: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: newCandidateData.fullName || 'Candidate Self-Service', 
          role: UserRole.Candidate,
          action: 'Application Created',
        },
      ],
      fullName: 'Unnamed Candidate',
      dob: new Date().toISOString().split('T')[0],
      contact: { phone: '', email: '' },
      emergencyContact: { name: '', phone: '' },
      address: '',
      vacancy: 'Unspecified',
      expectedSalary: 0,
      accommodationRequired: false,
      transportRequired: false,
      createdAt: new Date().toISOString(),
      ...newCandidateData,
    };
    
    try {
      const cleanData = cleanupForFirebase(candidateWithDefaults);
      const candidatesListRef = ref(db, 'candidates');
      const newCandidateRef = push(candidatesListRef);
      await set(newCandidateRef, cleanData);

      if (!newCandidateRef.key) {
        throw new Error("Failed to get new candidate key from Firebase.");
      }
      
      return { ...cleanData, id: newCandidateRef.key } as Candidate;
    } catch (error) {
        console.error("Error adding candidate to Firebase: ", error);
        alert("Error: Could not save new candidate. Please check your connection and Firebase setup.");
        throw error;
    }
  }, []);

  if (dbError) {
    return (
        <div className="bg-casino-primary min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl text-center">
                <Icon name="x-circle" className="w-16 h-16 text-casino-danger mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-casino-danger mb-4">Database Connection Error</h1>
                <p className="text-casino-text-muted whitespace-pre-wrap">{dbError}</p>
                <p className="text-casino-text-muted mt-4">If you are the administrator, please ensure your Firebase Realtime Database security rules allow read/write access from this domain. You can also check the browser's developer console for more specific error details.</p>
            </Card>
        </div>
    );
  }

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentRole(role);
    setAppState('main_app');
  };
  
  const handleLogout = () => {
    setCurrentRole(null);
    setAppState('role_selection');
  }

  const contextValue = { 
    currentRole: currentRole || UserRole.Admin,
    candidates, 
    updateCandidate, 
    addCandidate,
  };
  
  switch(appState) {
      case 'role_selection':
        return <RoleSelection 
                  onSelectCandidate={() => setAppState('candidate_portal')}
                  onSelectAdmin={() => setAppState('admin_login')}
               />;
      
      case 'admin_login':
        return <Login 
                  onLoginSuccess={handleLoginSuccess} 
                  onBack={() => setAppState('role_selection')} 
               />;
      
      case 'candidate_portal':
        const handleCandidateFormSubmit = (newCandidate: Candidate) => {
          setCandidateTakingTest(newCandidate);
          setAppState('candidate_test_confirmation');
        };
        return (
          <AppContext.Provider value={{...contextValue, currentRole: UserRole.Candidate}}>
            <div className="bg-casino-primary min-h-screen flex items-center justify-center p-4 md:p-8">
              <div className="w-full max-w-4xl">
                <CreateCandidateForm onSubmissionSuccess={handleCandidateFormSubmit} onCancel={handleLogout} />
              </div>
            </div>
          </AppContext.Provider>
        );
      
      case 'candidate_test_confirmation':
        if (!candidateTakingTest) {
            setAppState('role_selection');
            return null;
        }
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity p-4">
                <Card className="w-full max-w-lg text-center">
                    <Icon name="clock" className="w-16 h-16 text-casino-gold mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-casino-gold mb-4">Are you ready to take the test?</h2>
                    <p className="text-casino-text-muted mb-8 text-lg">
                        You will now be directed to a test of 40 questions that needs to be answered in 10 minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => {
                                setCandidateTakingTest(null);
                                setAppState('role_selection');
                            }}
                            className="w-full bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                        >
                             <Icon name="x-circle" className="w-5 h-5 mr-2" />
                            Skip Test
                        </button>
                        <button
                            onClick={() => setAppState('candidate_test')}
                            className="w-full bg-casino-success hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <Icon name="check-circle" className="w-5 h-5 mr-2" />
                            Start
                        </button>
                    </div>
                </Card>
            </div>
        );

      case 'candidate_test':
        if (!candidateTakingTest) {
          return <RoleSelection 
                  onSelectCandidate={() => setAppState('candidate_portal')}
                  onSelectAdmin={() => setAppState('admin_login')}
               />;
        }
        return (
           <AppContext.Provider value={{...contextValue, currentRole: UserRole.Candidate}}>
            <PreEmploymentTest 
              candidate={candidateTakingTest}
              onTestComplete={() => {
                setCandidateTakingTest(null);
                setAppState('role_selection');
              }}
            />
          </AppContext.Provider>
        );

      case 'main_app':
        if (!currentRole) {
          return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setAppState('role_selection')} />;
        }
        return (
          <AppContext.Provider value={{...contextValue, currentRole}}>
            <HashRouter>
              <div className="flex h-screen bg-casino-primary">
                <Sidebar currentRole={currentRole} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col ml-64">
                  <Header currentRole={currentRole} />
                  <main className="flex-1 p-8 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard currentRole={currentRole} candidates={candidates} />} />
                      <Route path="/applicants" element={<ApplicantList candidates={candidates} />} />
                      <Route 
                        path="/applicants/new" 
                        element={
                          currentRole === UserRole.HR || currentRole === UserRole.Admin ? (
                            <CreateCandidateAdminView />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        } 
                      />
                      <Route path="/applicants/:id" element={<ApplicantProfile candidates={candidates} currentRole={currentRole} updateCandidate={updateCandidate} />} />
                      <Route path="/schedule" element={<InterviewCalendar candidates={candidates} />} />
                      <Route path="/surveillance" element={<SurveillanceQueue candidates={candidates} />} />
                      <Route path="/offers" element={<HROffers candidates={candidates} />} />
                      <Route path="/reports" element={<Reports candidates={candidates} />} />
                      <Route 
                        path="/settings" 
                        element={
                          [UserRole.Admin, UserRole.HR].includes(currentRole) ? (
                            <Settings candidates={candidates} />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        } 
                      />
                      
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </HashRouter>
          </AppContext.Provider>
        );

      default:
        return <div>Error: Invalid application state.</div>
  }
};

export default App;