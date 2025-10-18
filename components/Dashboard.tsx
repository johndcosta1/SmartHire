

import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole, ApplicationStatus, Candidate } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';

interface DashboardProps {
  currentRole: UserRole;
  candidates: Candidate[];
}

const MetricCard: React.FC<{ value: number; label: string; icon: React.ComponentProps<typeof Icon>['name']; color: string }> = ({ value, label, icon, color }) => (
    <Card className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon name={icon} className="w-8 h-8 text-white" />
        </div>
        <div>
            <p className="text-3xl font-bold text-casino-text">{value}</p>
            <p className="text-casino-text-muted">{label}</p>
        </div>
    </Card>
);

export const Dashboard: React.FC<DashboardProps> = ({ currentRole, candidates }) => {

    const getMetrics = () => {
        const metrics = {
            [UserRole.Admin]: [
                { value: candidates.length, label: 'Total Applicants', icon: 'users' as const, color: 'bg-blue-500' },
                { value: candidates.filter(c => c.status === ApplicationStatus.Joined).length, label: 'Total Joined', icon: 'check-circle' as const, color: 'bg-casino-success' },
                { value: candidates.filter(c => c.status === ApplicationStatus.Rejected).length, label: 'Total Rejected', icon: 'x-circle' as const, color: 'bg-casino-danger' },
                { value: candidates.filter(c => c.status === ApplicationStatus.PendingSurveillance).length, label: 'Pending Surveillance', icon: 'shield-check' as const, color: 'bg-casino-warning' },
            ],
            [UserRole.CasinoManager]: [
                 { value: candidates.filter(c => c.status === ApplicationStatus.New).length, label: 'New Applicants to Review', icon: 'user-plus' as const, color: 'bg-blue-500' },
                 { value: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted).length, label: 'Awaiting Acknowledgement', icon: 'check-circle' as const, color: 'bg-casino-success' },
                 { value: candidates.filter(c => new Date(c.offer?.joiningDate || 0).toDateString() === new Date().toDateString()).length, label: 'Joining Today', icon: 'calendar' as const, color: 'bg-purple-500' },
                 { value: candidates.filter(c => c.status === ApplicationStatus.Joined).length, label: 'Total Team Members', icon: 'users' as const, color: 'bg-teal-500' },
            ],
             [UserRole.Scheduler]: [
                { value: candidates.filter(c => c.status === ApplicationStatus.New).length, label: 'Awaiting Interview Schedule', icon: 'calendar' as const, color: 'bg-cyan-500' },
                // FIX: Replaced non-existent ApplicationStatus.CMAcknowledged with ApplicationStatus.OfferAccepted, which is the status before joining is scheduled.
                { value: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted).length, label: 'To Schedule Joining', icon: 'briefcase' as const, color: 'bg-lime-500' },
                { value: candidates.filter(c => c.interview?.date === new Date().toISOString().split('T')[0]).length, label: 'Interviews Today', icon: 'clock' as const, color: 'bg-indigo-500' },
                { value: candidates.filter(c => c.status === ApplicationStatus.JoiningScheduled).length, label: 'Upcoming Joiners', icon: 'users' as const, color: 'bg-pink-500' },
            ],
             [UserRole.Surveillance]: [
                { value: candidates.filter(c => c.status === ApplicationStatus.PendingSurveillance).length, label: 'Pending Background Checks', icon: 'shield-check' as const, color: 'bg-casino-warning' },
                { value: candidates.filter(c => c.surveillanceReport?.status === 'Clear').length, label: 'Checks Cleared', icon: 'check-circle' as const, color: 'bg-casino-success' },
                { value: candidates.filter(c => c.surveillanceReport?.status === 'Flagged').length, label: 'Checks Flagged', icon: 'exclamation-circle' as const, color: 'bg-casino-danger' },
            ],
            [UserRole.HR]: [
                { value: candidates.filter(c => c.status === ApplicationStatus.SurveillanceCleared).length, label: 'Ready for Offer', icon: 'briefcase' as const, color: 'bg-purple-500' },
                // FIX: Replaced non-existent ApplicationStatus.OfferCreated with ApplicationStatus.OfferAccepted, as it's the next logical state in the workflow.
                { value: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted).length, label: 'Offers Sent', icon: 'external-link' as const, color: 'bg-blue-500' },
                { value: candidates.filter(c => c.status === ApplicationStatus.Joined).length, label: 'New Joinees This Month', icon: 'users' as const, color: 'bg-casino-success' },
                { value: candidates.filter(c => c.status === ApplicationStatus.Rejected).length, label: 'Rejected Candidates', icon: 'x-circle' as const, color: 'bg-casino-danger' },
            ]
        };
        return metrics[currentRole] || [];
    };

    const QuickAction: React.FC<{ to: string, text: string, icon: React.ComponentProps<typeof Icon>['name'] }> = ({ to, text, icon }) => (
        <Link to={to} className="bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
            <Icon name={icon} className="w-5 h-5 mr-2" />
            {text}
        </Link>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-casino-gold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {getMetrics().map(metric => <MetricCard key={metric.label} {...metric} />)}
            </div>

            <Card title="Quick Actions">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <QuickAction to="/applicants/new" text="Create Candidate" icon="user-plus" />
                   <QuickAction to="/applicants" text="View All Applicants" icon="users" />
                   <QuickAction to="/reports" text="Generate Reports" icon="reports" />
                   <QuickAction to="/settings" text="System Settings" icon="cog" />
                </div>
            </Card>
        </div>
    );
};