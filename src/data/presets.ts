import { ShiftPreset, ShiftStatus, ShiftEntry } from '../types';

export const SHIFT_PRESETS: ShiftPreset[] = [
  {
    id: 'manana',
    label: 'Mañana (9:30 - 15:00)',
    shortCode: 'M',
    status: 'Horas normales',
    morningIn: '09:30',
    morningOut: '15:00',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 5.5,
    badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    badgeText: 'text-emerald-800',
    description: 'Turno Mañana: 5.5 horas',
  },
  {
    id: 'tarde',
    label: 'Tarde (15:00 - 21:00)',
    shortCode: 'T',
    status: 'Horas normales',
    morningIn: '',
    morningOut: '',
    afternoonIn: '15:00',
    afternoonOut: '21:00',
    defaultHours: 6.0,
    badgeBg: 'bg-blue-100 border-blue-300 text-blue-800',
    badgeText: 'text-blue-800',
    description: 'Turno Tarde: 6.0 horas',
  },
  {
    id: 'manana_temprano',
    label: 'Mañana 9:00 (9:00 - 15:00)',
    shortCode: 'M9',
    status: 'Horas normales',
    morningIn: '09:00',
    morningOut: '15:00',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 6.0,
    badgeBg: 'bg-teal-100 border-teal-300 text-teal-800',
    badgeText: 'text-teal-800',
    description: 'Turno Mañana adelantada: 6.0 horas',
  },
  {
    id: 'tarde_corta',
    label: 'Tarde corta (15:00 - 20:00)',
    shortCode: 'T5',
    status: 'Horas normales',
    morningIn: '',
    morningOut: '',
    afternoonIn: '15:00',
    afternoonOut: '20:00',
    defaultHours: 5.0,
    badgeBg: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    badgeText: 'text-indigo-800',
    description: 'Turno Tarde corta: 5.0 horas',
  },
  {
    id: 'completo',
    label: 'Doble turno (9:30 - 21:00)',
    shortCode: '2T',
    status: 'Horas normales',
    morningIn: '09:30',
    morningOut: '21:00',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 11.5,
    badgeBg: 'bg-purple-100 border-purple-300 text-purple-800',
    badgeText: 'text-purple-800',
    description: 'Doble turno continuo: 11.5 horas',
  },
  {
    id: 'formacion',
    label: 'Formación (10-12 / 15-21)',
    shortCode: 'FORM',
    status: 'Formación',
    morningIn: '10:00',
    morningOut: '12:00',
    afternoonIn: '15:00',
    afternoonOut: '21:00',
    defaultHours: 8.0,
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-800',
    badgeText: 'text-amber-800',
    description: 'Formación específica: 8.0 horas',
  },
  {
    id: 'libranza',
    label: 'Libranza',
    shortCode: 'LIB',
    status: 'Libranza',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 0,
    badgeBg: 'bg-slate-100 border-slate-300 text-slate-600',
    badgeText: 'text-slate-600',
    description: 'Día libre / descanso semanal',
  },
  {
    id: 'vacaciones',
    label: 'Vacaciones',
    shortCode: 'VAC',
    status: 'Vacaciones',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 0,
    badgeBg: 'bg-sky-100 border-sky-300 text-sky-800',
    badgeText: 'text-sky-800',
    description: 'Período vacacional anual',
  },
  {
    id: 'festivo',
    label: 'Festivo',
    shortCode: 'FES',
    status: 'Festivo',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 0,
    badgeBg: 'bg-rose-100 border-rose-300 text-rose-800',
    badgeText: 'text-rose-800',
    description: 'Festivo nacional o autonómico',
  },
  {
    id: 'baja',
    label: 'Baja Médica (4.91h)',
    shortCode: 'BAJA',
    status: 'Baja',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 4.91,
    badgeBg: 'bg-orange-100 border-orange-300 text-orange-800',
    badgeText: 'text-orange-800',
    description: 'Incapacidad temporal: cómputo 4.91h',
  },
  {
    id: 'asuntos_propios',
    label: 'Asuntos propios',
    shortCode: 'AP',
    status: 'Asuntos propios',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 0,
    badgeBg: 'bg-violet-100 border-violet-300 text-violet-800',
    badgeText: 'text-violet-800',
    description: 'Día de libre disposición',
  },
  {
    id: 'permiso',
    label: 'Permiso retribuido (5.05h)',
    shortCode: 'PR',
    status: 'Permiso Retribuido',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    defaultHours: 5.05,
    badgeBg: 'bg-lime-100 border-lime-300 text-lime-800',
    badgeText: 'text-lime-800',
    description: 'Permiso retribuido por convenio',
  },
];

