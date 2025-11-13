

import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../App';
import { Candidate, UserRole } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { FormField } from './common/FormField';
import { DEPARTMENTS, MARITAL_STATUSES } from '../constants';

type FormData = Omit<Candidate, 'id' | 'status' | 'statusHistory' | 'rejection' | 'interview' | 'surveillanceReport' | 'offer' | 'employeeId'> & {
    entryDate: string;
};

const initialFormData: Partial<FormData> = {
    fullName: '',
    createdAt: new Date().toISOString().split('T')[0],
    dob: '',
    photoUrl: '',
    age: 0,
    address: '',
    contact: { phone: '', email: '' },
    emergencyContact: { name: '', phone: '' },
    medicalConditions: '',
    religion: '',
    maritalStatus: 'Single',
    vacancy: '',
    positionOffered: '',
    department: '',
    expectedSalary: 0,
    accommodationRequired: false,
    transportRequired: false,
    totalWorkExperience: 0,
    qualifications: [],
    workExperience: [],
    languagesKnown: '',
    ratings: {
        hr: { 
            score: 0, 
            interviewer: '',
            personality: 0,
            attitude: 0,
            presentable: 0,
            communication: 0,
            confidence: 0,
            evaluation: '',
        },
        manager: { score: 1 },
        cm: { score: 1 },
        department: { interviewer: '' }
    },
    references: [],
};

interface CreateCandidateFormProps {
  onSubmissionSuccess?: (candidate: Candidate) => void;
  onCancel?: () => void;
}


