import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { Exercise, Objective } from '../../types/tactical';
import {
  Crosshair,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Radio,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface ActiveExercisesViewProps {
  onGoToAiAssistant: () => void;
  onGoToSimMap: () => void;
}

export const ActiveExercisesView: React.FC<ActiveExercisesViewProps> = ({
  onGoToAiAssistant,
  onGoToSimMap
}) => {
  const {
    exercises,
    selectedExercise,
    setSelectedExerciseId,
    updateExerciseStatus,
    addObjectiveToExercise,
    updateObjectiveStatus,
    advanceExercisePhase,
    createExercise,
    canPerform,
    addAlert
  } = useTactical();

  const [showNewMissionModal, setShowNewMissionModal] = useState<boolean>(false);
  const [showAddObjModal, setShowAddObjModal] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [isGeneratingInject, setIsGeneratingInject] = useState<boolean>(false);

  // New Mission form state
  const [newCodename, setNewCodename] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newEchelon, setNewEchelon] = useState<string>('Combined Arms Battalion');
  const [newLocation, setNewLocation] = useState<string>('Tactical Training Sector 4');
  const [newGrid, setNewGrid] = useState<string>('32UND 8910 9340');
  const [newIntent, setNewIntent] = useState<string>('');

  // New Objective form state
  const [objTitle, setObjTitle] = useState<string>('');
  const [objDesc, setObjDesc] = useState<string>('');
  const [objPriority, setObjPriority] = useState<Objective['priority']>('HIGH');
  const [objSquad, setObjSquad] = useState<string>('1st Platoon / Alpha Company');
  const [objTargetTime, setObjTargetTime] = useState<string>('D+1 16:00');

  const handleCreateMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodename || !newTitle) return;

    const mission: Exercise = {
      id: `ex-${Date.now()}`,
      codename: newCodename.toUpperCase().startsWith('EXERCISE') ? newCodename.toUpperCase() : `EXERCISE ${newCodename.toUpperCase()}`,
      title: newTitle,
      echelon: newEchelon,
      status: 'PLANNING',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
      location: newLocation,
      gridCoordinates: `MGRS ${newGrid}`,
      description: newIntent,
      commandIntent: newIntent || 'Execute structured defense and multi-unit logistics rehearsal under simulated operational conditions.',
      progressPercent: 0,
      currentPhaseIndex: 0,
      threatCondition: 'FPCON BRAVO',
      simulatedTimeRemaining: '72h 00m',
      phases: [
        {
          id: `ph-1-${Date.now()}`,
          phaseNumber: 1,
          name: 'Phase I: Staging, Secure Assembly & Communications Check',
          durationHours: 12,
          status: 'ACTIVE',
          tasks: ['Inspect weapons safety lockouts and MILES sensors', 'Establish satellite C4ISR terminal'],
          criticalSuccessFactors: 'Zero equipment discrepancies upon armory issue.'
        },
        {
          id: `ph-2-${Date.now()}`,
          phaseNumber: 2,
          name: 'Phase II: Tactical Maneuver & Contested Logistics Convoy',
          durationHours: 36,
          status: 'PENDING',
          tasks: ['Stage resupply convoy', 'Simulate electronic warfare jamming countermeasures'],
          criticalSuccessFactors: 'Sustain continuous defensive readiness without supply lapse.'
        }
      ],
      objectives: [
        {
          id: `obj-init-${Date.now()}`,
          title: 'Establish Tactical Operations Center (TOC)',
          description: 'Deploy primary command antenna mast and link with subordinate platoon radios.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignedSquad: 'Signal Detachment',
          targetTime: 'D-Day 06:00'
        }
      ],
      assignedUnits: ['1st Mechanized Platoon', 'Support Logistics Company', 'Signal Detachment']
    };

    createExercise(mission);
    setShowNewMissionModal(false);
    setNewCodename('');
    setNewTitle('');
    setNewIntent('');
  };

  const handleAddObjectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objTitle || !selectedExercise) return;

    addObjectiveToExercise(selectedExercise.id, {
      title: objTitle,
      description: objDesc,
      priority: objPriority,
      assignedSquad: objSquad,
      targetTime: objTargetTime,
      status: 'NOT_STARTED'
    });

    setShowAddObjModal(false);
    setObjTitle('');
    setObjDesc('');
  };

  const handleSimulateInject = async () => {
    if (!selectedExercise) return;
    setIsGeneratingInject(true);
    try {
      const activePhase = selectedExercise.phases[selectedExercise.currentPhaseIndex]?.name || 'Tactical Movement';
      const res = await fetch('/api/ai/generate-inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMission: selectedExercise.codename,
          phaseName: activePhase,
          difficulty: 'Moderate'
        })
      });
      const data = await res.json();
      addAlert({
        severity: data.urgency === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        category: 'EXERCISE_INJECT',
        title: `[INJECT] ${data.title}`,
        message: `${data.description} Operational Impact: ${data.impact} Recommendation: ${data.recommendedAction}`
      });
    } catch {
      addAlert({
        severity: 'WARNING',
        category: 'EXERCISE_INJECT',
        title: '[INJECT] Simulated Bridge Washout along MSR Bronze',
        message: 'Engineers report simulated roadblock at Grid 8412-9210. Convoy 1 rerouted through Route Ironwood (+30 min).'
      });
    } finally {
      setIsGeneratingInject(false);
    }
  };

  const filteredObjectives = selectedExercise?.objectives.filter((obj) => {
    if (priorityFilter === 'ALL') return true;
    return obj.priority === priorityFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Exercise Controls & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-mono text-zinc-400">SELECT EXERCISE:</label>
          <select
            value={selectedExercise?.id}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-amber-300 text-xs font-mono font-semibold py-1.5 px-3 rounded focus:outline-none focus:border-amber-500"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.codename} - [{ex.status}]
              </option>
            ))}
          </select>

          <span className="text-zinc-600 hidden sm:inline">|</span>

          {selectedExercise && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">STATUS:</span>
              <select
                value={selectedExercise.status}
                disabled={!canPerform('EDIT_MISSION')}
                onChange={(e) => updateExerciseStatus(selectedExercise.id, e.target.value as Exercise['status'])}
                className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono py-1 px-2 rounded focus:outline-none"
              >
                <option value="PLANNING">PLANNING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DEBRIEF">DEBRIEF</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateInject}
            disabled={isGeneratingInject || !canPerform('SIMULATE_INJECT')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/80 text-amber-300 transition-colors disabled:opacity-50"
            title="Inject unexpected exercise scenario to test unit reaction"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isGeneratingInject ? 'SIMULATING...' : 'TRIGGER INJECT'}</span>
          </button>

          <button
            onClick={onGoToAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/80 text-emerald-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI PLANNER</span>
          </button>

          <button
            onClick={() => setShowNewMissionModal(true)}
            disabled={!canPerform('CREATE_MISSION')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW MISSION</span>
          </button>
        </div>
      </div>

      {selectedExercise && (
        <>
          {/* Mission Executive Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">
                    {selectedExercise.codename}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">
                    {selectedExercise.echelon}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400 text-xs font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    {selectedExercise.gridCoordinates}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{selectedExercise.title}</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>

              {/* Progress and Threat Stats */}
              <div className="flex items-center gap-6 shrink-0 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 font-mono text-xs">
                <div>
                  <div className="text-zinc-500 text-[10px]">MISSION COMPLETION</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {selectedExercise.progressPercent}%
                  </div>
                  <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${selectedExercise.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="border-l border-zinc-800 pl-4">
                  <div className="text-zinc-500 text-[10px]">THREAT LEVEL</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {selectedExercise.threatCondition}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {selectedExercise.simulatedTimeRemaining}
                  </div>
                </div>

                <div className="border-l border-zinc-800 pl-4">
                  <button
                    onClick={onGoToSimMap}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <span>VIEW ON MAP</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Commander's Intent Box */}
            <div className="mt-4 p-3 rounded bg-zinc-950 border-l-2 border-amber-500 text-xs">
              <span className="font-mono font-bold text-amber-400 text-[11px] block mb-0.5">
                COMMANDER'S OPERATIONAL INTENT & END-STATE:
              </span>
              <p className="text-zinc-300 italic">{selectedExercise.commandIntent}</p>
            </div>
          </div>

          {/* Operational Phases Track */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <h2 className="font-mono text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  Operational Phase Lines & Synchronization
                </h2>
              </div>
              {canPerform('EDIT_MISSION') && (
                <button
                  onClick={() => advanceExercisePhase(selectedExercise.id)}
                  disabled={selectedExercise.currentPhaseIndex >= selectedExercise.phases.length - 1}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 text-amber-400" />
                  <span>ADVANCE PHASE</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedExercise.phases.map((phase, idx) => {
                const isActive = idx === selectedExercise.currentPhaseIndex;
                const isComplete = idx < selectedExercise.currentPhaseIndex || phase.status === 'COMPLETE';

                return (
                  <div
                    key={phase.id}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      isActive
                        ? 'bg-amber-950/30 border-amber-600/80 shadow-md shadow-amber-950/20'
                        : isComplete
                        ? 'bg-zinc-950 border-emerald-800/60 opacity-80'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                      <span className="font-bold">PHASE {phase.phaseNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] ${
                          isActive
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : isComplete
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {isActive ? 'CURRENT' : isComplete ? 'RESOLVED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="font-semibold text-zinc-100 mb-1 line-clamp-1">{phase.name}</div>
                    <div className="text-[10px] text-zinc-400 mb-2">Duration: {phase.durationHours} hrs</div>

                    <div className="space-y-1">
                      {phase.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                          <span className="text-zinc-600 mt-0.5">·</span>
                          <span className="line-clamp-2">{task}</span>
                        </div>
                      ))}
                    </div>

                    {phase.criticalSuccessFactors && (
                      <div className="mt-2 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                        <span className="text-amber-400/90 font-mono">CRITICAL: </span>
                        {phase.criticalSuccessFactors}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mission Objectives & Tasks List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="font-mono text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  Tactical Objectives & Assigned Units
                </h2>
                <span className="text-xs text-zinc-500 font-mono">({selectedExercise.objectives.length})</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Priority Filter */}
                <div className="flex items-center p-0.5 bg-zinc-950 rounded border border-zinc-800 font-mono text-[11px]">
                  {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        priorityFilter === p ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {canPerform('EDIT_MISSION') && (
                  <button
                    onClick={() => setShowAddObjModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ADD OBJECTIVE</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {filteredObjectives.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs font-mono">
                  No objectives matching the selected filter.
                </div>
              ) : (
                filteredObjectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-3.5 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                      obj.status === 'COMPLETED'
                        ? 'bg-zinc-950/70 border-emerald-900/50'
                        : obj.status === 'IN_PROGRESS'
                        ? 'bg-zinc-950 border-amber-800/60'
                        : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            obj.priority === 'HIGH'
                              ? 'bg-red-950/80 text-red-400 border border-red-800'
                              : obj.priority === 'MEDIUM'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                              : 'bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {obj.priority} PRIORITY
                        </span>
                        <span className="font-semibold text-zinc-100 text-sm">{obj.title}</span>
                      </div>
                      <p className="text-zinc-400 text-xs max-w-2xl">{obj.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-1">
                        <span>Unit: <strong className="text-zinc-300">{obj.assignedSquad}</strong></span>
                        <span>·</span>
                        <span>Target: <strong className="text-amber-400/90">{obj.targetTime}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={obj.status}
                        disabled={!canPerform('EDIT_MISSION')}
                        onChange={(e) =>
                          updateObjectiveStatus(selectedExercise.id, obj.id, e.target.value as Objective['status'])
                        }
                        className={`text-xs font-mono py-1 px-2.5 rounded border focus:outline-none ${
                          obj.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                            : obj.status === 'IN_PROGRESS'
                            ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                            : obj.status === 'DELAYED'
                            ? 'bg-red-950/60 border-red-700 text-red-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <option value="NOT_STARTED">NOT STARTED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="DELAYED">DELAYED</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* New Mission Creation Modal */}
      {showNewMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800 font-mono">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-400" />
                CREATE DEFENSE TRAINING EXERCISE
              </span>
              <button
                onClick={() => setShowNewMissionModal(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMissionSubmit} className="space-y-3 font-mono">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">CODENAME (e.g. TITAN SHIELD)</label>
                <input
                  type="text"
                  required
                  placeholder="EXERCISE GUARDIAN AEGIS"
                  value={newCodename}
                  onChange={(e) => setNewCodename(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">EXERCISE TITLE / DOCTRINE</label>
                <input
                  type="text"
                  required
                  placeholder="Battalion Perimeter Defense & Logistics Convoy Drill"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">ECHELON</label>
                  <select
                    value={newEchelon}
                    onChange={(e) => setNewEchelon(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="Platoon">Platoon (30-40 personnel)</option>
                    <option value="Company">Company (100-150 personnel)</option>
                    <option value="Combined Arms Battalion">Battalion (500-800 personnel)</option>
                    <option value="Brigade Combat Team">Brigade Combat Team (Joint)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">MGRS GRID COORDINATES</label>
                  <input
                    type="text"
                    value={newGrid}
                    onChange={(e) => setNewGrid(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">LOCATION / PROVING GROUNDS</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">COMMANDER'S INTENT & OBJECTIVES</label>
                <textarea
                  rows={3}
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value)}
                  placeholder="State the core defensive training objectives, safety standards, and end-state requirements..."
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewMissionModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
                >
                  INSTANTIATE MISSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Objective Modal */}
      {showAddObjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800 font-mono">
              <span className="font-bold text-sm text-zinc-100">ADD TACTICAL OBJECTIVE</span>
              <button onClick={() => setShowAddObjModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddObjectiveSubmit} className="space-y-3 font-mono">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">OBJECTIVE TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Secure MSR Bronze Checkpoint 2"
                  value={objTitle}
                  onChange={(e) => setObjTitle(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">DETAILS & CRITERIA</label>
                <textarea
                  rows={2}
                  placeholder="Specific task conditions and standards..."
                  value={objDesc}
                  onChange={(e) => setObjDesc(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">PRIORITY</label>
                  <select
                    value={objPriority}
                    onChange={(e) => setObjPriority(e.target.value as Objective['priority'])}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">TARGET TIMELINE</label>
                  <input
                    type="text"
                    value={objTargetTime}
                    onChange={(e) => setObjTargetTime(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">ASSIGNED SQUAD / UNIT</label>
                <input
                  type="text"
                  value={objSquad}
                  onChange={(e) => setObjSquad(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddObjModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  ASSIGN OBJECTIVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
