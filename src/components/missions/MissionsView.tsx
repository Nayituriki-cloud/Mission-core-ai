import React, { useState, useMemo } from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  Search,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Mission, MissionPriority, MissionStatus, MissionCategory } from '../../types/mission';
import { storageService } from '../../services/storageService';

interface MissionsViewProps {
  onSelectMission: (mission: Mission) => void;
  onOpenCreateMission: () => void;
  onOpenAiPlanner: () => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  onSelectMission,
  onOpenCreateMission,
  onOpenAiPlanner,
}) => {
  const { missions, users, transitionMissionStatus, hasPermission } = useMissions();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Filtered missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || m.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [missions, searchQuery, selectedStatus, selectedPriority, selectedCategory]);

  const kanbanStatuses: MissionStatus[] = ['Planned', 'Active', 'In Progress', 'Completed', 'Archived'];

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

  const getStatusColor = (s: MissionStatus) => {
    switch (s) {
      case 'Active':
      case 'In Progress':
        return 'text-cyan-400';
      case 'Completed':
        return 'text-emerald-400';
      case 'Planned':
        return 'text-amber-400';
      case 'Archived':
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Missions & Operations Roster
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredMissions.length} operations matching operational filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV button */}
          <button
            onClick={() => storageService.exportMissionsToCSV(missions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Download full operational roster as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* AI Mission Planner shortcut */}
          <button
            onClick={onOpenAiPlanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Planner</span>
          </button>

          {/* New Mission */}
          {hasPermission('create_mission') && (
            <button
              onClick={onOpenCreateMission}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search code, title, objective, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">Status: All</option>
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Priority selector */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Views */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {filteredMissions.length === 0 ? (
            <div className="p-12 text-center border border-slate-800 rounded-lg bg-slate-900/30">
              <p className="text-sm text-slate-400">No missions match the selected query and filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-cyan-400 hover:underline font-mono"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredMissions.map((m) => {
              const totalTasks = m.tasks.length;
              const doneTasks = m.tasks.filter((t) => t.status === 'Done').length;
              const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
              const lead = users.find((u) => u.id === m.leadId);

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMission(m)}
                  className="p-4 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="text-cyan-400 font-semibold">{m.code}</span>
                      <span aria-hidden="true">·</span>
                      <span className={getPriorityColor(m.priority)}>{m.priority} Priority</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">{m.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={getStatusColor(m.status)}>{m.status}</span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                      {m.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                      {m.objective}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {m.location.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Deadline: {new Date(m.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {lead && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Lead: {lead.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right side: Progress & Status controls */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                    <div className="text-left md:text-right">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">
                        {doneTasks} of {totalTasks} Tasks ({pct}%)
                      </div>
                      <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => {
            const statusMissions = filteredMissions.filter((m) => m.status === status);
            return (
              <div
                key={status}
                className="bg-slate-900/50 rounded-lg border border-slate-800/80 p-3 flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3 text-xs font-mono">
                  <span className={`font-semibold uppercase tracking-wider ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {statusMissions.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                  {statusMissions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600 font-mono">
                      No missions in this stage.
                    </div>
                  ) : (
                    statusMissions.map((m) => {
                      const totalTasks = m.tasks.length;
                      const doneTasks = m.tasks.filter((t) => t.status === 'Done').length;
                      const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                      return (
                        <div
                          key={m.id}
                          onClick={() => onSelectMission(m)}
                          className="p-3 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-800/60 transition-all cursor-pointer group shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-cyan-400 font-semibold">{m.code}</span>
                            <span className={getPriorityColor(m.priority)}>{m.priority}</span>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2">
                            {m.title}
                          </h4>

                          <div className="text-[11px] font-mono text-slate-500 truncate">
                            {m.location.name}
                          </div>

                          {/* Progress */}
                          <div className="pt-1.5 border-t border-slate-900 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                            <span>Tasks: {doneTasks}/{totalTasks}</span>
                            <span>{pct}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
