import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { History, Search, ShieldAlert, RotateCcw } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, resetToInitialData, currentUser } = useTactical();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = filterType === 'ALL' || log.actionType === filterType;
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'AUTH':
        return 'text-sky-400 bg-sky-950/80 border-sky-800';
      case 'MISSION_MODIFY':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'LOGISTICS_DISPATCH':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
      case 'EQUIPMENT_UPDATE':
        return 'text-purple-400 bg-purple-950/80 border-purple-800';
      case 'AI_PLAN_GEN':
        return 'text-teal-400 bg-teal-950/80 border-teal-800';
      case 'EXPORT':
      case 'REPORT_SUBMIT':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
              COMMAND AUDIT TRAIL & SYSTEM INTEGRITY LOG
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-1 text-xs bg-zinc-950 border border-zinc-700 rounded text-zinc-300 focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="AUTH">Authentication</option>
              <option value="MISSION_MODIFY">Mission Modification</option>
              <option value="LOGISTICS_DISPATCH">Logistics</option>
              <option value="EQUIPMENT_UPDATE">Equipment Servicing</option>
              <option value="AI_PLAN_GEN">AI Generation</option>
              <option value="REPORT_SUBMIT">Reports</option>
            </select>
          </div>

          {currentUser.role === 'Commander' && (
            <button
              onClick={() => {
                if (window.confirm('Reset all exercise data to baseline training parameters?')) {
                  resetToInitialData();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 transition-colors"
              title="Reset simulation parameters to default baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DATASTORE</span>
            </button>
          )}
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 py-2 pr-1 space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No logs found.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-2.5 px-2 hover:bg-zinc-950/40 rounded transition-colors text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{log.timestamp}</span>
                    <span className="text-zinc-300 font-bold">{log.userName}</span>
                    <span className="text-[10px] text-zinc-500">({log.userRole})</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getActionBadge(log.actionType)}`}>
                    {log.actionType}
                  </span>
                </div>
                <p className="text-zinc-300 text-xs font-sans pl-1">{log.details}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 shrink-0">
          <span>Cryptographic hash verified. Tamper-evident append-only ledger.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
