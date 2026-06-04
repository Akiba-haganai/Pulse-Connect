import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, Download, FileText, UploadCloud, X, GraduationCap, CheckCircle2 
} from 'lucide-react';
import { useStudyHub } from '../hooks/useStudyHub';

// ✅ FIX: Added proper Resource interface
interface Resource {
  id: string;
  title: string;
  course_code: string;
  resource_type: string;
  description?: string;
  created_at: string;
  file_url: string;
}

const RESOURCE_TYPES = [
  { id: 'all', label: 'All Files', icon: BookOpen },
  { id: 'notes', label: 'Lecture Notes', icon: FileText },
  { id: 'past_paper', label: 'Past Papers', icon: GraduationCap },
  { id: 'assignment', label: 'Assignments', icon: FileText },
];

export default function StudyHub() {
  const [selectedCourse] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { resources, loading, uploadResource, trackDownload } = useStudyHub(selectedCourse);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadType, setUploadType] = useState('notes');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ FIX: Added proper typing for filteredResources
  const filteredResources = useMemo((): Resource[] => {
    return resources.filter((res: Resource) => {
      const queryMatch = res.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         res.course_code?.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = activeType === 'all' || res.resource_type === activeType;
      return queryMatch && typeMatch;
    });
  }, [resources, searchQuery, activeType]);

  // ✅ FIX: Added download handler with analytics tracking
  const handleDownload = async (id: string, fileUrl: string) => {
    try {
      if (trackDownload) {
        await trackDownload(id);
      }
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Download tracking failed:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle || !uploadCode) return alert('Fill out all required parameters.');
    
    setIsUploading(true);
    const result = await uploadResource(selectedFile, {
      title: uploadTitle,
      courseCode: uploadCode,
      type: uploadType,
      desc: uploadDesc
    });
    setIsUploading(false);

    if (result.success) {
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadCode('');
      setUploadDesc('');
      setSelectedFile(null);
    } else {
      alert(`Upload Error: ${result.error}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto bg-white dark:bg-black font-sans relative overflow-hidden">
      
      {/* CONTROL CONTAINER */}
      <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 space-y-3 shadow-xs z-10 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Study Hub</h2>
            <p className="text-[11px] font-semibold text-gray-400">Copperbelt University Vault</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <UploadCloud size={13} />
            <span>Share File</span>
          </button>
        </div>

        {/* INPUT LOOKUP */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search course codes (e.g., BIT210, MA110)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white shadow-inner"
          />
        </div>

        {/* RESOURCE SLIDER */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {RESOURCE_TYPES.map(type => {
            const Icon = type.icon;
            const isActive = activeType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Icon size={12} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* REPLICATED CARDS STREAM */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-900 rounded-2xl p-6">
            <BookOpen size={24} className="mx-auto text-gray-300 dark:text-gray-700" />
            <p className="text-xs font-bold text-gray-400 mt-2">No files cataloged yet</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Be the first to upload reference documents for this track.</p>
          </div>
        ) : (
          filteredResources.map((res) => (
            <div 
              key={res.id} 
              className="bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-900 p-4 rounded-xl flex items-start justify-between gap-3 hover:border-gray-300 dark:hover:border-gray-800 transition-all shadow-xs group text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded tracking-wide">
                    {res.course_code}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                    {res.resource_type?.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{res.title}</h4>
                {res.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{res.description}</p>
                )}
                <p className="text-[9px] text-gray-400 font-medium">
                  Added: {new Date(res.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* ✅ FIX: Replaced direct href with onClick handler for download tracking */}
              <button
                onClick={() => handleDownload(res.id, res.file_url)}
                aria-label={`Download ${res.title}`}
                className="p-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all cursor-pointer"
              >
                <Download size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* FULL ACCESSIBLE SLIDE SHEET MODAL ENGINE */}
      {showUploadModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end animate-fadeIn">
          <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-900 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl animate-slideUp">
            
            <div className="flex items-center justify-between text-left">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Share Academic Resource</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Support fellow Copperbelt University classmates.</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowUploadModal(false)}
                aria-label="Close upload modal"
                title="Close upload modal"
                className="p-1.5 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Course Code</label>
                  <input type="text" placeholder="BIT210" value={uploadCode} onChange={e => setUploadCode(e.target.value)} className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white rounded-xl focus:outline-indigo-500" required />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Material Title</label>
                  <input type="text" placeholder="2025 Past Exam Solutions Paper" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white rounded-xl focus:outline-indigo-500" required />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Resource Categorization</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white rounded-xl focus:outline-none">
                  <option value="notes">Lecture Notes PDF / Slides</option>
                  <option value="past_paper">Past Examination Paper</option>
                  <option value="assignment">Assignment Resource Guide</option>
                  <option value="syllabus">Course Syllabus Blueprint</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">File Content Description</label>
                <textarea rows={2} placeholder="Optional contextual summary tips..." value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} className="w-full mt-1 p-2.5 text-xs border border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white rounded-xl focus:outline-none" />
              </div>

              <div className="border-2 border-dashed border-gray-200 dark:border-gray-900 rounded-xl p-5 text-center bg-gray-50/50 dark:bg-gray-950/20 relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                  onChange={handleFileChange}
                  aria-label="Select file to upload"
                  title="Select file to upload"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required
                />
                <UploadCloud size={18} className="mx-auto text-indigo-500 mb-1" />
                <span className="text-xs font-bold block text-gray-700 dark:text-gray-300">
                  {selectedFile ? selectedFile.name : 'Choose file to publish'}
                </span>
                <span className="text-[9px] text-gray-400 block mt-0.5">PDF, DOCX, or Image file sizes up to 25MB</span>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-transform disabled:opacity-50 active:scale-98 shadow-md"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Uploading file payload...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Publish Document Asset</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}