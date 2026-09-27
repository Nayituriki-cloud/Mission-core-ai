export type UserRole = 'Admin' | 'Manager' | 'Team Member' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  callsign: string;
  unit: string;
  avatar: string;
  status: 'active' | 'deployed' | 'standby';
}

export type MissionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type MissionStatus = 'Planned' | 'Active' | 'In Progress' | 'Completed' | 'Archived';

export type MissionCategory =
  | 'Field Operations'
  | 'Emergency Preparedness'
  | 'Logistics & Supply'
  | 'Community Initiative'
  | 'Infrastructure Resilience'
  | 'Crisis Response';

export interface MissionResource {
  id: string;
  name: string;
  category: 'Personnel' | 'Equipment' | 'Vehicles' | 'Comms' | 'Medical' | 'Budget';
  allocated: number;
  needed: number;
  unit: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface MissionTask {
  id: string;
  missionId: string;
  title: string;
  description: string;
  assigneeId: string;
  status: 'Pending' | 'In Progress' | 'Blocked' | 'Done';
  priority: MissionPriority;
  estimatedHours: number;
  dueDate: string;
  completedAt?: string;
  checklist: TaskChecklistItem[];
}

export interface MissionMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  order: number;
}

export interface MissionRisk {
  id: string;
  description: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface MissionNote {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  tag: 'Field SITREP' | 'Logistics' | 'Command Directive' | 'Safety' | 'General';
  content: string;
  pinned?: boolean;
}

export interface MissionAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploaderName: string;
}

export interface MissionLocation {
  name: string;
  coordinates: [number, number]; // [lat, lng]
  zoneType: 'safe_zone' | 'active_perimeter' | 'staging_area' | 'restricted' | 'logistics_hub';
  terrainOrWeather?: string;
  elevationMeters?: number;
}

export interface Mission {
  id: string;
  code: string; // e.g. "MC-101"
  title: string;
  objective: string;
  category: MissionCategory;
  priority: MissionPriority;
  status: MissionStatus;
  startDate: string;
  deadline: string;
  location: MissionLocation;
  leadId: string;
  assignedTeamIds: string[];
  requiredResources: MissionResource[];
  tasks: MissionTask[];
  milestones: MissionMilestone[];
  risks: MissionRisk[];
  notes: MissionNote[];
  attachments: MissionAttachment[];
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending_sync';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'alert';
}

export interface AiPlanOutput {
  title: string;
  objective: string;
  category: MissionCategory;
  priority: MissionPriority;
  estimatedDurationDays: number;
  executiveBrief: string;
  milestones: Array<{
    title: string;
    dueDateOffsetDays: number;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    priority: MissionPriority;
    estimatedHours: number;
    dueDateOffsetDays: number;
    checklist: string[];
  }>;
  requiredResources: Array<{
    name: string;
    category: 'Personnel' | 'Equipment' | 'Vehicles' | 'Comms' | 'Medical' | 'Budget';
    needed: number;
    unit: string;
  }>;
  risks: Array<{
    description: string;
    impact: 'Critical' | 'High' | 'Medium' | 'Low';
    mitigation: string;
  }>;
  safetyComplianceNote: string;
}
