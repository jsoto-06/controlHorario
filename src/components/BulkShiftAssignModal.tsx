import { useState, useMemo } from 'react';
import {
  X,
  CalendarRange,
  Users,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
  Calendar,
  CheckSquare,
  Square,
  Sun,
  Moon,
  Coffee,
  Palmtree,
  ShieldCheck,
} from 'lucide-react';
import { YearSchedule, Employee, ShiftEntry, ShiftStatus } from '../types';
import { SHIFT_PRESETS, calculateHoursFromTimes } from '../data/presets';
import { SPANISH_MONTH_NAMES } from '../utils/calendarGenerator';

export interface BulkAssignConfig {
  targetEmployeeIds: string[]; // employee ids or all
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  daysOfWeek: ('L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D')[];
  skipHolidays: boolean;
  shift: ShiftEntry;
}

interface BulkShiftAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: YearSchedule;
  onApply: (config: BulkAssignConfig) => void;
}

const ALL_DAYS_OF_WEEK: { key: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D'; label: string; full: string }[] = [
  { key: 'L', label: 'Lun', full: 'Lunes' },
  { key: 'M', label: 'Mar', full: 'Martes' },
  { key: 'X', label: 'Mié', full: 'Miércoles' },
  { key: 'J', label: 'Jue', full: 'Jueves' },
  { key: 'V', label: 'Vie', full: 'Viernes' },
  { key: 'S', label: 'Sáb', full: 'Sábado' },
  { key: 'D', label: 'Dom', full: 'Domingo' },
];

