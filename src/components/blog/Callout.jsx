import React from 'react';
import { ShieldCheck, Layers, AlertCircle, Info, Sparkles } from 'lucide-react';

/**
 * Renderiza callouts/admoniciones técnicos replicando la estética de las tarjetas de proyectos
 */
export default function Callout({ type = 'note', title, children }) {
  let borderColor = 'border-[#2a2a2a]';
  let badgeColor = 'bg-[#1e1e1e] text-[#A0A0A0] border-[#333333]';
  let Icon = Info;
  let defaultTitle = '// TECHNICAL NOTE';

  const lowerType = type.toLowerCase();

  if (lowerType.includes('security') || lowerType.includes('owasp')) {
    borderColor = 'border-emerald-500/30';
    badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40';
    Icon = ShieldCheck;
    defaultTitle = '// SECURITY BASELINE';
  } else if (lowerType.includes('architecture') || lowerType.includes('impact')) {
    borderColor = 'border-cyan-500/30';
    badgeColor = 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40';
    Icon = Layers;
    defaultTitle = '// ARCHITECTURE & IMPACT';
  } else if (lowerType.includes('warning') || lowerType.includes('alert')) {
    borderColor = 'border-amber-500/30';
    badgeColor = 'bg-amber-950/40 text-amber-300 border-amber-500/40';
    Icon = AlertCircle;
    defaultTitle = '// SYSTEM ADVISORY';
  }

  return (
    <aside className={`my-6 rounded-3xl bg-[#141414] border ${borderColor} p-5 sm:p-6 shadow-lg transition-colors duration-300`}>
      {/* Callout Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border ${badgeColor}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{title || defaultTitle}</span>
        </span>
      </div>

      {/* Callout Body */}
      <div className="text-sm sm:text-base text-[#CFCFCF] leading-relaxed font-sans space-y-2">
        {children}
      </div>
    </aside>
  );
}
