import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex-1 bg-[#4169E1] overflow-hidden flex flex-col items-center justify-center min-h-screen p-4 space-y-16">
      {/* Header / Logo */}
      <div className="flex flex-col items-center space-y-8 text-center z-10">
        <img src="/ufs_logo.png" alt="UFS Logo" className="w-[60vw] max-w-[350px] object-contain" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md max-w-4xl leading-tight">
          LABORATÓRIO VIRTUAL DE FÍSICA
        </h1>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <Link 
          to="/simulations" 
          className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-3xl tracking-wider text-slate-900 bg-[#00E676] border-4 border-slate-900 rounded-2xl transition-all hover:bg-[#00c853] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#0f172a] shadow-[6px_6px_0px_#0f172a] animate-pulse-shake"
        >
          <Play className="w-10 h-10 mr-4 fill-slate-900" />
          INICIAR
        </Link>
      </div>
    </div>
  );
}
