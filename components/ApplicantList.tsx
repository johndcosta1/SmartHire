

import React, { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate, ApplicationStatus, UserRole } from '../types';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Icon } from './common/Icon';
import { AppContext } from '../App';
import { DEPARTMENTS } from '../constants';

interface ApplicantListProps {
    candidates: Candidate[];
}

export const ApplicantList: React.FC<ApplicantListProps> = ({ candidates }) => {
    const navigate = useNavigate();
    const { currentRole } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [departmentFilter, setDepartmentFilter] = useState<string>('All');

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.vacancy.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            const matchesDepartment = departmentFilter === 'All' || c.department === departmentFilter;
            return matchesSearch && matchesStatus && matchesDepartment;
        });
    }, [candidates, searchTerm, statusFilter, departmentFilter]);

    const handleExport = () => {
        const headers = [
            'ID', 'Full Name', 'Date of Birth', 'Phone', 'Email',
            'Address', 'Vacancy', 'Position Offered', 'Department',
            'Expected Salary', 'Accommodation Required', 'Transport Required',
            'Status', 'Created At'
        ];

        const csvRows = [headers.join(',')];

        for (const candidate of candidates) {
            const values = [
                candidate.id,
                `"${candidate.fullName}"`,
                candidate.dob,
                candidate.contact.phone,
                candidate.contact.email,
                `"${candidate.address.replace(/"/g, '""')}"`,
                `"${candidate.vacancy}"`,
                `"${candidate.positionOffered || ''}"`,
                `"${candidate.department || ''}"`,
                candidate.expectedSalary,
                candidate.accommodationRequired ? 'Yes' : 'No',
                candidate.transportRequired ? 'Yes' : 'No',
                candidate.status,
                new Date(candidate.createdAt).toISOString()
            ];
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'applicants.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-casino-gold">Applicants</h1>
                <div className="flex items-center space-x-4">
                    {currentRole === UserRole.Admin && (
                        <button onClick={handleExport} className="bg-casino-success hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Icon name="download" className="w-5 h-5 mr-2" />
                            Export to Excel
                        </button>
                    )}
                    {currentRole === UserRole.HR && (
                        <button onClick={() => navigate('/applicants/new')} className="bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Icon name="plus" className="w-5 h-5 mr-2" />
                            New Candidate
                        </button>
                    )}
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-casino-primary rounded-lg">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, ID, vacancy..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-casino-secondary border border-gray-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-casino-gold"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="w-5 h-5 text-casino-text-muted" />
                        </div>
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-casino-secondary border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-casino-gold">
                        <option value="All">All Statuses</option>
                        {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full bg-casino-secondary border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-casino-gold">
                        <option value="All">All Departments</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-casino-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Vacancy</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Created On</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Department</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-casino-primary divide-y divide-gray-700">
                            {filteredCandidates.map(candidate => (
                                <tr key={candidate.id} className="hover:bg-casino-secondary transition-colors cursor-pointer" onClick={() => navigate(`/applicants/${candidate.id}`)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={candidate.photoUrl || `https://ui-avatars.com/api/?name=${candidate.fullName.replace(' ', '+')}&background=c59d5f&color=1a202c`} alt={`${candidate.fullName}'s photo`} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-casino-text">{candidate.fullName}</div>
                                                <div className="text-sm text-casino-text-muted">{candidate.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text-muted">{candidate.vacancy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><Badge status={candidate.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text-muted">{new Date(candidate.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text">{candidate.department || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <span className="text-casino-gold hover:text-yellow-400">View</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};