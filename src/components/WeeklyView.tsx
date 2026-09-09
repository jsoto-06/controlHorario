import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Coffee, ShieldAlert, Calendar } from 'lucide-react';
import { YearSchedule, DayRecord, Employee, ShiftEntry } from '../types';
import { getShiftBadgeStyle } from '../data/presets';
import ShiftEditorModal from './ShiftEditorModal';

interface WeeklyViewProps {
  schedule: YearSchedule;
  onUpdateShift: (dayId: string, employeeId: string, updatedShift: ShiftEntry) => void;
  isAdmin?: boolean;
  onPromptAdminLogin?: () => void;
}

export default function WeeklyView({
  schedule,
  onUpdateShift,
  isAdmin = true,
  onPromptAdminLogin,
}: WeeklyViewProps) {
  // Find available week numbers
  const allWeeks = useMemo(() => {
    const set = new Set<number>();
    for (const d of schedule.days) {
      set.add(d.weekNumber);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [schedule.days]);

  const [currentWeek, setCurrentWeek] = useState<number>(() => allWeeks[0] || 1);

  const [editingTarget, setEditingTarget] = useState<{
    day: DayRecord;
    employee: Employee;
    shift: ShiftEntry;
  } | null>(null);

  const daysInWeek = useMemo(() => {
    return schedule.days.filter((d) => d.weekNumber === currentWeek);
  }, [schedule.days, currentWeek]);

  const prevWeek = () => {
    const idx = allWeeks.indexOf(currentWeek);
    if (idx > 0) setCurrentWeek(allWeeks[idx - 1]);
  };

  const nextWeek = () => {
    const idx = allWeeks.indexOf(currentWeek);
    if (idx < allWeeks.length - 1) setCurrentWeek(allWeeks[idx + 1]);
  };

  // Group employees for each day
  const getDayBreakdown = (day: DayRecord) => {
    const morning: { emp: Employee; shift: ShiftEntry }[] = [];
    const afternoon: { emp: Employee; shift: ShiftEntry }[] = [];
    const rest: { emp: Employee; shift: ShiftEntry }[] = [];
    const leaves: { emp: Employee; shift: ShiftEntry }[] = [];

    for (const emp of schedule.employees) {
      const shift = day.shifts[emp.id];
      if (!shift) continue;

      if (shift.status === 'Vacaciones' || shift.status === 'Baja' || shift.status === 'Asuntos propios') {
        leaves.push({ emp, shift });
      } else if (shift.status === 'Libranza' || shift.status === 'Festivo') {
        if (shift.totalHours > 0) {
          // Worked holiday
          if (shift.morningIn) morning.push({ emp, shift });
          else afternoon.push({ emp, shift });
        } else {
          rest.push({ emp, shift });
        }
      } else {
        if (shift.morningIn && shift.morningOut) {
          morning.push({ emp, shift });
        }
        if (shift.afternoonIn && shift.afternoonOut) {
          afternoon.push({ emp, shift });
        }
      }
    }

    return { morning, afternoon, rest, leaves };
  };

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            disabled={currentWeek === allWeeks[0]}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Vista Semanal Detallada
            </span>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Semana {currentWeek} de {schedule.year}</span>
              {daysInWeek.length > 0 && (
                <span className="text-xs font-normal text-slate-500">
                  ({daysInWeek[0].dateStr} - {daysInWeek[daysInWeek.length - 1].dateStr})
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={nextWeek}
            disabled={currentWeek === allWeeks[allWeeks.length - 1]}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* Quick jump */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Ir a semana:</span>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
          >
            {allWeeks.map((w) => (
              <option key={w} value={w}>
                Semana {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of 7 days */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {daysInWeek.map((day) => {
          const { morning, afternoon, rest, leaves } = getDayBreakdown(day);
          const isSunday = day.dayOfWeek === 'D';
          const isSaturday = day.dayOfWeek === 'S';

          return (
            <div
              key={day.id}
              className={`bg-white rounded-xl border flex flex-col shadow-2xs overflow-hidden ${
                day.isHoliday
                  ? 'border-rose-200 ring-1 ring-rose-300/40'
                  : isSunday
                  ? 'border-slate-300/70 bg-slate-50/50'
                  : 'border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div
                className={`px-3 py-2 border-b flex items-center justify-between ${
                  day.isHoliday
                    ? 'bg-rose-50 border-rose-200'
                    : isSunday
                    ? 'bg-slate-100 border-slate-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 block leading-tight">
                    {day.dayOfWeek === 'L'
                      ? 'Lunes'
                      : day.dayOfWeek === 'M'
                      ? 'Martes'
                      : day.dayOfWeek === 'X'
                      ? 'Miércoles'
                      : day.dayOfWeek === 'J'
                      ? 'Jueves'
                      : day.dayOfWeek === 'V'
                      ? 'Viernes'
                      : day.dayOfWeek === 'S'
                      ? 'Sábado'
                      : 'Domingo'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {day.dateStr}
                  </span>
                </div>
                {day.holidayName && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                    Festivo
                  </span>
                )}
              </div>

              {/* Day Content */}
              <div className="p-2.5 space-y-3 flex-1 text-xs">
                {/* Morning Shift */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-emerald-600" />
                      Mañana
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-50 rounded border border-emerald-200">
                      {morning.length} pers
                    </span>
                  </div>
                  <div className="space-y-1">
                    {morning.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic py-1">Sin personal</div>
                    ) : (
                      morning.map(({ emp, shift }) => (
                        <button
                          key={emp.id}
                          onClick={() =>
                            setEditingTarget({
                              day,
                              employee: emp,
                              shift,
                            })
                          }
                          className="w-full text-left p-1.5 rounded bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-400 transition-colors flex items-center justify-between group"
                        >
                          <span className="font-semibold text-emerald-950 truncate text-[11px]">
                            {emp.shortName}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {shift.morningIn || '9:30'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Afternoon Shift */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
                    <span className="flex items-center gap-1">
                      <Moon className="w-3 h-3 text-blue-600" />
                      Tarde
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 rounded border border-blue-200">
                      {afternoon.length} pers
                    </span>
                  </div>
                  <div className="space-y-1">
                    {afternoon.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic py-1">Sin personal</div>
                    ) : (
                      afternoon.map(({ emp, shift }) => (
                        <button
                          key={emp.id}
                          onClick={() =>
                            setEditingTarget({
                              day,
                              employee: emp,
                              shift,
                            })
                          }
                          className="w-full text-left p-1.5 rounded bg-blue-50/70 border border-blue-200/80 hover:border-blue-400 transition-colors flex items-center justify-between group"
                        >
                          <span className="font-semibold text-blue-950 truncate text-[11px]">
                            {emp.shortName}
                          </span>
                          <span className="text-[10px] text-blue-700 font-mono">
                            {shift.afternoonIn || '15:00'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Vacations / Leaves / Bajas */}
                {leaves.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Vacaciones / Bajas ({leaves.length})
                    </div>
                    <div className="space-y-1">
                      {leaves.map(({ emp, shift }) => {
                        const badge = getShiftBadgeStyle(shift);
                        return (
                          <button
                            key={emp.id}
                            onClick={() =>
                              setEditingTarget({
                                day,
                                employee: emp,
                                shift,
                              })
                            }
                            className={`w-full text-left p-1 rounded border text-[10px] font-medium flex items-center justify-between ${badge.bg}`}
                          >
                            <span className="truncate">{emp.shortName}</span>
                            <span className="font-bold">{badge.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shift Editor Modal */}
      {editingTarget && (
        <ShiftEditorModal
          isOpen={Boolean(editingTarget)}
          day={editingTarget.day}
          employee={editingTarget.employee}
          shift={editingTarget.shift}
          isAdmin={isAdmin}
          onPromptAdminLogin={onPromptAdminLogin}
          onClose={() => setEditingTarget(null)}
          onSave={(updatedShift) => {
            onUpdateShift(editingTarget.day.id, editingTarget.employee.id, updatedShift);
          }}
        />
      )}
    </div>
  );
}
