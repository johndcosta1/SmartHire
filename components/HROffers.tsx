import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Candidate, ApplicationStatus } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';

interface HROffersProps {
    candidates: Candidate[];
}

type OfferTab = 'Ready' | 'Accepted' | 'Scheduled';

const CandidateOfferCard: React.FC<{ candidate: Candidate; activeTab: OfferTab }> = ({ candidate, activeTab }) => {
    const navigate = useNavigate();
    const isEditable = activeTab === 'Accepted' || activeTab === 'Scheduled';

    return (
        <div className="bg-casino-secondary p-4 rounded-lg flex items-center justify-between shadow-md">
            <div className="flex items-center">
                <img className="h-12 w-12 rounded-full object-cover" src={candidate.photoUrl || `https://ui-avatars.com/api/?name=${candidate.fullName.replace(' ', '+')}&background=c59d5f&color=1a202c`} alt={`${candidate.fullName}'s photo`} />
                <div className="ml-4">
                    <p className="font-bold text-casino-text">{candidate.fullName}</p>
                    <p className="text-sm text-casino-text-muted">{candidate.vacancy}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 {isEditable && (
                    <button 
                        onClick={() => navigate(`/applicants/${candidate.id}`)} 
                        className="bg-casino-accent hover:bg-yellow-700 text-casino-primary font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm"
                    >
                        <Icon name="cog" className="w-4 h-4 mr-2" />
                        Edit Offer Details
                    </button>
                )}
                <button 
                    onClick={() => navigate(`/applicants/${candidate.id}`)} 
                    className="bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm"
                >
                    <Icon name="document-text" className="w-4 h-4 mr-2" />
                    View
                </button>
            </div>
        </div>
    );
};

export const HROffers: React.FC<HROffersProps> = ({ candidates }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<OfferTab>(location.state?.tab || 'Ready');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCandidates = {
        Ready: candidates.filter(c => c.status === ApplicationStatus.SurveillanceCleared),
        Accepted: candidates.filter(c => c.status === ApplicationStatus.OfferAccepted),
        Scheduled: candidates.filter(c => c.status === ApplicationStatus.JoiningScheduled),
    };

    const TabButton: React.FC<{ tab: OfferTab; label: string; icon: React.ComponentProps<typeof Icon>['name'] }> = ({ tab, label, icon }) => (
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
                <h1 className="text-3xl font-bold text-casino-gold flex items-center">
                    <Icon name="briefcase" className="w-8 h-8 mr-3" />
                    HR Offers & Onboarding
                </h1>
            </div>

            <div className="flex justify-between items-center border-b border-gray-700 mb-6">
                <div className="flex space-x-4">
                    <TabButton tab="Ready" label="Ready for Offer" icon="check-circle" />
                    <TabButton tab="Accepted" label="Offer Accepted" icon="document-text" />
                    <TabButton tab="Scheduled" label="Joining Scheduled" icon="calendar" />
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
                <div className="space-y-4">
                    {currentList.length > 0 ? (
                        currentList.map(candidate => (
                            <CandidateOfferCard key={candidate.id} candidate={candidate} activeTab={activeTab} />
                        ))
                    ) : (
                        <div className="text-center py-12">
                             <Icon name="users" className="w-16 h-16 text-casino-text-muted mx-auto mb-4" />
                            <p className="text-casino-text-muted">No candidates in this stage {searchTerm && "matching your search"}.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};