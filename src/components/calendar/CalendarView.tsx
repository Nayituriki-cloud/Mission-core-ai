import React, { useState, useMemo } from 'react';
import { useMissions } from '../../context/MissionContext';
import { Mission, MissionTask } from '../../types/mission';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface CalendarViewProps {
  onSelectMission: (mission: Mission) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectMission }) => {
  const { missions } = useMissions();

  // Current view date anchor (September 2026 based on timestamp)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 26)); // September 2026
  const [viewType, setViewType] = useState<'month' | 'agenda'>('month');

  // Days in month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Map missions and tasks by day
  const eventsByDay = useMemo(() => {
    const map: Record<number, Array<{ type: 'mission_deadline' | 'task_due'; title: string; mission: Mission; priority: string }>> = {};

    missions.forEach((m) => {
      const deadlineDate = new Date(m.deadline);
      if (deadlineDate.getFullYear() === year && deadlineDate.getMonth() === month) {
        const day = deadlineDate.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          type: 'mission_deadline',
          title: `[MISSION DEADLINE] ${m.code}`,
          mission: m,
          priority: m.priority,
        });
      }

      m.tasks.forEach((t) => {
        const tDate = new Date(t.dueDate);
        if (tDate.getFullYear() === year && tDate.getMonth() === month) {
          const day = tDate.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({
            type: 'task_due',
            title: `Task: ${t.title}`,
            mission: m,
            priority: t.priority,
          });
        }
      });
    });

    return map;
  }, [missions, year, month]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Timeline Coordination</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Operations Calendar & Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission milestone deadlines, mobilization windows, and tactical phase gates.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewType === 'month' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewType('agenda')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewType === 'agenda' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Agenda Stream
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-200 font-mono">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date(2026, 8, 26))}
          className="text-xs font-mono text-cyan-400 hover:underline px-2 py-1"
        >
          Today (Sept 2026)
        </button>
      </div>

      {viewType === 'month' ? (
        /* Month Grid */
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/80 text-center py-2.5 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-slate-950/30">
            {/* Empty offset padding for days before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[105px] p-2 bg-slate-950/60 opacity-30" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isToday = day === 26 && month === 8 && year === 2026;
              const dayEvents = eventsByDay[day] || [];

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[105px] p-2 transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-cyan-950/20 ring-1 ring-inset ring-cyan-500/40' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-cyan-400 font-bold">
                        {dayEvents.length} items
                      </span>
                    )}
                  </div>

                  {/* Day Events preview */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, eIdx) => (
                      <div
                        key={eIdx}
                        onClick={() => onSelectMission(ev.mission)}
                        className={`text-[10px] p-1 rounded font-mono truncate cursor-pointer transition-colors ${
                          ev.type === 'mission_deadline'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                        title={`${ev.title} (${ev.mission.title})`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda Stream */
        <div className="space-y-3">
          {missions.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMission(m)}
              className="p-4 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-cyan-400 font-bold">{m.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-200 font-semibold">{m.title}</span>
                </div>
                <div className="text-xs font-mono text-amber-400">
                  Target Deadline: {new Date(m.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Milestones timeline bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                {m.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300 truncate">{milestone.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(milestone.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
