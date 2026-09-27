export type Role = 'Commander' | 'Officer' | 'Staff' | 'Trainer' | 'Viewer';

export interface User {
  id: string;
  name: string;
  callsign: string;
  rank: string;
  role: Role;
  unit: string;
  avatarBadge: string;
}

export interface Phase {
  id: string;
  phaseNumber: number;
  name: string;
  durationHours: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETE';
  tasks: string[];
  criticalSuccessFactors?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedSquad: string;
  targetTime: string;
}

export interface Exercise {
  id: string;
  codename: string;
  title: string;
  echelon: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DEBRIEF';
  startDate: string;
  endDate: string;
  location: string;
  gridCoordinates: string;
  description: string;
  commandIntent: string;
  progressPercent: number;
  currentPhaseIndex: number;
  phases: Phase[];
  objectives: Objective[];
  assignedUnits: string[];
  threatCondition: 'FPCON NORMAL' | 'FPCON ALPHA' | 'FPCON BRAVO' | 'FPCON CHARLIE' | 'FPCON DELTA';
  simulatedTimeRemaining: string;
}

export interface Personnel {
  id: string;
  serviceNumber: string;
  name: string;
  callsign: string;
  rank: string;
  unitId: string;
  unitName: string;
  role: string;
  readinessStatus: 'DEPLOYABLE' | 'RESTRICTED' | 'MEDICAL_HOLD' | 'IN_TRAINING';
  combatReadinessScore: number; // 0 - 100
  certifications: string[];
  specializations: string[];
  medicalReadiness: 'CLASS_1' | 'CLASS_2' | 'CLASS_3';
  location: string;
  contactFreq: string;
}

export interface LogisticsConvoy {
  id: string;
  convoyCallsign: string;
  routeName: string;
  status: 'STAGED' | 'EN_ROUTE' | 'DELIVERED' | 'DELAYED' | 'REROUTED';
  cargoType: 'FUEL' | 'AMMUNITION_SIM' | 'RATIONS' | 'MEDICAL' | 'COMMS_SPARES';
  originGrid: string;
  destinationGrid: string;
  eta: string;
  progressPercent: number;
  manifestItems: { name: string; quantity: number; unit: string }[];
  fuelRemainingPercent: number;
  escortVehicleCount: number;
  driverCallsign: string;
}

export interface EquipmentItem {
  id: string;
  serialNumber: string;
  name: string;
  category: 'TACTICAL_VEHICLE' | 'COMMUNICATIONS' | 'ARMORY_SIM' | 'MEDICAL_GEAR' | 'SURVEILLANCE_UAV';
  operationalStatus: 'FULLY_MISSION_CAPABLE' | 'PARTIALLY_MISSION_CAPABLE' | 'MAINTENANCE_REQUIRED' | 'DEPOT_OVERHAUL';
  assignedUnitId: string;
  assignedUnitName: string;
  maintenanceDue: string;
  fuelBatteryLevel: number;
  conditionScore: number;
  locationGrid: string;
}

export interface TrainingEvent {
  id: string;
  title: string;
  category: 'LIVE_FIRE_SIM' | 'C4ISR_DRILL' | 'CONVOY_ESCORT' | 'CASUALTY_EVAC' | 'NIGHT_NAVIGATION';
  unitName: string;
  instructor: string;
  scheduledDate: string;
  durationHours: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  location: string;
  qualificationRate?: number;
  attendeeCount: number;
}

export interface MapMarker {
  id: string;
  name: string;
  type: 'BLUE_FORCE' | 'RED_SIM' | 'NEUTRAL_LOGISTICS' | 'WAYPOINT' | 'OBJECTIVE_FLAG' | 'FORWARD_BASE';
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  status: string;
  speedKmh?: number;
  headingDeg?: number;
  details: string;
  gridMGRS: string;
  unitStrength?: number;
}

export interface SituationReport {
  id: string;
  reportNumber: string;
  timestamp: string;
  authorRank: string;
  authorName: string;
  unit: string;
  gridLocation: string;
  currentSituation: string;
  friendlyForcesStatus: string;
  logisticsStatus: string;
  obstaclesChallenges: string;
  commanderAssessment: string;
  status: 'DRAFT' | 'TRANSMITTED' | 'ACKNOWLEDGED';
}

export interface AfterActionReport {
  id: string;
  exerciseId: string;
  codename: string;
  completionDate: string;
  leadEvaluator: string;
  overallRating: 'EXCEEDED_STANDARD' | 'MET_STANDARD' | 'MARGINAL' | 'BELOW_STANDARD';
  readinessGainScore: number;
  keySuccesses: string[];
  lessonsLearned: string[];
  logisticsVarianceNotes: string;
  safetyRecord: string;
  recommendations: string[];
}

export interface TacticalAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'LOGISTICS' | 'READINESS' | 'WEATHER' | 'EXERCISE_INJECT' | 'SECURITY';
  title: string;
  message: string;
  acknowledged: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  actionType: 'AUTH' | 'MISSION_MODIFY' | 'LOGISTICS_DISPATCH' | 'EQUIPMENT_UPDATE' | 'AI_PLAN_GEN' | 'EXPORT' | 'REPORT_SUBMIT' | 'OVERRIDE_SECURITY';
  details: string;
}

export interface GeneratedPlan {
  codename: string;
  scenarioTitle: string;
  echelon: string;
  operationalEnvironment: string;
  strategicObjective: string;
  commandIntent: string;
  phases: {
    phaseNumber: number;
    name: string;
    durationHours: number;
    keyTasks: string[];
    criticalSuccessFactors: string;
  }[];
  personnelRequirements: {
    role: string;
    count: number;
    requiredCertifications: string[];
    specialty: string;
  }[];
  timeline: {
    timeOffset: string;
    milestone: string;
    primaryUnit: string;
    safetyCheck: string;
  }[];
  logisticsChecklist: {
    category: string;
    item: string;
    quantity: number;
    unit: string;
    contingencyPlan: string;
  }[];
  safetyConsiderations: {
    riskLevel: 'LOW' | 'MED' | 'HIGH';
    hazard: string;
    mitigationProtocol: string;
    emergencyEvacZone: string;
  }[];
  evaluationCriteria: {
    metric: string;
    targetStandard: string;
    scoringWeight: string;
  }[];
  afterActionReportTemplate: {
    keyObservationsPrompt: string;
    logisticsEfficiencyPrompt: string;
    safetyComplianceSummary: string;
  };
}
