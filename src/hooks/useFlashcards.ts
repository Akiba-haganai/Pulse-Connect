import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useFlashcards() {
  const [decks, setDecks] = useState<any[]>([]);
  const [currentCards, setCurrentCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDecksByCourse = async (courseId: string) => {
    if (!courseId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('study_decks')
      .select('*, profiles:created_by(full_name)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (data) setDecks(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const fetchCardsByDeck = async (deckId: string) => {
    if (!deckId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (data) setCurrentCards(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const createDeck = async (courseId: string, title: string, description: string, cards: { front: string, back: string }[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // 1. Insert the parent Deck record
      const { data: deckData, error: deckError } = await supabase
        .from('study_decks')
        .insert([{ course_id: courseId, created_by: user.id, title, description }])
        .select()
        .single();

      if (deckError) throw deckError;

      // 2. Format and insert child Flashcards if provided
      if (cards.length > 0) {
        const formattedCards = cards.map(c => ({ deck_id: deckData.id, front: c.front, back: c.back }));
        const { error: cardsError } = await supabase.from('flashcards').insert(formattedCards);
        if (cardsError) throw cardsError;
      }

      toast.success('Study deck published!');
      return deckData.id;
    } catch (err) {
      console.error(err);
      toast.error('Failed to save study deck.');
      return false;
    }
  };

  return { decks, currentCards, loading, fetchDecksByCourse, fetchCardsByDeck, createDeck };
}