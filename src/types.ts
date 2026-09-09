export type ShiftStatus =
  | 'Horas normales'
  | 'Festivo'
  | 'Libranza'
  | 'Vacaciones'
  | 'Baja'
  | 'Asuntos propios'
  | 'Permiso Retribuido'
  | 'Formación'
  | 'Otro';

export type UserRole = 'admin' | 'worker';

export interface AppUser {
  id: string; // 'admin' or employee.id
  name: string;
  shortName?: string;
  email?: string;
  role: UserRole;
  employeeId?: string;
  pin?: string;
  color?: string;
}

export interface Employee {
  id: string;
  name: string;
  shortName: string;
  color: string;
  contractHoursPerYear: number;
  vacationDaysTotal: number;
  active: boolean;
  role?: UserRole;
  email?: string;
  pin?: string;
}

export interface ShiftEntry {
  status: ShiftStatus;
  morningIn: string; // e.g. "09:30"
  morningOut: string; // e.g. "15:00"
  afternoonIn: string; // e.g. "15:00"
  afternoonOut: string; // e.g. "21:00"
  totalHours: number; // e.g. 5.5
  festivoLaborable: boolean;
  disfruteFestivo: boolean;
  notes?: string;
}

export interface DayRecord {
  id: string; // "YYYY-MM-DD"
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  dateStr: string; // e.g. "29-dic", "1-ene"
  dayOfWeek: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
  weekNumber: number; // SEM (1 - 53)
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  shifts: Record<string, ShiftEntry>; // employeeId -> ShiftEntry
}

export interface YearSchedule {
  year: number;
  name: string;
  employees: Employee[];
  days: DayRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ShiftPreset {
  id: string;
  label: string;
  shortCode: string;
  status: ShiftStatus;
  morningIn: string;
  morningOut: string;
  afternoonIn: string;
  afternoonOut: string;
  defaultHours: number;
  badgeBg: string;
  badgeText: string;
  description: string;
}
