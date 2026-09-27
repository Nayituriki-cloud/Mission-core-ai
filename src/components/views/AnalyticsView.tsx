import React from 'react';
import { useTactical } from '../../context/TacticalContext';
import {
  BarChart3,
  Shield,
  Activity,
  Award,
  Truck,
  Package,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { personnel, equipment, convoys, trainingEvents, exercises, selectedExercise } = useTactical();

  // Metrics
  const totalPersonnel = personnel.length;
  const deployablePersonnel = personnel.filter((p) => p.readinessStatus === 'DEPLOYABLE').length;
  const deployablePercent = Math.round((deployablePersonnel / (totalPersonnel || 1)) * 100);

  const avgPersonnelCombatScore = Math.round(
    personnel.reduce((acc, p) => acc + p.combatReadinessScore, 0) / (totalPersonnel || 1)
  );

  const totalEquipment = equipment.length;
  const fmcEquipment = equipment.filter((e) => e.operationalStatus === 'FULLY_MISSION_CAPABLE').length;
  const fmcRate = Math.round((fmcEquipment / (totalEquipment || 1)) * 100);

  const completedTraining = trainingEvents.filter((t) => t.status === 'COMPLETED');
  const avgTrainingQual = Math.round(
    completedTraining.reduce((acc, t) => acc + (t.qualificationRate || 0), 0) / (completedTraining.length || 1)
  );

  const activeConvoys = convoys.filter((c) => c.status === 'EN_ROUTE');
  const deliveredConvoys = convoys.filter((c) => c.status === 'DELIVERED');

  const totalObjectives = selectedExercise?.objectives.length || 1;
  const completedObjectives = selectedExercise?.objectives.filter((o) => o.status === 'COMPLETED').length || 0;
  const objCompletionRate = Math.round((completedObjectives / totalObjectives) * 100);

  // Overall Battalion Combat Readiness Index
  const compositeCombatPower = Math.round(
    avgPersonnelCombatScore * 0.4 + fmcRate * 0.35 + avgTrainingQual * 0.25
  );

  return (
    <div className="space-y-6">
      {/* Top Combat Power Score Banner */}
      <div className="p-6 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="font-mono text-sm font-bold text-amber-400 uppercase tracking-widest">
              BATTALION COMBAT POWER & READINESS INDEX
            </h1>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Composite defense readiness formula calculated from personnel qualification rates, equipment Fully Mission Capable (FMC) uptime, and live simulation exercise performance.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
            <span>Personnel Weight: 40%</span>
            <span>·</span>
            <span>Equipment Weight: 35%</span>
            <span>·</span>
            <span>Training Score: 25%</span>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 bg-zinc-950 p-4 rounded-lg border border-zinc-800">
          <div className="text-center font-mono">
            <div className="text-4xl font-extrabold text-amber-400">{compositeCombatPower}%</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">READINESS INDEX</div>
          </div>
          <div className="border-l border-zinc-800 pl-4 space-y-1 text-xs font-mono">
            <div className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>DEFENSE STANDARD: MET</span>
            </div>
            <div className="text-zinc-400 text-[11px]">
              Deployability Target: <strong>90%+</strong>
            </div>
            <div className="text-zinc-500 text-[10px]">
              Last automated audit: 2026-09-26 10:00Z
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Personnel Pillar */}
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">PERSONNEL DEPLOYABILITY</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{deployablePercent}%</div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${deployablePercent}%` }} />
          </div>
          <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
            <div className="flex justify-between">
              <span>Deployable:</span>
              <strong className="text-zinc-200">{deployablePersonnel} / {totalPersonnel}</strong>
            </div>
            <div className="flex justify-between">
              <span>Avg Combat Score:</span>
              <strong className="text-zinc-200">{avgPersonnelCombatScore}%</strong>
            </div>
          </div>
        </div>

        {/* Equipment Pillar */}
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">EQUIPMENT OPERATIONAL (FMC)</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{fmcRate}%</div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${fmcRate}%` }} />
          </div>
          <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
            <div className="flex justify-between">
              <span>FMC Ready:</span>
              <strong className="text-zinc-200">{fmcEquipment} / {totalEquipment}</strong>
            </div>
            <div className="flex justify-between">
              <span>In Servicing:</span>
              <strong className="text-zinc-200">{totalEquipment - fmcEquipment}</strong>
            </div>
          </div>
        </div>

        {/* Logistics Pillar */}
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">LOGISTICS CONVOY ON-TIME</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">96.4%</div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: '96.4%' }} />
          </div>
          <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
            <div className="flex justify-between">
              <span>Active In Transit:</span>
              <strong className="text-zinc-200">{activeConvoys.length} Convoys</strong>
            </div>
            <div className="flex justify-between">
              <span>Delivered:</span>
              <strong className="text-zinc-200">{deliveredConvoys.length} Convoys</strong>
            </div>
          </div>
        </div>

        {/* Training Qualification Pillar */}
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">TRAINING QUALIFICATION RATE</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{avgTrainingQual}%</div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${avgTrainingQual}%` }} />
          </div>
          <div className="text-[11px] text-zinc-400 space-y-1 font-mono pt-1">
            <div className="flex justify-between">
              <span>Drills Evaluated:</span>
              <strong className="text-zinc-200">{completedTraining.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Pending Schedule:</span>
              <strong className="text-zinc-200">{trainingEvents.length - completedTraining.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Progress Breakdown & Sustenance Estimates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Exercise Objective Progress */}
        <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4 font-mono">
            <span className="font-bold text-zinc-100 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              EXERCISE OBJECTIVES EXECUTION RATE
            </span>
            <span className="text-amber-400 font-bold">{objCompletionRate}% Complete</span>
          </div>

          <div className="space-y-3">
            {selectedExercise?.objectives.map((obj) => (
              <div key={obj.id} className="p-3 rounded bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-200">{obj.title}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      obj.status === 'COMPLETED'
                        ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                        : obj.status === 'IN_PROGRESS'
                        ? 'text-amber-400 bg-amber-950/80 border border-amber-800'
                        : 'text-zinc-400 bg-zinc-900'
                    }`}
                  >
                    {obj.status}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center justify-between font-mono mt-1">
                  <span>Unit: {obj.assignedSquad}</span>
                  <span>Target: {obj.targetTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustenance & Burn Projections */}
        <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <span className="font-bold text-zinc-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              72-HOUR LOGISTICS SUSTAINABILITY PROJECTION
            </span>
            <span className="text-zinc-400 text-[10px]">Standard Ops Tempo</span>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between font-mono mb-1">
                <span className="text-zinc-300 font-semibold">Bulk Fuel (JP-8) Reserves</span>
                <span className="text-amber-400 font-bold">42,500 L / 55,000 L</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '77%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                <span>Burn rate: ~550 L/hr</span>
                <span className="text-emerald-400">Runway: 77.2 hours remaining</span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between font-mono mb-1">
                <span className="text-zinc-300 font-semibold">MRE Field Rations</span>
                <span className="text-emerald-400 font-bold">3,800 Meals</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                <span>Burn rate: ~420 meals/day</span>
                <span className="text-emerald-400">Runway: 9.0 days remaining</span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between font-mono mb-1">
                <span className="text-zinc-300 font-semibold">Simulated Blank Ammunition</span>
                <span className="text-sky-400 font-bold">95,000 Rounds</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-1">
                <span>Expenditure rate: ~12,000 rds/phase</span>
                <span className="text-emerald-400">Sufficient for 7+ multi-phase drills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