export function calculateHoursFromTimes(
  morningIn: string,
  morningOut: string,
  afternoonIn: string,
  afternoonOut: string,
  status: ShiftStatus
): number {
  if (status === 'Baja') return 4.91;
  if (status === 'Permiso Retribuido') return 5.05;
  if (['Libranza', 'Vacaciones', 'Festivo', 'Asuntos propios'].includes(status)) {
    // If times are set on a festivo or day, calculate them; else 0
    if (!morningIn && !morningOut && !afternoonIn && !afternoonOut) return 0;
  }

  const parseToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const clean = timeStr.trim().replace('.', ':');
    const parts = clean.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  let totalMinutes = 0;
  const mIn = parseToMinutes(morningIn);
  const mOut = parseToMinutes(morningOut);
  if (mIn !== null && mOut !== null && mOut > mIn) {
    totalMinutes += mOut - mIn;
  }

  const aIn = parseToMinutes(afternoonIn);
  const aOut = parseToMinutes(afternoonOut);
  if (aIn !== null && aOut !== null && aOut > aIn) {
    totalMinutes += aOut - aIn;
  }

  if (totalMinutes > 0) {
    return Math.round((totalMinutes / 60) * 100) / 100;
  }

  return 0;
}

export type ShiftDisplayMode = 'visual' | 'times' | 'hours';

