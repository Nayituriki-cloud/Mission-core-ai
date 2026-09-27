import React, { useState, useEffect } from 'react';
import { useMissions } from '../../context/MissionContext';
import {
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  UserCheck,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  onOpenCreateMission: () => void;
  onOpenAiPlanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateMission, onOpenAiPlanner }) => {
  const {
    currentUser,
    users,
    switchUser,
    offlineMode,
    setOfflineMode,
    pendingSyncCount,
    isSyncing,
    triggerManualSync,
    notifications,
    dismissNotification,
    markAllNotificationsRead,
    hasPermission,
  } = useMissions();

  const [zuluTime, setZuluTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setZuluTime(
        now.toISOString().substring(11, 19) + ' Z'
      );
      setLocalTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider uppercase text-slate-100 font-mono">
                MissionCore
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono font-medium tracking-tight">
                AI COMMAND
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Zulu / Local Clock */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-medium">{zuluTime}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{localTime} LOC</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Offline toggle, Sync, Notifications, Role Switcher, Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Simulation / Network Status */}
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          title={offlineMode ? 'Offline Mode Active (Click to go Online)' : 'Online Mode (Click to simulate field disconnection)'}
          className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 border transition-all ${
            offlineMode
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 shadow-sm'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          {offlineMode ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">OFFLINE MODE</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ONLINE</span>
            </>
          )}
        </button>

        {/* Sync Status Button */}
        {pendingSyncCount > 0 ? (
          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync ({pendingSyncCount})</span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>SYNCED</span>
          </div>
        )}

        {/* Notifications Drawer Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
            }}
            className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors relative"
            title="Operational Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Operational Signals
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No active tactical alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex items-start gap-2.5 transition-colors ${
                        n.read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-900 text-slate-200'
                      }`}
                    >
                      {n.type === 'alert' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-200 mb-0.5">{n.title}</div>
                        <p className="text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-500 hover:text-slate-300 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Operator Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900/80 hover:bg-slate-800/60 text-left transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-none">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 leading-tight mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 p-2">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Active Operator (RBAC)
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {currentUser.callsign} · {currentUser.unit}
                </div>
              </div>

              <div className="text-[10px] uppercase font-mono text-slate-500 px-2 py-1 font-semibold">
                Switch Operational Persona
              </div>

              <div className="space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between text-xs transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.role}</div>
                      </div>
                    </div>
                    {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Mission Button (if permitted) */}
        {hasPermission('create_mission') && (
          <button
            onClick={onOpenCreateMission}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/50 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Mission</span>
          </button>
        )}
      </div>
    </header>
  );
};
