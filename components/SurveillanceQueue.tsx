
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate, ApplicationStatus } from '../types.ts';
import { Card } from './common/Card.tsx';
import { Icon } from './common/Icon.tsx';
import { formatDate } from '../constants.ts';

interface SurveillanceQueueProps {
  candidates: Candidate[];
}

type SurveillanceTab = 'Pending' | 'Cleared' | 'Flagged';

export const SurveillanceQueue: React.FC<SurveillanceQueueProps> = ({ candidates }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SurveillanceTab>('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = {
    Pending: candidates.filter(c => c.status === ApplicationStatus.PendingSurveillance),
    Cleared: candidates.filter(c => c.surveillanceReport?.status === 'Clear'),
    Flagged: candidates.filter(c => c.surveillanceReport?.status === 'Flagged'),
  };
  
  const TabButton: React.FC<{ tab: SurveillanceTab; label: string; icon: React.ComponentProps<typeof Icon>['name'] }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'border-casino-gold text-casino-gold' : 'border-transparent text-casino-text-muted hover:text-casino-text'}`}
    >
      <Icon name={icon} className="w-5 h-5" />
      <span>{label}</span>
      <span className="bg-casino-secondary text-casino-text text-xs font-bold rounded-full px-2 py-0.5">{filteredCandidates[tab].length}</span>
    </button>
  );

  const currentList = (filteredCandidates[activeTab] || []).filter(c => 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-casino-gold flex items-center">
            <Icon name="shield-check" className="w-8 h-8 mr-3" />
            Surveillance Checks
          </h1>
          <p className="text-casino-text-muted mt-1">Showing <span className="font-semibold text-casino-text">{activeTab}</span> Candidates</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-b border-gray-700 mb-6">
          <div className="flex space-x-4">
              <TabButton tab="Pending" label="Pending" icon="clock" />
              <TabButton tab="Cleared" label="Cleared" icon="check-circle" />
              <TabButton tab="Flagged" label="Flagged" icon="exclamation-circle" />
          </div>
          <div className="relative w-full max-w-xs">
              <input
                  type="text"
                  placeholder="Search candidate..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-casino-secondary border border-gray-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-casino-gold"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="w-5 h-5 text-casino-text-muted" />
              </div>
          </div>
      </div>

      <Card>
        {currentList.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="search" className="w-16 h-16 text-casino-text-muted mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-casino-text">No Candidates Found</h2>
            <p className="text-casino-text-muted mt-2">There are no candidates in the "{activeTab}" category {searchTerm && "matching your search"}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-casino-secondary">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Candidate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Vacancy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Date Submitted</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-casino-text-muted uppercase tracking-wider">Interviewing Manager</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-casino-primary divide-y divide-gray-700">
                {currentList.map(candidate => (
                  <tr key={candidate.id} className="hover:bg-casino-secondary transition-colors" onClick={() => navigate(`/applicants/${candidate.id}`)}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text-muted">{formatDate(candidate.statusHistory.find(h => h.action.startsWith('Selected by'))?.timestamp || candidate.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text-muted">{candidate.interview?.interviewer || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-casino-gold hover:text-yellow-400 font-semibold cursor-pointer">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};