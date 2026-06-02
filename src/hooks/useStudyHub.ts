import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStudyHub(activeCourseCode?: string) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch resources conditionally filtered by course code
  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        let query = supabase.from('study_resources').select('*, academic_courses(title)');
        
        if (activeCourseCode) {
          query = query.eq('course_code', activeCourseCode.toUpperCase().replace(/\s+/g, ''));
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setResources(data || []);
      } catch (err) {
        console.error('Error fetching study vault:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, [activeCourseCode]);

  // 2. Upload Handler Function
  const uploadResource = async (file: File, meta: { title: string; courseCode: string; type: string; desc: string }) => {
    try {
      const normalizedCode = meta.courseCode.toUpperCase().replace(/\s+/g, '');
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Authentication required to upload resources.');

      // A. Push physical file to Storage Bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${normalizedCode}-${Date.now()}.${fileExt}`;
      const filePath = `vault/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('study-hub-vault')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // B. Get Public Download Link
      const { data: { publicUrl } } = supabase.storage
        .from('study-hub-vault')
        .getPublicUrl(filePath);

      // C. Register row item metadata inside DB
      const { data, error: dbError } = await supabase.from('study_resources').insert({
        course_code: normalizedCode,
        title: meta.title,
        description: meta.desc,
        resource_type: meta.type,
        file_url: publicUrl,
        uploaded_by: user.id
      }).select();

      if (dbError) throw dbError;
      setResources(prev => [data[0], ...prev]);
      return { success: true };
    } catch (err: any) {
      console.error('Upload script failure:', err);
      return { success: false, error: err.message };
    }
  };

  return { resources, loading, uploadResource };
}