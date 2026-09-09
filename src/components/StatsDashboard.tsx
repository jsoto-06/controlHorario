import { useMemo } from 'react';
import { BarChart3, Clock, Palmtree, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { YearSchedule } from '../types';

interface StatsDashboardProps {
  schedule: YearSchedule;
}

export default function StatsDashboard({ schedule }: StatsDashboardProps) {
  const teamStats = useMemo(() => {
    let totalTeamHours = 0;
    const employeeMetrics: {
      empId: string;
      name: string;
      shortName: string;
      color: string;
      totalHours: number;
      targetHours: number;
      diff: number;
      vacationDays: number;
      sickDays: number;
      weekendsWorked: number;
    }[] = [];

    for (const emp of schedule.employees) {
      let hours = 0;
      let vacations = 0;
      let sick = 0;
      let weekends = 0;

      for (const d of schedule.days) {
        const shift = d.shifts[emp.id];
        if (!shift) continue;

        if (shift.totalHours > 0) {
          hours += shift.totalHours;
          if (d.dayOfWeek === 'S' || d.dayOfWeek === 'D') {
            weekends++;
          }
        }

        if (shift.status === 'Vacaciones') vacations++;
        if (shift.status === 'Baja') sick++;
      }

      totalTeamHours += hours;
      const target = emp.contractHoursPerYear || 1760;

      employeeMetrics.push({
        empId: emp.id,
        name: emp.name,
        shortName: emp.shortName,
        color: emp.color,
        totalHours: Math.round(hours * 100) / 100,
        targetHours: target,
        diff: Math.round((hours - target) * 100) / 100,
        vacationDays: vacations,
        sickDays: sick,
        weekendsWorked: weekends,
      });
    }

    // Sort by hours
    employeeMetrics.sort((a, b) => b.totalHours - a.totalHours);

    return {
      totalTeamHours: Math.round(totalTeamHours),
      avgHoursPerEmp: Math.round(totalTeamHours / (schedule.employees.length || 1)),
      employeeMetrics,
    };
  }, [schedule]);

  return (
    <div className="space-y-5">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Bolsa Total de Horas Equipo</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {teamStats.totalTeamHours.toLocaleString()} h
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Cómputo anual de la plantilla ({schedule.year})
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Media de Horas por Empleado</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {teamStats.avgHoursPerEmp} h
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Meta de convenio estándar: 1.760 h/año
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Plantilla Activa</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {schedule.employees.length} profesionales
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Rotación continua mañana / tarde
          </div>
        </div>
      </div>

      {/* Equity & Balance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Equidad Horaria y Cumplimiento de Convenio por Empleado
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Año {schedule.year}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3 text-right">Horas Acumuladas</th>
                <th className="px-4 py-3 text-center">Progreso Convenio</th>
                <th className="px-4 py-3 text-right">Diferencia</th>
                <th className="px-4 py-3 text-center">Vacaciones Usadas</th>
                <th className="px-4 py-3 text-center">Fines de Semana</th>
                <th className="px-4 py-3 text-center">Bajas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamStats.employeeMetrics.map((item) => {
                const pct = Math.min(120, Math.round((item.totalHours / item.targetHours) * 100));

                return (
                  <tr key={item.empId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span title={item.name}>{item.shortName}</span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {item.totalHours.toFixed(1)}h
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-xs mx-auto">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct > 105 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 w-9 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={
                          item.diff >= 0
                            ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded'
                            : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded'
                        }
                      >
                        {item.diff >= 0 ? `+${item.diff}h` : `${item.diff}h`}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono">
                      <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {item.vacationDays} / 30 d
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono text-slate-700">
                      {item.weekendsWorked} d
                    </td>

                    <td className="px-4 py-3 text-center font-mono text-orange-700">
                      {item.sickDays > 0 ? `${item.sickDays} d` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
