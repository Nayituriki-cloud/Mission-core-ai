import React from 'react';
import { SituationReport, AfterActionReport } from '../../types/tactical';
import { Printer, Shield, CheckCircle } from 'lucide-react';

interface PrintReportModalProps {
  report: { type: 'SITREP' | 'AAR'; data: SituationReport | AfterActionReport } | null;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSitrep = report.type === 'SITREP';
  const sitrep = isSitrep ? (report.data as SituationReport) : null;
  const aar = !isSitrep ? (report.data as AfterActionReport) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-2xl text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800 shrink-0 print:hidden font-mono text-xs">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-zinc-100">
              DOCUMENT EXPORT & PRINT PREVIEW
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / SAVE AS PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* The Printable Tactical Document Area */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-8 rounded border border-zinc-800 font-sans print:bg-white print:text-black print:p-0 print:border-none">
          {/* Classification Banner Header */}
          <div className="text-center pb-4 border-b-2 border-amber-500/80 print:border-black">
            <div className="font-mono text-[10px] tracking-widest text-amber-400 uppercase font-bold print:text-zinc-600">
              UNCLASSIFIED // EXERCISE TRAINING USE ONLY // REL TO NATO/ALLIES
            </div>
            <div className="text-xl font-bold font-mono tracking-wider text-zinc-100 mt-1 print:text-black">
              HEADQUARTERS COMBINED ARMS DEFENSE TRAINING COMMAND
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5 print:text-zinc-600">
              JOINT FORCE EXERCISE & READINESS SYSTEM
            </div>
          </div>

          {/* SITREP Format */}
          {isSitrep && sitrep && (
            <div className="mt-6 space-y-5 text-xs">
              <div className="flex justify-between items-start font-mono pb-3 border-b border-zinc-800 print:border-zinc-300">
                <div>
                  <div className="text-base font-bold text-amber-400 print:text-black">
                    {sitrep.reportNumber}
                  </div>
                  <div className="text-zinc-400 print:text-zinc-700 mt-0.5">
                    REPORTING UNIT: <strong>{sitrep.unit}</strong>
                  </div>
                  <div className="text-zinc-400 print:text-zinc-700">
                    GRID LOCATION: <strong>{sitrep.gridLocation}</strong>
                  </div>
                </div>

                <div className="text-right text-zinc-400 print:text-zinc-700">
                  <div>DATE-TIME GROUP: <strong>{sitrep.timestamp}</strong></div>
                  <div>AUTHENTICATOR: <strong>{sitrep.authorRank} {sitrep.authorName}</strong></div>
                  <div className="text-emerald-400 font-bold print:text-black">
                    STATUS: {sitrep.status}
                  </div>
                </div>
              </div>

              <div className="space-y-4 leading-relaxed">
                <div>
                  <div className="font-mono font-bold text-amber-400 print:text-black text-[11px] uppercase mb-1">
                    1. CURRENT TACTICAL SITUATION:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2">{sitrep.currentSituation}</p>
                </div>

                <div>
                  <div className="font-mono font-bold text-amber-400 print:text-black text-[11px] uppercase mb-1">
                    2. FRIENDLY FORCES DISPOSITION & STRENGTH:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2">{sitrep.friendlyForcesStatus}</p>
                </div>

                <div>
                  <div className="font-mono font-bold text-amber-400 print:text-black text-[11px] uppercase mb-1">
                    3. LOGISTICS, FUEL & SUSTAINMENT STATUS:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2">{sitrep.logisticsStatus}</p>
                </div>

                <div>
                  <div className="font-mono font-bold text-amber-400 print:text-black text-[11px] uppercase mb-1">
                    4. OBSTACLES, OPERATIONAL INJECTS & ROAD CONDITIONS:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2">{sitrep.obstaclesChallenges}</p>
                </div>

                <div>
                  <div className="font-mono font-bold text-amber-400 print:text-black text-[11px] uppercase mb-1">
                    5. COMMANDER'S EVALUATION & FORWARD DIRECTIVES:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2 italic">{sitrep.commanderAssessment}</p>
                </div>
              </div>
            </div>
          )}

          {/* AAR Format */}
          {!isSitrep && aar && (
            <div className="mt-6 space-y-5 text-xs">
              <div className="flex justify-between items-start font-mono pb-3 border-b border-zinc-800 print:border-zinc-300">
                <div>
                  <div className="text-base font-bold text-emerald-400 print:text-black">
                    AFTER-ACTION REPORT: {aar.codename}
                  </div>
                  <div className="text-zinc-400 print:text-zinc-700 mt-0.5">
                    EXERCISE RATING: <strong>{aar.overallRating.replace('_', ' ')}</strong>
                  </div>
                </div>

                <div className="text-right text-zinc-400 print:text-zinc-700">
                  <div>DATE: <strong>{aar.completionDate}</strong></div>
                  <div>LEAD EVALUATOR: <strong>{aar.leadEvaluator}</strong></div>
                  <div className="text-emerald-400 font-bold print:text-black">
                    READINESS GAIN: +{aar.readinessGainScore}%
                  </div>
                </div>
              </div>

              <div className="space-y-4 leading-relaxed">
                <div>
                  <div className="font-mono font-bold text-emerald-400 print:text-black text-[11px] uppercase mb-1">
                    1. KEY OPERATIONAL SUCCESSES:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 print:text-black pl-2">
                    {aar.keySuccesses.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-mono font-bold text-amber-400 print:text-black text-[11px] uppercase mb-1">
                    2. IDENTIFIED LESSONS LEARNED & VULNERABILITIES:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 print:text-black pl-2">
                    {aar.lessonsLearned.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-mono font-bold text-zinc-400 print:text-black text-[11px] uppercase mb-1">
                    3. LOGISTICS & FUEL BURN VARIANCE ANALYSIS:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2">{aar.logisticsVarianceNotes}</p>
                </div>

                <div>
                  <div className="font-mono font-bold text-zinc-400 print:text-black text-[11px] uppercase mb-1">
                    4. SAFETY RECORD & INCIDENT AUDIT:
                  </div>
                  <p className="text-zinc-300 print:text-black pl-2">{aar.safetyRecord}</p>
                </div>

                <div>
                  <div className="font-mono font-bold text-emerald-400 print:text-black text-[11px] uppercase mb-1">
                    5. DOCTRINAL RECOMMENDATIONS:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 print:text-black pl-2">
                    {aar.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Authentication & Signature Block */}
          <div className="mt-8 pt-6 border-t border-zinc-800 print:border-zinc-400 flex justify-between items-end font-mono text-[10px] text-zinc-500 print:text-zinc-700">
            <div>
              <div>OFFICIAL RECORD COPY // ARCHIVE SEC-OPS</div>
              <div>HASH: SHA256: 7F8B2C4E910A34D</div>
            </div>
            <div className="text-right">
              <div className="border-b border-zinc-600 print:border-black w-48 mb-1 pb-4">
                [DIGITALLY SIGNED // COMMAND AUTHORITY]
              </div>
              <div>FOR THE COMMANDER</div>
            </div>
          </div>

          <div className="text-center pt-6 mt-4 border-t border-amber-500/40 print:border-zinc-300 font-mono text-[9px] text-amber-500/80 uppercase tracking-widest print:text-zinc-500">
            UNCLASSIFIED // EXERCISE TRAINING USE ONLY // NOT FOR OPERATIONAL USE
          </div>
        </div>
      </div>
    </div>
  );
};