export function getShiftBadgeStyle(
  shift?: ShiftEntry,
  displayMode: ShiftDisplayMode = 'visual'
): {
  bg: string;
  badge: string;
  label: string;
  icon?: string;
  category: 'morning' | 'afternoon' | 'split' | 'vacation' | 'off' | 'holiday' | 'leave' | 'none';
} {
  if (!shift || !shift.status) {
    return {
      bg: 'bg-transparent text-slate-300 border-transparent',
      badge: '—',
      label: 'Sin asignar',
      category: 'none',
    };
  }

  const { status, morningIn, morningOut, afternoonIn, afternoonOut, totalHours } = shift;

  if (status === 'Festivo') {
    if (totalHours > 0) {
      return {
        bg: 'bg-rose-100 text-rose-950 border-rose-300 font-bold',
        badge: displayMode === 'hours' ? `🎉 ${totalHours}h` : displayMode === 'times' ? `🎉 ${morningIn || afternoonIn}` : `🎉 F·${totalHours}h`,
        label: `Festivo trabajado (${totalHours}h)`,
        icon: '🎉',
        category: 'holiday',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
      badge: '🎉 FES',
      label: 'Festivo',
      icon: '🎉',
      category: 'holiday',
    };
  }

  if (status === 'Vacaciones') {
    return {
      bg: 'bg-cyan-100 text-cyan-950 border-cyan-300 font-bold',
      badge: '🏖️ VAC',
      label: 'Vacaciones',
      icon: '🏖️',
      category: 'vacation',
    };
  }

  if (status === 'Libranza') {
    return {
      bg: 'bg-slate-50 text-slate-400 border-slate-200/80 font-medium',
      badge: displayMode === 'visual' ? '💤 LIB' : 'LIB',
      label: 'Libranza / Descanso',
      icon: '💤',
      category: 'off',
    };
  }

  if (status === 'Baja') {
    return {
      bg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      badge: displayMode === 'hours' ? `🏥 ${totalHours}h` : '🏥 BAJA',
      label: `Baja Médica (${totalHours}h)`,
      icon: '🏥',
      category: 'leave',
    };
  }

  if (status === 'Asuntos propios') {
    return {
      bg: 'bg-violet-100 text-violet-950 border-violet-300 font-bold',
      badge: 'AP',
      label: 'Asuntos propios',
      icon: '📁',
      category: 'leave',
    };
  }

  if (status === 'Permiso Retribuido') {
    return {
      bg: 'bg-lime-100 text-lime-950 border-lime-300 font-bold',
      badge: displayMode === 'hours' ? `PR·${totalHours}h` : 'PR',
      label: `Permiso (${totalHours}h)`,
      icon: '📋',
      category: 'leave',
    };
  }

  if (status === 'Formación') {
    return {
      bg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      badge: displayMode === 'hours' ? `🎓 ${totalHours}h` : '🎓 FORM',
      label: `Formación (${totalHours}h)`,
      icon: '🎓',
      category: 'leave',
    };
  }

  // Horas normales: check whether morning, afternoon, or split
  const isMorning = Boolean(morningIn && morningOut);
  const isAfternoon = Boolean(afternoonIn && afternoonOut);

  // Split / Double Shift
  if (isMorning && isAfternoon) {
    let badgeText = '⚡ Doble';
    if (displayMode === 'visual') badgeText = '⚡ D';
    else if (displayMode === 'hours') badgeText = `⚡ ${totalHours}h`;
    else if (displayMode === 'times') badgeText = `${morningIn}-${afternoonOut}`;

    return {
      bg: 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold',
      badge: badgeText,
      label: `Partido ${morningIn}-${morningOut} / ${afternoonIn}-${afternoonOut} (${totalHours}h)`,
      icon: '⚡',
      category: 'split',
    };
  }

  // Morning Shift
  if (isMorning) {
    const cleanIn = morningIn ? morningIn.replace(':00', '') : '9:30';
    const cleanOut = morningOut ? morningOut.replace(':00', '') : '15';

    let badgeText = '☀️ Mañana';
    if (displayMode === 'visual') {
      badgeText = `☀️ M (${cleanIn}-${cleanOut})`;
    } else if (displayMode === 'times') {
      badgeText = `☀️ ${morningIn}-${morningOut}`;
    } else if (displayMode === 'hours') {
      badgeText = `☀️ ${totalHours}h`;
    }

    return {
      bg: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold shadow-2xs',
      badge: badgeText,
      label: `Mañana ${morningIn}-${morningOut} (${totalHours}h)`,
      icon: '☀️',
      category: 'morning',
    };
  }

  // Afternoon Shift
  if (isAfternoon) {
    const cleanIn = afternoonIn ? afternoonIn.replace(':00', '') : '15';
    const cleanOut = afternoonOut ? afternoonOut.replace(':00', '') : '21';

    let badgeText = '🌙 Tarde';
    if (displayMode === 'visual') {
      badgeText = `🌙 T (${cleanIn}-${cleanOut})`;
    } else if (displayMode === 'times') {
      badgeText = `🌙 ${afternoonIn}-${afternoonOut}`;
    } else if (displayMode === 'hours') {
      badgeText = `🌙 ${totalHours}h`;
    }

    return {
      bg: 'bg-blue-100 text-blue-950 border-blue-300 font-bold shadow-2xs',
      badge: badgeText,
      label: `Tarde ${afternoonIn}-${afternoonOut} (${totalHours}h)`,
      icon: '🌙',
      category: 'afternoon',
    };
  }

  if (totalHours > 0) {
    return {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold',
      badge: `${totalHours}h`,
      label: `${totalHours} horas`,
      category: 'morning',
    };
  }

  return {
    bg: 'bg-slate-50/50 text-slate-300 border-slate-200/50',
    badge: '—',
    label: 'Sin turno asignado',
    category: 'none',
  };
}
