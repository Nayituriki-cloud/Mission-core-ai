import React, { useState, useMemo } from 'react';
import { useMissions } from '../../context/MissionContext';
import { MissionTask, MissionPriority } from '../../types/mission';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  User as UserIcon,
  Trash2,
} from 'lucide-react';

interface TasksViewProps {
  onSelectMissionById: (missionId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onSelectMissionById }) => {
  const { missions, users, currentUser, updateTaskStatus, toggleChecklistItem, deleteTask, hasPermission } =
    useMissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Flatten all tasks with mission metadata attached
  const allTasksWithMeta = useMemo(() => {
    return missions.flatMap((m) =>
      m.tasks.map((t) => ({
        ...t,
        missionCode: m.code,
        missionTitle: m.title,
        missionStatus: m.status,
      }))
    );
  }, [missions]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return allTasksWithMeta.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.missionCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
      const matchesAssignee = selectedAssignee === 'all' || t.assigneeId === selectedAssignee;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [allTasksWithMeta, searchQuery, selectedStatus, selectedPriority, selectedAssignee]);

  const taskStatuses: MissionTask['status'][] = ['Pending', 'In Progress', 'Blocked', 'Done'];

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

  const getStatusColor = (s: MissionTask['status']) => {
    switch (s) {
      case 'Done':
        return 'text-emerald-400';
      case 'In Progress':
        return 'text-cyan-400';
      case 'Blocked':
        return 'text-rose-400';
      case 'Pending':
        return 'text-amber-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Task Execution Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredTasks.length} operational directives across all missions.
          </p>
        </div>

        {/* Quick Filter: My Assigned Tasks */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedAssignee(selectedAssignee === currentUser.id ? 'all' : currentUser.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
              selectedAssignee === currentUser.id
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-semibold'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {selectedAssignee === currentUser.id ? 'Showing My Tasks' : 'Filter: Assigned to Me'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search task directive or mission code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono"
          >
            <option value="all">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assignee */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
          >
            <option value="all">Assignee: All</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.callsign})
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'kanban' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {taskStatuses.map((status) => {
            const tasksInCol = filteredTasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="bg-slate-900/50 rounded-lg border border-slate-800 p-3 flex flex-col min-h-[480px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3 text-xs font-mono">
                  <span className={`font-semibold uppercase tracking-wider ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {tasksInCol.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                  {tasksInCol.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600 font-mono">
                      No tasks in this lane.
                    </div>
                  ) : (
                    tasksInCol.map((task) => {
                      const assignee = users.find((u) => u.id === task.assigneeId);
                      const isDone = task.status === 'Done';

                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-800/60 transition-all shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <button
                              onClick={() => onSelectMissionById(task.missionId)}
                              className="text-cyan-400 font-semibold hover:underline"
                            >
                              {task.missionCode}
                            </button>
                            <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                          </div>

                          <h4 className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                            {task.title}
                          </h4>

                          <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                          {/* Checklist preview */}
                          {task.checklist && task.checklist.length > 0 && (
                            <div className="pt-2 border-t border-slate-900 space-y-1">
                              {task.checklist.slice(0, 3).map((chk) => (
                                <label
                                  key={chk.id}
                                  className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={chk.done}
                                    onChange={() => toggleChecklistItem(task.missionId, task.id, chk.id)}
                                    disabled={!hasPermission('complete_task')}
                                    className="w-3 h-3 rounded bg-slate-900 border-slate-700 text-cyan-500"
                                  />
                                  <span className={chk.done ? 'line-through text-slate-600' : ''}>
                                    {chk.text}
                                  </span>
                                </label>
                              ))}
                              {task.checklist.length > 3 && (
                                <div className="text-[10px] font-mono text-slate-500">
                                  +{task.checklist.length - 3} more steps
                                </div>
                              )}
                            </div>
                          )}

                          {/* Footer with Assignee & Status */}
                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>{assignee?.callsign || 'Unassigned'}</span>
                            <select
                              value={task.status}
                              disabled={!hasPermission('complete_task')}
                              onChange={(e) => updateTaskStatus(task.missionId, task.id, e.target.value as any)}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-200"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Done">Done</option>
                            </select>
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
      ) : (
        /* List View */
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono border border-slate-800 rounded-lg">
              No tasks found.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              const isDone = task.status === 'Done';

              return (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                      <button
                        onClick={() => onSelectMissionById(task.missionId)}
                        className="text-cyan-400 font-semibold hover:underline"
                      >
                        {task.missionCode}
                      </button>
                      <span aria-hidden="true">·</span>
                      <span className={getPriorityColor(task.priority)}>{task.priority} Priority</span>
                      <span aria-hidden="true">·</span>
                      <span>{task.estimatedHours}h est</span>
                    </div>

                    <div className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {task.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {assignee?.callsign || 'Unassigned'}
                    </span>

                    <select
                      value={task.status}
                      disabled={!hasPermission('complete_task')}
                      onChange={(e) => updateTaskStatus(task.missionId, task.id, e.target.value as any)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Done">Done</option>
                    </select>

                    {hasPermission('edit_mission') && (
                      <button
                        onClick={() => deleteTask(task.missionId, task.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
