

import React, { useRef } from 'react';
import { Candidate } from '../../types';
import { Card } from './Card';
import { Icon } from './Icon';
import { db } from '../../firebaseConfig';
import { ref, update } from 'firebase/database';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        
        try {
            const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
            if (rows.length < 2) {
                alert("CSV file is empty or contains only a header.");
                return;
            }
            const header = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const newCandidates: Candidate[] = [];
            
            const defaultValues: Record<string, any> = {
                contact: { phone: '', email: '' },
                emergencyContact: { name: '', phone: '' },
                statusHistory: [],
                qualifications: [],
                workExperience: [],
                references: [],
            };

            for (let i = 1; i < rows.length; i++) {
                const data = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                const candidateObj: any = {};
                
                for(let j=0; j<header.length; j++) {
                    let value = data[j];
                    if (typeof value === 'string') {
                      if (value.startsWith('"') && value.endsWith('"')) {
                          value = value.slice(1, -1).replace(/""/g, '"');
                      }
                    } else {
                      value = '';
                    }
                    
                    const key = header[j];
                    if (!key) continue;
                    
                    if (['contact', 'emergencyContact', 'qualifications', 'workExperience', 'ratings', 'references', 'statusHistory', 'rejection', 'interview', 'surveillanceReport', 'offer'].includes(key)) {
                        try {
                           const parsedValue = value ? JSON.parse(value) : null;
                           candidateObj[key] = parsedValue ?? (defaultValues[key] ?? null);
                        } catch {
                           console.warn(`Could not parse JSON for key ${key} with value:`, value);
                           candidateObj[key] = defaultValues[key] ?? null;
                        }
                    } else if (['age', 'expectedSalary', 'totalWorkExperience'].includes(key)) {
                        candidateObj[key] = parseInt(value, 10) || 0;
                    } else if (['accommodationRequired', 'transportRequired'].includes(key)) {
                        candidateObj[key] = (value || '').toLowerCase() === 'true' || (value || '').toLowerCase() === 'yes';
                    } else {
                        candidateObj[key] = value;
                    }
                }
                newCandidates.push(candidateObj as Candidate);
            }
            
            const updates: { [key: string]: any } = {};
            newCandidates.forEach((candidate) => {
                if (candidate.id) {
                    const { id, ...data } = candidate;
                    updates[`/candidates/${id}`] = data;
                }
            });
            await update(ref(db), updates);

            alert(`${newCandidates.length} records imported successfully! The page will now reflect the new data.`);
            onClose();
        } catch (error) {
            console.error("Error importing data to Firebase:", error);
            alert("Failed to import data. Please check the file format and console for errors.");
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
      <Card className="w-full max-w-lg" title="Sync Candidate Data">
        <p className="text-casino-text-muted mb-6">
          To ensure you are working with the most up-to-date information, please import the latest candidate data file.
          This will overwrite any existing data in the system.
        </p>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={handleImportClick} 
            className="w-full bg-casino-accent hover:bg-yellow-700 text-casino-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <Icon name="upload" className="w-5 h-5 mr-2" />
            Import & Overwrite Data (.csv)
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
          
          <button 
            onClick={onClose}
            className="w-full bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
};