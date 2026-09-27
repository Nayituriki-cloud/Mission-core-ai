import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Exercise,
  Personnel,
  LogisticsConvoy,
  EquipmentItem,
  TrainingEvent,
  MapMarker,
  SituationReport,
  AfterActionReport,
  TacticalAlert,
  AuditLogEntry,
  User,
  Role,
  GeneratedPlan,
  Objective
} from '../types/tactical';
import {
  INITIAL_USERS,
  INITIAL_EXERCISES,
  INITIAL_PERSONNEL,
  INITIAL_CONVOYS,
  INITIAL_EQUIPMENT,
  INITIAL_TRAINING_EVENTS,
  INITIAL_MAP_MARKERS,
  INITIAL_SITREPS,
  INITIAL_AARS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

interface TacticalContextType {
  // Current session & auth
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  canPerform: (action: string) => boolean;

  // Data
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  setSelectedExerciseId: (id: string) => void;
  personnel: Personnel[];
  convoys: LogisticsConvoy[];
  equipment: EquipmentItem[];
  trainingEvents: TrainingEvent[];
  mapMarkers: MapMarker[];
  sitreps: SituationReport[];
  aars: AfterActionReport[];
  alerts: TacticalAlert[];
  auditLogs: AuditLogEntry[];

  // Exercise actions
  createExercise: (exercise: Exercise) => void;
  updateExerciseStatus: (exerciseId: string, status: Exercise['status']) => void;
  addObjectiveToExercise: (exerciseId: string, objective: Omit<Objective, 'id'>) => void;
  updateObjectiveStatus: (exerciseId: string, objectiveId: string, status: Objective['status']) => void;
  advanceExercisePhase: (exerciseId: string) => void;
  adoptAiPlan: (plan: GeneratedPlan) => void;

  // Personnel & unit actions
  addPersonnel: (p: Omit<Personnel, 'id'>) => void;
  updatePersonnelReadiness: (id: string, status: Personnel['readinessStatus'], score: number) => void;

  // Logistics actions
  dispatchConvoy: (convoy: Omit<LogisticsConvoy, 'id'>) => void;
  updateConvoyStatus: (id: string, status: LogisticsConvoy['status'], progress: number) => void;

  // Equipment actions
  updateEquipmentStatus: (id: string, status: EquipmentItem['operationalStatus'], notes?: string) => void;

  // Training actions
  addTrainingEvent: (event: Omit<TrainingEvent, 'id'>) => void;
  completeTrainingEvent: (id: string, score: number) => void;

  // Simulation & Map actions
  updateMapMarkerPosition: (id: string, x: number, y: number) => void;
  addMapMarker: (marker: Omit<MapMarker, 'id'>) => void;
  simulationClockRunning: boolean;
  toggleSimulationClock: () => void;

  // Reports
  submitSitrep: (sitrep: Omit<SituationReport, 'id' | 'timestamp'>) => void;
  submitAar: (aar: Omit<AfterActionReport, 'id'>) => void;

  // Alerts & Notifications
  acknowledgeAlert: (id: string) => void;
  addAlert: (alert: Omit<TacticalAlert, 'id' | 'timestamp' | 'acknowledged'>) => void;

  // Offline sync & reset
  isOnline: boolean;
  pendingSyncCount: number;
  syncWithHQ: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: string;
  resetToInitialData: () => void;
}

const STORAGE_KEY = 'aegis_command_tactical_state_v3';

const TacticalContext = createContext<TacticalContextType | undefined>(undefined);

export const TacticalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from local storage or fallback to initial
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [users] = useState<User[]>(INITIAL_USERS);
  
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_exercises`);
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || 'ex-01');

  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_personnel`);
    return saved ? JSON.parse(saved) : INITIAL_PERSONNEL;
  });

  const [convoys, setConvoys] = useState<LogisticsConvoy[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_convoys`);
    return saved ? JSON.parse(saved) : INITIAL_CONVOYS;
  });

  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_equipment`);
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [trainingEvents, setTrainingEvents] = useState<TrainingEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_training`);
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_EVENTS;
  });

  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_map`);
    return saved ? JSON.parse(saved) : INITIAL_MAP_MARKERS;
  });

  const [sitreps, setSitreps] = useState<SituationReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sitreps`);
    return saved ? JSON.parse(saved) : INITIAL_SITREPS;
  });

  const [aars, setAars] = useState<AfterActionReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_aars`);
    return saved ? JSON.parse(saved) : INITIAL_AARS;
  });

  const [alerts, setAlerts] = useState<TacticalAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Offline and synchronization state
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Just now');
  const [simulationClockRunning, setSimulationClockRunning] = useState<boolean>(true);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exercises`, JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_personnel`, JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_convoys`, JSON.stringify(convoys));
  }, [convoys]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_equipment`, JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_training`, JSON.stringify(trainingEvents));
  }, [trainingEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_map`, JSON.stringify(mapMarkers));
  }, [mapMarkers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sitreps`, JSON.stringify(sitreps));
  }, [sitreps]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_aars`, JSON.stringify(aars));
  }, [aars]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Periodic simulation tick for map movements and exercise clock
  useEffect(() => {
    if (!simulationClockRunning) return;
    const interval = setInterval(() => {
      setMapMarkers((prev) =>
        prev.map((marker) => {
          if (marker.type === 'NEUTRAL_LOGISTICS' && marker.speedKmh && marker.speedKmh > 0) {
            // Convoy moving slightly along vector
            const nextX = (marker.x + 0.1) % 85;
            const nextY = Math.max(30, Math.min(80, marker.y + 0.05));
            return { ...marker, x: Number(nextX.toFixed(2)), y: Number(nextY.toFixed(2)) };
          }
          return marker;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [simulationClockRunning]);

  const recordAudit = (actionType: AuditLogEntry['actionType'], details: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 199)]);
    if (!isOnline) {
      setPendingSyncCount((c) => c + 1);
    }
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      recordAudit('AUTH', `User switched credentials to ${found.rank} ${found.name} (${found.role}).`);
    }
  };

  // Role permissions check
  const canPerform = (action: string): boolean => {
    const role = currentUser.role;
    if (role === 'Commander') return true;
    if (role === 'Viewer') return false; // Viewers can never modify data

    switch (action) {
      case 'CREATE_MISSION':
      case 'APPROVE_AAR':
      case 'OVERRIDE_SECURITY':
        return false; // Commander is already checked above and returns true
      case 'EDIT_MISSION':
      case 'DISPATCH_LOGISTICS':
      case 'SUBMIT_SITREP':
      case 'GENERATE_AI_PLAN':
      case 'SIMULATE_INJECT':
        return role === 'Officer';
      case 'UPDATE_EQUIPMENT':
      case 'EDIT_MANIFEST':
      case 'MANAGE_PERSONNEL':
        return role === 'Officer' || role === 'Staff';
      case 'EVALUATE_TRAINING':
      case 'SUBMIT_AAR':
      case 'GRADE_DRILL':
        return role === 'Trainer';
      default:
        return true;
    }
  };

  const createExercise = (exercise: Exercise) => {
    setExercises((prev) => [exercise, ...prev]);
    setSelectedExerciseId(exercise.id);
    recordAudit('MISSION_MODIFY', `Created new exercise "${exercise.codename} - ${exercise.title}".`);
  };

  const updateExerciseStatus = (exerciseId: string, status: Exercise['status']) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, status } : ex))
    );
    recordAudit('MISSION_MODIFY', `Updated status of exercise ${exerciseId} to ${status}.`);
  };

  const addObjectiveToExercise = (exerciseId: string, objective: Omit<Objective, 'id'>) => {
    const newObj: Objective = {
      ...objective,
      id: `obj-${Date.now()}`,
    };
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            objectives: [...ex.objectives, newObj],
          };
        }
        return ex;
      })
    );
    recordAudit('MISSION_MODIFY', `Added objective "${objective.title}" to exercise ${exerciseId}.`);
  };

  const updateObjectiveStatus = (exerciseId: string, objectiveId: string, status: Objective['status']) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const updatedObjectives = ex.objectives.map((obj) =>
            obj.id === objectiveId ? { ...obj, status } : obj
          );
          const completedCount = updatedObjectives.filter((o) => o.status === 'COMPLETED').length;
          const progressPercent = Math.round((completedCount / (updatedObjectives.length || 1)) * 100);
          return {
            ...ex,
            objectives: updatedObjectives,
            progressPercent,
          };
        }
        return ex;
      })
    );
    recordAudit('MISSION_MODIFY', `Objective ${objectiveId} updated to ${status}.`);
  };

  const advanceExercisePhase = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const nextIndex = Math.min(ex.phases.length - 1, ex.currentPhaseIndex + 1);
          const updatedPhases = ex.phases.map((ph, idx) => {
            if (idx < nextIndex) return { ...ph, status: 'COMPLETE' as const };
            if (idx === nextIndex) return { ...ph, status: 'ACTIVE' as const };
            return { ...ph, status: 'PENDING' as const };
          });
          return {
            ...ex,
            currentPhaseIndex: nextIndex,
            phases: updatedPhases,
          };
        }
        return ex;
      })
    );
    recordAudit('MISSION_MODIFY', `Exercise ${exerciseId} transitioned to next operational phase.`);
  };

  const adoptAiPlan = (plan: GeneratedPlan) => {
    const newExercise: Exercise = {
      id: `ex-ai-${Date.now()}`,
      codename: plan.codename,
      title: plan.scenarioTitle,
      echelon: plan.echelon,
      status: 'PLANNING',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 4 * 86400000).toISOString().substring(0, 10),
      location: 'Simulated Tactical Proving Grounds',
      gridCoordinates: 'MGRS 32UND 8910 9340',
      description: plan.operationalEnvironment,
      commandIntent: plan.commandIntent || plan.strategicObjective,
      progressPercent: 5,
      currentPhaseIndex: 0,
      threatCondition: 'FPCON BRAVO',
      simulatedTimeRemaining: '96h 00m',
      phases: plan.phases.map((ph, idx) => ({
        id: `ph-ai-${idx}-${Date.now()}`,
        phaseNumber: ph.phaseNumber,
        name: ph.name,
        durationHours: ph.durationHours,
        status: idx === 0 ? 'ACTIVE' : 'PENDING',
        tasks: ph.keyTasks,
        criticalSuccessFactors: ph.criticalSuccessFactors,
      })),
      objectives: plan.timeline.map((tl, idx) => ({
        id: `obj-ai-${idx}-${Date.now()}`,
        title: tl.milestone,
        description: `Primary Unit: ${tl.primaryUnit}. Safety Requirement: ${tl.safetyCheck}`,
        status: 'NOT_STARTED',
        priority: idx === 0 ? 'HIGH' : 'MEDIUM',
        assignedSquad: tl.primaryUnit,
        targetTime: tl.timeOffset,
      })),
      assignedUnits: plan.personnelRequirements.map((p) => p.role),
    };

    setExercises((prev) => [newExercise, ...prev]);
    setSelectedExerciseId(newExercise.id);
    recordAudit('AI_PLAN_GEN', `Adopted AI-Generated Plan into operational roster: ${plan.codename}.`);

    // Add notification alert
    addAlert({
      severity: 'INFO',
      category: 'EXERCISE_INJECT',
      title: `AI Plan Instantiated: ${plan.codename}`,
      message: `Strategic objective: ${plan.strategicObjective.substring(0, 100)}... Initial logistics staged.`,
    });
  };

  const addPersonnel = (p: Omit<Personnel, 'id'>) => {
    const newP: Personnel = { ...p, id: `per-${Date.now()}` };
    setPersonnel((prev) => [newP, ...prev]);
    recordAudit('MISSION_MODIFY', `Added personnel ${p.rank} ${p.name} to unit ${p.unitName}.`);
  };

  const updatePersonnelReadiness = (id: string, status: Personnel['readinessStatus'], score: number) => {
    setPersonnel((prev) =>
      prev.map((p) => (p.id === id ? { ...p, readinessStatus: status, combatReadinessScore: score } : p))
    );
    recordAudit('MISSION_MODIFY', `Updated readiness for personnel ${id} to ${status} (${score}%).`);
  };

  const dispatchConvoy = (c: Omit<LogisticsConvoy, 'id'>) => {
    const newConvoy: LogisticsConvoy = { ...c, id: `cnv-${Date.now()}` };
    setConvoys((prev) => [newConvoy, ...prev]);
    recordAudit('LOGISTICS_DISPATCH', `Dispatched Convoy ${c.convoyCallsign} along route ${c.routeName}.`);
  };

  const updateConvoyStatus = (id: string, status: LogisticsConvoy['status'], progress: number) => {
    setConvoys((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, progressPercent: progress } : c))
    );
    recordAudit('LOGISTICS_DISPATCH', `Convoy ${id} updated to status ${status} (${progress}%).`);
  };

  const updateEquipmentStatus = (id: string, status: EquipmentItem['operationalStatus'], notes?: string) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, operationalStatus: status } : eq))
    );
    recordAudit('EQUIPMENT_UPDATE', `Equipment ${id} status set to ${status}. ${notes ? `Notes: ${notes}` : ''}`);
  };

  const addTrainingEvent = (event: Omit<TrainingEvent, 'id'>) => {
    const newEv: TrainingEvent = { ...event, id: `tr-${Date.now()}` };
    setTrainingEvents((prev) => [newEv, ...prev]);
    recordAudit('MISSION_MODIFY', `Scheduled training event: "${event.title}".`);
  };

  const completeTrainingEvent = (id: string, score: number) => {
    setTrainingEvents((prev) =>
      prev.map((tr) => (tr.id === id ? { ...tr, status: 'COMPLETED', qualificationRate: score } : tr))
    );
    recordAudit('MISSION_MODIFY', `Training event ${id} completed with qualification rate ${score}%.`);
  };

  const updateMapMarkerPosition = (id: string, x: number, y: number) => {
    setMapMarkers((prev) =>
      prev.map((mk) => (mk.id === id ? { ...mk, x, y } : mk))
    );
  };

  const addMapMarker = (marker: Omit<MapMarker, 'id'>) => {
    const newMarker: MapMarker = { ...marker, id: `mk-${Date.now()}` };
    setMapMarkers((prev) => [...prev, newMarker]);
    recordAudit('MISSION_MODIFY', `Added tactical marker ${marker.name} at coordinates (${marker.x}%, ${marker.y}%).`);
  };

  const toggleSimulationClock = () => {
    setSimulationClockRunning((c) => !c);
  };

  const submitSitrep = (sitrep: Omit<SituationReport, 'id' | 'timestamp'>) => {
    const newSitrep: SituationReport = {
      ...sitrep,
      id: `sitrep-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' Local',
    };
    setSitreps((prev) => [newSitrep, ...prev]);
    recordAudit('REPORT_SUBMIT', `Submitted ${sitrep.reportNumber} for ${sitrep.unit}.`);
  };

  const submitAar = (aar: Omit<AfterActionReport, 'id'>) => {
    const newAar: AfterActionReport = {
      ...aar,
      id: `aar-${Date.now()}`,
    };
    setAars((prev) => [newAar, ...prev]);
    recordAudit('REPORT_SUBMIT', `Published After-Action Report for ${aar.codename} (Rating: ${aar.overallRating}).`);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((al) => (al.id === id ? { ...al, acknowledged: true } : al))
    );
  };

  const addAlert = (alert: Omit<TacticalAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: TacticalAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      timestamp: 'Just now',
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const syncWithHQ = async () => {
    setIsSyncing(true);
    // Simulate tactical satellite burst handshake
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setPendingSyncCount(0);
    setIsSyncing(false);
    setLastSyncedAt(new Date().toLocaleTimeString());
    recordAudit('EXPORT', 'Successfully synchronized local tactical datastore with Headquarters Command Network.');
  };

  const resetToInitialData = () => {
    setExercises(INITIAL_EXERCISES);
    setSelectedExerciseId(INITIAL_EXERCISES[0].id);
    setPersonnel(INITIAL_PERSONNEL);
    setConvoys(INITIAL_CONVOYS);
    setEquipment(INITIAL_EQUIPMENT);
    setTrainingEvents(INITIAL_TRAINING_EVENTS);
    setMapMarkers(INITIAL_MAP_MARKERS);
    setSitreps(INITIAL_SITREPS);
    setAars(INITIAL_AARS);
    setAlerts(INITIAL_ALERTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
    recordAudit('OVERRIDE_SECURITY', 'Master reset: Restored baseline training exercise simulation parameters.');
  };

  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId) || exercises[0] || null;

  return (
    <TacticalContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        canPerform,
        exercises,
        selectedExercise,
        setSelectedExerciseId,
        personnel,
        convoys,
        equipment,
        trainingEvents,
        mapMarkers,
        sitreps,
        aars,
        alerts,
        auditLogs,
        createExercise,
        updateExerciseStatus,
        addObjectiveToExercise,
        updateObjectiveStatus,
        advanceExercisePhase,
        adoptAiPlan,
        addPersonnel,
        updatePersonnelReadiness,
        dispatchConvoy,
        updateConvoyStatus,
        updateEquipmentStatus,
        addTrainingEvent,
        completeTrainingEvent,
        updateMapMarkerPosition,
        addMapMarker,
        simulationClockRunning,
        toggleSimulationClock,
        submitSitrep,
        submitAar,
        acknowledgeAlert,
        addAlert,
        isOnline,
        pendingSyncCount,
        syncWithHQ,
        isSyncing,
        lastSyncedAt,
        resetToInitialData,
      }}
    >
      {children}
    </TacticalContext.Provider>
  );
};

export const useTactical = () => {
  const context = useContext(TacticalContext);
  if (!context) {
    throw new Error('useTactical must be used within a TacticalProvider');
  }
  return context;
};
