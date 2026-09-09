import { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Check,
  Edit2,
  Info,
  User,
  CalendarRange,
  Eye,
  SlidersHorizontal,
  Sparkles,
  Palmtree,
  Coffee,
} from 'lucide-react';
import { YearSchedule, DayRecord, Employee, ShiftEntry, AppUser } from '../types';
import { SPANISH_MONTH_NAMES } from '../utils/calendarGenerator';
import { getShiftBadgeStyle, ShiftDisplayMode } from '../data/presets';
import ShiftEditorModal from './ShiftEditorModal';

interface CuadranteTableProps {
  schedule: YearSchedule;
  onUpdateShift: (dayId: string, employeeId: string, updatedShift: ShiftEntry) => void;
  selectedMonth: number; // 0 = all, 1-12
  onSelectMonth: (m: number) => void;
  isAdmin?: boolean;
  onPromptAdminLogin?: () => void;
  currentUser?: AppUser | null;
  onOpenBulkAssignModal?: () => void;
}

export default function CuadranteTable({
  schedule,
  onUpdateShift,
  selectedMonth,
  onSelectMonth,
  isAdmin = true,
  onPromptAdminLogin,
  currentUser,
  onOpenBulkAssignModal,
}: CuadranteTableProps) {
  const [editingTarget, setEditingTarget] = useState<{
    day: DayRecord;
    employee: Employee;
    shift: ShiftEntry;
  } | null>(null);

  // Filters & View Controls
  const [searchFilter, setSearchFilter] = useState('');
  const [displayMode, setDisplayMode] = useState<ShiftDisplayMode>('visual');
  const [focusedEmpId, setFocusedEmpId] = useState<string>('all');
  const [isolateEmployee, setIsolateEmployee] = useState<boolean>(false);
  const [hoveredEmpId, setHoveredEmpId] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth <= 1) onSelectMonth(12);
    else onSelectMonth(selectedMonth - 1);
  };

  const nextMonth = () => {
    if (selectedMonth === 0 || selectedMonth >= 12) onSelectMonth(1);
    else onSelectMonth(selectedMonth + 1);
  };

  // Filter days by month
  const filteredDays = useMemo(() => {
    let list = schedule.days;
    if (selectedMonth > 0) {
      list = list.filter((d) => d.month === selectedMonth);
    }
    return list;
  }, [schedule.days, selectedMonth]);

  // Filter employees
  const displayedEmployees = useMemo(() => {
    let list = schedule.employees;

    // If isolated to single employee
    if (isolateEmployee && focusedEmpId !== 'all') {
      list = list.filter((e) => e.id === focusedEmpId);
    }

    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter(
      (e) => e.name.toLowerCase().includes(q) || e.shortName.toLowerCase().includes(q)
    );
  }, [schedule.employees, searchFilter, isolateEmployee, focusedEmpId]);

  // Compute monthly hours for each employee in current view
  const employeeHoursInView = useMemo(() => {
    const map: Record<string, number> = {};
    for (const emp of schedule.employees) {
      map[emp.id] = 0;
    }
    for (const day of filteredDays) {
      for (const emp of schedule.employees) {
        const s = day.shifts[emp.id];
        if (s && s.totalHours) {
          map[emp.id] = (map[emp.id] || 0) + s.totalHours;
        }
      }
    }
    return map;
  }, [filteredDays, schedule.employees]);

  // Calculate daily coverage (Morning vs Afternoon)
  const calculateCoverage = (day: DayRecord) => {
    let morningCount = 0;
    let afternoonCount = 0;
    let offCount = 0;
    let vacationCount = 0;

    for (const emp of schedule.employees) {
      const shift = day.shifts[emp.id];
      if (!shift) continue;
      if (shift.status === 'Vacaciones') vacationCount++;
      else if (shift.status === 'Libranza' || shift.status === 'Festivo') offCount++;
      else {
        if (shift.morningIn && shift.morningOut) morningCount++;
        if (shift.afternoonIn && shift.afternoonOut) afternoonCount++;
      }
    }

    return { morningCount, afternoonCount, offCount, vacationCount };
  };

  const selectedEmp = schedule.employees.find((e) => e.id === focusedEmpId);

  return (
    <div className="space-y-3.5">
      {/* 1. TOP MONTH NAVIGATION BAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Month Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectMonth(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedMonth === 0
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Año Completo (365d)
          </button>

          {SPANISH_MONTH_NAMES.map((name, index) => {
            const m = index + 1;
            const isSelected = selectedMonth === m;
            return (
              <button
                key={name}
                onClick={() => onSelectMonth(m)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {name.slice(0, 3)}
              </button>
            );
          })}

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Period Label */}
        <div className="text-xs font-bold text-slate-800 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {selectedMonth === 0
              ? `Año ${schedule.year} (365 días)`
              : `${SPANISH_MONTH_NAMES[selectedMonth - 1]} ${schedule.year} (${filteredDays.length} días)`}
          </span>
        </div>
      </div>

      {/* 2. VISIBILITY CONTROLS & EMPLOYEE HIGHLIGHT BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* A. DISPLAY MODE (Visual vs Horas vs Cómputo) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Ver:</span>
            </span>
            <button
              onClick={() => setDisplayMode('visual')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                displayMode === 'visual'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Visual: Muestra iconos y turnos destacados (☀️ M / 🌙 T / 🏖️ VAC) súper claros"
            >
              ☀️/🌙 Visual (M / T)
            </button>
            <button
              onClick={() => setDisplayMode('times')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                displayMode === 'times'
                  ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Horarios: Muestra las horas exactas de entrada y salida (09:30-15:00)"
            >
              🕒 Horarios
            </button>
            <button
              onClick={() => setDisplayMode('hours')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                displayMode === 'hours'
                  ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Cómputo: Muestra el total de horas de la jornada (5.5h / 6h)"
            >
              ⏱️ Horas (h)
            </button>
          </div>

          {/* B. Action Buttons & Search */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {isAdmin && onOpenBulkAssignModal && (
              <button
                onClick={onOpenBulkAssignModal}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                title="Asignar turnos masivamente por rango de fechas"
              >
                <CalendarRange className="w-3.5 h-3.5 text-amber-950" />
                <span>Asignar por Rango</span>
              </button>
            )}

            <div className="relative w-44 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar empleado..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* C. QUICK EMPLOYEE FOCUS PILLS */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 shrink-0">
              Enfocar:
            </span>

            <button
              onClick={() => {
                setFocusedEmpId('all');
                setIsolateEmployee(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                focusedEmpId === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👥 Toda la Plantilla
            </button>

            {currentUser?.employeeId && (
              <button
                onClick={() => {
                  setFocusedEmpId(currentUser.employeeId!);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  focusedEmpId === currentUser.employeeId
                    ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-400/40'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Solo Mi Turno</span>
              </button>
            )}

            {schedule.employees.map((emp) => {
              const isFocused = focusedEmpId === emp.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => setFocusedEmpId(emp.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isFocused
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: emp.color }}
                  />
                  <span>{emp.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle: Isolate to single column */}
          {focusedEmpId !== 'all' && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-950 font-bold text-[11px]">
              <input
                type="checkbox"
                checked={isolateEmployee}
                onChange={(e) => setIsolateEmployee(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Aislar solo a {selectedEmp?.shortName} (ocultar resto)</span>
            </label>
          )}
        </div>
      </div>

      {/* 3. MAIN CUADRANTE MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] relative scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
              <tr>
                {/* Date */}
                <th className="sticky left-0 z-30 bg-slate-100 px-3 py-2.5 font-extrabold text-slate-700 border-r border-slate-200 w-28">
                  Fecha
                </th>
                <th className="px-2 py-2.5 font-bold text-slate-600 border-r border-slate-200 text-center w-12">
                  Día
                </th>
                <th className="px-2 py-2.5 font-bold text-slate-500 border-r border-slate-200 text-center w-12">
                  Sem
                </th>

                {/* Coverage Summary */}
                <th className="px-2 py-2.5 font-bold text-slate-600 border-r border-slate-200 text-center w-28 bg-slate-50">
                  Cobertura
                </th>

                {/* Employee Columns */}
                {displayedEmployees.map((emp) => {
                  const isMyColumn = currentUser?.employeeId === emp.id;
                  const isFocused = focusedEmpId === emp.id;
                  const isHovered = hoveredEmpId === emp.id;

                  return (
                    <th
                      key={emp.id}
                      onMouseEnter={() => setHoveredEmpId(emp.id)}
                      onMouseLeave={() => setHoveredEmpId(null)}
                      className={`px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200 min-w-[140px] max-w-[170px] transition-all cursor-pointer ${
                        isFocused
                          ? 'bg-amber-100/90 border-amber-300 ring-2 ring-amber-500/40'
                          : isMyColumn
                          ? 'bg-indigo-100/80 border-indigo-300 ring-2 ring-indigo-500/30'
                          : isHovered
                          ? 'bg-slate-200/80'
                          : 'bg-slate-100'
                      }`}
                      onClick={() => setFocusedEmpId(focusedEmpId === emp.id ? 'all' : emp.id)}
                      title={`Clic para enfocar a ${emp.name}`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: emp.color }}
                          />
                          <span className="font-extrabold text-slate-900 truncate text-xs" title={emp.name}>
                            {emp.shortName}
                          </span>
                        </div>
                        {isMyColumn && (
                          <span className="text-[9px] font-bold text-white bg-indigo-600 px-1.5 py-0.2 rounded shrink-0 shadow-2xs">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                        <span>Horas mes:</span>
                        <span className="font-extrabold text-indigo-700">
                          {employeeHoursInView[emp.id]?.toFixed(1) || '0.0'}h
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-200/70">
              {filteredDays.map((day) => {
                const coverage = calculateCoverage(day);
                const isSunday = day.dayOfWeek === 'D';
                const isSaturday = day.dayOfWeek === 'S';
                const isWeekend = isSaturday || isSunday;

                const rowBg = day.isHoliday
                  ? 'bg-rose-50/50'
                  : isSunday
                  ? 'bg-rose-50/20'
                  : isSaturday
                  ? 'bg-amber-50/20'
                  : 'hover:bg-indigo-50/15';

                return (
                  <tr key={day.id} className={`${rowBg} transition-colors group`}>
                    {/* Sticky Date Col */}
                    <td className="sticky left-0 z-10 bg-white/95 group-hover:bg-slate-50 px-3 py-2 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {day.dateStr}
                        </span>
                        {day.holidayName && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1"
                            title={day.holidayName}
                          />
                        )}
                      </div>
                      {day.holidayName && (
                        <div className="text-[10px] font-semibold text-rose-600 truncate max-w-[100px] mt-0.5">
                          {day.holidayName}
                        </div>
                      )}
                    </td>

                    {/* Day of Week */}
                    <td
                      className={`px-2 py-2 text-center font-extrabold border-r border-slate-200 text-xs ${
                        isSunday
                          ? 'text-rose-600 bg-rose-50/60'
                          : isSaturday
                          ? 'text-amber-700 bg-amber-50/40'
                          : 'text-slate-700'
                      }`}
                    >
                      {day.dayOfWeek}
                    </td>

                    {/* Week Number (SEM) */}
                    <td className="px-2 py-2 text-center font-mono text-[10px] text-slate-400 border-r border-slate-200">
                      S{day.weekNumber}
                    </td>

                    {/* Coverage Indicators */}
                    <td className="px-2 py-1.5 text-center border-r border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono">
                        <span
                          className="flex items-center gap-0.5 text-emerald-800 font-extrabold bg-emerald-100 px-1 py-0.5 rounded border border-emerald-300/60"
                          title={`${coverage.morningCount} trabajadores en Turno Mañana`}
                        >
                          <Sun className="w-2.5 h-2.5 text-emerald-700" />
                          {coverage.morningCount}
                        </span>
                        <span
                          className="flex items-center gap-0.5 text-blue-800 font-extrabold bg-blue-100 px-1 py-0.5 rounded border border-blue-300/60"
                          title={`${coverage.afternoonCount} trabajadores en Turno Tarde`}
                        >
                          <Moon className="w-2.5 h-2.5 text-blue-700" />
                          {coverage.afternoonCount}
                        </span>
                      </div>
                    </td>

                    {/* Shifts for each employee */}
                    {displayedEmployees.map((emp) => {
                      const shift = day.shifts[emp.id];
                      const badge = getShiftBadgeStyle(shift, displayMode);

                      const isMyCell = currentUser?.employeeId === emp.id;
                      const isFocused = focusedEmpId === emp.id;
                      const isHovered = hoveredEmpId === emp.id;

                      return (
                        <td
                          key={emp.id}
                          onMouseEnter={() => setHoveredEmpId(emp.id)}
                          onMouseLeave={() => setHoveredEmpId(null)}
                          onClick={() =>
                            setEditingTarget({
                              day,
                              employee: emp,
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
                          className={`px-2 py-1.5 border-r border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-inset transition-all ${
                            isFocused
                              ? 'bg-amber-50/40'
                              : isMyCell
                              ? 'bg-indigo-50/40'
                              : isHovered
                              ? 'bg-slate-100/50'
                              : ''
                          }`}
                          title={
                            isAdmin
                              ? `Editar turno de ${emp.shortName} (${day.dateStr}): ${badge.label}`
                              : `Ver detalle de turno de ${emp.shortName} (${day.dateStr}): ${badge.label} (Modo Lectura)`
                          }
                        >
                          <div
                            className={`px-2 py-1 rounded-lg border text-center transition-all active:scale-95 flex items-center justify-between gap-1 shadow-2xs ${badge.bg}`}
                          >
                            <span className="font-bold text-[11px] truncate tracking-tight">
                              {badge.badge}
                            </span>
                            {shift && shift.totalHours > 0 && displayMode !== 'hours' && (
                              <span className="text-[10px] font-mono font-extrabold opacity-75 shrink-0">
                                {shift.totalHours}h
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. TABLE FOOTER & CLEAR LEGEND */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3 flex-wrap font-medium">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Leyenda de turnos:</span>

            <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 font-bold text-[11px]">
              <span>☀️ M</span>
              <span className="font-normal text-emerald-900">(Mañana 9:30-15:00)</span>
            </span>

            <span className="flex items-center gap-1.5 bg-blue-100 text-blue-950 px-2 py-0.5 rounded-md border border-blue-300 font-bold text-[11px]">
              <span>🌙 T</span>
              <span className="font-normal text-blue-900">(Tarde 15:00-21:00)</span>
            </span>

            <span className="flex items-center gap-1.5 bg-purple-100 text-purple-950 px-2 py-0.5 rounded-md border border-purple-300 font-bold text-[11px]">
              <span>⚡ D</span>
              <span className="font-normal text-purple-900">(Doble 9:30-21:00)</span>
            </span>

            <span className="flex items-center gap-1.5 bg-cyan-100 text-cyan-950 px-2 py-0.5 rounded-md border border-cyan-300 font-bold text-[11px]">
              <span>🏖️ VAC</span>
              <span className="font-normal text-cyan-900">(Vacaciones)</span>
            </span>

            <span className="flex items-center gap-1.5 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-300 font-medium text-[11px]">
              <span>💤 LIB</span>
              <span className="font-normal text-slate-600">(Libranza)</span>
            </span>

            <span className="flex items-center gap-1.5 bg-rose-100 text-rose-950 px-2 py-0.5 rounded-md border border-rose-300 font-bold text-[11px]">
              <span>🎉 FES</span>
              <span className="font-normal text-rose-900">(Festivo)</span>
            </span>
          </div>

          <div className="text-slate-500 font-medium text-[11px]">
            {isAdmin ? (
              <span>💡 Haz clic en cualquier celda para modificar turno o ajustar horarios</span>
            ) : (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                🔒 Modo Consulta: Haz clic para ver detalles del turno
              </span>
            )}
          </div>
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
