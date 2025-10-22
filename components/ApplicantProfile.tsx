import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Candidate, UserRole, ApplicationStatus, AuditLog, Comment } from '../types';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Icon } from './common/Icon';
import { STATUS_COLORS, DEPARTMENTS, MARITAL_STATUSES } from '../constants';
import { FormField } from './common/FormField';
import { HiringStatusTracker } from './common/HiringStatusTracker';

/**
 * Creates a deep clone of an object, removing any circular references
 * to make it safe for JSON serialization and state management.
 * This is particularly useful for cleaning objects retrieved from Firestore.
 */
const sanitizeObject = <T extends {}>(obj: T | null | undefined): T | null => {
    if (!obj) return null;
    const cache = new Set();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                // Circular reference found, discard it.
                return undefined;
            }
            cache.add(value);
        }
        return value;
    }));
};

/**
 * Helper to safely stringify objects that might contain circular references,
 * which can occur with complex state objects or data from libraries like Firebase.
 */
const safeJsonStringify = (obj: any): string => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) return; // Don't stringify circular references
            cache.add(value);
        }
        return value;
    });
};

interface ApplicantProfileProps {
  candidates: Candidate[];
  currentRole: UserRole;
  updateCandidate: (updatedCandidate: Candidate) => Promise<void>;
}

