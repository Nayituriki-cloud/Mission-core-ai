import React, { useState } from 'react';
import { useMissions } from '../../context/MissionContext';
import { planMissionWithAi, chatWithAiOperations } from '../../services/geminiService';
import { AiPlanOutput, MissionCategory, MissionPriority } from '../../types/mission';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageSquare,
  Boxes,
  Flag,
  Clock,
  CheckSquare,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface AiPlannerViewProps {
  onPlanAdopted: (missionId: string) => void;
}

export const AiPlannerView: React.FC<AiPlannerViewProps> = ({ onPlanAdopted }) => {
  const { createMissionFromAiPlan, missions, hasPermission } = useMissions();

  const [prompt, setPrompt] = useState('');
  const [preferredCategory, setPreferredCategory] = useState<MissionCategory>('Field Operations');
  const [preferredPriority, setPreferredPriority] = useState<MissionPriority>('High');
  const [durationDays, setDurationDays] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AiPlanOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Chat advisory state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'MissionCore AI Tactical Advisory active. Ask for contingency advice, risk analysis, logistical equations, or SITREP drafting.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const samplePrompts = [
    'Establish emergency drinking water & medical distribution corridor for 2,000 displaced residents after flash flood.',
    'Deploy mountain seismic & landslide warning sensor grid with solar repeater mast in high-wind terrain.',
    'Conduct 48-hour blackstart simulation and hospital microgrid synchronization test without grid interruption.',
    'Execute 50-meter community wildfire brush fuel break sweep with 8 infrared ember detection nodes.',
  ];

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const plan = await planMissionWithAi(
        prompt.trim(),
        preferredCategory,
        preferredPriority,
        parseInt(durationDays, 10) || 7
      );
      setGeneratedPlan(plan);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate operational blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdoptPlan = () => {
    if (!generatedPlan) return;
    if (!hasPermission('create_mission')) {
      alert('Manager or Admin permissions required to initialize new missions.');
      return;
    }
    const mission = createMissionFromAiPlan(generatedPlan);
    onPlanAdopted(mission.id);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const apiMessages = chatMessages.concat({ role: 'user', text: userText }).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      // Pass current active missions context for situational awareness
      const summaryContext = missions.map((m) => ({
        code: m.code,
        title: m.title,
        status: m.status,
        priority: m.priority,
        location: m.location.name,
      }));

      const reply = await chatWithAiOperations(apiMessages, summaryContext);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Tactical channel error. Please retry or verify telemetry connection.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyBriefToClipboard = () => {
    if (!generatedPlan?.executiveBrief) return;
    navigator.clipboard.writeText(generatedPlan.executiveBrief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Safety Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Operational Intelligence Architecture</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            AI Mission Planner & Tactical Advisor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn strategic goals into staged milestones, granular tasks, checklists, resource allocations, and risk mitigations.
          </p>
        </div>

        {/* Ethical Safety Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Non-Autonomous / Humanitarian & Peaceful Operations Guardrails Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mission Architect Input & Generated Blueprint */}
        <div className="lg:col-span-2 space-y-5">
          {/* Objective Prompt Card */}
          <div className="p-4 sm:p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-1.5">
                  Natural Language Operational Goal
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your operational objective in natural language. For example: 'Deploy emergency food and potable water distribution for 1,500 flood victims in Sector 4 within 72 hours, including bridge safety inspection and volunteer coordination.'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              {/* Sample Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400">Quick Mission Templates:</span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="text-[11px] px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors text-left truncate max-w-xs"
                      title={s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operational Constraints */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Category</label>
                  <select
                    value={preferredCategory}
                    onChange={(e) => setPreferredCategory(e.target.value as MissionCategory)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  >
                    <option value="Field Operations">Field Operations</option>
                    <option value="Crisis Response">Crisis Response</option>
                    <option value="Emergency Preparedness">Emergency Preparedness</option>
                    <option value="Logistics & Supply">Logistics & Supply</option>
                    <option value="Infrastructure Resilience">Infrastructure Resilience</option>
                    <option value="Community Initiative">Community Initiative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Operational Priority</label>
                  <select
                    value={preferredPriority}
                    onChange={(e) => setPreferredPriority(e.target.value as MissionPriority)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  >
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-lg shadow-cyan-950/50 transition-all active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>Synthesizing Operational Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Generate Mission Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Plan Blueprint Output */}
          {generatedPlan && (
            <div className="p-5 rounded-lg bg-slate-900 border border-cyan-800/80 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header with 1-click Convert button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <span className="font-bold">PROPOSED BLUEPRINT</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">{generatedPlan.priority} Priority</span>
                    <span aria-hidden="true">·</span>
                    <span>{generatedPlan.estimatedDurationDays} Days Duration</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{generatedPlan.title}</h3>
                </div>

                <button
                  onClick={handleAdoptPlan}
                  className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-all active:scale-[0.98] shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deploy Plan as Live Mission</span>
                </button>
              </div>

              {/* Executive Strategic Brief */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span className="text-cyan-400 font-semibold uppercase">Executive Briefing</span>
                  <button
                    onClick={copyBriefToClipboard}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                  >
                    {copiedBrief ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBrief ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">{generatedPlan.executiveBrief}</p>
                <p className="text-slate-400 text-[11px] pt-1">
                  <span className="font-mono text-slate-400">Objective: </span>
                  {generatedPlan.objective}
                </p>
              </div>

              {/* Phased Milestones Grid */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-slate-200">
                  <Flag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Phased Milestones ({generatedPlan.milestones?.length || 0})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {generatedPlan.milestones?.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400">Phase {idx + 1} · Day +{m.dueDateOffsetDays}</div>
                      <div className="font-medium text-slate-200">{m.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Tasks with Checklists */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-slate-200">
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sequenced Tasks & Checklists ({generatedPlan.tasks?.length || 0})</span>
                </div>
                <div className="space-y-2">
                  {generatedPlan.tasks?.map((task, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-0.5">
                            <span className="text-cyan-400">{task.priority} Priority</span>
                            <span aria-hidden="true">·</span>
                            <span>{task.estimatedHours}h est</span>
                            <span aria-hidden="true">·</span>
                            <span>Due Day +{task.dueDateOffsetDays}</span>
                          </div>
                          <div className="font-semibold text-slate-200">{task.title}</div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{task.description}</p>
                        </div>
                      </div>

                      {task.checklist && task.checklist.length > 0 && (
                        <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400">
                          {task.checklist.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Resources & Logistics */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-slate-200">
                  <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Required Resources ({generatedPlan.requiredResources?.length || 0})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {generatedPlan.requiredResources?.map((res, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <div className="font-semibold text-slate-200">{res.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {res.needed} {res.unit} · {res.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Matrix & Mitigations */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-slate-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Identified Risks & Defensive Mitigations ({generatedPlan.risks?.length || 0})</span>
                </div>
                <div className="space-y-1.5">
                  {generatedPlan.risks?.map((risk, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex justify-between text-rose-300 font-medium">
                        <span>Risk: {risk.description}</span>
                        <span className="text-[10px] font-mono text-rose-400">{risk.impact} Impact</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 pl-3 border-l border-cyan-800">
                        <span className="text-cyan-400 font-mono">Mitigation: </span>
                        {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Compliance Statement */}
              {generatedPlan.safetyComplianceNote && (
                <div className="p-2.5 rounded bg-slate-950/80 border border-emerald-900/60 text-[11px] font-mono text-emerald-300/90 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{generatedPlan.safetyComplianceNote}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Tactical Operations Advisory Chat */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col h-[680px]">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Operations Advisory AI
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-950/60 border border-cyan-800/80 text-cyan-100 ml-4'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 mr-2'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 mb-1">
                    {msg.role === 'user' ? 'Operator Query' : 'Tactical Advisory'}
                  </div>
                  <div className="whitespace-pre-line text-xs">{msg.text}</div>
                </div>
              ))}
              {isChatLoading && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Evaluating operational telemetry...</span>
                </div>
              )}
            </div>

            {/* Suggested quick questions */}
            <div className="py-2 border-t border-slate-800 flex flex-wrap gap-1">
              {[
                'Draft a 48h emergency SITREP',
                'What are primary flash flood risks?',
                'Estimate water logistics formula',
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChatInput(q)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask advisory question or request SITREP..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
