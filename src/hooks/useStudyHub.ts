import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export function useStudyHub(activeCourseCode?: string) {
  const [schools, setSchools] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);

    try {
      const [schoolsRes, coursesRes, materialsRes] = await Promise.all([
        supabase.from("schools").select("*").order("name"),
        supabase.from("courses").select("*").order("code"),
        supabase
          .from("study_materials")
          .select("*, courses(code, name), profiles:uploaded_by(full_name)")
          .order("created_at", { ascending: false }),
      ]);

      setSchools(schoolsRes.data ?? []);
      setCourses(coursesRes.data ?? []);
      setMaterials(materialsRes.data ?? []);
    } catch (err) {
      console.error("Academic vault error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      let query = supabase
        .from("study_resources")
        .select("*, academic_courses(title)")
        .order("created_at", { ascending: false });

      if (activeCourseCode) {
        query = query.eq(
          "course_code",
          activeCourseCode.toUpperCase().replace(/\s+/g, "")
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      setResources(data ?? []);
    } catch (err) {
      console.error("Study hub fetch error:", err);
    }
  }, [activeCourseCode]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const uploadResource = async (
    file: File,
    meta: {
      title: string;
      courseCode: string;
      type: string;
      desc: string;
    }
  ) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) throw new Error("Authentication required");

      const normalizedCode = meta.courseCode.toUpperCase().replace(/\s+/g, "");

      const fileExt = file.name.split(".").pop();
      const fileName = `${normalizedCode}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `study-vault/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("study-vault")
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data } = supabase.storage
        .from("study-vault")
        .getPublicUrl(filePath);

      const { data: inserted, error: dbError } = await supabase
        .from("study_materials")
        .insert([
          {
            title: meta.title,
            description: meta.desc,
            resource_type: meta.type,
            course_code: normalizedCode,
            course_id: null,
            file_url: data.publicUrl,
            uploaded_by: user.id,
          },
        ])
        .select();

      if (dbError) throw dbError;

      if (inserted?.[0]) {
        setResources((prev) => [inserted[0], ...prev]);
        setMaterials((prev) => [inserted[0], ...prev]);
      }

      toast.success("Study resource uploaded!");
      return { success: true };
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
      return { success: false, error: err.message };
    }
  };

  const refresh = async () => {
    await Promise.all([fetchInitialData(), fetchResources()]);
  };
  const trackDownload = async (resourceId: string) => {
  await supabase
    .from("resources")
    .update({ downloads: supabase.rpc("increment") })
    .eq("id", resourceId);
};

  return {
    schools,
    courses,
    materials,
    resources,
    loading,
    uploadResource,
    refresh,
    trackDownload,
  };
}