import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Compass, Plus, Save, Trash2, FileText } from 'lucide-react';

export default function AdminDirectoryManager() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Core configuration states (Keep the ones you have...)
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState('administration');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('08:00 - 16:30 (Mon-Fri)');
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [services, setServices] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check current auth status on render
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`Login Failed: ${error.message}`);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
    setCoords({ x, y });
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name) return alert('ID and Name are required.');
    setSaving(true);
    // ... Keep your exact handleSaveLocation execution logic from earlier step ...
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 🔒 GATEKEEPER VIEWSTATE: Render login screen if no admin session is verified
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-md space-y-4">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-gray-100">Admin Gate</h3>
            <p className="text-xs text-gray-400 mt-0.5">Authorized accounts only.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-gray-800 dark:border-gray-700" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-gray-800 dark:border-gray-700" required />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors">Verify Credentials</button>
          </form>
        </div>
      </div>
    );
  }

  // 🔑 FULLY DEPLOYED FORM LAYOUT CONTAINER (Displays only when signed in)
  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100 font-sans">
       {/* ... Keep the rest of your original admin panel UI return tree block exactly as is ... */}
    </div>
  );
}