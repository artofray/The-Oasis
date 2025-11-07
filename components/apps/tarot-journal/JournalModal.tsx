import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JournalEntry, TarotCard } from '../../../types';
import { analyzeTarotReading } from '../../../services/tarotService';
import Spinner from './Spinner';
import { XIcon, UploadIcon, TrashIcon, CameraIcon } from './Icons';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  date: Date;
  onSave: (entry: JournalEntry) => void;
  onDelete: (date: string) => void;
}

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, entry, date, onSave, onDelete }) => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [overallInterpretation, setOverallInterpretation] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateString = date.toISOString().split('T')[0];

  useEffect(() => {
    if (entry) {
      setCards(entry.cards);
      setOverallInterpretation(entry.overallInterpretation);
      setNotes(entry.notes);
      setImagePreviews([]);
      setImages([]);
    } else {
      setCards([]);
      setOverallInterpretation('');
      setNotes('');
      setImagePreviews([]);
      setImages([]);
    }
    setError(null);
  }, [entry, isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages(files);
      // FIX: Cast file to Blob as TypeScript seems to have trouble inferring the type from `Array.from(FileList)`.
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setImagePreviews(newPreviews);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (images.length === 0) {
      setError("Please upload at least one image of your tarot cards.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeTarotReading(images);
      setCards(result.cards);
      setOverallInterpretation(result.overallInterpretation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [images]);

  const handleSave = () => {
    const newEntry: JournalEntry = {
      id: entry?.id || new Date().toISOString(),
      date: dateString,
      cards,
      overallInterpretation,
      notes,
    };
    onSave(newEntry);
  };
 
  const handleDelete = () => {
      if(window.confirm('Are you sure you want to delete this entry?')) {
          onDelete(dateString);
      }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-purple-300 font-playfair-display">
          {entry ? 'Reading for' : 'New Reading for'} {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>

        <div className="space-y-6">
          {!entry && (
            <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
              <div className="flex justify-center items-center gap-4 mb-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors font-lora">
                  <UploadIcon className="h-5 w-5" /> Choose Files
                </button>
                <input type="file" ref={fileInputRef} multiple accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
              </div>
             
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {imagePreviews.map((src, index) => (
                    <img key={index} src={src} alt={`preview ${index}`} className="h-24 w-24 object-cover rounded-md shadow-lg" />
                  ))}
                </div>
              )}
              <button onClick={handleAnalyze} disabled={isLoading || images.length === 0} className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-lora">
                {isLoading ? <Spinner /> : <><CameraIcon className="w-5 h-5 mr-2" />Analyze with AI</>}
              </button>
              {error && <p className="text-red-400 mt-4 text-sm font-lora">{error}</p>}
            </div>
          )}
         
          { (cards.length > 0 || overallInterpretation) && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-teal-300 font-playfair-display border-b border-gray-700 pb-2">AI Interpretation</h3>
              <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                <p className="font-bold text-gray-300 mb-2 font-lora">Overall Meaning:</p>
                <p className="text-gray-400 font-lora">{overallInterpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                  <div key={index} className="bg-gray-900 bg-opacity-50 p-4 rounded-lg shadow-md">
                    <h4 className="font-bold text-purple-300 text-lg font-playfair-display">{card.name}</h4>
                    <p className="text-sm text-gray-400 italic mb-2 font-lora">{card.keywords.join(', ')}</p>
                    <p className="text-gray-300 text-sm font-lora">{card.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold text-teal-300 font-playfair-display mb-2">Your Notes & Reflections</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What thoughts or feelings came up during this reading? How does it connect to your day?"
              className="w-full h-32 p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-lora"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
             {entry && (
                 <button onClick={handleDelete} className="px-4 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2 font-lora">
                     <TrashIcon className="h-5 w-5"/> Delete
                 </button>
             )}
             <div className="flex-grow"></div>
            <button onClick={handleSave} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors font-lora">
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalModal;
