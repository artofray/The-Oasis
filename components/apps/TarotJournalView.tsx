import React, { useState, useMemo, useCallback } from 'react';
import { JournalEntry } from '../../types';
import CalendarView from './tarot-journal/CalendarView';
import JournalModal from './tarot-journal/JournalModal';
import { PlusIcon, BookOpenIcon } from './tarot-journal/Icons';

interface TarotJournalViewProps {
  entries: Record<string, JournalEntry>;
  setEntries: (entries: Record<string, JournalEntry>) => void;
}

export const TarotJournalView: React.FC<TarotJournalViewProps> = ({ entries, setEntries }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateEntries = (newEntries: Record<string, JournalEntry>) => {
    setEntries(newEntries);
  };

  const selectedDateString = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const currentEntry = useMemo(() => {
    return entries[selectedDateString] || null;
  }, [entries, selectedDateString]);

  const handleSaveEntry = useCallback((entry: JournalEntry) => {
    const newEntries = { ...entries, [entry.date]: entry };
    updateEntries(newEntries);
    setIsModalOpen(false);
  }, [entries, setEntries]);

  const handleDeleteEntry = useCallback((date: string) => {
    const newEntries = { ...entries };
    delete newEntries[date];
    updateEntries(newEntries);
    setIsModalOpen(false);
  }, [entries, setEntries]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="text-white antialiased h-full w-full overflow-y-auto" style={{ background: 'radial-gradient(circle at top, #1a202c, #0d1117)' }}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair-display font-bold text-purple-300 tracking-wider">
            AI Tarot Journal
          </h1>
          <p className="text-lg text-gray-400 mt-2 font-lora">
            Your daily cosmic chronicle.
          </p>
        </header>

        <main>
          <CalendarView
            entries={entries}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <div className="mt-8 text-center animate-fadeInUp">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50"
            >
              {currentEntry ? <BookOpenIcon className="h-6 w-6 mr-3" /> : <PlusIcon className="h-6 w-6 mr-3" />}
              {currentEntry ? 'View Today\'s Reading' : 'Add Today\'s Reading'}
            </button>
          </div>
        </main>
       
        {isModalOpen && (
          <JournalModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            entry={currentEntry}
            date={selectedDate}
            onSave={handleSaveEntry}
            onDelete={handleDeleteEntry}
          />
        )}
      </div>
       <footer className="text-center py-6 text-gray-500 font-lora text-sm">
          <p>&copy; {new Date().getFullYear()} Cosmic Coders. All rights reserved.</p>
        </footer>
    </div>
  );
}