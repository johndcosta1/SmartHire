import React from 'react';
import { Card } from './common/Card';
import { Icon } from './common/Icon';

interface RoleSelectionProps {
  onSelectCandidate: () => void;
  onSelectAdmin: () => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectCandidate, onSelectAdmin }) => {
  return (
    <div className="bg-casino-primary min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <img src="https://bigdaddy.in/core/views/f6924b8174/assets/img/Horizontal_logo_transparent_header.png" alt="Big Daddy Casino Logo" className="mx-auto h-24 mb-4" />
        <h1 className="text-4xl font-bold text-casino-gold mb-2">Welcome to SmartHire</h1>
        <p className="text-casino-text-muted mb-8">Please select your entry point.</p>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={onSelectCandidate}
            className="flex-1 bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-8 px-6 rounded-lg flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105"
          >
            <Icon name="user-plus" className="w-12 h-12 mb-4 text-casino-gold" />
            <span className="text-xl">Candidate</span>
            <span className="text-sm text-casino-text-muted mt-1">Register your interest</span>
          </button>
          <button
            onClick={onSelectAdmin}
            className="flex-1 bg-casino-secondary hover:bg-gray-700 text-casino-text font-bold py-8 px-6 rounded-lg flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105"
          >
            <Icon name="shield-check" className="w-12 h-12 mb-4 text-casino-accent" />
            <span className="text-xl">Administration</span>
            <span className="text-sm text-casino-text-muted mt-1">Manage hiring process</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
