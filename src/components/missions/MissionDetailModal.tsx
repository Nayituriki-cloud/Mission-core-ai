import React, { useState } from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  Mission,
  MissionStatus,
  MissionPriority,
  MissionTask,
  MissionNote,
} from '../../types/mission';
import {
  X,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Send,
  Paperclip,
  Printer,
  Download,
  AlertTriangle,
  Shield,
  FileText,
  Boxes,
  Flag,
  Share2,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface MissionDetailModalProps {
  missionId: string | null;
  onClose: () => void;
}

export const MissionDetailModal: React.FC<MissionDetailModalProps> = ({ missionId, onClose }) => {
  const {
    missions,
    users,
    currentUser,
    transitionMissionStatus,
    updateTaskStatus,
    toggleChecklistItem,
    addTask,
    deleteTask,
    addMissionNote,
    addMissionAttachment,
    deleteMission,
    hasPermission,
  } = useMissions();

  const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'resources' | 'notes' | 'attachments' | 'risks'>('tasks');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState<MissionNote['tag']>('Field SITREP');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<MissionPriority>('Medium');
  const [newTaskHours, setNewTaskHours] = useState('4');
  const [newTaskChecklistText, setNewTaskChecklistText] = useState('');

  const mission = missions.find((m) => m.id === missionId);

  if (!mission) return null;

  const leadUser = users.find((u) => u.id === mission.leadId);
  const totalTasks = mission.tasks.length;
  const doneTasks = mission.tasks.filter((t) => t.status === 'Done').length;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusList: MissionStatus[] = ['Planned', 'Active', 'In Progress', 'Completed', 'Archived'];

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addMissionNote(mission.id, newNoteTag, newNoteContent.trim());
    setNewNoteContent('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const checklistItems = newTaskChecklistText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `chk-new-${Date.now()}-${idx}`,
        text,
        done: false,
      }));

    addTask(mission.id, {
      title: newTaskTitle.trim(),
      description: 'Tactical field assignment.',
      assigneeId: newTaskAssignee || currentUser.id,
      status: 'Pending',
      priority: newTaskPriority,
      estimatedHours: parseInt(newTaskHours, 10) || 4,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      checklist: checklistItems,
    });

    setNewTaskTitle('');
    setNewTaskChecklistText('');
    setIsAddingTask(false);
  };

  const handleSimulateAttachment = () => {
    const mockFiles = [
      { name: `Field_Survey_Grid_${mission.code}.pdf`, size: '2.4 MB', type: 'application/pdf' },
      { name: `Drone_Orthophoto_${mission.code}.png`, size: '5.1 MB', type: 'image/png' },
      { name: `Hazmat_Safety_Clearance.pdf`, size: '890 KB', type: 'application/pdf' },
    ];
    const randomDoc = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    addMissionAttachment(mission.id, randomDoc);
  };

  const handlePrintSITREP = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">{mission.code}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">{mission.priority} Priority</span>
              <span aria-hidden="true">·</span>
              <span>{mission.category}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">{mission.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{mission.objective}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => storageService.exportSingleMissionCSV(mission)}
              className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Export SITREP CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrintSITREP}
              className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Print SITREP"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Operational Status Pipeline Bar */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">Lifecycle Stage:</span>
            <div className="flex items-center gap-1">
              {statusList.map((s, idx) => {
                const isCurrent = mission.status === s;
                return (
                  <button
                    key={s}
                    disabled={!hasPermission('edit_mission')}
                    onClick={() => transitionMissionStatus(mission.id, s)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      isCurrent
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {mission.location.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Due: {new Date(mission.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Zero-pill button group) */}
        <div className="px-5 border-b border-slate-800 bg-slate-900 flex items-center gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tasks ({mission.tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'milestones'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Milestones ({mission.milestones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Resources ({mission.requiredResources.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Field Notes & SITREPs ({mission.notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Documents ({mission.attachments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'risks'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Risks & Mitigations ({mission.risks.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  {doneTasks} of {totalTasks} tasks verified complete ({pct}%)
                </div>
                {hasPermission('assign_task') && (
                  <button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Task</span>
                  </button>
                )}
              </div>

              {/* Add Task Form Drawer */}
              {isAddingTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="text-xs font-semibold uppercase font-mono text-cyan-400">
                    New Task Directive
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Deploy portable emergency power generation unit"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Assignee</label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.callsign})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as MissionPriority)}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Estimated Hours</label>
                      <input
                        type="number"
                        min="1"
                        value={newTaskHours}
                        onChange={(e) => setNewTaskHours(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Checklist Steps (one per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Step 1: Check fuel lines&#10;Step 2: Test phase angle&#10;Step 3: Log operational test"
                      value={newTaskChecklistText}
                      onChange={(e) => setNewTaskChecklistText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </form>
              )}

              {/* Task Cards */}
              <div className="space-y-3">
                {mission.tasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  const isDone = task.status === 'Done';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span className={task.priority === 'Critical' ? 'text-rose-400' : 'text-slate-400'}>
                              {task.priority} Priority
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{task.estimatedHours}h est</span>
                            {assignee && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-cyan-400">Assigned: {assignee.callsign}</span>
                              </>
                            )}
                          </div>
                          <div className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {task.title}
                          </div>
                          <p className="text-xs text-slate-400">{task.description}</p>
                        </div>

                        {/* Status switcher */}
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            disabled={!hasPermission('complete_task')}
                            value={task.status}
                            onChange={(e) => updateTaskStatus(mission.id, task.id, e.target.value as any)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Done">Done</option>
                          </select>
                          {hasPermission('edit_mission') && (
                            <button
                              onClick={() => deleteTask(mission.id, task.id)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Checklist */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-900 space-y-1.5">
                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            Checklist Execution ({task.checklist.filter((c) => c.done).length}/{task.checklist.length})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {task.checklist.map((chk) => (
                              <label
                                key={chk.id}
                                className="flex items-center gap-2 text-xs text-slate-300 hover:text-slate-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={chk.done}
                                  onChange={() => toggleChecklistItem(mission.id, task.id, chk.id)}
                                  disabled={!hasPermission('complete_task')}
                                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                                />
                                <span className={chk.done ? 'line-through text-slate-500' : ''}>
                                  {chk.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Strategic phase gates required before operational handover.
              </div>
              <div className="relative border-l-2 border-slate-800 ml-4 pl-4 space-y-4">
                {mission.milestones.map((m, idx) => (
                  <div key={m.id} className="relative">
                    <span
                      className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        m.completed ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                    />
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          Phase {m.order}: {m.title}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          Target: {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Status: {m.completed ? 'VERIFIED COMPLETED' : 'INCOMPLETE'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Logistics requisition and equipment readiness.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mission.requiredResources.map((res) => {
                  const pctAlloc = Math.min(100, Math.round((res.allocated / res.needed) * 100));
                  return (
                    <div key={res.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{res.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{res.category}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                        <span>Allocated: {res.allocated} {res.unit}</span>
                        <span>Needed: {res.needed} {res.unit}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pctAlloc >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pctAlloc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: NOTES & SITREPS */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Post Note Form */}
              {hasPermission('complete_task') && (
                <form onSubmit={handlePostNote} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">
                      Broadcast Operational SITREP
                    </span>
                    <select
                      value={newNoteTag}
                      onChange={(e) => setNewNoteTag(e.target.value as any)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                    >
                      <option value="Field SITREP">Field SITREP</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Command Directive">Command Directive</option>
                      <option value="Safety">Safety</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter factual tactical update, coordinate status, or logistics bottleneck..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Update</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Feed of Notes */}
              <div className="space-y-2.5">
                {mission.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      note.pinned
                        ? 'bg-cyan-950/20 border-cyan-800/80 shadow-sm'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-semibold">{note.userName}</span>
                        <span className="text-cyan-400">({note.userRole})</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400 font-medium">{note.tag}</span>
                      </div>
                      <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Mission-critical flight maps, surveys, and technical drawings.
                </span>
                <button
                  onClick={handleSimulateAttachment}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-slate-950 border border-slate-800 text-cyan-400 hover:bg-slate-800"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach Document</span>
                </button>
              </div>

              <div className="space-y-2">
                {mission.attachments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    No documents attached yet.
                  </div>
                ) : (
                  mission.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-semibold text-slate-200">{att.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {att.size} · Uploaded by {att.uploaderName}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulated document preview for: ${att.name}`)}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-mono"
                      >
                        Preview
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: RISKS */}
          {activeTab === 'risks' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Threat identification matrix and pre-planned mitigations.
              </div>
              <div className="space-y-2.5">
                {mission.risks.map((risk) => (
                  <div key={risk.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Threat: {risk.description}
                      </span>
                      <span className="text-[11px] font-mono text-rose-400">{risk.impact} Impact</span>
                    </div>
                    <div className="text-slate-300 text-[11px] pl-5 border-l border-cyan-800/80 mt-1">
                      <span className="text-cyan-400 font-mono">Mitigation: </span>
                      {risk.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Danger Zone (Delete if Admin) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div>
            {hasPermission('delete_mission') && (
              <button
                onClick={() => {
                  if (confirm(`Permanently archive mission ${mission.code}?`)) {
                    deleteMission(mission.id);
                    onClose();
                  }
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive / Purge Mission</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
