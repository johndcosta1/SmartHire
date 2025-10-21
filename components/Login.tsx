
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { USER_ROLES, ROLE_PASSWORDS } from '../constants';

interface LoginProps {
  onLoginSuccess: (role: UserRole) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.HR);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ROLE_PASSWORDS[selectedRole] === password) {
      setError('');
      onLoginSuccess(selectedRole);
    } else {
      setError('Invalid password for the selected role.');
    }
  };

  return (
    <div className="bg-casino-primary min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-casino-gold">SmartHire</h1>
            <p className="text-casino-text-muted mt-2">Administration Login</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-casino-text-muted mb-1">Select Role</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full bg-casino-secondary border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-casino-gold text-casino-text"
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-casino-text-muted mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-casino-secondary border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-casino-gold text-casino-text"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-casino-danger text-center">{error}</p>}
          <div>
            <button type="submit" className="w-full bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
                <Icon name="shield-check" className="w-5 h-5 mr-2" />
                Login
            </button>
          </div>
           <div className="text-center">
             <button type="button" onClick={onBack} className="text-sm text-casino-text-muted hover:text-casino-gold">
                Back to role selection
             </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
