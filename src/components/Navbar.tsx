import { Calendar, CalendarPlus, Download, BookOpen, Layers, BarChart2, User, Table, Users, Shield, Lock, LogIn, LogOut, KeyRound, Eye } from 'lucide-react';
import { YearSchedule, AppUser } from '../types';

interface NavbarProps {
  currentSchedule: YearSchedule;
  allSchedules: YearSchedule[];
  onSelectYear: (year: number) => void;
  activeTab: 'cuadrante' | 'semanal' | 'empleado' | 'stats';
  onChangeTab: (tab: 'cuadrante' | 'semanal' | 'empleado' | 'stats') => void;
  onOpenNewYearModal: () => void;
  onOpenGuideModal: () => void;
  onOpenManageEmployeesModal: () => void;
  onExportExcel: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  currentUser?: AppUser | null;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  currentSchedule,
  allSchedules,
  onSelectYear,
  activeTab,
  onChangeTab,
  onOpenNewYearModal,
  onOpenGuideModal,
  onOpenManageEmployeesModal,
  onExportExcel,
  isAdmin,
  onToggleAdmin,
  currentUser,
  onOpenLoginModal,
  onLogout,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-3">
          {/* Logo & Year Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                  Gestor de Cuadrantes
                </h1>
                {/* Year Select dropdown */}
                <select
                  value={currentSchedule.year}
                  onChange={(e) => onSelectYear(Number(e.target.value))}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold font-mono text-xs px-2.5 py-1 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                >
                  {allSchedules.map((s) => (
                    <option key={s.year} value={s.year}>
                      Año {s.year}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Planificación anual de turnos, mañanas / tardes y cómputo de horas
              </p>
            </div>
          </div>

          {/* Action Buttons & Role / User Login Status */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1 pl-2 pr-1.5 rounded-xl shadow-2xs">
                {/* User avatar dot / badge */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-xs"
                    style={{ backgroundColor: currentUser.color || '#4338ca' }}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate" title={currentUser.name}>
                        {currentUser.name}
                      </span>
                      {currentUser.role === 'admin' ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                          <Eye className="w-2.5 h-2.5" />
                          Lectura
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Switch / Login Button */}
                <button
                  type="button"
                  onClick={onOpenLoginModal || onToggleAdmin}
                  className="text-[11px] font-medium text-slate-600 hover:text-indigo-700 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer ml-1"
                  title="Cambiar de usuario o identificarse con PIN"
                >
                  Cambiar
                </button>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal || onToggleAdmin}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shadow-indigo-200 cursor-pointer"
                title="Iniciar sesión con tu usuario y PIN"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            {/* Action Buttons based on Role */}
            {isAdmin && (
              <button
                onClick={onOpenManageEmployeesModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Gestionar plantilla de trabajadores y roles (Solo Administrador)"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Plantilla ({currentSchedule.employees.length})</span>
              </button>
            )}

            <button
              onClick={onOpenGuideModal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Guía con las mejores prácticas para crear y gestionar el horario año tras año"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Guía</span>
            </button>

            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Descargar cuadrante en formato Excel .xlsx"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenNewYearModal}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Crear un nuevo año o duplicar cuadrante (Solo Administrador)"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Crear / Duplicar Año</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-1 -mb-px overflow-x-auto">
          {/* If worker: Put 'Mi Horario' first */}
          {!isAdmin ? (
            <>
              <button
                onClick={() => onChangeTab('empleado')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'empleado'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Mi Horario Personal ({currentUser?.shortName || currentUser?.name || 'Empleado'})</span>
              </button>

              <button
                onClick={() => onChangeTab('cuadrante')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'cuadrante'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Cuadrante del Equipo (Consulta)</span>
              </button>

              <button
                onClick={() => onChangeTab('semanal')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'semanal'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vista Semanal</span>
              </button>
            </>
          ) : (
            /* Admin Tabs */
            <>
              <button
                onClick={() => onChangeTab('cuadrante')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'cuadrante'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Matriz Cuadrante (Excel)</span>
              </button>

              <button
                onClick={() => onChangeTab('semanal')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'semanal'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vista Semanal</span>
              </button>

              <button
                onClick={() => onChangeTab('empleado')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'empleado'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Por Empleado</span>
              </button>

              <button
                onClick={() => onChangeTab('stats')}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'stats'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Estadísticas & Cómputo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
