
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { Icon } from './common/Icon.tsx';

interface SidebarProps {
  currentRole: UserRole;
  onLogout: () => void;
}

const navLinks: { to: string; text: string; icon: React.ComponentProps<typeof Icon>['name']; roles: UserRole[] }[] = [
  { to: '/', text: 'Dashboard', icon: 'dashboard', roles: [UserRole.Admin, UserRole.HOD, UserRole.HR, UserRole.Scheduler, UserRole.Surveillance] },
  { to: '/applicants', text: 'Applicants', icon: 'users', roles: [UserRole.Admin, UserRole.HOD, UserRole.HR, UserRole.Scheduler, UserRole.Surveillance] },
  { to: '/applicants/new', text: 'New Candidate', icon: 'user-plus', roles: [UserRole.HR] },
  { to: '/schedule', text: 'Interview Calendar', icon: 'calendar', roles: [UserRole.Admin, UserRole.Scheduler] },
  { to: '/surveillance', text: 'Surveillance Queue', icon: 'shield-check', roles: [UserRole.Admin, UserRole.Surveillance] },
  { to: '/offers', text: 'HR Offers', icon: 'briefcase', roles: [UserRole.Admin, UserRole.HR] },
  { to: '/reports', text: 'Reports', icon: 'reports', roles: [UserRole.Admin, UserRole.HR, UserRole.HOD] },
  { to: '/settings', text: 'Settings', icon: 'cog', roles: [UserRole.Admin] },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, onLogout }) => {
  const activeLinkClass = "bg-casino-accent text-casino-primary";
  const inactiveLinkClass = "text-casino-text-muted hover:bg-casino-secondary hover:text-casino-text";

  return (
    <div className="w-64 bg-casino-primary h-full flex flex-col fixed shadow-2xl no-print">
      <div className="p-6 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-casino-gold">SmartHire</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.filter(link => link.roles.includes(currentRole)).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} flex items-center px-4 py-3 rounded-lg transition-colors duration-200`}
          >
            <Icon name={link.icon} className="w-5 h-5 mr-4" />
            <span className="font-medium">{link.text}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
         <button onClick={onLogout} className={`${inactiveLinkClass} w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-left`}>
            <Icon name="logout" className="w-5 h-5 mr-4" />
            <span className="font-medium">Logout</span>
         </button>
      </div>
    </div>
  );
};