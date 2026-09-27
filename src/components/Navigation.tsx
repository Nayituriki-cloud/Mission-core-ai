import React from 'react';
import {
  Crosshair,
  Users,
  Truck,
  Package,
  Calendar,
  FileText,
  BarChart3,
  Bot,
  MapPin
} from 'lucide-react';

export type TabKey =
  | 'EXERCISES'
  | 'PERSONNEL'
  | 'LOGISTICS'
  | 'EQUIPMENT'
  | 'TRAINING'
  | 'REPORTS'
  | 'ANALYTICS'
  | 'AI_ASSISTANT'
  | 'SIM_MAP';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'EXERCISES', label: 'ACTIVE EXERCISES', icon: Crosshair },
    { key: 'PERSONNEL', label: 'PERSONNEL', icon: Users },
    { key: 'LOGISTICS', label: 'LOGISTICS', icon: Truck },
    { key: 'EQUIPMENT', label: 'EQUIPMENT', icon: Package },
    { key: 'TRAINING', label: 'TRAINING', icon: Calendar },
    { key: 'REPORTS', label: 'REPORTS', icon: FileText },
    { key: 'ANALYTICS', label: 'ANALYTICS', icon: BarChart3 },
    { key: 'AI_ASSISTANT', label: 'AI ASSISTANT', icon: Bot },
    { key: 'SIM_MAP', label: 'SIMULATION MAP', icon: MapPin },
  ];

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800/80 sticky top-16 z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.key === 'AI_ASSISTANT' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
