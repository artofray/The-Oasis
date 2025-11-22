
import React, { useState, useMemo, useCallback } from 'react';
import { JournalEntry, TarotCard, TarotDeck } from '../../types';
import CalendarView from './tarot-journal/CalendarView';
import JournalModal from './tarot-journal/JournalModal';
import { TarotSanctum } from './tarot-journal/TarotSanctum';
import { DeckManager } from './tarot-journal/DeckManager';
import { PlusIcon, BookOpenIcon } from './tarot-journal/Icons';

interface TarotJournalViewProps {
  entries: Record<string, JournalEntry>;
  setEntries: (entries: Record<string, JournalEntry>) => void;
  customDecks?: TarotDeck[];
  setCustomDecks?: (updater: (prev: TarotDeck[]) => TarotDeck[]) => void;
  unleashedMode: boolean;
}

export const TarotJournalView: React.FC<TarotJournalViewProps> = ({ entries, setEntries, customDecks = [], setCustomDecks = (_: any) => {}, unleashedMode }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSanctumOpen, setIsSanctumOpen] = useState(false);
  const [isDeckManagerOpen, setIsDeckManagerOpen] = useState(false);

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

  const handleSanctumSave = useCallback((cards: TarotCard[], interpretation: string) => {
      // Create date string in local time to ensure it matches the calendar view's "today"
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const newEntry: JournalEntry = {
          id: `reading-${Date.now()}`,
          date: dateStr,
          cards: cards,
          overallInterpretation: interpretation,
          notes: "Generated in Tarot Sanctum"
      };
      const newEntries = { ...entries, [dateStr]: newEntry };
      updateEntries(newEntries);
      setSelectedDate(today);
  }, [entries, setEntries]);

  const handleUpdateDeck = (updatedDeck: TarotDeck) => {
      setCustomDecks(prev => prev.map(d => d.id === updatedDeck.id ? updatedDeck : d));
  };

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
    <div className="text-white antialiased h-full w-full overflow-y-auto relative" style={{ background: 'radial-gradient(circle at top, #1a202c, #0d1117)' }}>
      {isSanctumOpen ? (
          <TarotSanctum 
            onClose={() => setIsSanctumOpen(false)} 
            onSaveToJournal={handleSanctumSave}
            unleashedMode={unleashedMode}
            customDecks={customDecks}
            onUpdateDeck={handleUpdateDeck}
          />
      ) : (
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
              <div className="flex justify-center mb-8 gap-4">
                  <button 
                    onClick={() => setIsSanctumOpen(true)}
                    className="bg-gradient-to-r from-purple-900 to-black border border-[#ffd700] text-[#ffd700] px-8 py-4 rounded-lg font-bold text-lg shadow-[0_0_15px_#ffd70030] hover:scale-105 transition-transform flex items-center gap-3"
                  >
                      <span className="text-2xl">🔮</span> Enter Tarot Sanctum
                  </button>
                  <button
                    onClick={() => setIsDeckManagerOpen(true)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-6 py-4 rounded-lg font-bold transition-colors"
                  >
                      Manage Decks
                  </button>
              </div>

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
                  {currentEntry ? 'View Today\'s Reading' : 'Log Manual Reading'}
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
            
            {isDeckManagerOpen && (
                <DeckManager
                    isOpen={isDeckManagerOpen}
                    onClose={() => setIsDeckManagerOpen(false)}
                    customDecks={customDecks}
                    setCustomDecks={setCustomDecks}
                    unleashedMode={unleashedMode}
                />
            )}
          </div>
      )}
       <footer className="text-center py-6 text-gray-500 font-lora text-sm relative z-10">
          <p>&copy; {new Date().getFullYear()} Cosmic Coders. All rights reserved.</p>
        </footer>
    </div>
  );
}
