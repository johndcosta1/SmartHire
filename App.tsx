import React, { useState, createContext, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, Candidate, ApplicationStatus } from './types';
import { MOCK_CANDIDATES, USER_ROLES } from './constants';
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
import { ImportModal } from './components/common/ImportModal';

export const AppContext = createContext<{
  currentRole: UserRole;
  candidates: Candidate[];
  updateCandidate: (updatedCandidate: Candidate) => void;
  addCandidate: (newCandidateData: Partial<Candidate>) => void;
  setCandidates: (candidates: Candidate[]) => void;
}>({
  currentRole: USER_ROLES[0],
  candidates: [],
  updateCandidate: () => {},
  addCandidate: () => {},
  setCandidates: () => {},
});

const CANDIDATES_STORAGE_KEY = 'smartHireCandidates';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
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
          user: 'HR User', 
          role: UserRole.HR,
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
  }, []);

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentRole(role);
    setIsImportModalOpen(true);
  };

  if (!currentRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppContext.Provider value={{ currentRole, candidates, updateCandidate, addCandidate, setCandidates }}>
      <HashRouter>
        <div className="flex h-screen bg-casino-primary">
          <Sidebar currentRole={currentRole} onLogout={() => setCurrentRole(null)} />
          <div className="flex-1 flex flex-col ml-64">
            <Header currentRole={currentRole} />
            <main className="flex-1 p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard currentRole={currentRole} candidates={candidates} />} />
                <Route path="/applicants" element={<ApplicantList candidates={candidates} />} />
                <Route 
                  path="/applicants/new" 
                  element={
                    currentRole === UserRole.HR ? (
                      <CreateCandidateForm />
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
        <ImportModal 
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;