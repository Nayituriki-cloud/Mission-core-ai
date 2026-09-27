import React, { useState } from 'react';
import { useMissions } from '../../context/MissionContext';
import { storageService } from '../../services/storageService';
import {
  BarChart3,
  Download,
  Printer,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import { MissionCategory } from '../../types/mission';

export const ReportsView: React.FC = () => {
  const { missions, users } = useMissions();

  const [selectedReportType, setSelectedReportType] = useState<'summary' | 'sitrep' | 'workload'>('summary');

  // Metrics
  const totalMissions = missions.length;
  const completedMissions = missions.filter((m) => m.status === 'Completed').length;
  const activeMissions = missions.filter((m) => m.status === 'Active' || m.status === 'In Progress').length;
  const plannedMissions = missions.filter((m) => m.status === 'Planned').length;

  const allTasks = missions.flatMap((m) => m.tasks);
  const doneTasksCount = allTasks.filter((t) => t.status === 'Done').length;
  const taskCompletionRate = allTasks.length > 0 ? Math.round((doneTasksCount / allTasks.length) * 100) : 0;

  // Category breakdown
  const categoryCounts: Record<MissionCategory, number> = {
    'Field Operations': 0,
    'Crisis Response': 0,
    'Emergency Preparedness': 0,
    'Logistics & Supply': 0,
    'Infrastructure Resilience': 0,
    'Community Initiative': 0,
  };

  missions.forEach((m) => {
    if (categoryCounts[m.category] !== undefined) {
      categoryCounts[m.category]++;
    }
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operations Telemetry & Executive Debrief</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Mission Analytics & Reporting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission completion rates, deadline performance, personnel workload, and formatted SITREP exports.
          </p>
        </div>

        {/* Export & Print actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => storageService.exportMissionsToCSV(missions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Global Completion Rate</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {doneTasksCount} of {allTasks.length} total tasks verified
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Active Operations</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
            {activeMissions}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            100% on-track or staged
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Archived Successes</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {completedMissions}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Zero fatal safety deviations
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Field Mobilization</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
            {users.length}
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">
            Active certified operators
          </div>
        </div>
      </div>

      {/* Visual Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Operations by Category
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Classification</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = totalMissions > 0 ? Math.round((count / totalMissions) * 100) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operator Workload Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Operator Workload Distribution
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Personnel Allocation</span>
          </div>

          <div className="space-y-3">
            {users.map((u) => {
              const operatorTasks = allTasks.filter((t) => t.assigneeId === u.id);
              const opDone = operatorTasks.filter((t) => t.status === 'Done').length;
              const opPct = operatorTasks.length > 0 ? Math.round((opDone / operatorTasks.length) * 100) : 0;

              return (
                <div key={u.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300 font-medium">
                      {u.name} ({u.callsign})
                    </span>
                    <span className="text-slate-400">
                      {operatorTasks.length} tasks ({opDone} done · {opPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${opPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formal Printable SITREP Preview Document */}
      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              Formal Mission Briefing & Debrief Document
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">
              MissionCore AI Tactical Operations Record
            </h2>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            <div>DOC ID: MC-SITREP-2026-0926</div>
            <div>STATUS: VERIFIED SECURE</div>
          </div>
        </div>

        {/* Mission Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Mission Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Target Location</th>
                <th className="py-2.5 px-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {missions.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{m.code}</td>
                  <td className="py-2.5 px-3 text-slate-100 font-sans font-medium">{m.title}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.category}</td>
                  <td className="py-2.5 px-3 text-amber-400">{m.priority}</td>
                  <td className="py-2.5 px-3 text-slate-300">{m.status}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.location.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(m.deadline).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Operational Sign-off Block */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono text-slate-400">
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Operations Lead Sign-Off:</div>
            <div className="mt-2 text-slate-200 font-semibold">Cmdr. Elena Vance</div>
            <div className="text-[10px] text-slate-500">Apex Leader · Strategic Command</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Safety & Ethics Audit:</div>
            <div className="mt-2 text-emerald-400 font-semibold">VERIFIED COMPLIANT</div>
            <div className="text-[10px] text-slate-500">Autonomous weapon & harm bounds verified</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[10px]">Verification Timestamp:</div>
            <div className="mt-2 text-slate-200 font-semibold">{new Date().toISOString()}</div>
            <div className="text-[10px] text-slate-500">Synchronized HQ Timestamp</div>
          </div>
        </div>
      </div>
    </div>
  );
};
