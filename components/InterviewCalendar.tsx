import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate, ApplicationStatus } from '../types';
import { Card } from './common/Card';
import { Icon } from './common/Icon';

interface InterviewCalendarProps {
  candidates: Candidate[];
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ candidates }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const interviews = useMemo(() => {
    const interviewMap = new Map<string, Candidate[]>();
    candidates
      .filter(c => c.status === ApplicationStatus.InterviewScheduled && c.interview?.date)
      .forEach(c => {
        const dateKey = c.interview!.date;
        if (!interviewMap.has(dateKey)) {
          interviewMap.set(dateKey, []);
        }
        interviewMap.get(dateKey)!.push(c);
      });
    return interviewMap;
  }, [candidates]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-casino-gold">Interview Calendar</h1>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-casino-secondary"><Icon name="chevron-right" className="w-6 h-6 transform rotate-180" /></button>
          <span className="text-xl font-semibold w-48 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-casino-secondary"><Icon name="chevron-right" className="w-6 h-6" /></button>
        </div>
      </div>
      <Card>
        <div className="grid grid-cols-7 gap-px bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="text-center font-semibold py-2 bg-casino-secondary text-casino-text-muted">{dayName}</div>
          ))}
          {days.map((d, index) => {
            const dateKey = d.toISOString().split('T')[0];
            const dailyInterviews = interviews.get(dateKey) || [];
            const isCurrentMonth = d.getMonth() === currentDate.getMonth();
            return (
              <div key={index} className={`p-2 h-36 flex flex-col ${isCurrentMonth ? 'bg-casino-primary' : 'bg-casino-secondary'} relative`}>
                <span className={`font-bold ${isCurrentMonth ? 'text-casino-text' : 'text-casino-text-muted'} ${isToday(d) ? 'bg-casino-gold text-casino-primary rounded-full w-8 h-8 flex items-center justify-center' : ''}`}>
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-1 overflow-y-auto">
                  {dailyInterviews.map(c => (
                     <div key={c.id} onClick={() => navigate(`/applicants/${c.id}`)} className="bg-cyan-600 text-white text-xs p-1 rounded cursor-pointer hover:bg-cyan-500">
                        <p className="font-semibold truncate">{c.fullName}</p>
                        <p>{c.interview?.time}</p>
                     </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
