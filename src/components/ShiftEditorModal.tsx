import { useState } from 'react';
import { X, Clock, Calendar, Check, AlertCircle, Lock, Shield, Info } from 'lucide-react';
import { ShiftEntry, ShiftStatus, Employee, DayRecord } from '../types';
import { SHIFT_PRESETS, calculateHoursFromTimes } from '../data/presets';

interface ShiftEditorModalProps {
  day: DayRecord;
  employee: Employee;
  shift: ShiftEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShift: ShiftEntry) => void;
  isAdmin?: boolean;
  onPromptAdminLogin?: () => void;
}

export default function ShiftEditorModal({
  day,
  employee,
  shift,
  isOpen,
  onClose,
  onSave,
  isAdmin = true,
  onPromptAdminLogin,
}: ShiftEditorModalProps) {
  if (!isOpen) return null;

  const [status, setStatus] = useState<ShiftStatus>(shift.status || 'Horas normales');
  const [morningIn, setMorningIn] = useState(shift.morningIn || '');
  const [morningOut, setMorningOut] = useState(shift.morningOut || '');
  const [afternoonIn, setAfternoonIn] = useState(shift.afternoonIn || '');
  const [afternoonOut, setAfternoonOut] = useState(shift.afternoonOut || '');
  const [totalHours, setTotalHours] = useState<number>(shift.totalHours || 0);
  const [festivoLaborable, setFestivoLaborable] = useState(Boolean(shift.festivoLaborable));
  const [disfruteFestivo, setDisfruteFestivo] = useState(Boolean(shift.disfruteFestivo));
  const [notes, setNotes] = useState(shift.notes || '');

  const applyPreset = (presetId: string) => {
    if (!isAdmin) return;
    const preset = SHIFT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setStatus(preset.status);
    setMorningIn(preset.morningIn);
    setMorningOut(preset.morningOut);
    setAfternoonIn(preset.afternoonIn);
    setAfternoonOut(preset.afternoonOut);
    setTotalHours(preset.defaultHours);
  };

  const handleRecalculateHours = () => {
    if (!isAdmin) return;
    const hours = calculateHoursFromTimes(
      morningIn,
      morningOut,
      afternoonIn,
      afternoonOut,
      status
    );
    setTotalHours(hours);
  };

  const handleSave = () => {
    if (!isAdmin) return;
    onSave({
      status,
      morningIn,
      morningOut,
      afternoonIn,
      afternoonOut,
      totalHours,
      festivoLaborable,
      disfruteFestivo,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: employee.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-base leading-tight">
                  {employee.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-800 flex items-center gap-1'
                }`}>
                  {isAdmin ? 'Modo Edición' : <><Lock className="w-3 h-3" /> Solo Lectura</>}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {day.dayOfWeek} {day.dateStr} {day.year} (Semana {day.weekNumber})
                {day.holidayName && (
                  <span className="ml-2 text-rose-600 font-semibold">
                    • {day.holidayName}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!isAdmin ? (
          /* READ-ONLY VIEW */
          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Vista de Solo Lectura</p>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  Estás visualizando el turno en modo protegido. Si necesitas modificar el horario, accede como administrador.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado / Turno</span>
                <p className="text-sm font-bold text-slate-800">{shift.status || 'Horas normales'}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Horas Computadas</span>
                <p className="text-sm font-extrabold font-mono text-indigo-700">{shift.totalHours || 0} h</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horarios Programados</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">☀️ Mañana: </span>
                  <strong className="font-mono text-slate-800">
                    {shift.morningIn && shift.morningOut ? `${shift.morningIn} - ${shift.morningOut}` : 'Sin turno mañana'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">🌙 Tarde: </span>
                  <strong className="font-mono text-slate-800">
                    {shift.afternoonIn && shift.afternoonOut ? `${shift.afternoonIn} - ${shift.afternoonOut}` : 'Sin turno tarde'}
                  </strong>
                </div>
              </div>
            </div>

            {(shift.festivoLaborable || shift.disfruteFestivo) && (
              <div className="flex gap-2">
                {shift.festivoLaborable && (
                  <span className="text-xs px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-medium">
                    Festivo Laborable
                  </span>
                )}
                {shift.disfruteFestivo && (
                  <span className="text-xs px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium">
                    Disfrute Festivo
                  </span>
                )}
              </div>
            )}

            {shift.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observaciones</span>
                <p className="text-xs text-slate-700 italic">"{shift.notes}"</p>
              </div>
            )}
          </div>
        ) : (
          /* ADMIN EDITING VIEW */
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Quick Preset Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Presets Rápidos de Turno
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SHIFT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`text-xs px-2.5 py-2 rounded-lg border font-medium text-left transition-all cursor-pointer ${
                      status === preset.status && totalHours === preset.defaultHours
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{preset.shortCode}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {preset.defaultHours > 0 ? `${preset.defaultHours}h` : '0h'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">
                      {preset.label.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Inputs */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Horas de Entrada y Salida
                </span>
                <button
                  type="button"
                  onClick={handleRecalculateHours}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                >
                  Recalcular Horas
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Mañana (Entrada - Salida)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={morningIn}
                      onChange={(e) => setMorningIn(e.target.value)}
                      onBlur={handleRecalculateHours}
                      placeholder="09:30"
                      className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="text"
                      value={morningOut}
                      onChange={(e) => setMorningOut(e.target.value)}
                      onBlur={handleRecalculateHours}
                      placeholder="15:00"
                      className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tarde (Entrada - Salida)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={afternoonIn}
                      onChange={(e) => setAfternoonIn(e.target.value)}
                      onBlur={handleRecalculateHours}
                      placeholder="15:00"
                      className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="text"
                      value={afternoonOut}
                      onChange={(e) => setAfternoonOut(e.target.value)}
                      onBlur={handleRecalculateHours}
                      placeholder="21:00"
                      className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Total Hours Computed */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Total horas computable:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={totalHours}
                    onChange={(e) => setTotalHours(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right text-sm font-bold font-mono px-2.5 py-1 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden text-slate-800"
                  />
                  <span className="text-xs font-semibold text-slate-500">horas</span>
                </div>
              </div>
            </div>

            {/* Holiday and Festivo toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={festivoLaborable}
                  onChange={(e) => setFestivoLaborable(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Festivo Laborable</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disfruteFestivo}
                  onChange={(e) => setDisfruteFestivo(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Disfrute Festivo</span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Observaciones / Justificante
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Cambio de turno con Aitor, permiso médico..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-hidden text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
          {!isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPromptAdminLogin?.();
                }}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Acceder como Admin para Modificar</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </>
          ) : (
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
