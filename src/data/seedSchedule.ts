import { YearSchedule, DayRecord, ShiftEntry } from '../types';
import { INITIAL_EMPLOYEES } from './initialEmployees';
import { generateEmptyYearCalendar } from '../utils/calendarGenerator';

export function createInitial2026Schedule(): YearSchedule {
  const employees = INITIAL_EMPLOYEES;
  const days = generateEmptyYearCalendar(2026, employees);

  // Helper to apply shift to a day
  const applyShift = (
    day: DayRecord,
    empId: string,
    shift: Partial<ShiftEntry>
  ) => {
    day.shifts[empId] = {
      status: shift.status || 'Horas normales',
      morningIn: shift.morningIn || '',
      morningOut: shift.morningOut || '',
      afternoonIn: shift.afternoonIn || '',
      afternoonOut: shift.afternoonOut || '',
      totalHours: shift.totalHours ?? 0,
      festivoLaborable: shift.festivoLaborable || false,
      disfruteFestivo: shift.disfruteFestivo || false,
      notes: shift.notes,
    };
  };

  const M: Partial<ShiftEntry> = {
    status: 'Horas normales',
    morningIn: '9:30',
    morningOut: '15:00',
    totalHours: 5.5,
  };

  const T: Partial<ShiftEntry> = {
    status: 'Horas normales',
    afternoonIn: '15:00',
    afternoonOut: '21:00',
    totalHours: 6.0,
  };

  const LIB: Partial<ShiftEntry> = {
    status: 'Libranza',
    totalHours: 0,
  };

  const VAC: Partial<ShiftEntry> = {
    status: 'Vacaciones',
    totalHours: 0,
  };

  const BAJA: Partial<ShiftEntry> = {
    status: 'Baja',
    totalHours: 4.91,
  };

  const AP: Partial<ShiftEntry> = {
    status: 'Asuntos propios',
    totalHours: 0,
  };

  const FORM: Partial<ShiftEntry> = {
    status: 'Formación',
    morningIn: '10:00',
    morningOut: '12:00',
    afternoonIn: '15:00',
    afternoonOut: '21:00',
    totalHours: 8.0,
  };

  // Base schedule generation for 2026:
  // Distribute shifts across employees in a realistic two-turn rotation (Mañana vs Tarde)
  days.forEach((d) => {
    if (d.dayOfWeek === 'D' || d.isHoliday) {
      // Festivo for all by default
      employees.forEach((emp) => {
        applyShift(d, emp.id, {
          status: 'Festivo',
          totalHours: 0,
        });
      });
      return;
    }

    // Bi-weekly alternating rotation pattern:
    // Even weeks vs Odd weeks
    const isEvenWeek = d.weekNumber % 2 === 0;

    // Team Group 1: Aitor, Ignacio, Aldo
    // Team Group 2: Javier, Kevin, Jonathan, David
    if (isEvenWeek) {
      applyShift(d, 'aitor', T);
      applyShift(d, 'ignacio', T);
      applyShift(d, 'aldo', M);

      applyShift(d, 'javier', M);
      applyShift(d, 'kevin', M);
      applyShift(d, 'jonathan', T);
      if (d.month >= 7) applyShift(d, 'david', M);
    } else {
      applyShift(d, 'aitor', M);
      applyShift(d, 'ignacio', M);
      applyShift(d, 'aldo', T);

      applyShift(d, 'javier', T);
      applyShift(d, 'kevin', T);
      applyShift(d, 'jonathan', M);
      if (d.month >= 7) applyShift(d, 'david', T);
    }

    // Weekly rest day (Libranza) on Saturday or a weekday
    if (d.dayOfWeek === 'S') {
      applyShift(d, isEvenWeek ? 'javier' : 'ignacio', LIB);
      applyShift(d, isEvenWeek ? 'aitor' : 'kevin', LIB);
    }

    // Specific known special periods from user Excel:
    // January holidays
    if (d.month === 1 && d.day === 1) {
      employees.forEach((emp) => applyShift(d, emp.id, { status: 'Festivo', totalHours: 0 }));
    }
    if (d.month === 1 && d.day === 6) {
      employees.forEach((emp) => applyShift(d, emp.id, { status: 'Festivo', totalHours: 0 }));
    }

    // Specific training days
    if (d.month === 2 && d.day === 26) {
      applyShift(d, 'kevin', FORM);
    }

    // Vacations for Javier in late March / early April
    if ((d.month === 3 && d.day >= 30) || (d.month === 4 && d.day <= 5)) {
      applyShift(d, 'javier', VAC);
    }

    // Vacations for Jonathan in April
    if (d.month === 4 && d.day >= 6 && d.day <= 12) {
      applyShift(d, 'jonathan', VAC);
    }

    // Vacations for Aldo in late April
    if (d.month === 4 && d.day >= 20 && d.day <= 26) {
      applyShift(d, 'aldo', VAC);
    }

    // Vacations for Aitor in late April / early May
    if ((d.month === 4 && d.day >= 27) || (d.month === 5 && d.day <= 3)) {
      applyShift(d, 'aitor', VAC);
    }

    // Vacations for Kevin in late June
    if (d.month === 6 && d.day >= 22 && d.day <= 28) {
      applyShift(d, 'kevin', VAC);
    }

    // Vacations for Aldo in July
    if (d.month === 7 && d.day >= 6 && d.day <= 19) {
      applyShift(d, 'aldo', VAC);
    }

    // Vacations for Ignacio in early August
    if (d.month === 8 && d.day >= 1 && d.day <= 16) {
      applyShift(d, 'ignacio', VAC);
    }

    // Vacations for Jonathan in late August
    if (d.month === 8 && d.day >= 17 && d.day <= 30) {
      applyShift(d, 'jonathan', VAC);
    }

    // Vacations for Javier in early September
    if (d.month === 9 && d.day >= 1 && d.day <= 13) {
      applyShift(d, 'javier', VAC);
    }

    // Vacations for Aitor in mid September
    if (d.month === 9 && d.day >= 14 && d.day <= 27) {
      applyShift(d, 'aitor', VAC);
    }

    // Vacations for Aldo in October
    if (d.month === 10 && d.day >= 5 && d.day <= 11) {
      applyShift(d, 'aldo', VAC);
    }

    // Vacations for David in late October
    if (d.month === 10 && d.day >= 19 && d.day <= 25) {
      applyShift(d, 'david', VAC);
    }

    // Vacations for Kevin in late November
    if (d.month === 11 && d.day >= 16 && d.day <= 29) {
      applyShift(d, 'kevin', VAC);
    }

    // Vacations for Ignacio in early December
    if (d.month === 12 && d.day >= 1 && d.day <= 9) {
      applyShift(d, 'ignacio', VAC);
    }

    // Vacations for David in mid December
    if (d.month === 12 && d.day >= 14 && d.day <= 20) {
      applyShift(d, 'david', VAC);
    }

    // Vacations for Javier in late December
    if (d.month === 12 && d.day >= 28 && d.day <= 31) {
      applyShift(d, 'javier', VAC);
    }
  });

  return {
    year: 2026,
    name: 'Cuadrante Anual 2026',
    employees,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
