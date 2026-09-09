import { useState } from 'react';
import { X, CalendarPlus, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { YearSchedule } from '../types';
import { rolloverYearSchedule } from '../utils/calendarGenerator';

interface NewYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule: YearSchedule;
  onYearCreated: (newSchedule: YearSchedule) => void;
}

export default function NewYearModal({
  isOpen,
  onClose,
  currentSchedule,
  onYearCreated,
}: NewYearModalProps) {
  if (!isOpen) return null;

  const nextYear = currentSchedule.year + 1;
  const [targetYear, setTargetYear] = useState<number>(nextYear);
  const [cloneRotation, setCloneRotation] = useState(true);
  const [keepEmployees, setKeepEmployees] = useState(true);
  const [resetVacations, setResetVacations] = useState(true);

  const handleGenerate = () => {
    const newSchedule = rolloverYearSchedule(currentSchedule, targetYear, {
      cloneRotationPattern: cloneRotation,
      keepEmployees,
      resetVacations,
    });
    onYearCreated(newSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Cómo Crear y Gestionar el Cuadrante Cada Año
              </h2>
              <p className="text-xs text-slate-500">
                Metodología recomendada y asistente para generar el cuadrante anual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Best practice strategy guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
              <BookOpen className="w-4 h-4" />
              Metodología paso a paso para gestionar cada año
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-[13px]">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  Calendario y Festivos
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Generar automáticamente los 365 días con cálculo de festivos nacionales y semanas ISO.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-[13px]">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  Rotación Base
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Copiar el patrón de turnos rotativos (Mañana / Tarde) y libranzas semanales entre compañeros.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-[13px]">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  Vacaciones y Cómputo
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Planificar los bloques de vacaciones y controlar el saldo anual respecto al convenio (1.760h).
                </p>
              </div>
            </div>
          </div>

          {/* Generator settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Asistente de Creación para el Nuevo Año
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Año objetivo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={targetYear}
                    onChange={(e) => setTargetYear(parseInt(e.target.value, 10) || nextYear)}
                    className="w-full text-base font-bold font-mono px-3.5 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    (Base: {currentSchedule.year})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Plantilla de empleados ({currentSchedule.employees.length})
                </label>
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Se conservarán los {currentSchedule.employees.length} empleados activos actuales.
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneRotation}
                  onChange={(e) => setCloneRotation(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Replicar patrón de turnos rotativo (Mañanas y Tardes)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Mantiene la cadencia de turnos de mañana (9:30-15:00) y tarde (15:00-21:00) adaptada al nuevo calendario de días hábiles.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetVacations}
                  onChange={(e) => setResetVacations(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Limpiar vacaciones y bajas para planificar las nuevas
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Deja los días de vacaciones del año anterior como días laborables estándar para registrar el nuevo calendario de vacaciones de {targetYear}.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="text-xs text-slate-500">
            Podrás exportarlo a Excel o volver a {currentSchedule.year} en cualquier momento.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              Generar Cuadrante {targetYear}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
