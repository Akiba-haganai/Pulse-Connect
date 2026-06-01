import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  Upload, Search, Download, FileText, School as SchoolIcon, 
  X, Loader2, FolderPlus, ShieldCheck, HardDrive, 
  Star, Award, TrendingUp, Calendar, Layers, Eye,
} from 'lucide-react';

interface School { id: string; name: string; }
interface Document {
  id: string; title: string; file_url: string; school_id: string; created_at: string;
  download_count: number; is_favorite?: boolean; schools?: { name: string };
}
interface PastPaper {
  id: string; title: string; course_code: string; year: number; semester: number;
  file_url: string; school_id: string; created_at: string; download_count: number;
  is_favorite?: boolean; schools?: { name: string };
}

type MetricSort = 'all' | 'most_downloaded' | 'trending';

export default function StudyPage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'documents' | 'past_papers'>('documents');
  const [schools, setSchools] = useState<School[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [_favorites, setFavorites] = useState<{document_id?: string, past_paper_id?: string}[]>([]);
  
  // Filtering & Metrics Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [metricFilter, setMetricFilter] = useState<MetricSort>('all');
  
  const [isLoading, setIsLoading] = useState(true);
  // 🛠️ FIXING MISSING STATE: Added the missing state manager used for form loading states
  const [isUploading, setIsUploading] = useState(false);
  
  // Modals & Forms States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  
  // Preview Layer Architecture States
  const [previewingFile, setPreviewingFile] = useState<{
    id: string;
    title: string;
    file_url: string;
    type: 'document' | 'past_paper';
  } | null>(null);
  
  // Document Upload State Form Fields
  const [uploadSchoolId, setUploadSchoolId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Past Paper State Form Fields
  const [paperTitle, setPaperTitle] = useState('');
  const [paperCourseCode, setPaperCourseCode] = useState('');
  const [paperYear, setPaperYear] = useState(new Date().getFullYear());
  const [paperSemester, setPaperSemester] = useState(1);
  const [newSchoolName, setNewSchoolName] = useState('');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'professor';

  // 🛠️ LOGIC FIX: Cleaned dependency array parameters to avoid recursive connection rebuilding loop
  useEffect(() => {
    loadData();
    const channel = supabase.channel('mesh-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'past_papers' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'document_favorites' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  async function loadData() {
    try {
      const [schoolsRes, favsRes] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        profile?.id
          ? supabase
              .from('document_favorites')
              .select('document_id, past_paper_id')
              .eq('user_id', profile.id)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (schoolsRes.error) throw schoolsRes.error;

      setSchools(schoolsRes.data || []);
      const currentFavs = favsRes.data || [];
      setFavorites(currentFavs);

      // 🛠️ METRIC ORDER FILTER PLUMBING: Build order maps directly into queries
      let docsQuery = supabase.from('documents').select('*, schools(name)');
      let papersQuery = supabase.from('past_papers').select('*, schools(name)');

      if (metricFilter === 'most_downloaded' || metricFilter === 'trending') {
        docsQuery = docsQuery.order('download_count', { ascending: false });
        papersQuery = papersQuery.order('download_count', { ascending: false });
      } else {
        docsQuery = docsQuery.order('created_at', { ascending: false });
        papersQuery = papersQuery.order('created_at', { ascending: false });
      }

      const [docsRes, papersRes] = await Promise.all([docsQuery, papersQuery]);

      // 🛠️ DATA UNION REPAIR: Map database favorites directly to the layout items array structure
      const processedDocs = (docsRes.data || []).map((doc: any) => ({
        ...doc,
        is_favorite: currentFavs.some((f) => f.document_id === doc.id),
      }));

      const processedPapers = (papersRes.data || []).map((paper: any) => ({
        ...paper,
        is_favorite: currentFavs.some((f) => f.past_paper_id === paper.id),
      }));

      setDocuments(processedDocs);
      setPastPapers(processedPapers);
    } catch (e: any) {
      toast.error(e.message || 'Failed loading data');
    } finally {
      setIsLoading(false);
    }
  }

  // Refetch data when a user changes metric views
  useEffect(() => {
    loadData();
  }, [metricFilter]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const getPreviewUrl = (path: string) => {
    const publicUrl = getPublicUrl(path);
    const extension = path.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') return publicUrl;
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
    }
    return publicUrl;
  };

  const toggleFavorite = async (id: string, type: 'document' | 'past_paper', isFav: boolean) => {
    if (!profile?.id) return toast.error('Please log in first');
    try {
      if (isFav) {
        const matchCriteria = type === 'document' ? { document_id: id, user_id: profile.id } : { past_paper_id: id, user_id: profile.id };
        await supabase.from('document_favorites').delete().match(matchCriteria);
        toast.success('Removed from bookmarks');
      } else {
        const payload = type === 'document' ? { document_id: id, user_id: profile.id } : { past_paper_id: id, user_id: profile.id };
        await supabase.from('document_favorites').insert(payload as any);
        toast.success('Added to bookmarks');
      }
      loadData();
    } catch (e: any) {
      toast.error('Favorite status change failed');
    }
  };

  const executeSilentMetricLog = async (id: string, type: 'document' | 'past_paper') => {
    try {
      const targetTable = type === 'document' ? 'documents' : 'past_papers';
      const currentItem = type === 'document' ? documents.find(d => d.id === id) : pastPapers.find(p => p.id === id);
      const currentCount = currentItem?.download_count || 0;

      await supabase.from(targetTable).update({ download_count: currentCount + 1 }).eq('id', id);
      loadData(); 
    } catch (e) {
      console.error('Failed logging analytical tracking updates', e);
    }
  };

  const handleDownloadAction = async (id: string, type: 'document' | 'past_paper', url: string) => {
    try {
      await executeSilentMetricLog(id, type);
      const publicUrl = getPublicUrl(url);
      window.open(publicUrl, '_blank');
    } catch (e) {
      toast.error('Download failed');
    }
  };

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) return;
    try {
      await supabase.from('schools').insert({ name: newSchoolName.trim() });
      toast.success('School instance active');
      setNewSchoolName('');
      setShowSchoolModal(false);
      loadData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadSchoolId || !profile?.id) return;
    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        title: selectedFile.name,
        file_url: fileName,
        school_id: uploadSchoolId,
        user_id: profile.id,
        download_count: 0,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      toast.success('Resource uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadSchoolId('');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // 🛠️ FIXING MISSING CONTROLLER METHOD: Created the missing past paper database handler function
  const handleCreatePastPaper = async () => {
    if (!selectedFile || !uploadSchoolId || !paperTitle.trim() || !paperCourseCode.trim() || !profile?.id) {
      return toast.error('Please fill in all target tracking parameters and add a PDF file');
    }
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_paper_${Math.random().toString(36).substring(2)}.pdf`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('past_papers').insert({
        title: paperTitle.trim(),
        course_code: paperCourseCode.trim().toUpperCase(),
        year: paperYear,
        semester: paperSemester,
        file_url: fileName,
        school_id: uploadSchoolId,
        user_id: profile.id,
        download_count: 0,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      toast.success('Past paper indexed successfully!');
      setShowPaperModal(false);
      setSelectedFile(null);
      setPaperTitle('');
      setPaperCourseCode('');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Indexing failed');
    } finally {
      setIsUploading(false);
    }
  };

  // ⚡ COMPONENT COMPUTED CACHE LAYER: Optimizes UI responsiveness when searching large file indexes
  const filteredDocs = useMemo(() => {
    return documents.filter(d => 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (selectedSchoolId === 'all' || d.school_id === selectedSchoolId)
    );
  }, [documents, searchTerm, selectedSchoolId]);

  const filteredPapers = useMemo(() => {
    return pastPapers.filter(p => 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.course_code.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (selectedSchoolId === 'all' || p.school_id === selectedSchoolId)
    );
  }, [pastPapers, searchTerm, selectedSchoolId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs"><HardDrive size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pulse Drive</h1>
              <p className="text-xs text-gray-500">Resource indexing and analytics infrastructure node</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <>
                <button onClick={() => setShowSchoolModal(true)} className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium rounded-xl hover:bg-gray-50"><FolderPlus size={14} /><span>Add Folder</span></button>
                <button onClick={() => { setActiveTab('documents'); setShowUploadModal(true); }} className="flex items-center gap-1 px-3 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"><Upload size={14} /><span>Upload File</span></button>
                <button onClick={() => { setActiveTab('past_papers'); setShowPaperModal(true); }} className="flex items-center gap-1 px-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl"><Award size={14} /><span>Add Past Paper</span></button>
              </>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 text-xs font-semibold rounded-xl"><ShieldCheck size={14} /><span>Verified Student Access</span></div>
            )}
          </div>
        </div>

        {/* Navigation Core Tabs & Filters Hub */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b dark:border-gray-800 pb-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 max-w-xs">
              <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'documents' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-xs' : 'text-gray-400'}`}><FileText size={14} />Pulse Files</button>
              <button onClick={() => setActiveTab('past_papers')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'past_papers' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-xs' : 'text-gray-400'}`}><Award size={14} />Past Exam Papers</button>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 max-w-md">
              <button onClick={() => setMetricFilter('all')} className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${metricFilter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 shadow-xs' : 'text-gray-400'}`}>All Files</button>
              <button onClick={() => setMetricFilter('most_downloaded')} className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${metricFilter === 'most_downloaded' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-xs' : 'text-gray-400'}`}><Download size={12} />Most Downloaded</button>
              <button onClick={() => setMetricFilter('trending')} className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${metricFilter === 'trending' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow-xs' : 'text-gray-400'}`}><TrendingUp size={12} />Trending</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder={activeTab === 'documents' ? "Search by title..." : "Search by course code or title..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="relative min-w-50">
              <SchoolIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)} className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800 appearance-none cursor-pointer">
                <option value="all">📁 All Folders</option>
                {schools.map(s => <option key={s.id} value={s.id}>🏫 {s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Data Rendition Matrix Canvas */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : (activeTab === 'documents' ? filteredDocs.length : filteredPapers.length) === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
            <FileText className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="font-medium text-gray-500 text-sm">No files found matching the criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* DOCUMENTS GRID BLOCKS */}
            {activeTab === 'documents' && filteredDocs.map((doc) => (
              <div key={doc.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-indigo-600 rounded-xl"><FileText size={20} /></div>
                  <div className="flex items-center gap-1">
                    <button type="button" title={doc.is_favorite ? 'Remove from favorites' : 'Add to favorites'} onClick={() => toggleFavorite(doc.id, 'document', !!doc.is_favorite)} className={`p-1.5 rounded-lg transition-colors ${doc.is_favorite ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-500'}`}><Star size={16} fill={doc.is_favorite ? 'currentColor' : 'none'} /></button>
                    <button type="button" title="Preview file" onClick={() => setPreviewingFile({ id: doc.id, title: doc.title, file_url: doc.file_url, type: 'document' })} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg"><Eye size={16} /></button>
                    <button type="button" title="Download file" onClick={() => handleDownloadAction(doc.id, 'document', doc.file_url)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg"><Download size={16} /></button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md truncate max-w-37.5">{doc.schools?.name}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Download size={10} />{doc.download_count || 0}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setPreviewingFile({ id: doc.id, title: doc.title, file_url: doc.file_url, type: 'document' })}>{doc.title}</h3>
                </div>
              </div>
            ))}

            {/* PAST EXAM PAPER CARD NODES */}
            {activeTab === 'past_papers' && filteredPapers.map((paper) => (
              <div key={paper.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-emerald-600 rounded-xl"><Award size={20} /></div>
                  <div className="flex items-center gap-1">
                    <button type="button" title={paper.is_favorite ? 'Remove from favorites' : 'Add to favorites'} onClick={() => toggleFavorite(paper.id, 'past_paper', !!paper.is_favorite)} className={`p-1.5 rounded-lg transition-colors ${paper.is_favorite ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-500'}`}><Star size={16} fill={paper.is_favorite ? 'currentColor' : 'none'} /></button>
                    <button type="button" title="Preview file" onClick={() => setPreviewingFile({ id: paper.id, title: paper.title, file_url: paper.file_url, type: 'past_paper' })} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg"><Eye size={16} /></button>
                    <button type="button" title="Download file" onClick={() => handleDownloadAction(paper.id, 'past_paper', paper.file_url)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg"><Download size={16} /></button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">{paper.course_code}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Download size={10} />{paper.download_count || 0}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => setPreviewingFile({ id: paper.id, title: paper.title, file_url: paper.file_url, type: 'past_paper' })}>{paper.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2 border-t dark:border-gray-800 pt-2 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {paper.year}</span>
                    <span className="flex items-center gap-1"><Layers size={12} /> Sem {paper.semester}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL ARCHITECTURE VIEWS */}
        {previewingFile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full h-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-lg text-white ${previewingFile.type === 'document' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    {previewingFile.type === 'document' ? <FileText size={18} /> : <Award size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{previewingFile.title}</h2>
                    <p className="text-[11px] text-gray-400">Secure Sandbox Preview Window</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPreviewingFile(null)} aria-label="Close preview" title="Close preview" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-950 p-4">
                <iframe src={getPreviewUrl(previewingFile.file_url)} title="Secure Document Viewport" className="w-full h-full rounded-xl border bg-white shadow-inner" sandbox="allow-scripts allow-same-origin allow-popups" />
              </div>
            </div>
          </div>
        )}

        {/* ADD PAST PAPER MODAL */}
        {showPaperModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full shadow-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
                <h2 className="text-base font-semibold">Archive Past Exam Paper</h2>
                <button type="button" onClick={() => setShowPaperModal(false)} aria-label="Close modal" className="text-gray-400"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <input type="text" placeholder="Paper Descriptive Title" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} className="w-full p-2 border dark:border-gray-800 rounded-lg dark:bg-gray-800" />
                <input type="text" placeholder="Course Code (e.g. COS301)" value={paperCourseCode} onChange={(e) => setPaperCourseCode(e.target.value)} className="w-full p-2 border dark:border-gray-800 rounded-lg dark:bg-gray-800" />
                <label htmlFor="uploadSchoolId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Folder</label>
                <select id="uploadSchoolId" value={uploadSchoolId} onChange={(e) => setUploadSchoolId(e.target.value)} className="w-full p-2 border dark:border-gray-800 rounded-lg dark:bg-gray-800">
                  <option value="">Select Folder...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <label htmlFor="paperYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                <input id="paperYear" type="number" value={paperYear} onChange={(e) => setPaperYear(parseInt(e.target.value) || new Date().getFullYear())} className="w-full p-2 border dark:border-gray-800 rounded-lg dark:bg-gray-800" />
                <label htmlFor="paperSemester" className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                <select id="paperSemester" value={paperSemester} onChange={(e) => setPaperSemester(parseInt(e.target.value))} className="w-full p-2 border dark:border-gray-800 rounded-lg dark:bg-gray-800">
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Trimester 3</option>
                </select>
                <label htmlFor="paperFile" className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Past Paper PDF</label>
                <input id="paperFile" type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs p-1.5 border dark:border-gray-800 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
                <button onClick={() => setShowPaperModal(false)} className="px-3 py-1.5 text-xs text-gray-500">Cancel</button>
                <button onClick={handleCreatePastPaper} disabled={isUploading} className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded-lg flex items-center gap-1">
                  {isUploading && <Loader2 className="animate-spin" size={12} />}
                  <span>Index Paper</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INSTITUTIONAL FOLDER MODAL */}
        {showSchoolModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
                <h2 className="text-base font-semibold">Create Institutional Folder</h2>
                <button type="button" onClick={() => setShowSchoolModal(false)} className="text-gray-400" title="Close"><X size={18} /></button>
              </div>
              <input type="text" placeholder="Folder Name (e.g. School of Business)" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} className="w-full text-sm p-2 border dark:border-gray-800 rounded-xl dark:bg-gray-800" />
              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
                <button type="button" onClick={() => setShowSchoolModal(false)} className="px-3 py-1 text-xs text-gray-400">Cancel</button>
                <button type="button" onClick={handleCreateSchool} className="px-4 py-1 text-xs bg-indigo-600 text-white rounded-lg">Deploy</button>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT UPLOAD MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full shadow-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
                <h2 className="text-base font-semibold">Upload Document Node</h2>
                <button type="button" onClick={() => setShowUploadModal(false)} className="text-gray-400" title="Close"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <label htmlFor="uploadSchoolId" className="sr-only">Choose folder target</label>
                <select id="uploadSchoolId" value={uploadSchoolId} onChange={(e) => setUploadSchoolId(e.target.value)} className="w-full p-2 border dark:border-gray-800 rounded-lg dark:bg-gray-800">
                  <option value="">Choose folder target...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <label htmlFor="documentUpload" className="sr-only">Choose file to upload</label>
                <input id="documentUpload" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs p-1.5 border dark:border-gray-800 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-3 py-1.5 text-xs text-gray-500">Cancel</button>
                <button type="button" onClick={handleUpload} disabled={isUploading} className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg flex items-center gap-1">
                  {isUploading && <Loader2 className="animate-spin" size={12} />}
                  <span>Upload File</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}