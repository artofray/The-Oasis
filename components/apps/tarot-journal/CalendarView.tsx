import React, { useMemo } from 'react';
import { JournalEntry } from '../../../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  entries: Record<string, JournalEntry>;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries, onDateSelect, selectedDate, setSelectedDate }) => {
  const firstDayOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), [selectedDate]);
  const daysInMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate(), [selectedDate]);

  const changeMonth = (offset: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1));
  };
 
  const calendarDays = useMemo(() => {
    const blanks = Array(firstDayOfMonth.getDay()).fill(null);
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...daysArr];
  }, [firstDayOfMonth, daysInMonth]);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
  };

  const hasEntry = (day: number) => {
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    return !!entries[dateStr];
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="h-6 w-6 text-purple-300" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-purple-200 tracking-wide font-playfair-display">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronRightIcon className="h-6 w-6 text-purple-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-2 font-lora">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 font-lora">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => day && onDateSelect(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
            className={`
              relative flex items-center justify-center h-10 sm:h-12 lg:h-14 rounded-lg transition-all duration-300 cursor-pointer
              ${day ? 'hover:bg-purple-800' : 'cursor-default'}
              ${day && isToday(day) ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-400' : ''}
              ${day && selectedDate.getDate() === day ? 'bg-purple-700 border-2 border-purple-300' : ''}
              ${!day ? 'bg-transparent' : 'bg-gray-700 bg-opacity-50'}
            `}
          >
            {day}
            {day && hasEntry(day) && (
              <span className="absolute bottom-1 right-1 h-2 w-2 bg-teal-400 rounded-full shadow-lg"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
