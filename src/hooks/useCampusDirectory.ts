import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { LocationKnowledgeNode } from '../types/database';

export function useCampusDirectory() {
  const [locations, setLocations] = useState<LocationKnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'moderator' | 'admin'>('student');

  const fetchCompleteKnowledgeBase = async () => {
    try {
      setLoading(true);
      
      // 🔑 Get active user role context concurrently
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role) setUserRole(profile.role as any);
      }

      const { data, error } = await supabase
        .from('locations')
        .select(`
          id, name, category, buildingName:building_name, floor, roomNumber:room_number, x, y, description, hours,
          services:location_services(id, name),
          documents:location_documents(id, document_name)
        `);

      if (error) throw error;
      setLocations(data as unknown as LocationKnowledgeNode[] || []);
    } catch (err) {
      console.error('Error compiling campus knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLocationNode = async (id: string, updates: Partial<LocationKnowledgeNode>) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update({
          name: updates.name,
          description: updates.description,
          hours: updates.hours,
          building_name: updates.buildingName,
          room_number: updates.roomNumber,
          floor: updates.floor,
          x: updates.x,
          y: updates.y
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Location node metadata synced successfully.');
      await fetchCompleteKnowledgeBase();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update map node.');
      return false;
    }
  };

  const createLocationNode = async (node: Omit<LocationKnowledgeNode, 'id'>) => {
    try {
      const { error } = await supabase.from('locations').insert([{
        name: node.name,
        category: node.category,
        building_name: node.buildingName,
        floor: node.floor,
        room_number: node.roomNumber,
        x: node.x,
        y: node.y,
        description: node.description,
        hours: node.hours
      }]);

      if (error) throw error;
      toast.success('New geographic campus pin dropped live!');
      await fetchCompleteKnowledgeBase();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to pin new coordinate.');
      return false;
    }
  };

  useEffect(() => {
    fetchCompleteKnowledgeBase();
  }, []);

  return { 
    locations, 
    loading, 
    userRole, 
    isAdmin: userRole === 'admin' || userRole === 'moderator',
    updateLocationNode,
    createLocationNode
  };
}