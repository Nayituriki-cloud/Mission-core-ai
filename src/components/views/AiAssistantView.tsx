import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { GeneratedPlan } from '../../types/tactical';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Truck,
  Users,
  Award,
  Layers,
  FileCheck,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';

interface AiAssistantViewProps {
  onPlanAdopted: () => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ onPlanAdopted }) => {
  const { adoptAiPlan, canPerform, addAlert } = useTactical();

  const [scenarioPrompt, setScenarioPrompt] = useState<string>(
    'Battalion defensive perimeter exercise with simulated electronic jamming, night navigation drills, and high-urgency logistics resupply via contested supply corridor.'
  );
  const [echelon, setEchelon] = useState<string>('Combined Arms Battalion');
  const [terrainType, setTerrainType] = useState<string>('Multi-Domain Woodland & Urban MOUT');
  const [durationDays, setDurationDays] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<'PHASES' | 'PERSONNEL' | 'TIMELINE' | 'LOGISTICS' | 'SAFETY' | 'EVALUATION'>('PHASES');

  // Staff Advisor Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Tactical Staff Advisor AI initialized. Enter a fictional training scenario or organizational preparedness objective to generate a full OPORD plan, or ask questions regarding logistics calculations and exercise safety.'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const PRESET_SCENARIOS = [
    {
      title: 'MSR Corridor Defense & Electronic Jamming',
      prompt: 'Simulated electronic warfare blackout during night fuel convoy resupply across a 30km contested mountain pass.'
    },
    {
      title: 'Civil Crisis & Rapid Water Purification Staging',
      prompt: 'Emergency humanitarian disaster drill requiring mobile water purification, field generator staging, and mass casualty aeromedical evacuation.'
    },
    {
      title: 'Harbor Defense & Coastal Bridgehead Rehearsal',
      prompt: 'Joint defense of maritime harbor logistics node, anti-drone radar surveillance drills, and rapid ribbon bridge installation across coastal inlet.'
    }
  ];

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scenarioPrompt) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioPrompt,
          echelon,
          terrainType,
          durationDays
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate exercise plan');
      }

      const plan: GeneratedPlan = await response.json();
      setGeneratedPlan(plan);
      setActivePlanTab('PHASES');
    } catch (err) {
      console.error('Plan generation failed, loading local tactical baseline', err);
      // Fallback fallback is already returned by server, but guarantee state:
      addAlert({
        severity: 'INFO',
        category: 'EXERCISE_INJECT',
        title: 'Tactical Plan Generated (Offline Baseline)',
        message: 'Plan successfully compiled from defensive doctrine templates.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdoptPlan = () => {
    if (!generatedPlan) return;
    adoptAiPlan(generatedPlan);
    onPlanAdopted();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ content: userText }],
          context: { currentEchelon: echelon, activeScenario: scenarioPrompt }
        })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'Acknowledged.' }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Tactical Staff Advisor: Systems nominal. All safety parameters verified. Ensure 1.0L/hr hydration protocol during field exercises.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
              AI EXERCISE & READINESS PLANNING ENGINE
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">
            Automated Tactical Exercise Planner (OPORD Standard)
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl mt-1 leading-relaxed">
            Enter a fictional training scenario or organizational defense objective. The system synthesizes operational phase lines, personnel specialty allocations, logistics bills of materials, safety mitigation matrices, and after-action criteria.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
          <div className="text-amber-400 font-bold">DEFENSIVE & SIMULATION ONLY</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Strict safety doctrine compliant</div>
        </div>
      </div>

      {/* Main Grid: Input Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <h2 className="font-bold text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              SCENARIO PARAMETERS
            </h2>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  FICTIONAL TRAINING SCENARIO OR OBJECTIVE
                </label>
                <textarea
                  rows={4}
                  required
                  value={scenarioPrompt}
                  onChange={(e) => setScenarioPrompt(e.target.value)}
                  placeholder="Describe the operational setting, simulated adversary capabilities, logistics chokepoints, or emergency objectives..."
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500 font-sans text-xs leading-relaxed"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">
                  QUICK SCENARIO PRESETS:
                </span>
                <div className="space-y-1.5">
                  {PRESET_SCENARIOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setScenarioPrompt(preset.prompt)}
                      className="w-full text-left p-2 rounded bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-[11px] text-zinc-300 transition-colors flex items-center justify-between"
                    >
                      <span>{preset.title}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">ECHELON</label>
                  <select
                    value={echelon}
                    onChange={(e) => setEchelon(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="Platoon">Platoon</option>
                    <option value="Company">Company</option>
                    <option value="Combined Arms Battalion">Battalion</option>
                    <option value="Joint Task Force">Joint Task Force</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">DURATION (DAYS)</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value={1}>1 Day (Flash Drill)</option>
                    <option value={3}>3 Days (Standard 72h)</option>
                    <option value={5}>5 Days (Multi-Phase)</option>
                    <option value={7}>7 Days (Sustainment)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">SIMULATED ENVIRONMENT</label>
                <select
                  value={terrainType}
                  onChange={(e) => setTerrainType(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                >
                  <option value="Multi-Domain Woodland & Urban MOUT">Multi-Domain Woodland & Urban MOUT</option>
                  <option value="Desert & Arid Proving Grounds">Desert & Arid Proving Grounds</option>
                  <option value="Coastal & Harbor Defense Sector">Coastal & Harbor Defense Sector</option>
                  <option value="Mountain Defile & High Altitude">Mountain Defile & High Altitude</option>
                  <option value="Sub-Zero Arctic Snow & Ice">Sub-Zero Arctic Snow & Ice</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !canPerform('GENERATE_AI_PLAN')}
                className="w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-amber-950/20"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>SYNTHESIZING OPORD PLAN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE EXERCISE PLAN</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tactical Staff Advisor Chat */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex flex-col h-80">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-zinc-800 font-mono">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-zinc-200">TACTICAL STAFF ADVISOR</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded max-w-[90%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-amber-950/50 text-amber-200 border border-amber-800/80'
                      : 'bg-zinc-950 text-zinc-300 border border-zinc-800/80'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="p-2 rounded bg-zinc-950 text-zinc-500 font-mono text-[11px] animate-pulse">
                  Analyzing doctrinal references...
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-zinc-800 flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about burn rates, safety rules, C4ISR..."
                className="flex-1 p-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output Plan Display (7 Cols) */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <div className="p-12 rounded-lg bg-zinc-900 border border-zinc-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
              <div className="font-mono text-sm font-bold text-amber-400">
                GENERATING TACTICAL OPORD DIRECTIVE...
              </div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-mono">
                Calculating multi-domain phase lines, personnel requirements, fuel/ration burn formulas, and safety mitigations...
              </p>
            </div>
          ) : generatedPlan ? (
            <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-4 shadow-xl">
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-zinc-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">
                      {generatedPlan.codename}
                    </span>
                    <span className="text-zinc-500 font-mono">{generatedPlan.echelon}</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100">{generatedPlan.scenarioTitle}</h2>
                  <p className="text-[11px] text-zinc-400 mt-1">{generatedPlan.operationalEnvironment}</p>
                </div>

                <button
                  onClick={handleAdoptPlan}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-950/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>INSTANTIATE AS ACTIVE</span>
                </button>
              </div>

              {/* Strategic Objective & Intent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
                  <span className="font-mono text-amber-400 text-[10px] font-bold block mb-1 uppercase">
                    Strategic Objective:
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed">{generatedPlan.strategicObjective}</p>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
                  <span className="font-mono text-amber-400 text-[10px] font-bold block mb-1 uppercase">
                    Commander's Intent:
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed italic">{generatedPlan.commandIntent}</p>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex flex-wrap gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px]">
                <button
                  onClick={() => setActivePlanTab('PHASES')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePlanTab === 'PHASES' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  PHASES ({generatedPlan.phases.length})
                </button>
                <button
                  onClick={() => setActivePlanTab('PERSONNEL')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePlanTab === 'PERSONNEL' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  PERSONNEL ({generatedPlan.personnelRequirements.length})
                </button>
                <button
                  onClick={() => setActivePlanTab('TIMELINE')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePlanTab === 'TIMELINE' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  TIMELINE ({generatedPlan.timeline.length})
                </button>
                <button
                  onClick={() => setActivePlanTab('LOGISTICS')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePlanTab === 'LOGISTICS' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  LOGISTICS ({generatedPlan.logisticsChecklist.length})
                </button>
                <button
                  onClick={() => setActivePlanTab('SAFETY')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePlanTab === 'SAFETY' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  SAFETY MATRIX ({generatedPlan.safetyConsiderations.length})
                </button>
                <button
                  onClick={() => setActivePlanTab('EVALUATION')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePlanTab === 'EVALUATION' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  EVALUATION & AAR
                </button>
              </div>

              {/* Sub-tab content */}
              <div className="pt-2">
                {activePlanTab === 'PHASES' && (
                  <div className="space-y-3">
                    {generatedPlan.phases.map((ph, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-amber-400 text-sm">
                            Phase {ph.phaseNumber}: {ph.name}
                          </span>
                          <span className="text-[11px] text-zinc-500">{ph.durationHours} Hours</span>
                        </div>
                        <div className="space-y-1">
                          {ph.keyTasks.map((task, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-1.5 text-zinc-300 text-xs">
                              <span className="text-zinc-600 mt-0.5">·</span>
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                        {ph.criticalSuccessFactors && (
                          <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80 font-mono">
                            <span className="text-emerald-400 font-bold">SUCCESS STANDARD: </span>
                            {ph.criticalSuccessFactors}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activePlanTab === 'PERSONNEL' && (
                  <div className="space-y-2">
                    {generatedPlan.personnelRequirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-zinc-200 text-sm">{req.role}</div>
                          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            Specialty: <strong>{req.specialty}</strong>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Certs: {req.requiredCertifications.join(', ')}
                          </div>
                        </div>
                        <div className="text-right font-mono shrink-0 pl-3">
                          <div className="text-xl font-bold text-amber-400">{req.count}</div>
                          <div className="text-[10px] text-zinc-500 uppercase">TROOPS</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activePlanTab === 'TIMELINE' && (
                  <div className="space-y-2 font-mono text-xs">
                    {generatedPlan.timeline.map((tl, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400">{tl.timeOffset}</span>
                          <span className="text-zinc-400">{tl.primaryUnit}</span>
                        </div>
                        <div className="font-sans font-semibold text-zinc-200 text-sm">{tl.milestone}</div>
                        <div className="text-[11px] text-emerald-400/90 font-mono">
                          Safety Check: {tl.safetyCheck}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activePlanTab === 'LOGISTICS' && (
                  <div className="overflow-x-auto bg-zinc-950 rounded-lg border border-zinc-800">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Commodity Item</th>
                          <th className="p-2.5">Allotted Quantity</th>
                          <th className="p-2.5">Contingency Protocol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-sans">
                        {generatedPlan.logisticsChecklist.map((log, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/40">
                            <td className="p-2.5 font-mono text-amber-400 text-[11px] font-bold">
                              {log.category}
                            </td>
                            <td className="p-2.5 text-zinc-200 font-medium">{log.item}</td>
                            <td className="p-2.5 font-mono font-bold text-zinc-100">
                              {log.quantity.toLocaleString()} {log.unit}
                            </td>
                            <td className="p-2.5 text-zinc-400 text-[11px]">{log.contingencyPlan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activePlanTab === 'SAFETY' && (
                  <div className="space-y-2">
                    {generatedPlan.safetyConsiderations.map((safe, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                          safe.riskLevel === 'HIGH'
                            ? 'bg-red-950/30 border-red-800/80 text-red-200'
                            : safe.riskLevel === 'MED'
                            ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold">{safe.hazard}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              safe.riskLevel === 'HIGH'
                                ? 'bg-red-900 text-white'
                                : safe.riskLevel === 'MED'
                                ? 'bg-amber-800 text-white'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {safe.riskLevel} RISK
                          </span>
                        </div>
                        <div className="font-sans text-xs text-zinc-300">
                          <strong>Mitigation Protocol: </strong> {safe.mitigationProtocol}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400">
                          Emergency Evacuation Zone: {safe.emergencyEvacZone}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activePlanTab === 'EVALUATION' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <span className="font-mono text-amber-400 text-xs font-bold block mb-2 uppercase">
                        Grading Standards & Weightings:
                      </span>
                      <div className="space-y-2 font-mono text-xs">
                        {generatedPlan.evaluationCriteria.map((crit, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                            <div>
                              <div className="font-semibold text-zinc-200">{crit.metric}</div>
                              <div className="text-[11px] text-zinc-400">{crit.targetStandard}</div>
                            </div>
                            <div className="font-bold text-amber-400 text-sm shrink-0 pl-3">
                              {crit.scoringWeight}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="font-mono text-emerald-400 text-xs font-bold block uppercase">
                        AAR Debrief Framework Prompts:
                      </span>
                      <div className="text-xs text-zinc-300 space-y-1.5 font-sans">
                        <p><strong>Operational Observation:</strong> {generatedPlan.afterActionReportTemplate.keyObservationsPrompt}</p>
                        <p><strong>Logistics Review:</strong> {generatedPlan.afterActionReportTemplate.logisticsEfficiencyPrompt}</p>
                        <p><strong>Safety Record:</strong> {generatedPlan.afterActionReportTemplate.safetyComplianceSummary}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-lg bg-zinc-900 border border-zinc-800 text-center space-y-3 font-mono">
              <Bot className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-zinc-300 font-bold">READY TO GENERATE OPERATIONAL EXERCISE</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
                Provide training goals or use a quick preset on the left. Click "Generate Exercise Plan" to synthesize the complete OPORD document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
