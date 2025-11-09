import React, { useMemo } from 'react';
import { Candidate, ApplicationStatus, UserRole } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { STATUS_COLORS } from '../constants';
import { Badge } from './common/Badge';

interface ReportsProps {
  candidates: Candidate[];
}

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ComponentProps<typeof Icon>['name']; iconBg: string; }> = ({ title, value, icon, iconBg }) => (
    <div className="bg-casino-secondary p-4 rounded-lg flex items-center">
        <div className={`p-3 rounded-full mr-4 ${iconBg}`}>
            <Icon name={icon} className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-3xl font-bold text-casino-text">{value}</p>
            <p className="text-casino-text-muted">{title}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  // FIX: Handle empty data object to avoid error with Math.max on an empty array.
  const values = Object.values(data);
  if (values.length === 0) {
    return null;
  }
  const maxValue = Math.max(...values);
  if (maxValue === 0) return null;
  const colors = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ef4444', '#6366f1', '#ec4899', '#f97316'];

  return (
    <div className="w-full bg-casino-primary p-4 rounded-lg mb-4">
      <div className="flex items-end h-56 space-x-4" aria-label="Hires by department chart">
        {Object.entries(data).map(([dept, count], index) => (
          <div key={dept} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="text-sm font-bold text-casino-text mb-1" aria-hidden="true">{count}</div>
            <div
              className="w-full rounded-t-md transition-all duration-300 ease-in-out"
              style={{
                // FIX: Explicitly cast `count` to a number to prevent type error during arithmetic operation.
                height: `${(Number(count) / maxValue) * 100}%`,
                backgroundColor: colors[index % colors.length],
              }}
              role="presentation"
              aria-label={`${dept}: ${count} hires`}
            />
            <div className="text-xs text-casino-text-muted mt-2 text-center w-full truncate" aria-hidden="true">{dept}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const Reports: React.FC<ReportsProps> = ({ candidates }) => {

  const stats = useMemo(() => {
    const total = candidates.length;
    const joined = candidates.filter(c => c.status === ApplicationStatus.Joined).length;
    const readyForOffer = candidates.filter(c => c.status === ApplicationStatus.SurveillanceCleared).length;
    const offersAccepted = candidates.filter(c => [ApplicationStatus.OfferAccepted, ApplicationStatus.JoiningScheduled, ApplicationStatus.Joined].includes(c.status)).length;
    
    const acceptanceRate = readyForOffer + offersAccepted > 0 
      ? ((offersAccepted / (readyForOffer + offersAccepted)) * 100).toFixed(1) + '%' 
      : 'N/A';
      
    const statusCounts = Object.values(ApplicationStatus).reduce((acc, status) => {
        acc[status] = candidates.filter(c => c.status === status).length;
        return acc;
    }, {} as Record<ApplicationStatus, number>);

    const hiresByDept = candidates.filter(c => c.status === ApplicationStatus.Joined && c.department)
      .reduce((acc, c) => {
        acc[c.department!] = (acc[c.department!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return { total, joined, acceptanceRate, statusCounts, hiresByDept };
  }, [candidates]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-casino-gold flex items-center">
          <Icon name="reports" className="w-8 h-8 mr-3" />
          Hiring Reports
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard title="Total Applicants" value={stats.total} icon="users" iconBg="bg-blue-500" />
          <MetricCard title="Total Hired" value={stats.joined} icon="check-circle" iconBg="bg-casino-success" />
          <MetricCard title="Offer Acceptance Rate" value={stats.acceptanceRate} icon="briefcase" iconBg="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Hiring Funnel">
              <div className="space-y-3">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                        <Badge status={status as ApplicationStatus} />
                        <span className="font-bold text-casino-text text-lg">{count}</span>
                    </div>
                  ))}
              </div>
          </Card>

          <Card title="New Hires by Department">
              {Object.keys(stats.hiresByDept).length > 0 ? (
                <>
                  <BarChart data={stats.hiresByDept} />
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                      {Object.entries(stats.hiresByDept).map(([dept, count]) => (
                          <div key={dept} className="flex justify-between items-center bg-casino-primary p-3 rounded-md">
                              <span className="font-semibold text-casino-text-muted">{dept}</span>
                              <span className="font-bold text-casino-gold text-lg">{count}</span>
                          </div>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-casino-text-muted text-center py-8">No hired candidates with department information yet.</p>
              )}
          </Card>
      </div>

    </div>
  );
};
