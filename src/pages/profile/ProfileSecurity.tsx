import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ShieldAlert, KeyRound, Loader2, HelpCircle } from 'lucide-react';

export default function ProfileSecurity() {
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordResetRequest = async () => {
    setIsResetting(true);
    try {
      // Pull state emails straight via auth identity layer instances
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No validated active authentication session found.');

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Security token recovery packet dispatched to your mailbox!');
    } catch (err: any) {
      toast.error(err.message || 'Security auth cluster refused trigger.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
          <ShieldAlert size={16} /> Security Configurations
        </h3>
        <p className="text-[11px] text-gray-400 font-medium">Protect your academic identity node and active credentials</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-2">
        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">
          <KeyRound size={13} className="text-gray-500" /> Account Access Control
        </h4>
        <p className="text-[11px] text-gray-500 leading-normal font-medium">
          Triggering an access recovery token dispatches a temporary cryptography link allowing immediate key re-signing access parameters safely.
        </p>
        
        <button
          onClick={handlePasswordResetRequest}
          disabled={isResetting}
          className="mt-1 px-3 py-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50/30 text-gray-700 hover:text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          {isResetting ? <Loader2 size={13} className="animate-spin" /> : null}
          <span>Dispatch Key Reset Token</span>
        </button>
      </div>

      <div className="p-3 bg-indigo-50/40 border border-indigo-100/60 rounded-xl text-[10px] font-medium text-indigo-700/80 flex items-start gap-1.5">
        <HelpCircle size={14} className="shrink-0 mt-0.5" />
        <span>To request verification badges or query database administrative rule flags, reach out to your designated tier moderator node.</span>
      </div>
    </div>
  );
}