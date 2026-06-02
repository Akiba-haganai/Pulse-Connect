import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust this path to match your project initialization file

export interface LocationKnowledgeNode {
  id: string;
  name: string;
  category: 'academic' | 'hostels' | 'administration' | 'shops' | 'health' | 'services' | 'food' | 'banking' | 'security' | 'sports';
  buildingName: string;
  floor: string;
  roomNumber: string;
  x: number;
  y: number;
  description: string;
  hours: string;
  services?: { id: string; name: string }[];
  documents?: { id: string; document_name: string }[];
  faqs?: { id: string; question: string; answer: string }[];
}

export function useCampusDirectory() {
  const [locations, setLocations] = useState<LocationKnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompleteKnowledgeBase() {
      try {
        // Fetches locations and automatically nests related table arrays in one single trip
        const { data, error } = await supabase
          .from('locations')
          .select(`
            *,
            services:location_services(id, name),
            documents:location_documents(id, document_name),
            faqs:location_faqs(id, question, answer)
          `);

        if (error) throw error;
        setLocations(data || []);
      } catch (err) {
        console.error('Error compiling campus knowledge base:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompleteKnowledgeBase();
  }, []);

  return { locations, loading };
}