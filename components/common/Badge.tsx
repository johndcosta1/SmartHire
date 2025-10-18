
import React from 'react';
import { ApplicationStatus } from '../../types';
import { STATUS_COLORS } from '../../constants';

interface BadgeProps {
  status: ApplicationStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-500';
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};
