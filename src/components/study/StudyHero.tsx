import { HardDrive } from 'lucide-react';

export default function StudyHero() {
  return (
    <div className="relative overflow-hidden bg-radial from-indigo-600 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-indigo-500/20">
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xs">
            <HardDrive size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pulse Drive Hub</h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
              Secure structural node for institutional resource indexing & academic archives
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}