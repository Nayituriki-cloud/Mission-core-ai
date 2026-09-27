import React from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Sliders,
  ShieldCheck,
  CircleDot,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'missions'
  | 'tasks'
  | 'ai-planner'
  | 'maps'
  | 'calendar'
  | 'team'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { missions, offlineMode } = useMissions();

  const activeMissionsCount = missions.filter((m) => m.status === 'Active' || m.status === 'In Progress').length;
  const allPendingTasksCount = missions
    .flatMap((m) => m.tasks)
    .filter((t) => t.status === 'In Progress' || t.status === 'Pending').length;

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    special?: boolean;
  }> = [
    { id: 'dashboard', label: 'Command Deck', icon: LayoutDashboard },
    { id: 'missions', label: 'Missions', icon: Target, badge: activeMissionsCount },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: allPendingTasksCount },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles, special: true },
    { id: 'maps', label: 'Field Map', icon: MapPin },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'team', label: 'Operators', icon: Users },
    { id: 'reports', label: 'Reports & SITREP', icon: BarChart3 },
    { id: 'settings', label: 'Audit & System', icon: Sliders },
  ];

  return (
    <aside className="w-56 lg:w-60 border-r border-slate-800/80 bg-slate-950/70 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
          Operations Core
        </div>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-cyan-400'
                        : item.special
                        ? 'text-cyan-400/80 group-hover:text-cyan-300'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        : 'text-slate-400 bg-slate-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operational Readiness Telemetry Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-xs">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <CircleDot className={`w-3 h-3 ${offlineMode ? 'text-amber-400' : 'text-emerald-400'}`} />
            {offlineMode ? 'Local Cache' : 'HQ Uplink Active'}
          </span>
          <span className="text-slate-400">v2.4</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Active Units:</span>
            <span className="text-slate-300 font-mono font-medium">3 Deployed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Relief Ops:</span>
            <span className="text-cyan-400 font-mono font-medium">{activeMissionsCount} Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
