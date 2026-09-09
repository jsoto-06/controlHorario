import { DayRecord, Employee, YearSchedule, ShiftEntry } from '../types';

export const SPANISH_MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const SPANISH_MONTH_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sept',
  'oct',
  'nov',
  'dic',
];

export const DAYS_OF_WEEK_SHORT: ('L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D')[] = [
  'D',
  'L',
  'M',
  'X',
  'J',
  'V',
  'S',
]; // 0=Sunday, 1=Monday...

// Helper to calculate Easter Sunday for Catholic calendar (Meeus/Jones/Butcher algorithm)
function getEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

// Get standard holidays in Spain for a given year
export function getNationalHolidays(year: number): Map<string, string> {
  const holidays = new Map<string, string>();

  // Fixed holidays
  holidays.set(`${year}-01-01`, 'Año Nuevo');
  holidays.set(`${year}-01-06`, 'Epifanía del Señor (Reyes)');
  holidays.set(`${year}-05-01`, 'Fiesta del Trabajo');
  holidays.set(`${year}-08-15`, 'Asunción de la Virgen');
  holidays.set(`${year}-10-12`, 'Fiesta Nacional de España');
  holidays.set(`${year}-11-01`, 'Todos los Santos');
  holidays.set(`${year}-12-06`, 'Día de la Constitución');
  holidays.set(`${year}-12-08`, 'Inmaculada Concepción');
  holidays.set(`${year}-12-25`, 'Navidad');

  // Easter movable holidays
  const easter = getEasterSunday(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);

  // Good Friday (Viernes Santo) = Easter - 2 days
  const goodFriday = new Date(easterDate);
  goodFriday.setDate(easterDate.getDate() - 2);
  const gfMonth = String(goodFriday.getMonth() + 1).padStart(2, '0');
  const gfDay = String(goodFriday.getDate()).padStart(2, '0');
  holidays.set(`${year}-${gfMonth}-${gfDay}`, 'Viernes Santo');

  // Holy Thursday (Jueves Santo) = Easter - 3 days
  const holyThursday = new Date(easterDate);
  holyThursday.setDate(easterDate.getDate() - 3);
  const htMonth = String(holyThursday.getMonth() + 1).padStart(2, '0');
  const htDay = String(holyThursday.getDate()).padStart(2, '0');
  holidays.set(`${year}-${htMonth}-${htDay}`, 'Jueves Santo');

  return holidays;
}

// Calculate ISO Week Number
export function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Generate full year days for any given year
export function generateEmptyYearCalendar(year: number, employees: Employee[]): DayRecord[] {
  const days: DayRecord[] = [];
  const holidays = getNationalHolidays(year);

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeekIdx = d.getDay(); // 0=Sunday
    const dayOfWeekLetter = (
      dayOfWeekIdx === 0 ? 'D' : ['D', 'L', 'M', 'X', 'J', 'V', 'S'][dayOfWeekIdx]
    ) as 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';

    const id = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateStr = `${day}-${SPANISH_MONTH_SHORT[m - 1]}`;
    const weekNumber = getISOWeekNumber(d);
    const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6; // Saturday or Sunday
    const isHoliday = holidays.has(id);
    const holidayName = holidays.get(id);

    // Initial shifts for each employee
    const shifts: Record<string, ShiftEntry> = {};
    for (const emp of employees) {
      if (isHoliday || dayOfWeekIdx === 0) {
        // Sundays & Holidays default to Festivo
        shifts[emp.id] = {
          status: 'Festivo',
          morningIn: '',
          morningOut: '',
          afternoonIn: '',
          afternoonOut: '',
          totalHours: 0,
          festivoLaborable: false,
          disfruteFestivo: false,
        };
      } else {
        // Default working day placeholder
        shifts[emp.id] = {
          status: 'Horas normales',
          morningIn: '',
          morningOut: '',
          afternoonIn: '',
          afternoonOut: '',
          totalHours: 0,
          festivoLaborable: false,
          disfruteFestivo: false,
        };
      }
    }

    days.push({
      id,
      year: y,
      month: m,
      day,
      dateStr,
      dayOfWeek: dayOfWeekLetter,
      weekNumber,
      isWeekend,
      isHoliday: isHoliday || dayOfWeekIdx === 0,
      holidayName,
      shifts,
    });
  }

  return days;
}

// Clone/Roll-over schedule to next year
export function rolloverYearSchedule(
  sourceSchedule: YearSchedule,
  targetYear: number,
  options: {
    cloneRotationPattern: boolean;
    keepEmployees: boolean;
    resetVacations: boolean;
  }
): YearSchedule {
  const employees = options.keepEmployees
    ? sourceSchedule.employees.map((emp) => ({ ...emp }))
    : [...sourceSchedule.employees];

  const newDays = generateEmptyYearCalendar(targetYear, employees);

  if (options.cloneRotationPattern) {
    // Map previous year weekday shift patterns
    // For each weekday (L, M, X, J, V, S), find dominant shift per employee or cycle
    const weekdayShifts: Record<string, Record<string, ShiftEntry>> = {};
    for (const emp of employees) {
      weekdayShifts[emp.id] = {};
    }

    // Sample from normal weeks of previous year
    for (const d of sourceSchedule.days) {
      if (d.month === 2) { // February is typically regular
        for (const emp of employees) {
          const shift = d.shifts[emp.id];
          if (shift && shift.status === 'Horas normales' && shift.totalHours > 0) {
            weekdayShifts[emp.id][d.dayOfWeek] = { ...shift };
          }
        }
      }
    }

    // Apply baseline weekday shifts to target year (excluding holidays & Sundays)
    for (const day of newDays) {
      if (!day.isHoliday && day.dayOfWeek !== 'D') {
        for (const emp of employees) {
          const base = weekdayShifts[emp.id]?.[day.dayOfWeek];
          if (base) {
            day.shifts[emp.id] = {
              ...base,
              notes: undefined,
            };
          }
        }
      }
    }
  }

  return {
    year: targetYear,
    name: `Cuadrante Anual ${targetYear}`,
    employees,
    days: newDays,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
