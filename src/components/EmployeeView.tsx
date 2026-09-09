import { useState, useMemo, useEffect } from 'react';
import { User, Calendar, Clock, AlertCircle, CheckCircle2, Palmtree, Award } from 'lucide-react';
import { YearSchedule, Employee, DayRecord, ShiftEntry, AppUser } from '../types';
import { SPANISH_MONTH_NAMES } from '../utils/calendarGenerator';
import { getShiftBadgeStyle } from '../data/presets';
import ShiftEditorModal from './ShiftEditorModal';

interface EmployeeViewProps {
  schedule: YearSchedule;
  onUpdateShift: (dayId: string, employeeId: string, updatedShift: ShiftEntry) => void;
  isAdmin?: boolean;
  onPromptAdminLogin?: () => void;
  initialEmployeeId?: string;
  currentUser?: AppUser | null;
}

export default function EmployeeView({
  schedule,
  onUpdateShift,
  isAdmin = true,
  onPromptAdminLogin,
  initialEmployeeId,
  currentUser,
}: EmployeeViewProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    if (currentUser?.employeeId && schedule.employees.some((e) => e.id === currentUser.employeeId)) {
      return currentUser.employeeId;
    }
    return initialEmployeeId || schedule.employees[0]?.id || '';
  });

  // Switch to current user when user changes
  useEffect(() => {
    if (currentUser?.employeeId && schedule.employees.some((e) => e.id === currentUser.employeeId)) {
      setSelectedEmpId(currentUser.employeeId);
    }
  }, [currentUser?.employeeId, schedule.employees]);

  useEffect(() => {
    if (!schedule.employees.some((e) => e.id === selectedEmpId) && schedule.employees.length > 0) {
      setSelectedEmpId(schedule.employees[0].id);
    }
  }, [schedule.employees, selectedEmpId]);

  const [editingTarget, setEditingTarget] = useState<{
    day: DayRecord;
    employee: Employee;
    shift: ShiftEntry;
  } | null>(null);

  const employee = useMemo(() => {
    return schedule.employees.find((e) => e.id === selectedEmpId) || schedule.employees[0];
  }, [schedule.employees, selectedEmpId]);

  // Compute detailed stats for this employee
  const stats = useMemo(() => {
    if (!employee) return null;

    let totalHours = 0;
    let workedDays = 0;
    let morningDays = 0;
    let afternoonDays = 0;
    let weekendDaysWorked = 0;
    let vacationDays = 0;
    let sickLeaveDays = 0;
    let holidaysWorked = 0;
    const monthlyHours: number[] = new Array(12).fill(0);

    for (const day of schedule.days) {
      const shift = day.shifts[employee.id];
      if (!shift) continue;

      if (shift.totalHours > 0) {
        totalHours += shift.totalHours;
        workedDays++;
        monthlyHours[day.month - 1] += shift.totalHours;

        if (day.dayOfWeek === 'S' || day.dayOfWeek === 'D') {
          weekendDaysWorked++;
        }
        if (shift.festivoLaborable || day.isHoliday) {
          holidaysWorked++;
        }
      }

      if (shift.morningIn && shift.morningOut) morningDays++;
      if (shift.afternoonIn && shift.afternoonOut) afternoonDays++;

      if (shift.status === 'Vacaciones') vacationDays++;
      if (shift.status === 'Baja') sickLeaveDays++;
    }

    const targetHours = employee.contractHoursPerYear || 1760;
    const hoursDiff = totalHours - targetHours;
    const vacationsLeft = Math.max(0, (employee.vacationDaysTotal || 30) - vacationDays);

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      targetHours,
      hoursDiff: Math.round(hoursDiff * 100) / 100,
      workedDays,
      morningDays,
      afternoonDays,
      weekendDaysWorked,
      vacationDays,
      vacationsLeft,
      sickLeaveDays,
      holidaysWorked,
      monthlyHours,
    };
  }, [schedule.days, employee]);

  if (!employee || !stats) return null;

  return (
    <div className="space-y-5">
      {/* Employee Selector Pills */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 shrink-0">
          Empleado:
        </span>
        {schedule.employees.map((emp) => {
          const isSelected = emp.id === selectedEmpId;
          const isMe = currentUser?.employeeId === emp.id;
          return (
            <button
              key={emp.id}
              onClick={() => setSelectedEmpId(emp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: emp.color }}
              />
              <span>{emp.shortName}</span>
              {isMe && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                  Tú
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Hours vs Target */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Cómputo Anual Horas</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.totalHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {stats.targetHours}h
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                stats.totalHours > stats.targetHours
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{
                width: `${Math.min(100, (stats.totalHours / stats.targetHours) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] mt-2 font-medium">
            <span className="text-slate-500">Diferencia convenio:</span>
            <span
              className={`font-bold font-mono ${
                stats.hoursDiff >= 0 ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              {stats.hoursDiff >= 0 ? `+${stats.hoursDiff}h` : `${stats.hoursDiff}h`}
            </span>
          </div>
        </div>

        {/* Vacations Balance */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Vacaciones Anuales</span>
            <Palmtree className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.vacationDays}
            </span>
            <span className="text-xs text-slate-400">
              días disfrutados
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Restantes para el año:</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {stats.vacationsLeft} días
            </span>
          </div>
        </div>

        {/* Shifts Split: Morning vs Afternoon */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Reparto de Turnos</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-2 mt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 font-medium">Turnos de Mañana:</span>
              <span className="font-bold font-mono text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded">
                {stats.morningDays} días
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">Turnos de Tarde:</span>
              <span className="font-bold font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                {stats.afternoonDays} días
              </span>
            </div>
          </div>
        </div>

        {/* Weekend & Sick Leave */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Fines de Semana & Bajas</span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="space-y-2 mt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Sábados/Domingos trab:</span>
              <span className="font-bold font-mono text-slate-800">
                {stats.weekendDaysWorked} días
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-700 font-medium">Días de Baja médica:</span>
              <span className="font-bold font-mono text-orange-800">
                {stats.sickLeaveDays} días
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Month by Month Hours Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Horas Trabajadas por Mes ({schedule.year})
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center">
          {SPANISH_MONTH_NAMES.map((name, idx) => {
            const h = stats.monthlyHours[idx];
            const max = Math.max(...stats.monthlyHours, 160);
            const pct = Math.min(100, Math.round((h / max) * 100));

            return (
              <div key={name} className="flex flex-col items-center">
                <div className="text-[11px] font-mono font-bold text-slate-700 mb-1">
                  {h > 0 ? `${h.toFixed(0)}h` : '-'}
                </div>
                <div className="w-full bg-slate-100 rounded-t h-24 flex items-end justify-center p-1">
                  <div
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t transition-all"
                    style={{ height: `${pct}%` }}
                    title={`${name}: ${h.toFixed(1)} horas`}
                  />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1.5">
                  {name.substring(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Year Calendar Grid for this Employee */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>Calendario Anual Detallado de {employee.name}</span>
          <span className="text-xs font-normal text-slate-500">
            Haz clic en cualquier día para ajustar su turno
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPANISH_MONTH_NAMES.map((monthName, mIdx) => {
            const m = mIdx + 1;
            const daysInM = schedule.days.filter((d) => d.month === m);

            return (
              <div
                key={monthName}
                className="border border-slate-200 rounded-lg p-2 bg-slate-50/50"
              >
                <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                  <span>{monthName}</span>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold">
                    {stats.monthlyHours[mIdx].toFixed(0)}h
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-[9px] text-center font-mono">
                  {daysInM.map((d) => {
                    const shift = d.shifts[employee.id];
                    const badge = getShiftBadgeStyle(shift);

                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          setEditingTarget({
                            day: d,
                            employee,
                            shift: shift || {
                              status: 'Horas normales',
                              morningIn: '',
                              morningOut: '',
                              afternoonIn: '',
                              afternoonOut: '',
                              totalHours: 0,
                              festivoLaborable: false,
                              disfruteFestivo: false,
                            },
                          })
                        }
                        className={`p-1 rounded font-bold transition-all hover:scale-105 ${badge.bg}`}
                        title={`${d.dateStr}: ${badge.label}`}
                      >
                        <div>{d.day}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Turnos:</span>
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300 font-bold text-[11px]">
            <span>☀️ M</span>
            <span className="font-normal text-emerald-900">Mañana (9:30-15)</span>
          </span>
          <span className="flex items-center gap-1 bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-300 font-bold text-[11px]">
            <span>🌙 T</span>
            <span className="font-normal text-blue-900">Tarde (15-21)</span>
          </span>
          <span className="flex items-center gap-1 bg-purple-100 text-purple-950 px-2 py-0.5 rounded border border-purple-300 font-bold text-[11px]">
            <span>⚡ D</span>
            <span className="font-normal text-purple-900">Doble</span>
          </span>
          <span className="flex items-center gap-1 bg-cyan-100 text-cyan-950 px-2 py-0.5 rounded border border-cyan-300 font-bold text-[11px]">
            <span>🏖️ VAC</span>
            <span className="font-normal text-cyan-900">Vacaciones</span>
          </span>
          <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
            <span>💤 LIB</span>
            <span>Libranza</span>
          </span>
          <span className="flex items-center gap-1 bg-rose-100 text-rose-950 px-2 py-0.5 rounded border border-rose-300 font-bold text-[11px]">
            <span>🎉 FES</span>
            <span className="font-normal text-rose-900">Festivo</span>
          </span>
        </div>
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
