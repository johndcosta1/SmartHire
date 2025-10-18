
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Candidate, UserRole, ApplicationStatus } from '../types';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Icon } from './common/Icon';
import { STATUS_COLORS, DEPARTMENTS, MARITAL_STATUSES } from '../constants';
import { FormField } from './common/FormField';

interface ApplicantProfileProps {
  candidates: Candidate[];
  currentRole: UserRole;
  updateCandidate: (updatedCandidate: Candidate) => void;
}

// Action Panels
const ActionPanel: React.FC<{title: string; children: React.ReactNode; icon: React.ComponentProps<typeof Icon>['name']}> = ({title, children, icon}) => (
    <Card className="border-l-4 border-casino-gold">
        <div className="flex items-center mb-4">
            <Icon name={icon} className="w-6 h-6 mr-3 text-casino-gold" />
            <h3 className="text-xl font-semibold text-casino-gold">{title}</h3>
        </div>
        <div>{children}</div>
    </Card>
);

const SurveillancePanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => void}> = ({candidate, updateCandidate}) => {
    const handleUpdate = (status: ApplicationStatus, action: string) => {
        const updatedCandidate: Candidate = {
            ...candidate,
            status: status,
            surveillanceReport: {
                ...candidate.surveillanceReport,
                status: status === ApplicationStatus.SurveillanceCleared ? "Clear" : "Flagged",
            },
            statusHistory: [
                ...candidate.statusHistory,
                { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user: 'Surveillance', role: UserRole.Surveillance, action }
            ]
        };
        updateCandidate(updatedCandidate);
    };

    return (
        <ActionPanel title="Surveillance Check" icon="shield-check">
            <p className="text-casino-text-muted mb-4">Update background check status for the candidate.</p>
            <div className="flex flex-col space-y-3 mt-4">
                <button type="button" onClick={() => handleUpdate(ApplicationStatus.SurveillanceCleared, 'Background Check Cleared')} className="bg-casino-success hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="check-circle" className="w-5 h-5 mr-2"/>Cleared</button>
                <button type="button" onClick={() => handleUpdate(ApplicationStatus.SurveillanceFlagged, 'Background Check Flagged')} className="bg-casino-danger hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="x-circle" className="w-5 h-5 mr-2"/>Flagged</button>
                <button type="button" className="bg-casino-warning hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="clock" className="w-5 h-5 mr-2"/>Pending</button>
            </div>
        </ActionPanel>
    );
};

const AdminPanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => void}> = ({candidate, updateCandidate}) => {
    const handleAdminAction = (newStatus: ApplicationStatus, actionText: string) => {
        const updatedCandidate: Candidate = {
            ...candidate,
            status: newStatus,
            statusHistory: [
                ...candidate.statusHistory,
                { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user: 'Admin', role: UserRole.Admin, action: actionText }
            ]
        };
        updateCandidate(updatedCandidate);
    };
    
    return (
     <ActionPanel title="Admin Onboarding" icon="briefcase">
        <p className="text-casino-text-muted mb-4">Manage the candidate's final onboarding process.</p>
        <div className="flex flex-col space-y-3">
             <button disabled={candidate.status !== ApplicationStatus.SurveillanceCleared} onClick={() => handleAdminAction(ApplicationStatus.OfferAccepted, "Offer Accepted")} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Offer Accepted</button>
             <button disabled={candidate.status !== ApplicationStatus.OfferAccepted} onClick={() => handleAdminAction(ApplicationStatus.JoiningScheduled, "Joining Scheduled")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Schedule Joining</button>
             <button disabled={candidate.status !== ApplicationStatus.JoiningScheduled} onClick={() => handleAdminAction(ApplicationStatus.Joined, "Marked as Joined")} className="bg-casino-success hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Mark as Joined</button>
        </div>
    </ActionPanel>
    );
};

const CMPanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => void}> = ({candidate, updateCandidate}) => {
    const handleDecision = (status: ApplicationStatus, action: string) => {
         const updatedCandidate: Candidate = {
            ...candidate,
            status,
            rejection: status === ApplicationStatus.Rejected ? { actor: UserRole.CasinoManager, reason: 'Rejected after interview', timestamp: new Date().toISOString() } : candidate.rejection,
            statusHistory: [...candidate.statusHistory, { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user: 'Casino Manager', role: UserRole.CasinoManager, action }]
        };
        updateCandidate(updatedCandidate);
    };

    return (
        <ActionPanel title="Interview Feedback" icon="user-plus">
            <p className="text-casino-text-muted mb-4">Provide the outcome of the interview.</p>
            <div className="flex flex-col space-y-3 mt-4">
                <button type="button" onClick={() => handleDecision(ApplicationStatus.PendingSurveillance, 'Selected for Surveillance')} className="bg-casino-success hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="check-circle" className="w-5 h-5 mr-2"/>Selected</button>
                <button type="button" onClick={() => handleDecision(ApplicationStatus.InterviewCompleted, 'Interview outcome is pending')} className="bg-casino-warning hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="clock" className="w-5 h-5 mr-2"/>Pending</button>
                <button type="button" onClick={() => handleDecision(ApplicationStatus.Rejected, 'Rejected after interview')} className="bg-casino-danger hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="x-circle" className="w-5 h-5 mr-2"/>Rejected</button>
            </div>
        </ActionPanel>
    );
};

const SchedulerPanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => void}> = ({candidate, updateCandidate}) => {
    const [interviewDate, setInterviewDate] = useState(candidate.interview?.date || '');
    const [interviewTime, setInterviewTime] = useState(candidate.interview?.time || '');

    const handleScheduleInterview = () => {
        if (!interviewDate || !interviewTime) {
            alert("Please select a date and time for the interview.");
            return;
        }
        const updatedCandidate: Candidate = {
            ...candidate,
            status: ApplicationStatus.InterviewScheduled,
            interview: {
                id: `int_${candidate.id.slice(-3)}`,
                interviewer: 'Casino Manager',
                date: interviewDate,
                time: interviewTime,
                type: 'In-Person',
                feedback: '',
                score: 0,
                recommendation: 'Pass',
            },
            statusHistory: [
                ...candidate.statusHistory,
                {
                    id: `log_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    user: 'Scheduler',
                    role: UserRole.Scheduler,
                    action: `Interview Scheduled for ${interviewDate} at ${interviewTime}`,
                }
            ]
        };
        updateCandidate(updatedCandidate);
    };

    return (
        <ActionPanel title="Schedule Interview" icon="calendar">
            <p className="text-casino-text-muted mb-4">Schedule interview date and time for the candidate.</p>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-casino-text-muted mb-1">Interview Date:</label>
                        <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full bg-casino-primary border border-gray-600 rounded-md py-2 px-3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-casino-text-muted mb-1">Interview Time:</label>
                        <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full bg-casino-primary border border-gray-600 rounded-md py-2 px-3" />
                    </div>
                </div>
                <button type="button" onClick={handleScheduleInterview} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg w-full">Schedule Interview</button>
            </div>
        </ActionPanel>
    );
};

export const ApplicantProfile: React.FC<ApplicantProfileProps> = ({ candidates, currentRole, updateCandidate }) => {
  const { id } = useParams<{ id: string }>();
  const candidate = candidates.find(c => c.id === id);

  const [formData, setFormData] = useState<Candidate | null>(candidate || null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const canEdit = currentRole === UserRole.HR;
  const canEditJobSection = currentRole === UserRole.HR || currentRole === UserRole.CasinoManager;
  const canEditHRRatings = currentRole === UserRole.HR;
  const canEditManagerRatings = currentRole === UserRole.CasinoManager;

  useEffect(() => {
    if (candidate) {
        setFormData(candidate);
    }
  }, [candidate]);

  if (!candidate || !formData) {
    return <div className="text-center p-10">
        <h2 className="text-2xl text-casino-danger">Applicant not found.</h2>
        <Link to="/applicants" className="text-casino-gold hover:underline mt-4 inline-block">Back to list</Link>
    </div>;
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newPhotoUrl = reader.result as string;
            setFormData(prev => ({
                ...prev!,
                photoUrl: newPhotoUrl
            }));
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    let val: string | number | boolean = type === 'checkbox' ? checked : value;

    if (type === 'number' || name.endsWith('score')) {
      val = value === '' ? '' : Number(value);
    }

    const parts = name.split('.');

    setFormData(prev => {
        if (!prev) return null;

        if (parts.length === 1) {
            return { ...prev, [name]: val };
        } 
        
        if (parts.length === 2) {
            const [parent, child] = parts;
            return {
                ...prev,
                [parent]: { 
                    ...((prev as any)[parent] || {}), 
                    [child]: val 
                },
            };
        } 
        
        if (parts.length === 3) {
            const [parent, child, grandchild] = parts;
            const prevParent = (prev as any)[parent] || {};
            const prevChild = prevParent[child] || {};
            
            return {
                ...prev,
                [parent]: {
                    ...prevParent,
                    [child]: { 
                        ...prevChild, 
                        [grandchild]: val 
                    },
                },
            };
        }
        return prev;
    });
  };

  const handleRepeatingChange = (section: 'qualifications' | 'workExperience' | 'references', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (!canEdit) return;
      const { name, value } = e.target;
      setFormData(prev => {
          if (!prev) return null;
          const newSectionData = prev[section] ? [...prev[section]!] : [];
          if(newSectionData[index]) {
            (newSectionData[index] as any)[name] = value;
          }
          return { ...prev, [section]: newSectionData };
      });
  };

  const addRepeatingField = (section: 'qualifications' | 'workExperience' | 'references') => {
      if (!formData || !canEdit || (formData[section]?.length || 0) >= 3) return;
      let newItem: object = {};
      if (section === 'qualifications') newItem = { name: '', institute: '', year: '' };
      if (section === 'workExperience') newItem = { company: '', role: '', from: '', to: '', responsibilities: '' };
      if (section === 'references') newItem = { name: '', relation: '', company: '', contact: '', email: '' };
      setFormData(prev => ({ ...prev!, [section]: [...(prev![section] || []), newItem] }));
  };

  const handleUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!candidate) return;

      if (currentRole === UserRole.HR) {
          const finalCandidate: Candidate = {
              ...formData,
              ratings: {
                  ...candidate.ratings,
                  hr: formData.ratings?.hr,
              },
          };
          updateCandidate(finalCandidate);
          alert("Candidate details updated!");
          return;
      }

      if (currentRole === UserRole.CasinoManager) {
          const finalCandidate: Candidate = {
              ...candidate,
              vacancy: formData.vacancy,
              positionOffered: formData.positionOffered,
              department: formData.department,
              expectedSalary: formData.expectedSalary,
              accommodationRequired: formData.accommodationRequired,
              transportRequired: formData.transportRequired,
              ratings: {
                  // Explicitly preserve HR ratings from original candidate
                  hr: candidate.ratings?.hr,
                  // Take the manager-editable fields from the current form state
                  manager: formData.ratings?.manager,
                  cm: formData.ratings?.cm,
                  department: formData.ratings?.department,
              },
          };
          updateCandidate(finalCandidate);
          alert("Job & Compensation and Manager ratings updated!");
          return;
      }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const renderActionPanel = () => {
      if (currentRole === UserRole.Scheduler && candidate.status === ApplicationStatus.New) {
        return <SchedulerPanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      if (currentRole === UserRole.CasinoManager && candidate.status === ApplicationStatus.InterviewScheduled) {
        return <CMPanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      if (currentRole === UserRole.Surveillance && candidate.status === ApplicationStatus.PendingSurveillance) {
        return <SurveillancePanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      if (currentRole === UserRole.Admin && [ApplicationStatus.SurveillanceCleared, ApplicationStatus.OfferAccepted, ApplicationStatus.JoiningScheduled].includes(candidate.status)) {
        return <AdminPanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      return null;
  }
  
  const canSaveChanges = currentRole === UserRole.HR || currentRole === UserRole.CasinoManager;

  return (
    <div id="printable-profile">
      <form onSubmit={handleUpdate}>
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <img 
                        className="h-24 w-24 rounded-full object-cover border-4 border-casino-secondary" 
                        src={formData.photoUrl || `https://ui-avatars.com/api/?name=${formData.fullName.replace(' ', '+')}&background=2d3748&color=e2e8f0&size=128`} 
                        alt={`${formData.fullName}'s profile`} 
                    />
                    {canEdit && (
                        <div className="absolute bottom-0 right-0 no-print-in-profile">
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="bg-casino-gold p-2 rounded-full hover:bg-yellow-600 transition-colors">
                                <Icon name="upload" className="w-4 h-4 text-casino-primary" />
                            </button>
                            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-casino-gold">{formData.fullName}</h1>
                    <p className="text-casino-text-muted">{formData.vacancy}</p>
                </div>
            </div>
             <div className="flex items-center space-x-4">
                {currentRole === UserRole.CasinoManager && (
                <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-casino-accent hover:bg-yellow-700 text-casino-primary font-bold py-2 px-4 rounded-lg flex items-center transition-colors no-print"
                >
                    <Icon name="download" className="w-5 h-5 mr-2" />
                    Export to PDF
                </button>
                )}
                <Badge status={formData.status} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <Card title="Personal Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required disabled={!canEdit} />
                      <FormField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required disabled={!canEdit} />
                      <FormField label="Age" name="age" type="number" value={formData.age || ''} onChange={handleChange} disabled={!canEdit} />
                      <FormField label="Address" name="address" type="textarea" value={formData.address} onChange={handleChange} required className="md:col-span-2 lg:col-span-3" disabled={!canEdit} />
                      <FormField label="Mobile No." name="contact.phone" type="tel" value={formData.contact.phone} onChange={handleChange} required disabled={!canEdit} />
                      <FormField label="Email" name="contact.email" type="email" value={formData.contact.email} onChange={handleChange} disabled={!canEdit} />
                      <FormField label="Emergency Contact Name" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} required disabled={!canEdit} />
                      <FormField label="Emergency Contact Number" name="emergencyContact.phone" type="tel" value={formData.emergencyContact.phone} onChange={handleChange} required disabled={!canEdit} />
                      <FormField label="Medical Conditions" name="medicalConditions" type="textarea" value={formData.medicalConditions || ''} onChange={handleChange} disabled={!canEdit} />
                      <FormField label="Religion" name="religion" value={formData.religion || ''} onChange={handleChange} disabled={!canEdit} />
                      <FormField label="Marital Status" name="maritalStatus" type="select" options={MARITAL_STATUSES} value={formData.maritalStatus || 'Single'} onChange={handleChange} disabled={!canEdit} />
                  </div>
              </Card>

              <Card title="Job & Compensation">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField label="Job Role Applied For" name="vacancy" type="text" value={formData.vacancy} onChange={handleChange} placeholder="e.g., Senior Croupier" required disabled={!canEditJobSection} />
                      <FormField label="Position Offered" name="positionOffered" value={formData.positionOffered || ''} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Department" name="department" type="select" options={DEPARTMENTS} value={formData.department || ''} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Expected Salary" name="expectedSalary" type="number" value={formData.expectedSalary} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Accommodation Required" name="accommodationRequired" type="checkbox" checked={formData.accommodationRequired} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Transport Required" name="transportRequired" type="checkbox" checked={formData.transportRequired} onChange={handleChange} disabled={!canEditJobSection} />
                  </div>
              </Card>
              
               <Card title="Interview & Ratings">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField label="HR Interviewer Name" name="ratings.hr.interviewer" value={formData.ratings?.hr?.interviewer || ''} onChange={handleChange} disabled={!canEditHRRatings}/>
                      <FormField label="HR Total Rating (0-3)" name="ratings.hr.score" type="number" min="0" max="3" value={formData.ratings?.hr?.score || ''} onChange={handleChange} disabled={!canEditHRRatings}/>
                      <FormField label="Manager Total Rating (0-3)" name="ratings.manager.score" type="number" min="0" max="3" value={formData.ratings?.manager?.score || ''} onChange={handleChange} disabled={!canEditManagerRatings}/>
                      <FormField label="CM Total Rating (0-3)" name="ratings.cm.score" type="number" min="0" max="3" value={formData.ratings?.cm?.score || ''} onChange={handleChange} disabled={!canEditManagerRatings}/>
                      <FormField label="Department Interviewer Name" name="ratings.department.interviewer" value={formData.ratings?.department?.interviewer || ''} onChange={handleChange} disabled={!canEditManagerRatings}/>
                  </div>
              </Card>

               <Card title="Qualifications & Experience">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Total Work Experience (Years)" name="totalWorkExperience" type="number" value={formData.totalWorkExperience || ''} onChange={handleChange} disabled={!canEdit}/>
                      <FormField label="Languages Known" name="languagesKnown" value={formData.languagesKnown || ''} onChange={handleChange} placeholder="e.g., English, Hindi, Konkani" disabled={!canEdit}/>
                  </div>
                  <div className="mt-4">
                       <h4 className="text-casino-text-muted font-semibold mb-2">Qualifications (Max 3)</h4>
                      {(formData.qualifications || []).map((q, i) => (
                           <div key={i} className="grid grid-cols-3 gap-2 p-2 border border-gray-700 rounded mb-2">
                              <input name="name" value={q.name} onChange={(e) => handleRepeatingChange('qualifications', i, e)} placeholder="Qualification" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                              <input name="institute" value={q.institute} onChange={(e) => handleRepeatingChange('qualifications', i, e)} placeholder="Institute" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                              <input name="year" value={q.year} onChange={(e) => handleRepeatingChange('qualifications', i, e)} placeholder="Year" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                          </div>
                      ))}
                      {canEdit && <button type="button" onClick={() => addRepeatingField('qualifications')} className="text-sm text-casino-gold no-print-in-profile">+ Add Qualification</button>}
                  </div>
                   <div className="mt-4">
                       <h4 className="text-casino-text-muted font-semibold mb-2">Work Experience (Max 3)</h4>
                      {(formData.workExperience || []).map((w, i) => (
                           <div key={i} className="p-2 border border-gray-700 rounded mb-2 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                  <input name="company" value={w.company} onChange={(e) => handleRepeatingChange('workExperience', i, e)} placeholder="Company" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                                  <input name="role" value={w.role} onChange={(e) => handleRepeatingChange('workExperience', i, e)} placeholder="Role" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                                  <input name="from" value={w.from} onChange={(e) => handleRepeatingChange('workExperience', i, e)} placeholder="From (YYYY-MM)" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                                  <input name="to" value={w.to} onChange={(e) => handleRepeatingChange('workExperience', i, e)} placeholder="To (YYYY-MM)" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                              </div>
                          </div>
                      ))}
                      {canEdit && <button type="button" onClick={() => addRepeatingField('workExperience')} className="text-sm text-casino-gold no-print-in-profile">+ Add Experience</button>}
                  </div>
              </Card>
              
              {canSaveChanges && (
                  <div className="flex justify-end items-center py-4 no-print">
                      <button type="submit" className="bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-2 px-6 rounded-lg flex items-center transition-colors">
                          <Icon name="check-circle" className="w-5 h-5 mr-2" />
                          Save Changes
                      </button>
                  </div>
              )}
          </div>
          <div className="space-y-6">
            <div className="no-print">
              {renderActionPanel()}
            </div>
            <Card title="Audit Trail">
              <ul className="space-y-4">
                {formData.statusHistory.slice().reverse().map(log => (
                  <li key={log.id} className="flex items-start">
                    <div className={`w-3 h-3 ${STATUS_COLORS[candidate.status] || 'bg-gray-400'} rounded-full mt-1.5 mr-3`}></div>
                    <div>
                      <p className="font-semibold text-casino-text">{log.action}</p>
                      <p className="text-xs text-casino-text-muted">{log.user} ({log.role})</p>
                      <p className="text-xs text-casino-text-muted">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
