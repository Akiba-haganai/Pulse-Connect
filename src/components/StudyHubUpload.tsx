import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react';

// Initialize your Supabase client connection (wired into your environment file)
const env = (globalThis as any).process?.env;
const supabase = createClient(
  env?.NEXT_PUBLIC_SUPABASE_URL ?? '',
  env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

const ACADEMIC_CATEGORIES = ['Lecture Notes', 'Past Paper', 'Assignment', 'Textbook Guide'];

interface UploadFormProps {
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

export default function StudyHubUpload({ onUploadSuccess, onClose }: UploadFormProps) {
  // Controlled form states
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [category, setCategory] = useState('Lecture Notes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Status handling states
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Enforce your 25MB infrastructure policy rule locally before wasting bandwidth
      if (file.size > 26214400) {
        setStatusMessage({ type: 'error', text: 'File exceeds the strict 25MB campus hub upload cap.' });
        setSelectedFile(null);
        return;
      }
      
      setStatusMessage(null);
      setSelectedFile(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !courseCode) {
      setStatusMessage({ type: 'error', text: 'Please complete all fields and drop a file.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      // 1. Fetch current user session reference ID token
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication required to upload campus files.');

      // 2. Format a sanitized, clean file name string mapping your path isolation policies
      const fileExtension = selectedFile.name.split('.').pop();
      const sanitizedFileName = `${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
      
      // Enforce your storage bucket directory path routing structure: bucket/user_uuid/file
      const storageFilePath = `${user.id}/${sanitizedFileName}`;

      // 3. Dispatch file payload stream directly to Supabase storage bucket
      const { error: storageError } = await supabase.storage
        .from('study-vault')
        .upload(storageFilePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 4. Retrieve the direct public engine asset delivery URL link 
      const { data: { publicUrl } } = supabase.storage
        .from('study-vault')
        .getPublicUrl(storageFilePath);

      // 5. Save the structural catalog entry inside your public data tracking table
      const { error: dbError } = await supabase
        .from('academic_resources')
        .insert([
          {
            title: title.trim(),
            course_code: courseCode.trim().toUpperCase(), // Enforce upper-case e.g., BIT210
            category: category,
            file_url: publicUrl,
            uploaded_by: user.id
          }
        ]);

      if (dbError) throw dbError;

      // Trigger reset lifecycle success states
      setStatusMessage({ type: 'success', text: 'Document published successfully to CBU Study Vault!' });
      setTitle('');
      setCourseCode('');
      setSelectedFile(null);
      
      if (onUploadSuccess) onUploadSuccess();

    } catch (error: any) {
      console.error('Vault upload failure tracking:', error);
      setStatusMessage({ type: 'error', text: error.message || 'An unexpected upload failure happened.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-900 rounded-2xl p-5 font-sans text-left shadow-xl relative">
      
      {/* Structural Header Action HUD Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Upload Vault Document</h3>
          <p className="text-[10px] font-semibold text-gray-400">Share academic papers with fellow classmates</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close upload dialog" title="Close" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400">
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {/* INPUT: Document Descriptive Title Label */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Document Title</label>
          <input
            type="text"
            required
            placeholder="e.g., BIT210 Systems Analysis Past Paper 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* ROW INTERACTIVE WRAPPER LINK UNITS */}
        <div className="grid grid-cols-2 gap-3">
          {/* INPUT: Local CBU Course Code Identifier */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Course Code</label>
            <input
              type="text"
              required
              placeholder="e.g., BIT210"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              disabled={isUploading}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white uppercase"
            />
          </div>

          {/* INPUT: Structural File Category Scroller Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Resource Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white font-semibold"
            >
              {ACADEMIC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DROPZONE ACCENT AREA COMPONENT BOX */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Document Binary Payload</label>
          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-200 dark:border-gray-900 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-950/40 hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-all overflow-hidden p-4 group">
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} disabled={isUploading} className="hidden" />
            
            {selectedFile ? (
              <div className="text-center space-y-1.5">
                <FileText className="mx-auto text-indigo-500 animate-bounce" size={28} />
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1 max-w-50">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB / 25MB Cap Limit
                </p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <UploadCloud className="mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors" size={32} />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Tap to browse files</p>
                <p className="text-[10px] text-gray-400 font-medium max-w-45">Supports PDFs, Word docs, or Images up to 25MB</p>
              </div>
            )}
          </label>
        </div>

        {/* FEEDBACK ANCHOR RESPONSE MESSAGES BANNER */}
        {statusMessage && (
          <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40' 
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/40'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle size={15} className="shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="shrink-0 mt-0.5" />}
            <span className="leading-snug">{statusMessage.text}</span>
          </div>
        )}

        {/* DISPATCH ACTION ACTION ACTION BUTTON ENGINE */}
        <button
          type="submit"
          disabled={isUploading || !selectedFile || !title || !courseCode}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-950 text-white disabled:text-gray-400 text-xs font-black rounded-xl shadow-md transition-all active:scale-98"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Publishing Resource to CBU...</span>
            </>
          ) : (
            <span>Publish Document</span>
          )}
        </button>
      </form>
    </div>
  );
}