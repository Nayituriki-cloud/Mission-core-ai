import React, { useState } from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  Sliders,
  Shield,
  ShieldAlert,
  Wifi,
  WifiOff,
  RotateCcw,
  Trash2,
  Lock,
  CheckCircle2,
  Info,
  AlertTriangle,
  Server,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    auditLogs,
    clearAuditLogs,
    resetDatabase,
    offlineMode,
    setOfflineMode,
    pendingSyncCount,
    triggerManualSync,
    isSyncing,
    currentUser,
    hasPermission,
  } = useMissions();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'audit' | 'rbac' | 'system'>('audit');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Operational Integrity & Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            System Settings & Security Audit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable security event logs, RBAC matrix, and offline cache synchronization.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono">
          <button
            onClick={() => setActiveSettingsTab('audit')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSettingsTab === 'audit' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveSettingsTab('rbac')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSettingsTab === 'rbac' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            RBAC Matrix
          </button>
          <button
            onClick={() => setActiveSettingsTab('system')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSettingsTab === 'system' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            System Diagnostics
          </button>
        </div>
      </div>

      {/* Tab: Audit Log */}
      {activeSettingsTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              Displaying all security transitions, status upgrades, and task assignments.
            </div>
            {hasPermission('admin_override') && (
              <button
                onClick={clearAuditLogs}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Audit Trail</span>
              </button>
            )}
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Security Action</th>
                    <th className="py-2.5 px-3">Operational Details</th>
                    <th className="py-2.5 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Audit trail empty.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-400 font-medium whitespace-nowrap">
                          {log.userName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-bold whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans max-w-md">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                              log.severity === 'alert'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : log.severity === 'warning'
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: RBAC Matrix */}
      {activeSettingsTab === 'rbac' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Role-Based Access Control (RBAC) Specification
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                MissionCore AI enforces strict cryptographic role boundaries across four permission tiers:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono text-sm">Admin</span>
                  <Shield className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-slate-300">
                  Full command authorization: create, edit, archive, or delete missions; modify operator roles; purge audit records; override all field locks.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 font-mono text-sm">Manager</span>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-slate-300">
                  Mission planning and tactical control: initialize missions, run AI planners, advance status pipelines, assign tasks to operators, allocate resources.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 font-mono text-sm">Team Member</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-slate-300">
                  Field execution: complete assigned tasks and check off steps, transmit field SITREPs and operational notes, upload document attachments.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 font-mono text-sm">Viewer</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-slate-300">
                  Read-only oversight: monitor live dashboards, inspect tactical field maps, review schedules, and export printable SITREP documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: System Diagnostics & Offline Cache */}
      {activeSettingsTab === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Offline Cache & Telemetry */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Offline Field Mode & Cache
                </h3>
                {offlineMode ? (
                  <WifiOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <p className="text-slate-300 leading-relaxed">
                When disconnected from the network or during remote field operations, MissionCore AI buffers all mission edits, checklist updates, and notes locally in encrypted device storage.
              </p>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Connection Mode:</span>
                  <span className={offlineMode ? 'text-amber-400' : 'text-emerald-400'}>
                    {offlineMode ? 'LOCAL OFFLINE BUFFER' : 'HQ LIVE SYNCHRONIZED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pending Changes:</span>
                  <span className="text-cyan-400">{pendingSyncCount} items buffered</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setOfflineMode(!offlineMode)}
                  className="px-3 py-1.5 rounded font-mono text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {offlineMode ? 'Disable Offline Mode' : 'Simulate Offline Disconnection'}
                </button>
                {pendingSyncCount > 0 && (
                  <button
                    onClick={triggerManualSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded font-mono text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                  >
                    Sync Buffer Now
                  </button>
                )}
              </div>
            </div>

            {/* Storage Reset & Factory Reset */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Database & System Reset
                </h3>
                <RotateCcw className="w-4 h-4 text-slate-400" />
              </div>

              <p className="text-slate-300 leading-relaxed">
                Restore the database to initial factory demo seed state. This will refresh sample humanitarian, infrastructure, and crisis response missions.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => {
                    if (confirm('Reset all mission and operator data to initial demo seed?')) {
                      resetDatabase();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Factory Demo Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
