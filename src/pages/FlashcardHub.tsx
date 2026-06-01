import React, { useState, useEffect } from 'react';
import { useFlashcards } from '../hooks/useFlashcards';
import { supabase } from '../lib/supabase';
import { BookOpen, Layers, ArrowLeft, ArrowRight, RotateCw, PlusCircle, Trash2, Loader2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FlashcardHub() {
  const { decks, currentCards, loading, fetchDecksByCourse, fetchCardsByDeck, createDeck } = useFlashcards();
  
  // Selection Context States
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [activeDeck, setActiveDeck] = useState<any>(null);

  // Studying Engine States
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Deck Creator Form States
  const [isCreating, setIsCreating] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [newCards, setNewCards] = useState<{ front: string; back: string }[]>([{ front: '', back: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate available course listings
  useEffect(() => {
    supabase.from('courses').select('*').order('code').then(({ data }) => {
      if (data) {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id);
      }
    });
  }, []);

  // Sync refresh lists when changing top-level courses
  useEffect(() => {
    if (selectedCourse) {
      fetchDecksByCourse(selectedCourse);
      setActiveDeck(null);
    }
  }, [selectedCourse]);

  const startStudying = async (deck: any) => {
    setCardIndex(0);
    setIsFlipped(false);
    await fetchCardsByDeck(deck.id);
    setActiveDeck(deck);
  };

  // Safe navigation wrapper that resets the flip state before changing indices
  const handleCardNavigation = (direction: 'next' | 'prev') => {
    setIsFlipped(false);
    // Short timeout allows the card to visually unflip before swapping text content
    setTimeout(() => {
      if (direction === 'next' && cardIndex < currentCards.length - 1) {
        setCardIndex(prev => prev + 1);
      } else if (direction === 'prev' && cardIndex > 0) {
        setCardIndex(prev => prev - 1);
      }
    }, 150);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validCards = newCards.filter(c => c.front.trim() && c.back.trim());
    
    if (!deckTitle.trim()) {
      toast.error('Please enter a deck name.');
      return;
    }
    if (validCards.length === 0) {
      toast.error('Please fill out at least one flashcard question and answer.');
      return;
    }

    setSubmitting(true);
    const successId = await createDeck(selectedCourse, deckTitle.trim(), deckDesc.trim(), validCards);
    setSubmitting(false);

    if (successId) {
      setDeckTitle('');
      setDeckDesc('');
      setNewCards([{ front: '', back: '' }]);
      setIsCreating(false);
      fetchDecksByCourse(selectedCourse);
    }
  };

  const removeCardRow = (indexToRemove: number) => {
    if (newCards.length === 1) {
      setNewCards([{ front: '', back: '' }]);
      return;
    }
    setNewCards(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-24">
      
      {/* 🧭 TOP LEVEL FILTER TOOLBAR */}
      {!activeDeck && !isCreating && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-3xs space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Layers className="text-indigo-600" size={18} /> Revision Decks
            </h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 focus:outline-hidden cursor-pointer"
            >
              <PlusCircle size={14} /> Create Deck
            </button>
          </div>

          <select
            aria-label="Select course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden font-semibold text-gray-700 dark:text-gray-300"
          >
            {courses.length === 0 && <option value="">No courses registered...</option>}
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
      )}

      {/* 🧠 INTERACTIVE LIVE STUDY PANEL */}
      {activeDeck && (
        <div className="space-y-4 animate-fadeIn">
          <button 
            onClick={() => { setActiveDeck(null); setIsFlipped(false); }}
            className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1 focus:outline-hidden transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Leave Study Mode
          </button>

          <div className="text-center">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 truncate max-w-xs mx-auto">{activeDeck.title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
              Card {currentCards.length > 0 ? cardIndex + 1 : 0} of {currentCards.length}
            </p>
          </div>

          {currentCards.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl text-xs text-gray-400 border border-gray-100 dark:border-gray-800 font-medium">
              This study set doesn't contain any flashcards yet.
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* FLIP BOX ENGINE */}
              <div 
                onClick={() => setIsFlipped(prev => !prev)}
                className={`w-full min-h-52 bg-white dark:bg-gray-900 border-2 rounded-3xl p-6 shadow-xs flex flex-col justify-center items-center text-center cursor-pointer relative select-none transition-all duration-200 ${
                  isFlipped 
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200'
                }`}
              >
                <div className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold">
                  <RotateCw size={10} /> Click to flip
                </div>

                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-3 ${
                  isFlipped 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' 
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400'
                }`}>
                  {isFlipped ? 'Answer Key' : 'Question Prompt'}
                </span>

                <p className={`text-xs leading-relaxed text-gray-900 dark:text-gray-100 wrap-break-word max-w-xs ${
                  isFlipped ? 'font-medium italic text-gray-800 dark:text-gray-200' : 'font-bold'
                }`}>
                  {/* Defensive checks against out of bounds array values */}
                  {currentCards[cardIndex] 
                    ? (isFlipped ? currentCards[cardIndex].back : currentCards[cardIndex].front)
                    : 'Loading card payload...'
                  }
                </p>
              </div>

              {/* CONTROLS BAR ROW */}
              <div className="flex justify-between items-center px-2">
                <button
                  type="button"
                  aria-label="Previous card"
                  disabled={cardIndex === 0}
                  onClick={() => handleCardNavigation('prev')}
                  className="p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 disabled:opacity-20 rounded-xl text-gray-600 dark:text-gray-400 transition-colors shadow-3xs cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>

                {/* Progress Tracking Bar */}
                <div className="w-1/2 bg-gray-100 dark:bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-200/20">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((cardIndex + 1) / currentCards.length) * 100}%` } as React.CSSProperties}
                  />
                </div>

                <button
                  type="button"
                  aria-label="Next card"
                  disabled={cardIndex === currentCards.length - 1}
                  onClick={() => handleCardNavigation('next')}
                  className="p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 disabled:opacity-20 rounded-xl text-gray-600 dark:text-gray-400 transition-colors shadow-3xs cursor-pointer"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✍️ DECK CREATOR BUILDER FORM PANEL */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 animate-slideUp">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-2 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">Build Study Set</h3>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setNewCards([{ front: '', back: '' }]); }} 
              className="text-xs text-gray-400 hover:text-gray-600 font-bold focus:outline-hidden cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Set Title (e.g., CSC-101 Midterm Prep)..."
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100 font-bold focus:border-indigo-400"
              required
            />
            <input
              type="text"
              placeholder="Short descriptive subtitle note (optional)..."
              value={deckDesc}
              onChange={(e) => setDeckDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Dynamic Flashcard Rows List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">Flashcards Configuration Matrix</label>
            {newCards.map((card, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800/80 space-y-2 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-indigo-500 font-extrabold uppercase">Card #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCardRow(i)}
                    className="text-gray-300 hover:text-red-500 transition-colors focus:outline-hidden cursor-pointer"
                    title="Remove this card"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Term, Formula, or Question Prompt..."
                  value={card.front}
                  onChange={(e) => {
                    const copy = [...newCards];
                    copy[i].front = e.target.value;
                    setNewCards(copy);
                  }}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md outline-hidden text-gray-900 dark:text-gray-100 font-semibold"
                  required
                />
                <input
                  type="text"
                  placeholder="Definition, Key, or Answer Details..."
                  value={card.back}
                  onChange={(e) => {
                    const copy = [...newCards];
                    copy[i].back = e.target.value;
                    setNewCards(copy);
                  }}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md outline-hidden text-gray-700 dark:text-gray-300"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setNewCards([...newCards, { front: '', back: '' }])}
              className="w-full py-2 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              + Add Card Row
            </button>
            <button
              type="submit"
              disabled={submitting || !deckTitle.trim() || newCards.filter(c => c.front.trim() && c.back.trim()).length === 0}
              className="w-full py-2 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Save Study Set
            </button>
          </div>
        </form>
      )}

      {/* 🗂️ PRIMARY DECK STREAM FEED LIST VIEW */}
      {!activeDeck && !isCreating && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 space-y-2">
              <HelpCircle className="mx-auto text-gray-300 dark:text-gray-600" size={24} />
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No review sets active under this course code yet.</p>
            </div>
          ) : (
            decks.map((deck) => (
              <div 
                key={deck.id}
                onClick={() => startStudying(deck)}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-3xs flex justify-between items-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-900 transition-all group animate-fadeIn"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {deck.title}
                  </h4>
                  {deck.description && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">
                      {deck.description}
                    </p>
                  )}
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                    Created by: <span className="text-gray-500 dark:text-gray-400 font-semibold">{deck.profiles?.full_name || 'Campus Member'}</span>
                  </p>
                </div>
                <div className="p-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-950/20 transition-all shrink-0">
                  <BookOpen size={14} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}