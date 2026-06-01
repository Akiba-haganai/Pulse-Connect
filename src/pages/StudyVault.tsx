import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAcademicVault } from '../hooks/useAcademicVault';
import { GraduationCap, Download, Search, PlusCircle, FileText, UploadCloud, Loader2 } from 'lucide-react';

export default function StudyVault() {
  const { profile } = useAuthStore();
  const { schools, courses, materials, loading, uploadMaterial } = useAcademicVault();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');

  // Form Upload States
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('lecture_note');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isFaculty = profile?.role === 'professor' || profile?.role === 'admin';

  // ⚡ PERFORMANCE FILTERING MEMO
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.courses?.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = selectedSchool === 'all' || m.courses?.school_id === selectedSchool;
      return matchesSearch && matchesSchool;
    });
  }, [materials, searchQuery, selectedSchool]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !selectedCourseId) return;

    setUploading(true);
    const success = await uploadMaterial(file, title.trim(), description.trim(), resourceType, selectedCourseId);
    if (success) {
      setTitle('');
      setDescription('');
      setFile(null);
      setShowUploadForm(false);
    }
    setUploading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-20">
      
      {/* Search Header Core */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-3xs space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <GraduationCap className="text-indigo-600" size={20} /> Academic Vault
          </h2>
          {isFaculty && (
            <button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 focus:outline-hidden"
            >
              <PlusCircle size={14} /> Upload Vault Item
            </button>
          )}
        </div>

        {/* Dynamic Contextual Filtering Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search course code or resource title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Horizontal School Slider Badges */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSchool('all')}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap focus:outline-hidden ${
              selectedSchool === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border border-gray-100 dark:border-gray-800'
            }`}
          >
            All Schools
          </button>
          {schools.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSchool(s.id)}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap focus:outline-hidden ${
                selectedSchool === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border border-gray-100 dark:border-gray-800'
              }`}
            >
              {s.name.split(' of ')[1] || s.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🛡️ INSTRUCTOR UPLOAD UTILITY CONTAINER */}
      {isFaculty && showUploadForm && (
        <form onSubmit={handleFileUpload} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/40 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Publish Academic Materials</h3>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Resource Document Title (e.g., Midterm Exam Review 2026)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100 font-medium"
              required
            />
            <input
              type="text"
              placeholder="Short descriptive explanation notes (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-extrabold uppercase text-gray-400 mb-1">Target Course Code</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-700 dark:text-gray-300"
                required
              >
                <option value="">Select Course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold uppercase text-gray-400 mb-1">Document Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full p-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-700 dark:text-gray-300"
              >
                <option value="lecture_note">📒 Lecture Notes</option>
                <option value="past_exam">📝 Past Exam Papers</option>
                <option value="syllabus">📋 Course Syllabus</option>
                <option value="assignment">📁 Assignment Prompt</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <UploadCloud size={20} className="text-gray-400 shrink-0" />
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700"
              title="Upload academic material file"
              aria-label="Upload academic material file"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !title.trim() || !selectedCourseId}
              className="px-4 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 disabled:opacity-40"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : null}
              {uploading ? 'Uploading Vault Item...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      )}

      {/* 📑 STREAMING LIST ITEM CONTAINER MAPS */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 font-medium">
            No matching reference items registered in this catalog branch.
          </div>
        ) : (
          filteredMaterials.map((m) => (
            <div key={m.id} className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-3xs flex gap-3 items-start justify-between">
              <div className="flex gap-2.5 items-start min-w-0">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 mt-0.5">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex gap-1.5 items-center flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-sm">
                      {m.courses?.code}
                    </span>
                    <span className="text-[9px] font-medium text-gray-400 lowercase border-l border-gray-200 pl-1.5">
                      {m.resource_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">{m.title}</h4>
                  {m.description && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{m.description}</p>}
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Uploaded by: {m.profiles?.full_name || 'Faculty Member'}</p>
                </div>
              </div>

              {/* Direct Anchor Download Trigger */}
              <a 
                href={m.file_url} 
                target="_blank" 
                rel="noreferrer"
                download
                title="Download resource"
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all shrink-0 focus:outline-hidden"
              >
                <Download size={14} />
              </a>
            </div>
          ))
        )}
      </div>

    </div>
  );
}