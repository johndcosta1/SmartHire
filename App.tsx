
import React, { useState, createContext, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, Candidate, ApplicationStatus } from './types';
import { MOCK_CANDIDATES } from './constants';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ApplicantList } from './components/ApplicantList';
import { ApplicantProfile } from './components/ApplicantProfile';
import { CreateCandidateForm } from './components/CreateCandidateForm';
import { Login } from './components/Login';
import { InterviewCalendar } from './components/InterviewCalendar';
import { SurveillanceQueue } from './components/SurveillanceQueue';
import { HROffers } from './components/HROffers';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { RoleSelection } from './components/RoleSelection';
import { PreEmploymentTest } from './components/test/PreEmploymentTest';
import { Card } from './components/common/Card';
import { Icon } from './components/common/Icon';

export const AppContext = createContext<{
  currentRole: UserRole;
  candidates: Candidate[];
  updateCandidate: (updatedCandidate: Candidate) => void;
  addCandidate: (newCandidateData: Partial<Candidate>) => Candidate;
  setCandidates: (candidates: Candidate[]) => void;
}>({
  currentRole: UserRole.Admin, // Default to a non-null role
  candidates: [],
  updateCandidate: () => {},
  addCandidate: () => ({} as Candidate),
  setCandidates: () => {},
});

const CANDIDATES_STORAGE_KEY = 'smartHireCandidates';

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

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('role_selection');
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [candidateTakingTest, setCandidateTakingTest] = useState<Candidate | null>(null);
  
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const storedCandidates = window.localStorage.getItem(CANDIDATES_STORAGE_KEY);
      if (storedCandidates) {
        return JSON.parse(storedCandidates);
      }
    } catch (error) {
      console.error("Error reading candidates from localStorage", error);
    }
    return MOCK_CANDIDATES;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(candidates));
    } catch (error) {
      console.error("Error saving candidates to localStorage", error);
    }
  }, [candidates]);
  
  const updateCandidate = useCallback((updatedCandidate: Candidate) => {
      setCandidates(prevCandidates => 
        prevCandidates.map(c => c.id === updatedCandidate.id ? updatedCandidate : c)
      );
  }, []);

  const addCandidate = useCallback((newCandidateData: Partial<Candidate>) => {
    const newCandidate: Candidate = {
      id: `cand_${String(Date.now()).slice(-4)}`,
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
      // Set defaults for required fields that might be missing
      fullName: 'Unnamed Candidate',
      vacancy: 'Unspecified',
      contact: { phone: '', email: '' },
      emergencyContact: { name: '', phone: ''},
      address: '',
      expectedSalary: 0,
      accommodationRequired: false,
      transportRequired: false,
      createdAt: new Date().toISOString(),
      dob: new Date().toISOString().split('T')[0],
      ...newCandidateData,
    };
    setCandidates(prev => [newCandidate, ...prev]);
    return newCandidate;
  }, []);

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
    setCandidates 
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