export default function BulkShiftAssignModal({
  isOpen,
  onClose,
  schedule,
  onApply,
}: BulkShiftAssignModalProps) {
  if (!isOpen) return null;

  const year = schedule.year;

  // 1. Employee Target
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>(
    schedule.employees.map((e) => e.id)
  );

  // 2. Dates
  const [startDate, setStartDate] = useState(`${year}-02-01`);
  const [endDate, setEndDate] = useState(`${year}-02-28`);

  // 3. Days of Week
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<
    ('L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D')[]
  >(['L', 'M', 'X', 'J', 'V']); // default L-V
  const [skipHolidays, setSkipHolidays] = useState(true);

  // 4. Shift Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('manana');
  const [customStatus, setCustomStatus] = useState<ShiftStatus>('Horas normales');
  const [customMorningIn, setCustomMorningIn] = useState('09:30');
  const [customMorningOut, setCustomMorningOut] = useState('15:00');
  const [customAfternoonIn, setCustomAfternoonIn] = useState('');
  const [customAfternoonOut, setCustomAfternoonOut] = useState('');
  const [customTotalHours, setCustomTotalHours] = useState<number>(5.5);
  const [notes, setNotes] = useState('');

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SHIFT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCustomStatus(preset.status);
      setCustomMorningIn(preset.morningIn);
      setCustomMorningOut(preset.morningOut);
      setCustomAfternoonIn(preset.afternoonIn);
      setCustomAfternoonOut(preset.afternoonOut);
      setCustomTotalHours(preset.defaultHours);
    }
  };

  // Quick Date Range Helpers
  const setMonthRange = (monthIdx: number) => {
    const m = String(monthIdx + 1).padStart(2, '0');
    const lastDay = new Date(year, monthIdx + 1, 0).getDate();
    setStartDate(`${year}-${m}-01`);
    setEndDate(`${year}-${m}-${String(lastDay).padStart(2, '0')}`);
  };

  const setWholeYearRange = () => {
    setStartDate(`${year}-01-01`);
    setEndDate(`${year}-12-31`);
  };

  // Toggle Day of Week
  const toggleDayOfWeek = (d: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D') => {
    if (selectedDaysOfWeek.includes(d)) {
      if (selectedDaysOfWeek.length > 1) {
        setSelectedDaysOfWeek(selectedDaysOfWeek.filter((x) => x !== d));
      }
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, d]);
    }
  };

  // Toggle Employee
  const toggleEmployee = (empId: string) => {
    if (selectedEmpIds.includes(empId)) {
      if (selectedEmpIds.length > 1) {
        setSelectedEmpIds(selectedEmpIds.filter((id) => id !== empId));
      }
    } else {
      setSelectedEmpIds([...selectedEmpIds, empId]);
    }
  };

  // Calculate Impact Metrics in real-time
  const impactSummary = useMemo(() => {
    const targetEmployees =
      targetType === 'all'
        ? schedule.employees
        : schedule.employees.filter((e) => selectedEmpIds.includes(e.id));

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { matchingDaysCount: 0, totalShiftAssignments: 0, targetEmployeesCount: 0 };
    }

    let matchingDaysCount = 0;
    for (const day of schedule.days) {
      if (day.id >= startDate && day.id <= endDate) {
        if (selectedDaysOfWeek.includes(day.dayOfWeek)) {
          if (skipHolidays && day.isHoliday && day.dayOfWeek !== 'D') {
            // skip official holiday
            continue;
          }
          matchingDaysCount++;
        }
      }
    }

    const totalShiftAssignments = matchingDaysCount * targetEmployees.length;

    return {
      matchingDaysCount,
      totalShiftAssignments,
      targetEmployeesCount: targetEmployees.length,
    };
  }, [
    schedule.days,
    schedule.employees,
    startDate,
    endDate,
    selectedDaysOfWeek,
    skipHolidays,
    targetType,
    selectedEmpIds,
  ]);

  // Submit Handler
  const handleApply = () => {
    const targetEmployeeIds =
      targetType === 'all' ? schedule.employees.map((e) => e.id) : selectedEmpIds;

    const finalShift: ShiftEntry = {
      status: customStatus,
      morningIn: customMorningIn,
      morningOut: customMorningOut,
      afternoonIn: customAfternoonIn,
      afternoonOut: customAfternoonOut,
      totalHours: customTotalHours,
      festivoLaborable: false,
      disfruteFestivo: false,
      notes: notes.trim() || undefined,
    };

    onApply({
      targetEmployeeIds,
      startDate,
      endDate,
      daysOfWeek: selectedDaysOfWeek,
      skipHolidays,
      shift: finalShift,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
              <CalendarRange className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Asignador Masivo por Rango</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                  Rápido
                </span>
              </h2>
              <p className="text-xs text-amber-100">
                Rellena semanas, meses enteros o todo el año con 1 solo clic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* STEP 1: A QUIÉN APLICAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-amber-600" />
                <span>1. ¿A quién aplicar los turnos?</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {targetType === 'all'
                  ? `Toda la plantilla (${schedule.employees.length})`
                  : `${selectedEmpIds.length} seleccionados`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  targetType === 'all'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-2xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    targetType === 'all' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}
                >
                  {targetType === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs">Todos los Empleados</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {schedule.employees.length} trabajadores a la vez
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('specific')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  targetType === 'specific'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-2xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    targetType === 'specific' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}
                >
                  {targetType === 'specific' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs">Empleados Específicos</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Elige uno o varios compañeros
                  </div>
                </div>
              </button>
            </div>

            {targetType === 'specific' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Marca los empleados deseados:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEmpIds(schedule.employees.map((e) => e.id))}
                      className="text-amber-700 hover:underline font-bold cursor-pointer"
                    >
                      Todos
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedEmpIds([schedule.employees[0]?.id || ''])}
                      className="text-slate-600 hover:underline cursor-pointer"
                    >
                      Solo uno
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {schedule.employees.map((emp) => {
                    const isSelected = selectedEmpIds.includes(emp.id);
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => toggleEmployee(emp.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: emp.color }}
                        />
                        <span>{emp.name}</span>
                        {isSelected ? (
                          <CheckSquare className="w-3 h-3 text-amber-700" />
                        ) : (
                          <Square className="w-3 h-3 text-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: RANGO DE FECHAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>2. Rango de Fechas</span>
              </label>
              <button
                type="button"
                onClick={setWholeYearRange}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                📅 Todo el año {year}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1">
                  Desde (Fecha inicio):
                </span>
                <input
                  type="date"
                  value={startDate}
                  min={`${year}-01-01`}
                  max={`${year}-12-31`}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1">
                  Hasta (Fecha fin):
                </span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={`${year}-12-31`}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Meses rápidos */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Atajos por mes:
              </span>
              <div className="flex flex-wrap gap-1 overflow-x-auto pb-0.5">
                {SPANISH_MONTH_NAMES.map((mName, idx) => (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => setMonthRange(idx)}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {mName.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: DÍAS DE LA SEMANA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>3. ¿Qué días de la semana aplicar?</span>
              </label>
              <div className="flex gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek(['L', 'M', 'X', 'J', 'V'])}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  L-V (Lab.)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek(['L', 'M', 'X', 'J', 'V', 'S'])}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  L-S
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek(['S', 'D'])}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Finde (S-D)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek(['L', 'M', 'X', 'J', 'V', 'S', 'D'])}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {ALL_DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDaysOfWeek.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDayOfWeek(d.key)}
                    className={`py-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-600 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{d.key}</span>
                    <span className={`text-[9px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {d.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Skip Holidays Checkbox */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={skipHolidays}
                onChange={(e) => setSkipHolidays(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px] text-slate-700 font-medium">
                <strong>Respetar festivos oficiales</strong> (no sobreescribir días festivos nacionales
                con turnos ordinarios)
              </span>
            </label>
          </div>

          {/* STEP 4: QUÉ TURNO ASIGNAR */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>4. Selecciona el Turno a Asignar</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Presets más frecuentes */}
              {SHIFT_PRESETS.slice(0, 9).map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-2xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${preset.badgeBg}`}
                      >
                        {preset.shortCode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {preset.defaultHours > 0 ? `${preset.defaultHours}h` : '0h'}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{preset.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Time inputs if needed */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-bold">Detalle del horario configurado:</span>
                <span className="text-amber-800 font-extrabold text-xs">
                  Cómputo: {customTotalHours} horas / día
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Mañana Entrada</span>
                  <input
                    type="time"
                    value={customMorningIn}
                    onChange={(e) => {
                      setCustomMorningIn(e.target.value);
                      const h = calculateHoursFromTimes(
                        e.target.value,
                        customMorningOut,
                        customAfternoonIn,
                        customAfternoonOut,
                        customStatus
                      );
                      setCustomTotalHours(h);
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Mañana Salida</span>
                  <input
                    type="time"
                    value={customMorningOut}
                    onChange={(e) => {
                      setCustomMorningOut(e.target.value);
                      const h = calculateHoursFromTimes(
                        customMorningIn,
                        e.target.value,
                        customAfternoonIn,
                        customAfternoonOut,
                        customStatus
                      );
                      setCustomTotalHours(h);
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Tarde Entrada</span>
                  <input
                    type="time"
                    value={customAfternoonIn}
                    onChange={(e) => {
                      setCustomAfternoonIn(e.target.value);
                      const h = calculateHoursFromTimes(
                        customMorningIn,
                        customMorningOut,
                        e.target.value,
                        customAfternoonOut,
                        customStatus
                      );
                      setCustomTotalHours(h);
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Tarde Salida</span>
                  <input
                    type="time"
                    value={customAfternoonOut}
                    onChange={(e) => {
                      setCustomAfternoonOut(e.target.value);
                      const h = calculateHoursFromTimes(
                        customMorningIn,
                        customMorningOut,
                        customAfternoonIn,
                        e.target.value,
                        customStatus
                      );
                      setCustomTotalHours(h);
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* IMPACT LIVE SUMMARY BANNER */}
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <div className="font-bold text-xs">
                  Resumen de la asignación automática:
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Se asignarán <strong>{impactSummary.matchingDaysCount} días</strong> a{' '}
                  <strong>{impactSummary.targetEmployeesCount} empleados</strong>. Total de turnos
                  actualizados:{' '}
                  <span className="font-extrabold text-amber-950 text-xs">
                    {impactSummary.totalShiftAssignments}
                  </span>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={impactSummary.totalShiftAssignments === 0}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>
              Aplicar {impactSummary.totalShiftAssignments} Turnos Masivamente
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
