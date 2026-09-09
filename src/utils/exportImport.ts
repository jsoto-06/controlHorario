import * as XLSX from 'xlsx';
import { YearSchedule, DayRecord } from '../types';

export function exportScheduleToExcel(schedule: YearSchedule): void {
  const headers: string[] = ['MES', 'AÑO', 'SEM', 'Fecha', 'Día'];

  schedule.employees.forEach((emp, index) => {
    headers.push(
      `Empleado${index + 1}`,
      emp.name,
      'Entrada MAÑANA',
      'Salida MAÑANA',
      'Entrada TARDE',
      'Salida TARDE',
      `TOTAL trabajadas${index + 1}`,
      `Festivos laborables${index + 1}`,
      `Disfrute Festivos laborables${index + 1}`
    );
  });

  const rows: (string | number)[][] = [headers];

  for (const day of schedule.days) {
    const row: (string | number)[] = [
      day.month,
      day.year,
      day.weekNumber,
      day.dateStr,
      day.dayOfWeek,
    ];

    for (const emp of schedule.employees) {
      const shift = day.shifts[emp.id];
      if (!shift) {
        row.push(emp.name, '', '', '', '', '', '-', '-', '-');
      } else {
        row.push(
          emp.name,
          shift.status,
          shift.morningIn || '',
          shift.morningOut || '',
          shift.afternoonIn || '',
          shift.afternoonOut || '',
          shift.totalHours > 0 ? shift.totalHours.toFixed(2).replace('.', ',') : '-',
          shift.festivoLaborable ? 'SÍ' : '-',
          shift.disfruteFestivo ? 'SÍ' : '-'
        );
      }
    }
    rows.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Cuadrante ${schedule.year}`);

  XLSX.writeFile(workbook, `Horario_Turnos_${schedule.year}.xlsx`);
}

export function exportScheduleToCSV(schedule: YearSchedule): void {
  const headers = ['MES', 'AÑO', 'SEM', 'Fecha', 'Día'];
  schedule.employees.forEach((emp, index) => {
    headers.push(
      `Empleado${index + 1}`,
      emp.name,
      'Entrada MAÑANA',
      'Salida MAÑANA',
      'Entrada TARDE',
      'Salida TARDE',
      `TOTAL trabajadas${index + 1}`
    );
  });

  const lines = [headers.join('\t')];
  for (const day of schedule.days) {
    const r: string[] = [
      String(day.month),
      String(day.year),
      String(day.weekNumber),
      day.dateStr,
      day.dayOfWeek,
    ];
    for (const emp of schedule.employees) {
      const shift = day.shifts[emp.id];
      if (shift) {
        r.push(
          emp.name,
          shift.status,
          shift.morningIn,
          shift.morningOut,
          shift.afternoonIn,
          shift.afternoonOut,
          shift.totalHours > 0 ? shift.totalHours.toFixed(2).replace('.', ',') : '-'
        );
      } else {
        r.push(emp.name, '', '', '', '', '', '-');
      }
    }
    lines.push(r.join('\t'));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Horario_Turnos_${schedule.year}.tsv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
