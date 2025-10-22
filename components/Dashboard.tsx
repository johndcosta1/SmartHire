import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserRole, ApplicationStatus, Candidate, AuditLog } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';

interface DashboardProps {
  currentRole: UserRole;
  candidates: Candidate[];
}

const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;

    const years = Math.floor(months / 12);
    return `${years} years ago`;
}

const MetricCard: React.FC<{ value: number; label: string; icon: React.ComponentProps<typeof Icon>['name']; color: string; to: string; state?: object; }> = ({ value, label, icon, color, to, state }) => (
    <Link to={to} state={state} className="block hover:scale-105 hover:shadow-lg transition-transform duration-200 rounded-lg">
        <Card className="flex items-center space-x-4 h-full">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon name={icon} className="w-8 h-8 text-white" />
            </div>
            <div>
                <p className="text-3xl font-bold text-casino-text">{value}</p>
                <p className="text-casino-text-muted">{label}</p>
            </div>
        </Card>
    </Link>
);

export const Dashboard: React.FC<DashboardProps> = ({ currentRole, candidates }) => {

    const metrics = useMemo(() => {
        const allMetrics = {
            [UserRole.Admin]: [
                { value: candidates.length, label: 'Total Applicants', icon: 'users' as const, color: 'bg-blue-500', to: '/applicants' },
                { value: candidates.filter(c => c.status === ApplicationStatus.Joined).length, label: 'Total Joined', icon: 'check-circle' as const, color: 'bg-casino-success', to: '/applicants', state: { status: ApplicationStatus.Joined } },
                { value: candidates.filter(c => c.status === ApplicationStatus.Rejected).length, label: 'Total Rejected', icon: 'x-circle' as const, color: 'bg-casino-danger', to: '/applicants', state: { status: ApplicationStatus.Rejected } },
                { value: candidates.filter(c => c.status === ApplicationStatus.PendingSurveillance).length, label: 'Pending Surveillance', icon: 'shield-check' as const, color: 'bg-casino-warning', to: '/surveillance' },
            ],
            [UserRole.HOD]: [
                 { value: candidates.filter(c => c.status === ApplicationStatus.New).length, label: 'New Applicants to Review', icon: 'user-plus' as const, color: 'bg-blue-500', to: '/applicants', state: { status: ApplicationStatus.New } },
                 { value: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted).length, label: 'Awaiting Acknowledgement', icon: 'check-circle' as const, color: 'bg-casino-success', to: '/applicants', state: { status: ApplicationStatus.OfferAccepted } },
                 { value: candidates.filter(c => new Date(c.offer?.joiningDate || 0).toDateString() === new Date().toDateString()).length, label: 'Joining Today', icon: 'calendar' as const, color: 'bg-purple-500', to: '/applicants', state: { status: ApplicationStatus.JoiningScheduled } },
                 { value: candidates.filter(c => c.status === ApplicationStatus.Joined).length, label: 'Total Team Members', icon: 'users' as const, color: 'bg-teal-500', to: '/applicants', state: { status: ApplicationStatus.Joined } },
            ],
             [UserRole.Scheduler]: [
                { value: candidates.filter(c => c.status === ApplicationStatus.New).length, label: 'Awaiting Interview Schedule', icon: 'calendar' as const, color: 'bg-cyan-500', to: '/applicants', state: { status: ApplicationStatus.New } },
                { value: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted).length, label: 'To Schedule Joining', icon: 'briefcase' as const, color: 'bg-lime-500', to: '/applicants', state: { status: ApplicationStatus.OfferAccepted } },
                { value: candidates.filter(c => c.interview?.date === new Date().toISOString().split('T')[0]).length, label: 'Interviews Today', icon: 'clock' as const, color: 'bg-indigo-500', to: '/schedule' },
                { value: candidates.filter(c => c.status === ApplicationStatus.JoiningScheduled).length, label: 'Upcoming Joiners', icon: 'users' as const, color: 'bg-pink-500', to: '/applicants', state: { status: ApplicationStatus.JoiningScheduled } },
            ],
             [UserRole.Surveillance]: [
                { value: candidates.filter(c => c.status === ApplicationStatus.PendingSurveillance).length, label: 'Pending Background Checks', icon: 'shield-check' as const, color: 'bg-casino-warning', to: '/surveillance' },
                { value: candidates.filter(c => c.surveillanceReport?.status === 'Clear').length, label: 'Checks Cleared', icon: 'check-circle' as const, color: 'bg-casino-success', to: '/applicants', state: { status: ApplicationStatus.SurveillanceCleared } },
                { value: candidates.filter(c => c.surveillanceReport?.status === 'Flagged').length, label: 'Checks Flagged', icon: 'exclamation-circle' as const, color: 'bg-casino-danger', to: '/applicants', state: { status: ApplicationStatus.SurveillanceFlagged } },
            ],
            [UserRole.HR]: [
                { value: candidates.filter(c => c.status === ApplicationStatus.SurveillanceCleared).length, label: 'Ready for Offer', icon: 'briefcase' as const, color: 'bg-purple-500', to: '/offers', state: { tab: 'Ready' } },
                { value: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted).length, label: 'Offers Accepted', icon: 'external-link' as const, color: 'bg-blue-500', to: '/offers', state: { tab: 'Accepted' } },
                { value: candidates.filter(c => c.status === ApplicationStatus.Joined).length, label: 'New Joinees This Month', icon: 'users' as const, color: 'bg-casino-success', to: '/applicants', state: { status: ApplicationStatus.Joined } },
                { value: candidates.filter(c => c.status === ApplicationStatus.Rejected).length, label: 'Rejected Candidates', icon: 'x-circle' as const, color: 'bg-casino-danger', to: '/applicants', state: { status: ApplicationStatus.Rejected } },
            ]
        };
        return allMetrics[currentRole] || [];
    }, [currentRole, candidates]);

    const userActivity = useMemo(() => {
        const activity: Array<AuditLog & { candidateName: string; candidateId: string; }> = [];
        candidates.forEach(candidate => {
            candidate.statusHistory.forEach(log => {
                if (log.role === currentRole) {
                    activity.push({
                        ...log,
                        candidateName: candidate.fullName,
                        candidateId: candidate.id,
                    });
                }
            });
        });
        return activity
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // Limit to latest 10
    }, [candidates, currentRole]);

    const QuickAction: React.FC<{ to: string, text: string, icon: React.ComponentProps<typeof Icon>['name'] }> = ({ to, text, icon }) => (
        <Link to={to} className="bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
            <Icon name={icon} className="w-5 h-5 mr-2" />
            {text}
        </Link>
    );
    
    const allQuickActions = [
        { to: "/applicants/new", text: "Create Candidate", icon: "user-plus" as const, roles: [UserRole.HR] },
        { to: "/applicants", text: "View All Applicants", icon: "users" as const, roles: [UserRole.Admin, UserRole.HOD, UserRole.HR, UserRole.Scheduler, UserRole.Surveillance] },
        { to: "/reports", text: "Generate Reports", icon: "reports" as const, roles: [UserRole.Admin, UserRole.HR, UserRole.HOD] },
        { to: "/settings", text: "System Settings", icon: "cog" as const, roles: [UserRole.Admin] },
    ];

    const availableQuickActions = allQuickActions.filter(action => action.roles.includes(currentRole));

    return (
        <div>
            <h1 className="text-3xl font-bold text-casino-gold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map(metric => <MetricCard key={metric.label} {...metric} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Quick Actions">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {availableQuickActions.map(action => (
                            <QuickAction key={action.to} to={action.to} text={action.text} icon={action.icon} />
                        ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:row-start-1 lg:col-start-3">
                     <Card title="My Recent Activity">
                        {userActivity.length > 0 ? (
                            <ul className="space-y-3">
                                {userActivity.map(log => (
                                    <li key={log.id} className="flex items-start space-x-3 pb-3 border-b border-gray-700 last:border-b-0">
                                        <Icon name="document-text" className="w-5 h-5 text-casino-text-muted mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-casino-text leading-tight">
                                                {log.action} for <Link to={`/applicants/${log.candidateId}`} className="font-semibold text-casino-gold hover:underline">{log.candidateName}</Link>.
                                            </p>
                                            <p className="text-xs text-casino-text-muted mt-1">{formatTimeAgo(log.timestamp)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <Icon name="search" className="w-12 h-12 mx-auto text-casino-text-muted mb-4" />
                                <p className="text-casino-text-muted">You have no recent activity.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};