import React, { useContext } from 'react';
import { Candidate, UserRole } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { USER_ROLES, JOB_ROLES, DEPARTMENTS } from '../constants';
import { AppContext } from '../App';

interface SettingsProps {
  candidates: Candidate[];
}

const sanitizeForExport = (obj: any) => {
    const cache = new Set();
    // This is safe because JSON.parse will create a new plain object
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return; // Remove circular references
            }
            cache.add(value);
        }
        return value;
    }));
};

const InfoCard: React.FC<{ title: string; value: string | number; icon: React.ComponentProps<typeof Icon>['name']; }> = ({ title, value, icon }) => (
    <Card className="flex items-center">
        <Icon name={icon} className="w-8 h-8 mr-4 text-casino-gold" />
        <div>
            <p className="text-2xl font-bold text-casino-text">{value}</p>
            <p className="text-casino-text-muted">{title}</p>
        </div>
    </Card>
);

const ListCard: React.FC<{ title: string; items: readonly string[] }> = ({ title, items }) => (
    <Card title={title}>
        <div className="flex flex-wrap gap-2">
            {items.map(item => (
                <span key={item} className="bg-casino-primary px-3 py-1 text-sm font-semibold text-casino-text rounded-full">
                    {item}
                </span>
            ))}
        </div>
    </Card>
);


export const Settings: React.FC<SettingsProps> = ({ candidates }) => {
  const { currentRole } = useContext(AppContext);

  const handleExportData = () => {
    // Sanitize the entire candidates array to remove Firestore-specific complexities and circular references.
    const sanitizedCandidates = sanitizeForExport(candidates);

    const formatCsvCell = (data: any): string => {
        if (data === null || data === undefined) return '';
        // After sanitization, all objects are plain and can be safely stringified.
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        let cell = String(data);
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
        }
        return cell;
    };

    const headers = [
      'id', 'photoUrl', 'fullName', 'dob', 'age', 'contact',
      'emergencyContact', 'address',
      'medicalConditions', 'religion', 'maritalStatus', 'vacancy',
      'positionOffered', 'department', 'expectedSalary',
      'accommodationRequired', 'transportRequired',
      'totalWorkExperience', 'languagesKnown',
      'ratings', 'references', 'qualifications', 'workExperience',
      'status', 'statusHistory', 'rejection',
      'interview', 'surveillanceReport',
      'offer', 'employeeId', 'createdAt'
    ];
    
    const csvRows = [headers.join(',')];

    for (const candidate of sanitizedCandidates) {
        const values = headers.map(header => formatCsvCell((candidate as any)[header] ?? ''));
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `smarthire_backup_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-casino-gold flex items-center">
            <Icon name="cog" className="w-8 h-8 mr-3" />
            System Settings
          </h1>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-casino-text-muted mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard title="Total Candidates" value={candidates.length} icon="users" />
                <InfoCard title="Defined User Roles" value={USER_ROLES.length} icon="briefcase" />
                <InfoCard title="Active Departments" value={DEPARTMENTS.length} icon="document-text" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-casino-text-muted mb-4">Configurable Lists</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ListCard title="Job Roles" items={JOB_ROLES} />
                <ListCard title="Departments" items={DEPARTMENTS} />
            </div>
          </section>
          
          { [UserRole.Admin, UserRole.HR].includes(currentRole) && (
              <section>
                <h2 className="text-xl font-semibold text-casino-text-muted mb-4">Data Management</h2>
                <Card>
                    <p className="text-casino-text-muted mb-4">Export all candidate data to a backup CSV file.</p>
                    <div className="flex items-center space-x-4">
                        <button onClick={handleExportData} className="bg-casino-secondary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Icon name="download" className="w-5 h-5 mr-2" />
                            Export Data (CSV)
                        </button>
                    </div>
                </Card>
              </section>
          )}
        </div>
      </div>
  );
};