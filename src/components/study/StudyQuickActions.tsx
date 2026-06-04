import { useAuthStore } from '../../store/authStore';
import { Upload, FolderPlus, Award, ShieldCheck } from 'lucide-react';

export default function StudyQuickActions() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'professor';

  // Dispatch events over the window node to pop the centralized vaults modals
  const triggerModal = (modalType: 'school' | 'document' | 'paper') => {
    const event = new CustomEvent('open-study-modal', { detail: modalType });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-sm font-semibold">Quick Sandbox Control Panel</h3>
        <p className="text-xs text-gray-400">Initialize instances or catalog asset schemas instantly</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {isAdmin ? (
          <>
            <button 
              onClick={() => triggerModal('school')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FolderPlus size={14} /> <span>Create Folder</span>
            </button>
            <button 
              onClick={() => triggerModal('document')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-xs"
            >
              <Upload size={14} /> <span>Upload Resource</span>
            </button>
            <button 
              onClick={() => triggerModal('paper')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-xs"
            >
              <Award size={14} /> <span>Catalog Exam</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl border border-indigo-100 dark:border-indigo-900/50 w-full sm:w-auto justify-center">
            <ShieldCheck size={15} />
            <span>Verified Institutional Student Access Authorized</span>
          </div>
        )}
      </div>
    </div>
  );
}