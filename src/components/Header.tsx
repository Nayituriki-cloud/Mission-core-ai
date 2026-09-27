import React, { useState, useEffect } from 'react';
import { useTactical } from '../context/TacticalContext';
import {
  Shield,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  UserCheck,
  History,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenAuditLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuditLogs }) => {
  const {
    currentUser,
    users,
    switchUser,
    isOnline,
    pendingSyncCount,
    syncWithHQ,
    isSyncing,
    lastSyncedAt,
    alerts,
    acknowledgeAlert,
    selectedExercise,
    simulationClockRunning,
    toggleSimulationClock,
  } = useTactical();

  const [militaryTime, setMilitaryTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // Military Zulu string format: 261720Z SEP 26
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[now.getUTCMonth()];
      const year = String(now.getUTCFullYear()).slice(-2);

      setUtcTime(`${day}${hours}${minutes}Z ${month} ${year}`);
      setMilitaryTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Commander':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'Officer':
        return 'text-sky-400 bg-sky-950/60 border-sky-800/80';
      case 'Trainer':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'Staff':
        return 'text-zinc-300 bg-zinc-900 border-zinc-700';
      case 'Viewer':
        return 'text-zinc-400 bg-zinc-950 border-zinc-800';
      default:
        return 'text-zinc-300 bg-zinc-900 border-zinc-700';
    }
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Security Classification */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shadow-amber-500/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-widest text-zinc-100 font-mono">
                  AEGIS // COMMAND AI
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  TRAINING SIMULATION
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                <span>{selectedExercise?.codename || 'EXERCISE DEFENSE'}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-mono text-[10px]">
                  {selectedExercise?.threatCondition || 'FPCON BRAVO'}
                </span>
              </div>
            </div>
          </div>

          {/* Tactical Clock & Simulation Status */}
          <div className="hidden md:flex items-center gap-5 font-mono text-xs">
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <div>
                <span className="text-zinc-500 text-[10px] block leading-none">ZULU TIME (UTC)</span>
                <span className="text-amber-400 font-semibold">{utcTime}</span>
              </div>
              <div className="border-l border-zinc-800 pl-2 ml-1">
                <span className="text-zinc-500 text-[10px] block leading-none">LOCAL TOC</span>
                <span className="text-zinc-200">{militaryTime}</span>
              </div>
            </div>

            <button
              onClick={toggleSimulationClock}
              title={simulationClockRunning ? 'Pause simulation timeline' : 'Resume simulation timeline'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs transition-colors"
            >
              {simulationClockRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-semibold">SIM LIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 text-[11px] font-semibold">SIM PAUSED</span>
                </>
              )}
            </button>
          </div>

          {/* Right Action Bar: Offline Status, Alerts, Role Switcher, Audit Log */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync & Offline Status */}
            <div className="flex items-center">
              <button
                onClick={syncWithHQ}
                disabled={isSyncing}
                title={`Last synced: ${lastSyncedAt}. Click to force sync with HQ.`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-all ${
                  !isOnline
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                    : pendingSyncCount > 0
                    ? 'bg-sky-950/40 border-sky-800/80 text-sky-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : !isOnline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden sm:inline font-mono text-[11px]">
                  {isSyncing
                    ? 'SYNCING...'
                    : !isOnline
                    ? `OFFLINE (${pendingSyncCount} Q)`
                    : pendingSyncCount > 0
                    ? `${pendingSyncCount} UNCOMMITTED`
                    : 'HQ SYNCED'}
                </span>
              </button>
            </div>

            {/* Tactical Alerts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                title="Tactical Alerts & Injects"
              >
                <Bell className="w-4 h-4" />
                {unacknowledgedAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    {unacknowledgedAlerts.length}
                  </span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-2 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 px-2 font-mono">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      TACTICAL ALERTS & INJECTS
                    </span>
                    <span className="text-[10px] text-zinc-500">{alerts.length} Total</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                    {alerts.length === 0 ? (
                      <div className="p-3 text-center text-zinc-500">No active alerts reported.</div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2.5 rounded border transition-colors ${
                            alert.acknowledged
                              ? 'bg-zinc-950/50 border-zinc-800/50 opacity-70'
                              : alert.severity === 'CRITICAL'
                              ? 'bg-red-950/40 border-red-800/80 text-red-200'
                              : alert.severity === 'WARNING'
                              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 mb-0.5">
                                <span className="font-bold">{alert.category}</span>
                                <span>·</span>
                                <span>{alert.timestamp}</span>
                              </div>
                              <p className="font-semibold text-zinc-100">{alert.title}</p>
                              <p className="text-[11px] text-zinc-400 mt-1">{alert.message}</p>
                            </div>
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="shrink-0 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400"
                                title="Acknowledge alert"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audit Log Trigger */}
            <button
              onClick={onOpenAuditLogs}
              title="Command Audit Trail & Event Logs"
              className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Role & User Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs font-mono transition-colors ${getRoleColor(
                  currentUser.role
                )}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <div className="text-left">
                  <div className="font-bold text-[11px] leading-tight">{currentUser.rank}</div>
                  <div className="text-[9px] uppercase opacity-80">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-2 text-xs">
                  <div className="px-2 py-1.5 border-b border-zinc-800 mb-1 font-mono text-[10px] text-zinc-400">
                    SWITCH COMMAND ROLE & CREDENTIALS
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
                            : 'hover:bg-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {u.rank} · {u.unit}
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getRoleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-800 px-2 text-[10px] text-zinc-500">
                    Role determines edit vs. read-only permissions across tactical modules.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
