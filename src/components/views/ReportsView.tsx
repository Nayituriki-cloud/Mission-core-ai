import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { SituationReport, AfterActionReport } from '../../types/tactical';
import {
  FileText,
  Printer,
  Plus,
  Award,
  CheckCircle,
  Clock,
  Shield,
  FileCheck,
  MapPin,
  Send
} from 'lucide-react';

interface ReportsViewProps {
  onPrintReport: (report: { type: 'SITREP' | 'AAR'; data: SituationReport | AfterActionReport }) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onPrintReport }) => {
  const { sitreps, aars, submitSitrep, submitAar, canPerform, selectedExercise, currentUser } = useTactical();

  const [activeReportTab, setActiveReportTab] = useState<'SITREP' | 'AAR'>('SITREP');
  const [showNewSitrepModal, setShowNewSitrepModal] = useState<boolean>(false);
  const [showNewAarModal, setShowNewAarModal] = useState<boolean>(false);

  // New SITREP Form
  const [sitrepNum, setSitrepNum] = useState<string>(`SITREP-0${sitreps.length + 1}`);
  const [gridLoc, setGridLoc] = useState<string>(selectedExercise?.gridCoordinates || '32UND 8472 9134');
  const [unit, setUnit] = useState<string>(selectedExercise?.title ? `${selectedExercise.echelon} TOC` : 'Battalion TOC');
  const [situation, setSituation] = useState<string>('');
  const [friendly, setFriendly] = useState<string>('');
  const [logistics, setLogistics] = useState<string>('');
  const [obstacles, setObstacles] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');

  // New AAR Form
  const [aarCodename, setAarCodename] = useState<string>(selectedExercise?.codename || 'EXERCISE DEFENSE');
  const [rating, setRating] = useState<AfterActionReport['overallRating']>('MET_STANDARD');
  const [gainScore, setGainScore] = useState<number>(12.5);
  const [successes, setSuccesses] = useState<string>('Achieved 100% communications uptime; Convoy delivered fuel on time.');
  const [lessons, setLessons] = useState<string>('Electronic jamming created 10-minute voice net lag before HF handover.');
  const [logisticsNotes, setLogisticsNotes] = useState<string>('Fuel burn matched calculated projections within 4%.');
  const [safetyNotes, setSafetyNotes] = useState<string>('Zero reportable injuries. 100% hearing and laser safety compliance.');
  const [recs, setRecs] = useState<string>('Standardize HF backup frequencies for all platoon-level radios.');

  const handleSitrepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation) return;

    submitSitrep({
      reportNumber: sitrepNum,
      authorRank: currentUser.rank,
      authorName: currentUser.name,
      unit,
      gridLocation: gridLoc,
      currentSituation: situation,
      friendlyForcesStatus: friendly || 'All units in designated defensive assembly areas. Zero equipment losses.',
      logisticsStatus: logistics || 'Class I (Rations) and Class III (Fuel) reserves stable. Supply convoys transiting.',
      obstaclesChallenges: obstacles || 'Simulated bridge demolition drill pending evaluation.',
      commanderAssessment: assessment || 'Training standards achieved. Mission ready for next phase execution.',
      status: 'TRANSMITTED'
    });

    setShowNewSitrepModal(false);
    setSituation('');
  };

  const handleAarSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitAar({
      exerciseId: selectedExercise?.id || 'ex-general',
      codename: aarCodename,
      completionDate: new Date().toISOString().substring(0, 10),
      leadEvaluator: `${currentUser.rank} ${currentUser.name}`,
      overallRating: rating,
      readinessGainScore: gainScore,
      keySuccesses: successes.split(';').map((s) => s.trim()).filter(Boolean),
      lessonsLearned: lessons.split(';').map((s) => s.trim()).filter(Boolean),
      logisticsVarianceNotes: logisticsNotes,
      safetyRecord: safetyNotes,
      recommendations: recs.split(';').map((s) => s.trim()).filter(Boolean)
    });

    setShowNewAarModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle & New Report Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center p-1 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setActiveReportTab('SITREP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeReportTab === 'SITREP'
                ? 'bg-zinc-800 text-amber-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>SITUATION REPORTS (SITREP)</span>
            <span className="text-[10px] text-zinc-500">({sitreps.length})</span>
          </button>

          <button
            onClick={() => setActiveReportTab('AAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeReportTab === 'AAR'
                ? 'bg-zinc-800 text-emerald-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>AFTER-ACTION REVIEWS (AAR)</span>
            <span className="text-[10px] text-zinc-500">({aars.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeReportTab === 'SITREP' && canPerform('SUBMIT_SITREP') && (
            <button
              onClick={() => setShowNewSitrepModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>DRAFT SITREP</span>
            </button>
          )}

          {activeReportTab === 'AAR' && canPerform('SUBMIT_AAR') && (
            <button
              onClick={() => setShowNewAarModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>PUBLISH AAR</span>
            </button>
          )}
        </div>
      </div>

      {/* SITREP List */}
      {activeReportTab === 'SITREP' && (
        <div className="space-y-4">
          {sitreps.map((sitrep) => (
            <div
              key={sitrep.id}
              className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-4 shadow-sm"
            >
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-sm">{sitrep.reportNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      {sitrep.status}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5 font-sans">
                    Reporting Unit: <strong>{sitrep.unit}</strong> · Location: <em>{sitrep.gridLocation}</em>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px] text-zinc-400">
                    <div>DTG: {sitrep.timestamp}</div>
                    <div>By: {sitrep.authorRank} {sitrep.authorName}</div>
                  </div>

                  <button
                    onClick={() => onPrintReport({ type: 'SITREP', data: sitrep })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px]"
                    title="Generate printable PDF formatted report"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>PRINT / PDF</span>
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-zinc-400 text-[10px] font-bold block mb-1 uppercase">
                    1. Current Tactical Situation:
                  </span>
                  <p className="text-zinc-200 leading-relaxed">{sitrep.currentSituation}</p>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-zinc-400 text-[10px] font-bold block mb-1 uppercase">
                    2. Friendly Forces Status:
                  </span>
                  <p className="text-zinc-200 leading-relaxed">{sitrep.friendlyForcesStatus}</p>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-zinc-400 text-[10px] font-bold block mb-1 uppercase">
                    3. Logistics & Sustainment Status:
                  </span>
                  <p className="text-zinc-200 leading-relaxed">{sitrep.logisticsStatus}</p>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-zinc-400 text-[10px] font-bold block mb-1 uppercase">
                    4. Obstacles, Hazards & Challenges:
                  </span>
                  <p className="text-zinc-200 leading-relaxed">{sitrep.obstaclesChallenges}</p>
                </div>
              </div>

              {/* Commander Assessment */}
              <div className="p-3 rounded bg-zinc-950 border-l-2 border-amber-500 font-sans">
                <span className="font-mono text-amber-400 text-[10px] font-bold block mb-1 uppercase">
                  5. Commander / Staff Assessment & Directive:
                </span>
                <p className="text-zinc-200 italic leading-relaxed">{sitrep.commanderAssessment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AAR List */}
      {activeReportTab === 'AAR' && (
        <div className="space-y-4">
          {aars.map((aar) => (
            <div
              key={aar.id}
              className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 text-sm">AFTER-ACTION REPORT: {aar.codename}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      {aar.overallRating.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5 font-sans">
                    Evaluator: <strong>{aar.leadEvaluator}</strong> · Date: <em>{aar.completionDate}</em>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px] text-zinc-400 font-mono">
                    <div>READINESS GAIN</div>
                    <div className="text-emerald-400 font-bold">+{aar.readinessGainScore}% Combat Index</div>
                  </div>

                  <button
                    onClick={() => onPrintReport({ type: 'AAR', data: aar })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px]"
                    title="Generate printable PDF formatted report"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PRINT / PDF</span>
                  </button>
                </div>
              </div>

              {/* Successes and Lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-emerald-400 text-[10px] font-bold block mb-1 uppercase">
                    Key Operational Successes:
                  </span>
                  <ul className="space-y-1 text-zinc-300">
                    {aar.keySuccesses.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-amber-400 text-[10px] font-bold block mb-1 uppercase">
                    Identified Lessons Learned:
                  </span>
                  <ul className="space-y-1 text-zinc-300">
                    {aar.lessonsLearned.map((l, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-mono font-bold shrink-0 mt-0.5">·</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-zinc-400 text-[10px] font-bold block mb-1 uppercase">
                    Logistics Variance & Burn Rates:
                  </span>
                  <p className="text-zinc-300">{aar.logisticsVarianceNotes}</p>
                </div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="font-mono text-zinc-400 text-[10px] font-bold block mb-1 uppercase">
                    Safety & Injury Audit:
                  </span>
                  <p className="text-zinc-300">{aar.safetyRecord}</p>
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-950 border-l-2 border-emerald-500 font-sans">
                <span className="font-mono text-emerald-400 text-[10px] font-bold block mb-1 uppercase">
                  Doctrinal Recommendations for Future Exercises:
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {aar.recommendations.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono font-bold mt-0.5">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New SITREP Modal */}
      {showNewSitrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                TRANSMIT SITUATION REPORT (SITREP)
              </span>
              <button onClick={() => setShowNewSitrepModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSitrepSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">REPORT DESIGNATION</label>
                  <input
                    type="text"
                    required
                    value={sitrepNum}
                    onChange={(e) => setSitrepNum(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-amber-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">GRID COORDINATES (MGRS)</label>
                  <input
                    type="text"
                    value={gridLoc}
                    onChange={(e) => setGridLoc(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">REPORTING UNIT</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">1. CURRENT SITUATION (TACTICAL)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Phase line progress, security perimeter status, comms health..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">2. FRIENDLY FORCES STATUS</label>
                <textarea
                  rows={2}
                  placeholder="Personnel readiness, combat power, casualties simulated..."
                  value={friendly}
                  onChange={(e) => setFriendly(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">3. LOGISTICS & SUSTAINMENT</label>
                <textarea
                  rows={2}
                  placeholder="Fuel reserves, ration supplies, convoy progress..."
                  value={logistics}
                  onChange={(e) => setLogistics(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">4. OBSTACLES & HAZARDS</label>
                <textarea
                  rows={2}
                  placeholder="Road conditions, weather shifts, simulated enemy probes..."
                  value={obstacles}
                  onChange={(e) => setObstacles(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">5. COMMANDER'S ASSESSMENT</label>
                <textarea
                  rows={2}
                  placeholder="Directives for the next 12 hours..."
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewSitrepModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT SITREP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New AAR Modal */}
      {showNewAarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                PUBLISH AFTER-ACTION REVIEW (AAR)
              </span>
              <button onClick={() => setShowNewAarModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAarSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">EXERCISE CODENAME</label>
                  <input
                    type="text"
                    required
                    value={aarCodename}
                    onChange={(e) => setAarCodename(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-emerald-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">OVERALL PERFORMANCE RATING</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as AfterActionReport['overallRating'])}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="EXCEEDED_STANDARD">EXCEEDED STANDARD</option>
                    <option value="MET_STANDARD">MET STANDARD</option>
                    <option value="MARGINAL">MARGINAL</option>
                    <option value="BELOW_STANDARD">BELOW STANDARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  KEY SUCCESSES (SEPARATE WITH SEMICOLONS ;)
                </label>
                <textarea
                  rows={2}
                  value={successes}
                  onChange={(e) => setSuccesses(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  LESSONS LEARNED (SEPARATE WITH SEMICOLONS ;)
                </label>
                <textarea
                  rows={2}
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">LOGISTICS & FUEL BURN VARIANCE</label>
                <input
                  type="text"
                  value={logisticsNotes}
                  onChange={(e) => setLogisticsNotes(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">SAFETY & INJURY RECORD</label>
                <input
                  type="text"
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  DOCTRINAL RECOMMENDATIONS (SEPARATE WITH SEMICOLONS ;)
                </label>
                <textarea
                  rows={2}
                  value={recs}
                  onChange={(e) => setRecs(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewAarModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  PUBLISH AAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