export const CreateCandidateForm: React.FC<CreateCandidateFormProps> = ({ onSubmissionSuccess, onCancel }) => {
    const { addCandidate, currentRole } = useContext(AppContext);
    const [formData, setFormData] = useState(initialFormData);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const finalValue = type === 'checkbox' 
            ? checked 
            : type === 'number' 
            ? (value === '' ? 0 : parseFloat(value)) 
            : value;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { 
                    ...(prev as any)[parent], 
                    [child]: finalValue 
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: finalValue
            }));
        }
    };
    
    const handleRepeatingChange = (section: 'qualifications' | 'workExperience' | 'references', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const oldSection = prev[section] || [];
            const newSection = oldSection.map((item, i) => {
                if (i === index) {
                    return { ...item, [name]: value };
                }
                return item;
            });
            return { ...prev, [section]: newSection };
        });
    };

    const addRepeatingField = (section: 'qualifications' | 'workExperience' | 'references') => {
        if((formData[section]?.length || 0) >= 3) return;
        let newItem = {};
        if (section === 'qualifications') newItem = { name: '', institute: '', year: '' };
        if (section === 'workExperience') newItem = { company: '', role: '', from: '', to: '', responsibilities: '' };
        if (section === 'references') newItem = { name: '', relation: '', company: '', contact: '', email: '' };
        setFormData(prev => ({...prev, [section]: [...(prev[section] || []), newItem]}));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalData: Partial<Candidate> = {
                ...formData,
                photoUrl: photoPreview || '',
            };
            const newCandidate = await addCandidate(finalData);
            if (onSubmissionSuccess) {
                onSubmissionSuccess(newCandidate);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("There was an error submitting your application. Please check your network connection and try again.");
        }
    };
    
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-casino-gold">
                    {currentRole === UserRole.Candidate ? 'Candidate Registration' : 'Create New Candidate'}
                </h1>
            </div>

            <div className="space-y-6">
                 <Card title="Personal Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-3 flex items-center gap-6 p-4 border-b border-gray-700 mb-4">
                            <div className="flex flex-col items-center">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Candidate Preview" className="h-24 w-24 rounded-full object-cover mb-2 border-2 border-casino-gold" />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-casino-primary flex items-center justify-center mb-2 border-2 border-gray-600">
                                        <Icon name="user-plus" className="w-12 h-12 text-casino-text-muted" />
                                    </div>
                                )}
                                <button type="button" onClick={() => photoInputRef.current?.click()} className="bg-casino-secondary hover:bg-gray-700 text-sm text-casino-text font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                                    <Icon name="upload" className="w-4 h-4 mr-2" />
                                    Upload Photo
                                </button>
                                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </div>
                            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FormField label="Full Name" name="fullName" value={formData.fullName!} onChange={handleChange} required />
                                <FormField label="Date of Birth" name="dob" type="date" value={formData.dob!} onChange={handleChange} required />

                            </div>
                        </div>

                        <FormField label="Age" name="age" type="number" value={formData.age!} onChange={handleChange} />
                        <FormField label="Address" name="address" type="textarea" value={formData.address!} onChange={handleChange} required className="md:col-span-2 lg:col-span-3" />
                        <FormField label="Mobile No." name="contact.phone" type="tel" value={formData.contact!.phone} onChange={handleChange} required />
                        <FormField label="Email" name="contact.email" type="email" value={formData.contact!.email} onChange={handleChange} />
                        <FormField label="Emergency Contact Name" name="emergencyContact.name" value={formData.emergencyContact!.name} onChange={handleChange} required />
                        <FormField label="Emergency Contact Number" name="emergencyContact.phone" type="tel" value={formData.emergencyContact!.phone} onChange={handleChange} required />
                        <FormField label="Medical Conditions" name="medicalConditions" type="textarea" value={formData.medicalConditions!} onChange={handleChange} />
                        <FormField label="Religion" name="religion" value={formData.religion!} onChange={handleChange} />
                        <FormField label="Marital Status" name="maritalStatus" type="select" options={MARITAL_STATUSES} value={formData.maritalStatus!} onChange={handleChange} />
                    </div>
                </Card>

                <Card title="Job & Compensation">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField label="Job Role Applied For" name="vacancy" type="text" value={formData.vacancy!} onChange={handleChange} placeholder="e.g., Senior Croupier" required />
                        <FormField label="Department" name="department" type="select" options={DEPARTMENTS} value={formData.department!} onChange={handleChange} />
                        <FormField label="Expected Salary" name="expectedSalary" type="number" value={formData.expectedSalary!} onChange={handleChange} />
                        <FormField label="Accommodation Required" name="accommodationRequired" type="checkbox" checked={formData.accommodationRequired!} onChange={handleChange} />
                        <FormField label="Transport Required" name="transportRequired" type="checkbox" checked={formData.transportRequired!} onChange={handleChange} />
                    </div>
                </Card>

                <Card title="Qualifications & Experience">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Total Work Experience (Years)" name="totalWorkExperience" type="number" value={formData.totalWorkExperience!} onChange={handleChange} />
                        <FormField label="Languages Known" name="languagesKnown" value={formData.languagesKnown!} onChange={handleChange} placeholder="e.g., English, Hindi, Konkani" />
                    </div>
                    <div className="mt-4">
                         <h4 className="text-casino-text-muted font-semibold mb-2">Qualifications (Max 3)</h4>
                        {(formData.qualifications || []).map((q, i) => (
                             <div key={i} className="grid grid-cols-3 gap-2 p-2 border border-gray-700 rounded mb-2">
                                <input name="name" value={q.name} onChange={(e) => handleRepeatingChange('qualifications', i, e)} placeholder="Qualification" className="bg-casino-primary border-gray-600 rounded p-1"/>
                                <input name="institute" value={q.institute} onChange={(e) => handleRepeatingChange('qualifications', i, e)} placeholder="Institute" className="bg-casino-primary border-gray-600 rounded p-1"/>
                                <input name="year" value={q.year} onChange={(e) => handleRepeatingChange('qualifications', i, e)} placeholder="Year" className="bg-casino-primary border-gray-600 rounded p-1"/>
                            </div>
                        ))}
                        <button type="button" onClick={() => addRepeatingField('qualifications')} className="text-sm text-casino-gold">+ Add Qualification</button>
                    </div>
                     <div className="mt-4">
                         <h4 className="text-casino-text-muted font-semibold mb-2">Work Experience (Max 3)</h4>
                        {(formData.workExperience || []).map((w, i) => (
                             <div key={i} className="p-2 border border-gray-700 rounded mb-2 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input name="company" value={w.company} onChange={(e) => handleRepeatingChange('workExperience', i, e)} placeholder="Company" className="bg-casino-primary border-gray-600 rounded p-1 w-full"/>
                                    <input name="role" value={w.role} onChange={(e) => handleRepeatingChange('workExperience', i, e)} placeholder="Role" className="bg-casino-primary border-gray-600 rounded p-1 w-full"/>
                                    <div>
                                        <label htmlFor={`workexp-from-${i}`} className="text-xs text-casino-text-muted">From</label>
                                        <input id={`workexp-from-${i}`} type="date" name="from" value={w.from} onChange={(e) => handleRepeatingChange('workExperience', i, e)} className="bg-casino-primary border-gray-600 rounded p-1 w-full"/>
                                    </div>
                                    <div>
                                        <label htmlFor={`workexp-to-${i}`} className="text-xs text-casino-text-muted">To</label>
                                        <input id={`workexp-to-${i}`} type="date" name="to" value={w.to} onChange={(e) => handleRepeatingChange('workExperience', i, e)} className="bg-casino-primary border-gray-600 rounded p-1 w-full"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addRepeatingField('workExperience')} className="text-sm text-casino-gold">+ Add Experience</button>
                    </div>
                    <div className="mt-4">
                         <h4 className="text-casino-text-muted font-semibold mb-2">References (Max 3)</h4>
                        {(formData.references || []).map((r, i) => (
                             <div key={i} className="p-2 border border-gray-700 rounded mb-2 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input name="name" value={r.name} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Name" className="bg-casino-primary border-gray-600 rounded p-1"/>
                                    <input name="relation" value={r.relation} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Relation" className="bg-casino-primary border-gray-600 rounded p-1"/>
                                    <input name="company" value={r.company} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Company" className="bg-casino-primary border-gray-600 rounded p-1"/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input name="contact" value={r.contact} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Contact No." className="bg-casino-primary border-gray-600 rounded p-1"/>
                                    <input name="email" type="email" value={r.email} onChange={(e) => handleRepeatingChange('references', i, e)} placeholder="Email" className="bg-casino-primary border-gray-600 rounded p-1"/>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addRepeatingField('references')} className="text-sm text-casino-gold">+ Add Reference</button>
                    </div>
                </Card>
                
                {currentRole !== UserRole.Candidate && (
                    <Card title="Interview & Ratings">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField label="Position Offered" name="positionOffered" value={formData.positionOffered!} onChange={handleChange} />
                            <FormField label="HR Interviewer Name" name="ratings.hr.interviewer" value={formData.ratings!.hr!.interviewer} onChange={handleChange} />
                            <FormField label="HR Total Rating (1-5)" name="ratings.hr.score" type="number" min="1" max="5" value={formData.ratings!.hr!.score} onChange={handleChange} />
                            <FormField label="Manager Total Rating (1-5)" name="ratings.manager.score" type="number" min="1" max="5" value={formData.ratings!.manager!.score} onChange={handleChange} />
                            <FormField label="CM Total Rating (1-5)" name="ratings.cm.score" type="number" min="1" max="5" value={formData.ratings!.cm!.score} onChange={handleChange} />
                            <FormField label="Department Interviewer Name" name="ratings.department.interviewer" value={formData.ratings!.department!.interviewer} onChange={handleChange} />
                        </div>
                    </Card>
                )}
            </div>
            
            <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-700">
                <button type="button" onClick={handleCancel} className="bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-2 px-6 rounded-lg transition-colors mr-4">Cancel</button>
                <button type="submit" className="bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-2 px-6 rounded-lg flex items-center transition-colors">
                    <Icon name="check-circle" className="w-5 h-5 mr-2" />
                    {currentRole === UserRole.Candidate ? 'Submit Application' : 'Save Candidate'}
                </button>
            </div>
        </form>
    );
};