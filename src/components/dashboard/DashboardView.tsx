import React from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Radio,
  FileText,
  Activity,
} from 'lucide-react';
import { Mission, MissionPriority } from '../../types/mission';

interface DashboardViewProps {
  onSelectMission: (mission: Mission) => void;
  onNavigateTab: (tab: any) => void;
  onOpenCreateMission: () => void;
  onOpenAiPlanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectMission,
  onNavigateTab,
  onOpenCreateMission,
  onOpenAiPlanner,
}) => {
  const { missions, users, currentUser, hasPermission } = useMissions();

  // Metrics
  const totalMissions = missions.length;
  const activeMissions = missions.filter((m) => m.status === 'Active' || m.status === 'In Progress');
  const completedMissions = missions.filter((m) => m.status === 'Completed');
  const criticalMissions = missions.filter((m) => m.priority === 'Critical' && m.status !== 'Completed' && m.status !== 'Archived');

  const allTasks = missions.flatMap((m) => m.tasks);
  const doneTasks = allTasks.filter((t) => t.status === 'Done');
  const taskCompletionRate = allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;

  // Upcoming deadlines (next 7 days)
  const now = new Date();
  const upcomingMissions = [...missions]
    .filter((m) => m.status !== 'Completed' && m.status !== 'Archived')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Recent notes/SITREPs across all missions
  const recentSitreps = missions
    .flatMap((m) => m.notes.map((n) => ({ ...n, missionCode: m.code, missionTitle: m.title })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getPriorityColor = (p: MissionPriority) => {
    switch (p) {
      case 'Critical':
        return 'text-rose-400';
      case 'High':
        return 'text-amber-400';
      case 'Medium':
        return 'text-cyan-400';
      case 'Low':
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Mission Management System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, {currentUser.name} ({currentUser.callsign}). All communication and telemetry corridors are active.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAiPlanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Mission Planner</span>
          </button>

          {hasPermission('create_mission') && (
            <button
              onClick={onOpenCreateMission}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40 transition-all"
            >
              <span>Initialize Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Deployments</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              {activeMissions.length}
            </span>
            <span className="text-xs text-slate-400">of {totalMissions} total</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Operations on schedule</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Critical Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-300">
              {criticalMissions.length}
            </span>
            <span className="text-xs text-slate-400">requiring oversight</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {criticalMissions.length > 0 ? 'Active contingency rules apply' : 'No critical alerts'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              {taskCompletionRate}%
            </span>
            <span className="text-xs text-slate-400">{doneTasks.length}/{allTasks.length} tasks</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Completed Missions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
              {completedMissions.length}
            </span>
            <span className="text-xs text-slate-400">archived safely</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-mono">
            100% mission safety compliance
          </div>
        </div>
      </div>

      {/* Main Command Split: Active Missions List & Right Intel Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Operations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Active & In-Progress Operations
              </h2>
              <span className="text-xs text-slate-400 font-mono">({activeMissions.length})</span>
            </div>
            <button
              onClick={() => onNavigateTab('missions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>View all missions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeMissions.length === 0 ? (
              <div className="p-8 rounded-lg bg-slate-900/50 border border-slate-800 text-center">
                <p className="text-sm text-slate-400">No active operations currently running.</p>
                <button
                  onClick={onOpenAiPlanner}
                  className="mt-3 px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 text-white"
                >
                  Generate Plan with AI
                </button>
              </div>
            ) : (
              activeMissions.map((mission) => {
                const totalTasks = mission.tasks.length;
                const completedTasks = mission.tasks.filter((t) => t.status === 'Done').length;
                const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                const lead = users.find((u) => u.id === mission.leadId);

                return (
                  <div
                    key={mission.id}
                    onClick={() => onSelectMission(mission)}
                    className="p-4 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-800/60 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        {/* Unboxed clean metadata (Zero-pill discipline) */}
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                          <span className="text-cyan-400 font-semibold">{mission.code}</span>
                          <span aria-hidden="true">·</span>
                          <span className={getPriorityColor(mission.priority)}>{mission.priority} Priority</span>
                          <span aria-hidden="true">·</span>
                          <span>{mission.category}</span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {mission.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                          {mission.objective}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 block">
                          {mission.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Due {new Date(mission.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Footer */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-28 sm:w-40 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-300">{pct}% ({completedTasks}/{totalTasks} tasks)</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{mission.location.name}</span>
                        {lead && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Lead: {lead.callsign}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick AI Planner Banner Card */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Operational Architect</span>
              </div>
              <p className="text-xs text-slate-300">
                Need to spin up a disaster relief corridor, infrastructure audit, or search perimeter? Describe the goal in plain English.
              </p>
            </div>
            <button
              onClick={onOpenAiPlanner}
              className="px-4 py-2 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 shadow-sm transition-all"
            >
              Draft AI Mission Plan
            </button>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Radar & Field SITREPs */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Radar */}
          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Target Deadlines
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-[11px] text-cyan-400 hover:underline font-mono"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingMissions.map((m) => {
                const diffDays = Math.ceil(
                  (new Date(m.deadline).getTime() - now.getTime()) / (1000 * 3600 * 24)
                );
                const isUrgent = diffDays <= 3;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMission(m)}
                    className="p-2.5 rounded bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-cyan-400">{m.code}</span>
                      <span
                        className={`text-[11px] font-mono ${
                          isUrgent ? 'text-amber-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {diffDays > 0 ? `${diffDays}d remaining` : 'Due today'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 truncate">
                      {m.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Field Notes & SITREPs */}
          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Latest Field SITREPs
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Stream</span>
            </div>

            <div className="space-y-3">
              {recentSitreps.map((s) => (
                <div key={s.id} className="text-xs border-l-2 border-slate-700 pl-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-cyan-400">{s.missionCode} · {s.userName}</span>
                    <span>{new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-slate-300 leading-snug line-clamp-2">
                    {s.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
