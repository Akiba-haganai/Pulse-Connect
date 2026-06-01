import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useAcademicVault() {
  const [schools, setSchools] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, coursesRes, materialsRes] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('courses').select('*').order('code'),
        supabase.from('study_materials').select('*, courses(code, name), profiles:uploaded_by(full_name)').order('created_at', { ascending: false })
      ]);

      if (schoolsRes.data) setSchools(schoolsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (materialsRes.data) setMaterials(materialsRes.data);
    } catch (err) {
      console.error('Error hydrating academic vault:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadMaterial = async (file: File, title: string, description: string, resourceType: string, courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // 1. Send file object into Supabase Storage bucket path
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
        .from('study-vault')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // 2. Compute the direct static public access URL string URL pointer
      const { data: { publicUrl } } = supabase.storage.from('study-vault').getPublicUrl(fileName);

      // 3. Write row entries to the database catalog index
      const { error: dbError } = await supabase.from('study-materials').insert([
        {
          title,
          description,
          resource_type: resourceType,
          course_id: courseId,
          file_url: publicUrl,
          uploaded_by: user.id
        }
      ]);

      if (dbError) throw dbError;
      
      toast.success('Resource file published into vault!');
      fetchInitialData();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error uploading file.');
      return false;
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return { schools, courses, materials, loading, uploadMaterial, refresh: fetchInitialData };
}