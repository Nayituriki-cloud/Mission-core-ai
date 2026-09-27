import React, { useState } from 'react';
import { useTactical } from '../../context/TacticalContext';
import { TrainingEvent } from '../../types/tactical';
import { exportTrainingToCsv } from '../../utils/exportHelpers';
import {
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Download,
  Award,
  Users,
  MapPin,
  Flame,
  Radio,
  Cross,
  Moon
} from 'lucide-react';

export const TrainingView: React.FC = () => {
  const { trainingEvents, addTrainingEvent, completeTrainingEvent, canPerform } = useTactical();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [gradingEvent, setGradingEvent] = useState<TrainingEvent | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(95);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<TrainingEvent['category']>('LIVE_FIRE_SIM');
  const [unitName, setUnitName] = useState<string>('1st & 2nd Mechanized Platoons');
  const [instructor, setInstructor] = useState<string>('SFC Thomas Hayes');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-09-28 08:00');
  const [duration, setDuration] = useState<number>(4);
  const [location, setLocation] = useState<string>('Range Alpha 2');
  const [attendees, setAttendees] = useState<number>(36);

  const filteredEvents = trainingEvents.filter((e) => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
  });

  const completedEvents = trainingEvents.filter((e) => e.status === 'COMPLETED');
  const avgQualification = Math.round(
    completedEvents.reduce((acc, e) => acc + (e.qualificationRate || 0), 0) / (completedEvents.length || 1)
  );

  const getCategoryBadge = (cat: TrainingEvent['category']) => {
    switch (cat) {
      case 'LIVE_FIRE_SIM':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded">
            <Flame className="w-3 h-3" />
            LIVE-FIRE SIM
          </span>
        );
      case 'C4ISR_DRILL':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded">
            <Radio className="w-3 h-3" />
            C4ISR / EW
          </span>
        );
      case 'CASUALTY_EVAC':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded">
            <Cross className="w-3 h-3" />
            TCCC / MEDEVAC
          </span>
        );
      case 'NIGHT_NAVIGATION':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
            <Moon className="w-3 h-3" />
            NIGHT NAV
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
            TACTICAL DRILL
          </span>
        );
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addTrainingEvent({
      title,
      category,
      unitName,
      instructor,
      scheduledDate,
      durationHours: duration,
      status: 'SCHEDULED',
      location,
      attendeeCount: attendees
    });

    setShowAddModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Training Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>QUALIFIED RATE</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {avgQualification}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Passing standard (85%+)</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>TOTAL EXERCISE DRILLS</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono mt-1">{trainingEvents.length}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Multi-echelon curriculum</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>COMPLETED QUALS</span>
            <CheckCircle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            {completedEvents.length}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Certified exercise rotations</div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>TRAINED PERSONNEL</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono mt-1">
            {trainingEvents.reduce((acc, t) => acc + t.attendeeCount, 0)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Total attendee billets logged</div>
        </div>
      </div>

      {/* Filter and Schedule Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-zinc-400">CATEGORY:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-700 rounded py-1.5 px-3 text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Training Categories</option>
            <option value="LIVE_FIRE_SIM">Live-Fire Simulation</option>
            <option value="C4ISR_DRILL">C4ISR & EW Jamming</option>
            <option value="CASUALTY_EVAC">Casualty Evacuation / TCCC</option>
            <option value="CONVOY_ESCORT">Convoy Defense</option>
            <option value="NIGHT_NAVIGATION">Night Vision Navigation</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTrainingToCsv(filteredEvents)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>EXPORT CSV</span>
          </button>

          {canPerform('EVALUATE_TRAINING') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>SCHEDULE DRILL</span>
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {getCategoryBadge(event.category)}
                <span className="font-bold text-zinc-100 text-sm">{event.title}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  Unit: <strong>{event.unitName}</strong> ({event.attendeeCount} troops)
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Scheduled: <strong className="text-amber-400/90">{event.scheduledDate}</strong> ({event.durationHours} hrs)
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  Location: {event.location}
                </span>
                <span>·</span>
                <span>Lead Trainer: <em>{event.instructor}</em></span>
              </div>
            </div>

            {/* Score & Grading Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {event.status === 'COMPLETED' ? (
                <div className="text-right font-mono">
                  <div className="text-[10px] text-zinc-500">QUALIFICATION RATE</div>
                  <div className="text-base font-bold text-emerald-400">{event.qualificationRate}%</div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    {event.status}
                  </span>
                  {canPerform('EVALUATE_TRAINING') && (
                    <button
                      onClick={() => setGradingEvent(event)}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold"
                    >
                      GRADE & EVALUATE
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grade Event Modal */}
      {gradingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                TRAINING EVALUATION SCORE
              </span>
              <button onClick={() => setGradingEvent(null)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                <div className="font-bold text-zinc-200">{gradingEvent.title}</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">{gradingEvent.unitName}</div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>QUALIFICATION SCORE</span>
                  <span className="text-emerald-400 font-bold">{gradeScore}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setGradingEvent(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    completeTrainingEvent(gradingEvent.id, gradeScore);
                    setGradingEvent(null);
                  }}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold"
                >
                  SUBMIT GRADE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Training Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                SCHEDULE TACTICAL TRAINING DRILL
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">DRILL TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tactical Mass Casualty & Aeromedical Hoist Drill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">DRILL CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TrainingEvent['category'])}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  >
                    <option value="LIVE_FIRE_SIM">Live-Fire Simulation</option>
                    <option value="C4ISR_DRILL">C4ISR / EW Jamming</option>
                    <option value="CASUALTY_EVAC">Casualty Evac / TCCC</option>
                    <option value="CONVOY_ESCORT">Convoy Escort Drill</option>
                    <option value="NIGHT_NAVIGATION">Night Navigation</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">ATTENDEE COUNT</label>
                  <input
                    type="number"
                    min="4"
                    max="200"
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">PARTICIPATING UNIT</label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">DATE & TIME</label>
                  <input
                    type="text"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">DURATION (HOURS)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">LOCATION / FACILITY</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">INSTRUCTOR / EVALUATOR</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold"
                >
                  SCHEDULE DRILL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