const generateChangeLogs = (original: Candidate, updated: Candidate, user: string, role: UserRole, fieldsToTrack: string[]): AuditLog[] => {
    const logs: AuditLog[] = [];
    const now = Date.now();

    const getValueFromPath = (obj: any, path: string): any => {
        return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
    };

    const formatKey = (keyPath: string): string => {
        return keyPath
            .replace(/([A-Z])/g, ' $1')
            .replace(/\./g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    fieldsToTrack.forEach(path => {
        const originalValue = getValueFromPath(original, path);
        const updatedValue = getValueFromPath(updated, path);

        if (safeJsonStringify(originalValue) === safeJsonStringify(updatedValue)) {
            return;
        }

        if (typeof originalValue === 'boolean' && typeof updatedValue === 'boolean') {
             logs.push({
                id: `log_${now}_${logs.length}`,
                timestamp: new Date().toISOString(),
                user,
                role,
                action: `${formatKey(path)} set to "${updatedValue ? 'Yes' : 'No'}".`
            });
            return;
        }

        if (Array.isArray(originalValue) || Array.isArray(updatedValue)) {
            logs.push({
                id: `log_${now}_${logs.length}`,
                timestamp: new Date().toISOString(),
                user,
                role,
                action: `${formatKey(path)} was updated.`
            });
            return;
        }

        const from = originalValue !== null && originalValue !== undefined && originalValue !== '' ? `from "${originalValue}"` : 'from empty';
        const to = updatedValue !== null && updatedValue !== undefined && updatedValue !== '' ? `to "${updatedValue}"` : 'to empty';
        
        logs.push({
            id: `log_${now}_${logs.length}`,
            timestamp: new Date().toISOString(),
            user,
            role,
            action: `${formatKey(path)} changed ${from} ${to}.`
        });
    });

    return logs;
};

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

const SurveillancePanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => Promise<void>}> = ({candidate, updateCandidate}) => {
    const handleUpdate = async (status: ApplicationStatus, action: string) => {
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
        await updateCandidate(updatedCandidate);
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

const AdminPanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => Promise<void>}> = ({candidate, updateCandidate}) => {
    const handleAdminAction = async (newStatus: ApplicationStatus, actionText: string) => {
        const updatedCandidate: Candidate = {
            ...candidate,
            status: newStatus,
            statusHistory: [
                ...candidate.statusHistory,
                { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user: 'Admin', role: UserRole.Admin, action: actionText }
            ]
        };
        await updateCandidate(updatedCandidate);
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

const HODPanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => Promise<void>}> = ({candidate, updateCandidate}) => {
    const handleDecision = async (status: ApplicationStatus, action: string) => {
         const now = new Date();
         let newStatusHistory = [...candidate.statusHistory];

         // For final decisions (Selected/Rejected), add two log entries.
         if (status === ApplicationStatus.PendingSurveillance || status === ApplicationStatus.Rejected) {
            newStatusHistory.push({
                id: `log_${now.getTime()}_a`,
                timestamp: now.toISOString(),
                user: 'HOD',
                role: UserRole.HOD,
                action: 'Interview Completed'
            });
            newStatusHistory.push({
                id: `log_${now.getTime()}_b`,
                timestamp: new Date(now.getTime() + 1).toISOString(), // Ensure different timestamp for key
                user: 'HOD',
                role: UserRole.HOD,
                action: action // This will be 'Selected by HOD' or 'Rejected after interview'
            });
         } else {
             // For 'Pending' status, add a single entry.
            newStatusHistory.push({
                id: `log_${now.getTime()}`,
                timestamp: now.toISOString(),
                user: 'HOD',
                role: UserRole.HOD,
                action: action
            });
         }
        
         const updatedCandidate: Candidate = {
            ...candidate,
            status,
            rejection: status === ApplicationStatus.Rejected ? { actor: UserRole.HOD, reason: 'Rejected after interview', timestamp: now.toISOString() } : candidate.rejection,
            statusHistory: newStatusHistory
        };
        await updateCandidate(updatedCandidate);
    };

    return (
        <ActionPanel title="Interview Feedback" icon="user-plus">
            <p className="text-casino-text-muted mb-4">Provide the outcome of the interview.</p>
            <div className="flex flex-col space-y-3 mt-4">
                <button type="button" onClick={() => handleDecision(ApplicationStatus.PendingSurveillance, 'Selected by HOD')} className="bg-casino-success hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="check-circle" className="w-5 h-5 mr-2"/>Selected</button>
                <button type="button" onClick={() => handleDecision(ApplicationStatus.InterviewCompleted, 'Interview outcome is pending')} className="bg-casino-warning hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="clock" className="w-5 h-5 mr-2"/>Pending</button>
                <button type="button" onClick={() => handleDecision(ApplicationStatus.Rejected, 'Rejected after interview')} className="bg-casino-danger hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Icon name="x-circle" className="w-5 h-5 mr-2"/>Rejected</button>
            </div>
        </ActionPanel>
    );
};

const SchedulerPanel: React.FC<{candidate: Candidate, updateCandidate: (c: Candidate) => Promise<void>}> = ({candidate, updateCandidate}) => {
    const [interviewDate, setInterviewDate] = useState(candidate.interview?.date || '');
    const [interviewTime, setInterviewTime] = useState(candidate.interview?.time || '');

    const handleScheduleInterview = async () => {
        if (!interviewDate || !interviewTime) {
            alert("Please select a date and time for the interview.");
            return;
        }
        const updatedCandidate: Candidate = {
            ...candidate,
            status: ApplicationStatus.InterviewScheduled,
            interview: {
                id: `int_${candidate.id.slice(-3)}`,
                interviewer: 'HOD',
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
        await updateCandidate(updatedCandidate);
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

const StarRating: React.FC<{
  score: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}> = ({ score, onRate, disabled }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => !disabled && onRate(star)}
          className={`text-3xl transition-transform duration-150 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-125'} ${star <= score ? 'text-casino-gold' : 'text-gray-600'}`}
          aria-label={`Rate ${star} out of 5`}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export const ApplicantProfile: React.FC<ApplicantProfileProps> = ({ candidates, currentRole, updateCandidate }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidate = candidates.find(c => c.id === id);

  const [formData, setFormData] = useState<Candidate | null>(sanitizeObject(candidate));
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [commenterEmpId, setCommenterEmpId] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const canEdit = currentRole === UserRole.HR;
  const canEditJobSection = currentRole === UserRole.HR || currentRole === UserRole.HOD;

  useEffect(() => {
    setFormData(sanitizeObject(candidate));
  }, [candidate]);

  useEffect(() => {
    if (currentRole !== UserRole.HR) return;

    const hrRatings = formData?.ratings?.hr;
    if (hrRatings) {
        const scores = [
            hrRatings.personality,
            hrRatings.attitude,
            hrRatings.presentable,
            hrRatings.communication,
            hrRatings.confidence,
        ].filter((s): s is number => typeof s === 'number' && s >= 1 && s <= 5);

        const newScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        if (hrRatings.score !== newScore) {
            setFormData(prev => {
                if (!prev || !prev.ratings || !prev.ratings.hr) return prev;
                return {
                    ...prev,
                    ratings: {
                        ...prev.ratings,
                        hr: {
                            ...prev.ratings.hr,
                            score: newScore,
                        },
                    },
                };
            });
        }
    }
  }, [
    formData?.ratings?.hr?.personality,
    formData?.ratings?.hr?.attitude,
    formData?.ratings?.hr?.presentable,
    formData?.ratings?.hr?.communication,
    formData?.ratings?.hr?.confidence,
    currentRole,
    formData?.ratings?.hr,
  ]);


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

    if (type === 'number' || name.endsWith('score') || name.endsWith('salary')) {
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

  const handleRatingChange = (name: string, rating: number) => {
    if (!canEdit) return;
    const parts = name.split('.');
    setFormData(prev => {
        if (!prev || parts.length !== 3) return prev;
        
        const [parent, child, grandchild] = parts;
        const prevParent = (prev as any)[parent] || {};
        const prevChild = prevParent[child] || {};
        
        return {
            ...prev,
            [parent]: {
                ...prevParent,
                [child]: {
                    ...prevChild,
                    [grandchild]: rating,
                },
            },
        };
    });
};


  const handleRepeatingChange = (section: 'qualifications' | 'workExperience' | 'references', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (!canEdit) return;
      const { name, value } = e.target;
      setFormData(prev => {
          if (!prev || !prev[section]) return prev;
          
          const newSectionData = (prev[section] as any[]).map((item, i) => {
              if (i === index) {
                  return { ...item, [name]: value };
              }
              return item;
          });

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate || !formData) return;

    let newLogs: AuditLog[] = [];
    let finalCandidate: Candidate;

    if (currentRole === UserRole.HR) {
        const hrInterviewerName = formData.ratings?.hr?.interviewer || 'HR Staff';
        const hrFieldsToTrack = [
            'fullName', 'dob', 'age', 'address', 'contact.phone', 'contact.email',
            'emergencyContact.name', 'emergencyContact.phone', 'medicalConditions',
            'religion', 'maritalStatus', 'totalWorkExperience', 'languagesKnown',
            'qualifications', 'workExperience', 'references',
            'ratings.hr.interviewer', 'ratings.hr.personality', 'ratings.hr.attitude',
            'ratings.hr.presentable', 'ratings.hr.communication', 'ratings.hr.confidence',
            'ratings.hr.evaluation', 'vacancy', 'positionOffered', 'department',
            'expectedSalary', 'accommodationRequired', 'transportRequired',
            'offer.salary', 'offer.joiningDate', 'offer.accommodationDetails'
        ];
        newLogs = generateChangeLogs(candidate, formData, hrInterviewerName, UserRole.HR, hrFieldsToTrack);

        finalCandidate = {
            ...formData,
            statusHistory: [...formData.statusHistory, ...newLogs],
        };

    } else if (currentRole === UserRole.HOD) {
        const hodFieldsToTrack = [
            'vacancy', 'positionOffered', 'department', 'expectedSalary',
            'accommodationRequired', 'transportRequired', 'ratings.manager.score',
            'ratings.cm.score', 'ratings.department.interviewer'
        ];
        
        newLogs = generateChangeLogs(candidate, formData, 'HOD', UserRole.HOD, hodFieldsToTrack);

        finalCandidate = {
            ...candidate,
            vacancy: formData.vacancy,
            positionOffered: formData.positionOffered,
            department: formData.department,
            expectedSalary: formData.expectedSalary,
            accommodationRequired: formData.accommodationRequired,
            transportRequired: formData.transportRequired,
            ratings: {
                ...candidate.ratings,
                manager: formData.ratings?.manager,
                cm: formData.ratings?.cm,
                department: formData.ratings?.department,
            },
            statusHistory: [...candidate.statusHistory, ...newLogs],
        };
    } else {
        return; // No update logic for other roles
    }
    
    if (newLogs.length > 0) {
        await updateCandidate(finalCandidate);
        alert("Candidate details updated successfully!");
        navigate('/applicants');
    } else {
        alert("No changes were made.");
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
    const handleSaveComment = async () => {
        if (!commentText.trim() || !commenterName.trim() || !commenterEmpId.trim()) {
            alert('Please fill in your name, employee ID, and comment before submitting.');
            return;
        }

        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: commenterName,
            empId: commenterEmpId,
            comment: commentText,
            role: currentRole,
        };

        const updatedCandidate: Candidate = {
            ...candidate,
            comments: [...(candidate.comments || []), newComment],
        };

        await updateCandidate(updatedCandidate);
        navigate('/applicants');
    };

  const renderActionPanel = () => {
      if (currentRole === UserRole.Scheduler && candidate.status === ApplicationStatus.New) {
        return <SchedulerPanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      if (currentRole === UserRole.HOD && candidate.status === ApplicationStatus.InterviewScheduled) {
        return <HODPanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      if (currentRole === UserRole.Surveillance && candidate.status === ApplicationStatus.PendingSurveillance) {
        return <SurveillancePanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      if (currentRole === UserRole.Admin && [ApplicationStatus.SurveillanceCleared, ApplicationStatus.OfferAccepted, ApplicationStatus.JoiningScheduled].includes(candidate.status)) {
        return <AdminPanel candidate={candidate} updateCandidate={updateCandidate} />;
      }
      return null;
  }
  
  const getTestRating = (score: number) => {
    if (score >= 35) return { text: '⭐ Excellent', color: 'text-casino-success' };
    if (score >= 28) return { text: '✅ Good', color: 'text-teal-400' };
    if (score >= 20) return { text: '⚙️ Average', color: 'text-casino-warning' };
    return { text: '❌ Below Average', color: 'text-casino-danger' };
  };

  const canSaveChanges = currentRole === UserRole.HR || currentRole === UserRole.HOD;

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
                {currentRole === UserRole.HOD && (
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

        <HiringStatusTracker candidate={formData} />

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
                  <div className="mt-4">
                       <h4 className="text-casino-text-muted font-semibold mb-2">References (Max 3)</h4>
                      {(formData.references || []).map((r, i) => (
                           <div key={i} className="p-2 border border-gray-700 rounded mb-2 space-y-2">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                   <input name="name" value={r.name} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Name" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                                   <input name="relation" value={r.relation} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Relation" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                                   <input name="company" value={r.company} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Company" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                   <input name="contact" value={r.contact} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Contact No." className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                                   <input name="email" type="email" value={r.email} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Email" className="bg-casino-primary border-gray-600 rounded p-1 text-sm disabled:cursor-not-allowed" disabled={!canEdit}/>
                               </div>
                          </div>
                      ))}
                      {canEdit && <button type="button" onClick={() => addRepeatingField('references')} className="text-sm text-casino-gold no-print-in-profile">+ Add Reference</button>}
                  </div>
              </Card>

               <Card title="HR Interview & Ratings">
                    <div>
                        {/* HR Evaluation Section */}
                        <div className="pt-4">
                            <h4 className="text-lg font-semibold text-casino-text-muted mb-3">HR Evaluation</h4>
                             <div className="space-y-6">
                                <FormField label="HR Interviewer Name" name="ratings.hr.interviewer" value={formData.ratings?.hr?.interviewer || ''} onChange={handleChange} disabled={!canEdit} />
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-casino-text-muted">Overall Personality</label>
                                            <StarRating score={formData.ratings?.hr?.personality || 0} onRate={(r) => handleRatingChange('ratings.hr.personality', r)} disabled={!canEdit} />
                                        </div>
                                        <p className="text-xs text-casino-text-muted mt-1">Observe the candidate’s overall demeanor, including appearance, smile, and general impression.</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-casino-text-muted">Attitude</label>
                                            <StarRating score={formData.ratings?.hr?.attitude || 0} onRate={(r) => handleRatingChange('ratings.hr.attitude', r)} disabled={!canEdit} />
                                        </div>
                                        <p className="text-xs text-casino-text-muted mt-1">Assess whether the candidate demonstrates a positive and cooperative attitude.</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-casino-text-muted">Presentable</label>
                                            <StarRating score={formData.ratings?.hr?.presentable || 0} onRate={(r) => handleRatingChange('ratings.hr.presentable', r)} disabled={!canEdit} />
                                        </div>
                                        <p className="text-xs text-casino-text-muted mt-1">Check if the candidate maintains a professional and well-groomed appearance.</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-casino-text-muted">Communication Skills</label>
                                            <StarRating score={formData.ratings?.hr?.communication || 0} onRate={(r) => handleRatingChange('ratings.hr.communication', r)} disabled={!canEdit} />
                                        </div>
                                        <p className="text-xs text-casino-text-muted mt-1">Evaluate how clearly and fluently the candidate communicates.</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-casino-text-muted">Confidence</label>
                                            <StarRating score={formData.ratings?.hr?.confidence || 0} onRate={(r) => handleRatingChange('ratings.hr.confidence', r)} disabled={!canEdit} />
                                        </div>
                                        <p className="text-xs text-casino-text-muted mt-1">Note the candidate’s confidence while speaking and presenting themselves.</p>
                                    </div>
                                </div>
                                
                                <FormField 
                                    label="HR Interviewer's Evaluation"
                                    name="ratings.hr.evaluation"
                                    type="textarea"
                                    rows={4}
                                    value={formData.ratings?.hr?.evaluation || ''}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    placeholder="Provide a summary of the interview, candidate's strengths, weaknesses, and overall impression..."
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-casino-text-muted mb-1">HR Final Rating (Calculated)</label>
                                    <div className="flex items-center space-x-4 p-3 bg-casino-primary rounded-md">
                                        <span className="text-2xl font-bold text-casino-gold">
                                            {(formData.ratings?.hr?.score || 0).toFixed(1)} / 5
                                        </span>
                                        <div className="w-full bg-gray-700 rounded-full h-4">
                                            <div
                                                className="bg-casino-gold h-4 rounded-full transition-all duration-500"
                                                style={{ width: `${((formData.ratings?.hr?.score || 0) / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-lg font-semibold text-casino-text-muted">
                                            {(((formData.ratings?.hr?.score || 0) / 5) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

              {candidate.preEmploymentTest && (
                <Card title="Pre-Employment Test">
                    <div className="flex justify-around items-center text-center">
                        <div>
                            <p className="text-casino-text-muted text-sm">Completed On</p>
                            <p className="font-semibold text-casino-text">{new Date(candidate.preEmploymentTest.completedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-casino-text-muted text-sm">Score</p>
                            <p className="text-3xl font-bold text-casino-gold">{candidate.preEmploymentTest.score} <span className="text-lg text-casino-text-muted">/ 40</span></p>
                        </div>
                         <div>
                            <p className="text-casino-text-muted text-sm">Rating</p>
                            <p className={`text-xl font-bold ${getTestRating(candidate.preEmploymentTest.score).color}`}>{getTestRating(candidate.preEmploymentTest.score).text}</p>
                        </div>
                    </div>
                </Card>
              )}

              <Card title="Job & Compensation">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField label="Job Role Applied For" name="vacancy" type="text" value={formData.vacancy} onChange={handleChange} placeholder="e.g., Senior Croupier" required disabled={!canEditJobSection} />
                      <FormField label="Department" name="department" type="select" options={DEPARTMENTS} value={formData.department || ''} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Expected Salary" name="expectedSalary" type="number" value={formData.expectedSalary} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Position Offered" name="positionOffered" value={formData.positionOffered || ''} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Accommodation Required" name="accommodationRequired" type="checkbox" checked={formData.accommodationRequired} onChange={handleChange} disabled={!canEditJobSection} />
                      <FormField label="Transport Required" name="transportRequired" type="checkbox" checked={formData.transportRequired} onChange={handleChange} disabled={!canEditJobSection} />
                  </div>
                   <div className="mt-6 pt-4 border-t border-gray-700">
                      <h4 className="text-lg font-semibold text-casino-text-muted mb-3">Other Evaluations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField label="Manager Total Rating (1-5)" name="ratings.manager.score" type="number" min="1" max="5" value={formData.ratings?.manager?.score || ''} onChange={handleChange} disabled={currentRole !== UserRole.HOD}/>
                          <FormField label="CM Total Rating (1-5)" name="ratings.cm.score" type="number" min="1" max="5" value={formData.ratings?.cm?.score || ''} onChange={handleChange} disabled={currentRole !== UserRole.HOD}/>
                          <FormField label="Department Interviewer Name" name="ratings.department.interviewer" value={formData.ratings?.department?.interviewer || ''} onChange={handleChange} disabled={currentRole !== UserRole.HOD}/>
                      </div>
                  </div>
              </Card>

              {[
                ApplicationStatus.SurveillanceCleared,
                ApplicationStatus.OfferAccepted,
                ApplicationStatus.JoiningScheduled,
                ApplicationStatus.Joined,
              ].includes(formData.status) && (
                <Card title="Offer Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Offered Salary"
                      name="offer.salary"
                      type="number"
                      value={formData.offer?.salary || ''}
                      onChange={handleChange}
                      disabled={!canEdit}
                      placeholder="Enter offered salary"
                    />
                    <FormField
                      label="Joining Date"
                      name="offer.joiningDate"
                      type="date"
                      value={formData.offer?.joiningDate || ''}
                      onChange={handleChange}
                      disabled={!canEdit}
                    />
                    <FormField
                      label="Accommodation Details"
                      name="offer.accommodationDetails"
                      type="textarea"
                      rows={3}
                      value={formData.offer?.accommodationDetails || ''}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="md:col-span-2"
                      placeholder="Details about accommodation, if any"
                    />
                  </div>
                </Card>
              )}
              
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
            
            {currentRole !== UserRole.Admin && (
              <Card title="Add a Comment">
                  <div className="space-y-4">
                      <FormField
                          label="Your Name"
                          name="commenterName"
                          value={commenterName}
                          onChange={(e) => setCommenterName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                      />
                      <FormField
                          label="Employee ID"
                          name="commenterEmpId"
                          value={commenterEmpId}
                          onChange={(e) => setCommenterEmpId(e.target.value)}
                          placeholder="Enter your employee ID"
                          required
                      />
                      <FormField
                          label="Comment"
                          name="commentText"
                          type="textarea"
                          rows={4}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add your notes or comments here..."
                          required
                      />
                      <button
                          type="button"
                          onClick={handleSaveComment}
                          className="w-full bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors"
                      >
                          <Icon name="check-circle" className="w-5 h-5 mr-2" />
                          Save & Submit
                      </button>
                  </div>
              </Card>
            )}

            <Card title="Comments Log">
                {(candidate.comments && candidate.comments.length > 0) ? (
                    <ul className="space-y-4">
                    {candidate.comments.slice().reverse().map(comment => (
                        <li key={comment.id} className="flex items-start pb-3 border-b border-gray-700 last:border-b-0">
                        <div className="bg-casino-accent text-casino-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0" title={`${comment.user} (${comment.role})`}>
                            {comment.user.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm text-casino-text">{comment.comment}</p>
                            <p className="text-xs text-casino-text-muted mt-1">
                            <strong>{comment.user}</strong> (ID: {comment.empId})
                            </p>
                            <p className="text-xs text-casino-text-muted">
                            {new Date(comment.timestamp).toLocaleString()}
                            </p>
                        </div>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-casino-text-muted text-center py-4">No comments yet.</p>
                )}
            </Card>

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
