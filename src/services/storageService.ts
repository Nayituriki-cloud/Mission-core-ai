import { Mission, User, AuditLogEntry } from '../types/mission';
import { INITIAL_MISSIONS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  MISSIONS: 'missioncore_missions_v1',
  USERS: 'missioncore_users_v1',
  CURRENT_USER: 'missioncore_current_user_v1',
  AUDIT_LOGS: 'missioncore_audit_logs_v1',
  SYNC_QUEUE: 'missioncore_sync_queue_v1',
};

export const storageService = {
  getMissions(): Mission[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading missions from localStorage:', e);
    }
    // Seed initial data
    this.saveMissions(INITIAL_MISSIONS);
    return INITIAL_MISSIONS;
  },

  saveMissions(missions: Mission[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
    } catch (e) {
      console.error('Error saving missions to localStorage:', e);
    }
  },

  getUsers(): User[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading users from localStorage:', e);
    }
    this.saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
  },

  saveUsers(users: User[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  },

  getCurrentUser(): User {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading current user:', e);
    }
    // Default to Cmdr. Elena Vance (Admin)
    return INITIAL_USERS[0];
  },

  setCurrentUser(user: User) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving current user:', e);
    }
  },

  getAuditLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading audit logs:', e);
    }
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
    return INITIAL_AUDIT_LOGS;
  },

  saveAuditLogs(logs: AuditLogEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
    } catch (e) {
      console.error('Error saving audit logs:', e);
    }
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs];
    this.saveAuditLogs(updated);
    return updated;
  },

  // Export missions to CSV
  exportMissionsToCSV(missions: Mission[]) {
    const headers = ['Code', 'Title', 'Category', 'Priority', 'Status', 'Lead', 'Location', 'Start Date', 'Deadline', 'Tasks Count', 'Tasks Done'];
    const users = this.getUsers();
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const rows = missions.map((m) => {
      const totalTasks = m.tasks.length;
      const doneTasks = m.tasks.filter((t) => t.status === 'Done').length;
      const leadName = userMap.get(m.leadId) || 'Unassigned';

      return [
        `"${m.code}"`,
        `"${m.title.replace(/"/g, '""')}"`,
        `"${m.category}"`,
        `"${m.priority}"`,
        `"${m.status}"`,
        `"${leadName}"`,
        `"${m.location.name.replace(/"/g, '""')}"`,
        `"${m.startDate}"`,
        `"${m.deadline}"`,
        totalTasks,
        doneTasks,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MissionCore_Missions_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export specific mission SITREP summary to CSV
  exportSingleMissionCSV(mission: Mission) {
    const lines = [
      `"MISSIONCORE SITREP EXPORT"`,
      `"Mission Code","${mission.code}"`,
      `"Title","${mission.title.replace(/"/g, '""')}"`,
      `"Status","${mission.status}"`,
      `"Priority","${mission.priority}"`,
      `"Category","${mission.category}"`,
      `"Objective","${mission.objective.replace(/"/g, '""')}"`,
      `"Location","${mission.location.name}"`,
      `"Coordinates","${mission.location.coordinates.join(', ')}"`,
      `"Deadline","${mission.deadline}"`,
      ``,
      `"TASKS BREAKDOWN"`,
      `"Task Title","Assignee","Priority","Status","Hours"`,
    ];

    const users = this.getUsers();
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    mission.tasks.forEach((t) => {
      lines.push(
        `"${t.title.replace(/"/g, '""')}","${userMap.get(t.assigneeId) || 'Unassigned'}","${t.priority}","${t.status}",${t.estimatedHours}`
      );
    });

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${mission.code}_SITREP_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.MISSIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    this.saveMissions(INITIAL_MISSIONS);
    this.saveUsers(INITIAL_USERS);
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
    this.setCurrentUser(INITIAL_USERS[0]);
  },
};
