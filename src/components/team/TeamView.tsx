import React from 'react';
import { useMissions } from '../../context/MissionContext';
import { User, UserRole } from '../../types/mission';
import {
  Users,
  Shield,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const { users, currentUser, switchUser, updateUserRole, missions, hasPermission } = useMissions();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case 'Manager':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
      case 'Team Member':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'Viewer':
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const roles: UserRole[] = ['Admin', 'Manager', 'Team Member', 'Viewer'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Personnel & RBAC Deployment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Operations Team & Operator Roster
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based authorization (Admin, Manager, Team Member, Viewer) and field deployment workload.
          </p>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((operator) => {
          const isCurrentSession = operator.id === currentUser.id;

          // Assigned missions count
          const assignedMissions = missions.filter(
            (m) => m.leadId === operator.id || m.assignedTeamIds.includes(operator.id)
          );

          // Assigned active tasks count
          const assignedTasks = missions
            .flatMap((m) => m.tasks)
            .filter((t) => t.assigneeId === operator.id);
          const pendingTasks = assignedTasks.filter((t) => t.status !== 'Done');

          return (
            <div
              key={operator.id}
              className={`p-5 rounded-xl border transition-all space-y-4 shadow-md ${
                isCurrentSession
                  ? 'bg-slate-900 border-cyan-700 shadow-cyan-950/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Operator Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={operator.avatar}
                    alt={operator.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{operator.name}</h3>
                    <div className="text-xs font-mono text-cyan-400 font-semibold">
                      {operator.callsign}
                    </div>
                    <div className="text-[11px] text-slate-400">{operator.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${getRoleBadgeColor(
                      operator.role
                    )}`}
                  >
                    {operator.role}
                  </span>
                </div>
              </div>

              {/* Unit & Status */}
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Unit:</span>
                  <span className="text-slate-200">{operator.unit}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Deployment Status:</span>
                  <span className="text-emerald-400 uppercase font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {operator.status}
                  </span>
                </div>
              </div>

              {/* Workload Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-lg font-bold text-slate-200">{assignedMissions.length}</div>
                  <div className="text-[10px] text-slate-400">Missions</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-lg font-bold text-cyan-400">{pendingTasks.length}</div>
                  <div className="text-[10px] text-slate-400">Active Tasks</div>
                </div>
              </div>

              {/* Actions & Role Change */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {/* Admin Role Selector */}
                {hasPermission('admin_override') ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500">Role:</span>
                    <select
                      value={operator.role}
                      onChange={(e) => updateUserRole(operator.id, e.target.value as UserRole)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">
                    Permissions: Standard {operator.role}
                  </span>
                )}

                {/* Switch active operator session */}
                {!isCurrentSession ? (
                  <button
                    onClick={() => switchUser(operator)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <span>Switch To</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Active Persona
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
