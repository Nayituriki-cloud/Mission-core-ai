import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Mission,
  MissionTask,
  MissionNote,
  MissionStatus,
  User,
  UserRole,
  AuditLogEntry,
  AiPlanOutput,
} from '../types/mission';
import { storageService } from '../services/storageService';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'alert' | 'warning';
  read: boolean;
}

interface MissionContextType {
  missions: Mission[];
  users: User[];
  currentUser: User;
  auditLogs: AuditLogEntry[];
  offlineMode: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  notifications: AppNotification[];
  switchUser: (user: User) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  createMission: (data: Partial<Mission>) => Mission;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  transitionMissionStatus: (id: string, newStatus: MissionStatus) => void;
  updateTaskStatus: (missionId: string, taskId: string, status: MissionTask['status']) => void;
  toggleChecklistItem: (missionId: string, taskId: string, checkId: string) => void;
  addTask: (missionId: string, task: Omit<MissionTask, 'id' | 'missionId'>) => void;
  deleteTask: (missionId: string, taskId: string) => void;
  addMissionNote: (missionId: string, tag: MissionNote['tag'], content: string, pinned?: boolean) => void;
  addMissionAttachment: (missionId: string, file: { name: string; size: string; type: string }) => void;
  createMissionFromAiPlan: (plan: AiPlanOutput) => Mission;
  setOfflineMode: (offline: boolean) => void;
  triggerManualSync: () => void;
  clearAuditLogs: () => void;
  resetDatabase: () => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  hasPermission: (action: 'create_mission' | 'edit_mission' | 'delete_mission' | 'assign_task' | 'complete_task' | 'admin_override') => boolean;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [missions, setMissions] = useState<Mission[]>(() => storageService.getMissions());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => storageService.getAuditLogs());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [forcedOffline, setForcedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Active Corridor Alert',
      message: 'MC-101 Supply Corridor Alfa is currently accepting high-clearance medical convoys.',
      timestamp: new Date().toISOString(),
      type: 'info',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Upcoming Deadline Warning',
      message: 'MC-102 Node 1-6 telemetry deployment target is approaching in 48 hours.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'alert',
      read: false,
    },
  ]);

  const effectiveOffline = forcedOffline || !isOnline;

  // Listen to browser network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!forcedOffline) {
        syncPendingItems();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forcedOffline]);

  // Sync pending items
  const syncPendingItems = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setMissions((prev) => {
        const updated = prev.map((m) => ({ ...m, syncStatus: 'synced' as const }));
        storageService.saveMissions(updated);
        return updated;
      });
      setIsSyncing(false);
      pushNotification('Automatic Sync Complete', 'All localized field changes synchronized with Command HQ.', 'success');
    }, 900);
  }, []);

  const pendingSyncCount = useMemo(() => {
    return missions.filter((m) => m.syncStatus === 'pending_sync').length;
  }, [missions]);

  const pushNotification = (title: string, message: string, type: 'info' | 'success' | 'alert' | 'warning' = 'info') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  };

  const logAudit = (action: string, details: string, severity: 'info' | 'warning' | 'alert' = 'info') => {
    const updated = storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      severity,
    });
    setAuditLogs(updated);
  };

  // RBAC Permission Check
  const hasPermission = (action: 'create_mission' | 'edit_mission' | 'delete_mission' | 'assign_task' | 'complete_task' | 'admin_override'): boolean => {
    const role = currentUser.role;
    switch (action) {
      case 'admin_override':
      case 'delete_mission':
        return role === 'Admin';
      case 'create_mission':
      case 'edit_mission':
      case 'assign_task':
        return role === 'Admin' || role === 'Manager';
      case 'complete_task':
        return role === 'Admin' || role === 'Manager' || role === 'Team Member';
      default:
        return false;
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
    logAudit('USER_ROLE_SWITCH', `Active operator session switched to ${user.name} (${user.role}).`);
    pushNotification('Operator Profile Switched', `Now operating under ${user.callsign} (${user.role}).`, 'info');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!hasPermission('admin_override')) {
      pushNotification('Permission Denied', 'Admin privileges required to reassign operator roles.', 'alert');
      return;
    }

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      storageService.saveUsers(updated);
      return updated;
    });

    if (currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, role: newRole };
      setCurrentUser(updatedCurrent);
      storageService.setCurrentUser(updatedCurrent);
    }

    logAudit('ROLE_UPDATED', `User ${userId} permissions updated to ${newRole}.`, 'warning');
    pushNotification('Role Updated', `Operator credentials updated to ${newRole}.`, 'success');
  };

  const createMission = (data: Partial<Mission>): Mission => {
    if (!hasPermission('create_mission')) {
      throw new Error('Insufficient permissions: Manager or Admin role required to create missions.');
    }

    const nextIdNumber = missions.length + 101;
    const newMission: Mission = {
      id: `mis-${Date.now()}`,
      code: data.code || `MC-${nextIdNumber}`,
      title: data.title || 'Untitled Operation',
      objective: data.objective || 'Operational objective not specified.',
      category: data.category || 'Field Operations',
      priority: data.priority || 'Medium',
      status: data.status || 'Planned',
      startDate: data.startDate || new Date().toISOString(),
      deadline: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      location: data.location || {
        name: 'Operational Grid Alpha',
        coordinates: [45.4215, -75.6972],
        zoneType: 'staging_area',
        terrainOrWeather: 'Standard operational conditions',
        elevationMeters: 50,
      },
      leadId: data.leadId || currentUser.id,
      assignedTeamIds: data.assignedTeamIds && data.assignedTeamIds.length > 0 ? data.assignedTeamIds : [currentUser.id],
      requiredResources: data.requiredResources || [
        { id: `res-${Date.now()}-1`, name: 'Tactical Radio Units', category: 'Comms', allocated: 2, needed: 2, unit: 'units' },
        { id: `res-${Date.now()}-2`, name: 'Field Transport', category: 'Vehicles', allocated: 1, needed: 1, unit: 'vehicle' },
      ],
      tasks: data.tasks || [],
      milestones: data.milestones || [
        { id: `mls-${Date.now()}-1`, title: 'Initial Deployment & Staging', dueDate: new Date(Date.now() + 86400000).toISOString(), completed: false, order: 1 },
        { id: `mls-${Date.now()}-2`, title: 'Primary Objective Handover', dueDate: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString(), completed: false, order: 2 },
      ],
      risks: data.risks || [],
      notes: [
        {
          id: `not-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toISOString(),
          tag: 'Command Directive',
          content: 'Mission initialized in Command Core. Initial logistics and staging underway.',
          pinned: true,
        },
      ],
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: effectiveOffline ? 'pending_sync' : 'synced',
    };

    setMissions((prev) => {
      const updated = [newMission, ...prev];
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('MISSION_CREATED', `Mission ${newMission.code}: "${newMission.title}" created with priority ${newMission.priority}.`);
    pushNotification('Mission Initialized', `Mission ${newMission.code} is now live in the system.`, 'success');

    return newMission;
  };

  const updateMission = (id: string, updates: Partial<Mission>) => {
    if (!hasPermission('edit_mission')) {
      pushNotification('Permission Denied', 'Manager or Admin role required to edit mission parameters.', 'alert');
      return;
    }

    setMissions((prev) => {
      const updated = prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...updates,
              updatedAt: new Date().toISOString(),
              syncStatus: (effectiveOffline ? 'pending_sync' : 'synced') as 'pending_sync' | 'synced',
            }
          : m
      );
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('MISSION_UPDATED', `Mission ID ${id} parameters updated.`);
  };

  const deleteMission = (id: string) => {
    if (!hasPermission('delete_mission')) {
      pushNotification('Permission Denied', 'Only Admins are authorized to archive or delete missions.', 'alert');
      return;
    }

    const target = missions.find((m) => m.id === id);
    setMissions((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('MISSION_DELETED', `Mission ${target?.code || id} deleted by ${currentUser.name}.`, 'warning');
    pushNotification('Mission Removed', `Mission ${target?.code || id} has been purged.`, 'info');
  };

  const transitionMissionStatus = (id: string, newStatus: MissionStatus) => {
    if (!hasPermission('edit_mission')) {
      pushNotification('Permission Denied', 'Manager or Admin authorization needed to advance mission status.', 'alert');
      return;
    }

    const mission = missions.find((m) => m.id === id);
    if (!mission) return;

    updateMission(id, { status: newStatus });
    logAudit('STATUS_TRANSITION', `Mission ${mission.code} status changed from ${mission.status} -> ${newStatus}.`);
    pushNotification('Status Updated', `Mission ${mission.code} advanced to ${newStatus}.`, 'info');
  };

  const updateTaskStatus = (missionId: string, taskId: string, status: MissionTask['status']) => {
    if (!hasPermission('complete_task')) {
      pushNotification('Permission Denied', 'Viewer role is read-only. Cannot alter task state.', 'alert');
      return;
    }

    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== missionId) return m;
        const updatedTasks = m.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status,
            completedAt: status === 'Done' ? new Date().toISOString() : undefined,
          };
        });
        return {
          ...m,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
          syncStatus: (effectiveOffline ? 'pending_sync' : 'synced') as 'pending_sync' | 'synced',
        };
      });
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('TASK_STATUS_CHANGED', `Task ${taskId} in Mission ${missionId} updated to ${status}.`);
  };

  const toggleChecklistItem = (missionId: string, taskId: string, checkId: string) => {
    if (!hasPermission('complete_task')) return;

    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== missionId) return m;
        const updatedTasks = m.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const updatedChecklist = t.checklist.map((c) =>
            c.id === checkId ? { ...c, done: !c.done } : c
          );
          // If all checklist items are now done, auto mark task Done; if unchecking, back to In Progress
          const allDone = updatedChecklist.length > 0 && updatedChecklist.every((c) => c.done);
          return {
            ...t,
            checklist: updatedChecklist,
            status: allDone ? ('Done' as const) : t.status === 'Done' ? ('In Progress' as const) : t.status,
          };
        });
        return {
          ...m,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
          syncStatus: (effectiveOffline ? 'pending_sync' : 'synced') as 'pending_sync' | 'synced',
        };
      });
      storageService.saveMissions(updated);
      return updated;
    });
  };

  const addTask = (missionId: string, taskData: Omit<MissionTask, 'id' | 'missionId'>) => {
    if (!hasPermission('edit_mission')) {
      pushNotification('Permission Denied', 'Manager or Admin role required to create new mission tasks.', 'alert');
      return;
    }

    const newTask: MissionTask = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      missionId,
    };

    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== missionId) return m;
        return {
          ...m,
          tasks: [...m.tasks, newTask],
          updatedAt: new Date().toISOString(),
          syncStatus: (effectiveOffline ? 'pending_sync' : 'synced') as 'pending_sync' | 'synced',
        };
      });
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('TASK_ADDED', `New task "${newTask.title}" assigned to mission ${missionId}.`);
    pushNotification('Task Dispatched', `Task "${newTask.title}" added to mission roster.`, 'success');
  };

  const deleteTask = (missionId: string, taskId: string) => {
    if (!hasPermission('edit_mission')) return;

    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== missionId) return m;
        return {
          ...m,
          tasks: m.tasks.filter((t) => t.id !== taskId),
          updatedAt: new Date().toISOString(),
        };
      });
      storageService.saveMissions(updated);
      return updated;
    });
  };

  const addMissionNote = (missionId: string, tag: MissionNote['tag'], content: string, pinned = false) => {
    if (!hasPermission('complete_task')) {
      pushNotification('Permission Denied', 'Cannot post SITREP notes in viewer mode.', 'alert');
      return;
    }

    const newNote: MissionNote = {
      id: `not-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString(),
      tag,
      content,
      pinned,
    };

    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== missionId) return m;
        return {
          ...m,
          notes: [newNote, ...m.notes],
          updatedAt: new Date().toISOString(),
          syncStatus: (effectiveOffline ? 'pending_sync' : 'synced') as 'pending_sync' | 'synced',
        };
      });
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('NOTE_POSTED', `SITREP note (${tag}) recorded for Mission ${missionId}.`);
  };

  const addMissionAttachment = (missionId: string, file: { name: string; size: string; type: string }) => {
    const newAtt = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploaderName: currentUser.name,
    };

    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== missionId) return m;
        return {
          ...m,
          attachments: [newAtt, ...m.attachments],
          updatedAt: new Date().toISOString(),
        };
      });
      storageService.saveMissions(updated);
      return updated;
    });

    logAudit('ATTACHMENT_UPLOADED', `Document "${file.name}" uploaded to Mission ${missionId}.`);
    pushNotification('Document Attached', `"${file.name}" indexed to mission record.`, 'success');
  };

  const createMissionFromAiPlan = (plan: AiPlanOutput): Mission => {
    const now = Date.now();
    const durationDays = plan.estimatedDurationDays || 7;
    const deadlineDate = new Date(now + durationDays * 86400000).toISOString();

    const tasks: MissionTask[] = (plan.tasks || []).map((t, idx) => ({
      id: `tsk-ai-${now}-${idx}`,
      missionId: '',
      title: t.title,
      description: t.description,
      assigneeId: users[idx % users.length].id,
      status: 'Pending',
      priority: t.priority || 'Medium',
      estimatedHours: t.estimatedHours || 8,
      dueDate: new Date(now + (t.dueDateOffsetDays || Math.max(1, idx + 1)) * 86400000).toISOString(),
      checklist: (t.checklist || []).map((item, cIdx) => ({
        id: `chk-${now}-${idx}-${cIdx}`,
        text: item,
        done: false,
      })),
    }));

    const milestones = (plan.milestones || []).map((m, idx) => ({
      id: `mls-ai-${now}-${idx}`,
      title: m.title,
      dueDate: new Date(now + (m.dueDateOffsetDays || Math.max(1, idx * 2 + 1)) * 86400000).toISOString(),
      completed: false,
      order: idx + 1,
    }));

    const requiredResources = (plan.requiredResources || []).map((r, idx) => ({
      id: `res-ai-${now}-${idx}`,
      name: r.name,
      category: r.category,
      allocated: Math.floor(r.needed * 0.5),
      needed: r.needed,
      unit: r.unit,
    }));

    const risks = (plan.risks || []).map((r, idx) => ({
      id: `rsk-ai-${now}-${idx}`,
      description: r.description,
      impact: r.impact,
      mitigation: r.mitigation,
    }));

    const mission = createMission({
      title: plan.title,
      objective: plan.objective,
      category: plan.category,
      priority: plan.priority,
      status: 'Planned',
      startDate: new Date().toISOString(),
      deadline: deadlineDate,
      requiredResources,
      tasks,
      milestones,
      risks,
    });

    if (plan.executiveBrief) {
      addMissionNote(mission.id, 'Command Directive', `[AI Strategic Brief]: ${plan.executiveBrief}`, true);
    }

    logAudit('AI_PLAN_CONVERTED', `AI-generated operational blueprint converted to live Mission ${mission.code}.`);
    pushNotification('AI Mission Deployed', `Mission ${mission.code} created from AI blueprint.`, 'success');
    return mission;
  };

  const setOfflineMode = (offline: boolean) => {
    setForcedOffline(offline);
    if (!offline && isOnline) {
      syncPendingItems();
    } else {
      pushNotification('Offline Simulation Active', 'System is now buffering changes in localized offline cache.', 'alert');
    }
  };

  const triggerManualSync = () => {
    syncPendingItems();
  };

  const clearAuditLogs = () => {
    if (!hasPermission('admin_override')) return;
    storageService.saveAuditLogs([]);
    setAuditLogs([]);
    pushNotification('Audit Trail Cleared', 'Security event log cleared by administrative override.', 'warning');
  };

  const resetDatabase = () => {
    storageService.resetAllData();
    setMissions(storageService.getMissions());
    setUsers(storageService.getUsers());
    setCurrentUser(storageService.getCurrentUser());
    setAuditLogs(storageService.getAuditLogs());
    pushNotification('System Reset', 'Mission database restored to factory demo state.', 'info');
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <MissionContext.Provider
      value={{
        missions,
        users,
        currentUser,
        auditLogs,
        offlineMode: effectiveOffline,
        isOnline,
        pendingSyncCount,
        isSyncing,
        notifications,
        switchUser,
        updateUserRole,
        createMission,
        updateMission,
        deleteMission,
        transitionMissionStatus,
        updateTaskStatus,
        toggleChecklistItem,
        addTask,
        deleteTask,
        addMissionNote,
        addMissionAttachment,
        createMissionFromAiPlan,
        setOfflineMode,
        triggerManualSync,
        clearAuditLogs,
        resetDatabase,
        dismissNotification,
        markAllNotificationsRead,
        hasPermission,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMissions = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMissions must be used within a MissionProvider');
  }
  return context;
};
