import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate, ApplicationStatus, UserRole } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';

interface SurveillanceQueueProps {
  candidates: Candidate[];
}

export const SurveillanceQueue: React.FC<SurveillanceQueueProps> = ({ candidates }) => {
  const navigate = useNavigate();
  const queue = candidates.filter(c => c.status === ApplicationStatus.PendingSurveillance);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-casino-gold flex items-center">
          <Icon name="shield-check" className="w-8 h-8 mr-3" />
          Surveillance Queue
        </h1>
        <div className="text-lg font-semibold bg-casino-warning text-white rounded-full px-4 py-1">
          {queue.length} Pending
        </div>
      </div>
      <Card>
        {queue.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="check-circle" className="w-16 h-16 text-casino-success mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-casino-text">The queue is clear!</h2>
            <p className="text-casino-text-muted mt-2">There are no candidates currently pending surveillance checks.</p>
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
                {queue.map(candidate => (
                  <tr key={candidate.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text-muted">{new Date(candidate.statusHistory.find(h => h.action.includes('Selected for Surveillance'))?.timestamp || candidate.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-casino-text-muted">{candidate.interview?.interviewer || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => navigate(`/applicants/${candidate.id}`)} className="text-casino-gold hover:text-yellow-400 font-semibold">View Profile</button>
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
