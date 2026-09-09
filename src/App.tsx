import { useState, useEffect, useMemo } from 'react';
import { YearSchedule, ShiftEntry, Employee, AppUser } from './types';
import { createInitial2026Schedule } from './data/seedSchedule';
import { exportScheduleToExcel } from './utils/exportImport';
import {
  getAvailableUsers,
  saveUserPin,
  loadSavedUser,
  persistUser,
  SUPER_ADMIN_USER,
  getStoredUserPins,
  STORAGE_USER_PINS_KEY,
} from './utils/auth';
import {
  testConnection,
  subscribeToSchedules,
  saveScheduleToFirestore,
  subscribeToUserCredentials,
} from './firebase';
import Navbar from './components/Navbar';
import CuadranteTable from './components/CuadranteTable';
import WeeklyView from './components/WeeklyView';
import EmployeeView from './components/EmployeeView';
import StatsDashboard from './components/StatsDashboard';
import NewYearModal from './components/NewYearModal';
import BestPracticesGuide from './components/BestPracticesGuide';
import ManageEmployeesModal from './components/ManageEmployeesModal';
import UserLoginModal from './components/UserLoginModal';
import BulkShiftAssignModal, { BulkAssignConfig } from './components/BulkShiftAssignModal';
import LoginPage from './components/LoginPage';
import { CalendarPlus, BookOpen, Users, Check, Shield, Lock, KeyRound, Cloud, CalendarRange, Sparkles, LogOut } from 'lucide-react';

const STORAGE_KEY = 'cuadrante_schedules_v2';

// Helper to sanitize schedules (removes deleted employees manu and alejandro)
function sanitizeSchedules(list: YearSchedule[]): YearSchedule[] {
  return list.map((sched) => {
    const cleanEmployees = sched.employees
      .filter(
        (e) =>
          e.id !== 'manu' &&
          e.id !== 'alejandro' &&
          e.shortName !== 'Manu C.' &&
          e.shortName !== 'Alejandro G.'
      )
      .map((e): Employee => {
        if (e.id === 'jonathan' || e.email?.toLowerCase() === 'jonathan@empresa.com') {
          return {
            ...e,
            email: 'jonathan@empresa.com',
            role: 'admin',
          };
        }
        return e;
      });

    return {
      ...sched,
      employees: cleanEmployees.length > 0 ? cleanEmployees : createInitial2026Schedule().employees,
      days: sched.days.map((d) => {
        const cleanShifts = { ...d.shifts };
        delete cleanShifts['manu'];
        delete cleanShifts['alejandro'];
        return {
          ...d,
          shifts: cleanShifts,
        };
      }),
    };
  });
}

export default function App() {
  // Load stored schedules or initialize with 2026
  const [schedules, setSchedules] = useState<YearSchedule[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      const savedV1 = localStorage.getItem('cuadrante_schedules_v1');
      const raw = savedV2 || savedV1;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeSchedules(parsed);
        }
      }
    } catch {
      // fallback
    }
    return [createInitial2026Schedule()];
  });

  const [activeYear, setActiveYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'cuadrante' | 'semanal' | 'empleado' | 'stats'>('cuadrante');
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // Default to current work month (February) for immediate clear view

  const [isNewYearModalOpen, setIsNewYearModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [bulkSuccessNotice, setBulkSuccessNotice] = useState<string | null>(null);

  // Current active schedule
  const currentSchedule = schedules.find((s) => s.year === activeYear) || schedules[0];

  // List of available users for login
  const availableUsers = useMemo(() => {
    return getAvailableUsers(currentSchedule.employees);
  }, [currentSchedule.employees]);

  // Current logged in user (null by default so the login screen appears first, or loaded from saved session)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const initialSched = createInitial2026Schedule();
      const users = getAvailableUsers(initialSched.employees);
      const saved = loadSavedUser(users);
      if (saved) return saved;
      return null;
    } catch {
      return null;
    }
  });

  // Calculate admin privilege based on logged-in user
  const isAdmin = currentUser?.role === 'admin';

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch {
      // ignore
    }
  }, [schedules]);

  // Firebase Real-time Synchronization
  useEffect(() => {
    // 1. Connection test on boot
    testConnection().then((ok) => {
      if (ok) setIsCloudSynced(true);
    });

    // 2. Real-time subscription to schedules
    const unsubscribeSchedules = subscribeToSchedules((cloudSchedules) => {
      if (cloudSchedules && cloudSchedules.length > 0) {
        const sanitized = sanitizeSchedules(cloudSchedules);
        setSchedules(sanitized);
        setIsCloudSynced(true);
      } else {
        // First boot with empty cloud: seed initial schedule to Firestore
        const initial = createInitial2026Schedule();
        saveScheduleToFirestore(initial)
          .then(() => setIsCloudSynced(true))
          .catch(console.warn);
      }
    });

    // 3. Real-time subscription to user credentials (PINs and roles)
    const unsubscribeCreds = subscribeToUserCredentials((credsMap) => {
      try {
        const currentPins = getStoredUserPins();
        let changed = false;
        Object.entries(credsMap).forEach(([uid, val]) => {
          if (val.pin && currentPins[uid] !== val.pin) {
            currentPins[uid] = val.pin;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_USER_PINS_KEY, JSON.stringify(currentPins));
        }
      } catch {
        // ignore
      }
    });

    return () => {
      unsubscribeSchedules();
      unsubscribeCreds();
    };
  }, []);

  // Login handler
  const handleLoginUser = (user: AppUser) => {
    setCurrentUser(user);
    persistUser(user);
    setIsLoginModalOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    persistUser(null);
  };

  // Update PIN handler
  const handleUpdateUserPin = (userId: string, newPin: string) => {
    saveUserPin(userId, newPin);
    if (currentUser && currentUser.id === userId) {
      const updated = { ...currentUser, pin: newPin };
      setCurrentUser(updated);
      persistUser(updated);
    }
  };

  // Update a single shift (only if admin)
  const handleUpdateShift = (dayId: string, employeeId: string, updatedShift: ShiftEntry) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setSchedules((prev) =>
      prev.map((sched) => {
        if (sched.year !== currentSchedule.year) return sched;
        const updated = {
          ...sched,
          updatedAt: new Date().toISOString(),
          days: sched.days.map((day) => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              shifts: {
                ...day.shifts,
                [employeeId]: updatedShift,
              },
            };
          }),
        };
        // Background sync to Firestore
        saveScheduleToFirestore(updated).catch(console.warn);
        return updated;
      })
    );
  };

  // Bulk assign shifts across range of dates and employees
  const handleApplyBulkShifts = (config: BulkAssignConfig) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setSchedules((prev) =>
      prev.map((sched) => {
        if (sched.year !== currentSchedule.year) return sched;
        const targetEmpSet = new Set(config.targetEmployeeIds);
        const daysOfWeekSet = new Set(config.daysOfWeek);

        let affectedCount = 0;
        const updatedDays = sched.days.map((day) => {
          // 1. Date range check
          if (day.id < config.startDate || day.id > config.endDate) {
            return day;
          }
          // 2. Day of week check
          if (!daysOfWeekSet.has(day.dayOfWeek)) {
            return day;
          }
          // 3. Skip holidays check
          if (config.skipHolidays && day.isHoliday && day.dayOfWeek !== 'D') {
            return day;
          }

          const newShifts = { ...day.shifts };
          for (const empId of config.targetEmployeeIds) {
            newShifts[empId] = {
              ...config.shift,
            };
            affectedCount++;
          }

          return {
            ...day,
            shifts: newShifts,
          };
        });

        const updated = {
          ...sched,
          updatedAt: new Date().toISOString(),
          days: updatedDays,
        };

        // Background sync to Firestore
        saveScheduleToFirestore(updated).catch(console.warn);
        return updated;
      })
    );

    const shiftLabel = config.shift.status === 'Horas normales'
      ? `${config.shift.morningIn ? `Mañana (${config.shift.morningIn}-${config.shift.morningOut})` : ''} ${config.shift.afternoonIn ? `Tarde (${config.shift.afternoonIn}-${config.shift.afternoonOut})` : ''}`.trim()
      : config.shift.status;

    setBulkSuccessNotice(
      `¡Asignación masiva completada! Se asignaron turnos de "${shiftLabel}" entre el ${config.startDate} y el ${config.endDate} a ${config.targetEmployeeIds.length} empleado(s).`
    );
  };

  // Add a newly created year
  const handleYearCreated = (newSchedule: YearSchedule) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    // Save to Firestore
    saveScheduleToFirestore(newSchedule).catch(console.warn);

    setSchedules((prev) => {
      const filtered = prev.filter((s) => s.year !== newSchedule.year);
      return [...filtered, newSchedule].sort((a, b) => a.year - b.year);
    });
    setActiveYear(newSchedule.year);
    setSelectedMonth(0);
  };

  // Delete an employee from current schedule
  const handleDeleteEmployee = (employeeId: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    const emp = currentSchedule.employees.find((e) => e.id === employeeId);
    const empName = emp ? emp.shortName : employeeId;

    setSchedules((prev) =>
      prev.map((sched) => {
        if (sched.year !== currentSchedule.year) return sched;
        const updated = {
          ...sched,
          updatedAt: new Date().toISOString(),
          employees: sched.employees.filter((e) => e.id !== employeeId),
          days: sched.days.map((d) => {
            const nextShifts = { ...d.shifts };
            delete nextShifts[employeeId];
            return {
              ...d,
              shifts: nextShifts,
            };
          }),
        };
        // Background sync to Firestore
        saveScheduleToFirestore(updated).catch(console.warn);
        return updated;
      })
    );

    setBulkSuccessNotice(`Empleado ${empName} eliminado de la plantilla y sus turnos liberados.`);
  };

  // Add an employee to current schedule
  const handleAddEmployee = (newEmployee: Employee) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setSchedules((prev) =>
      prev.map((sched) => {
        if (sched.year !== currentSchedule.year) return sched;
        const updated = {
          ...sched,
          updatedAt: new Date().toISOString(),
          employees: [...sched.employees, newEmployee],
          days: sched.days.map((d) => ({
            ...d,
            shifts: {
              ...d.shifts,
              [newEmployee.id]: {
                status: d.dayOfWeek === 'D' || d.isHoliday ? 'Festivo' : 'Horas normales',
                morningIn: '',
                morningOut: '',
                afternoonIn: '',
                afternoonOut: '',
                totalHours: 0,
                festivoLaborable: false,
                disfruteFestivo: false,
              },
            },
          })),
        };
        // Background sync to Firestore
        saveScheduleToFirestore(updated).catch(console.warn);
        return updated;
      })
    );
  };

  // Update employee metadata
  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setSchedules((prev) =>
      prev.map((sched) => {
        if (sched.year !== currentSchedule.year) return sched;
        const updated = {
          ...sched,
          updatedAt: new Date().toISOString(),
          employees: sched.employees.map((e) =>
            e.id === updatedEmployee.id ? updatedEmployee : e
          ),
        };
        // Background sync to Firestore
        saveScheduleToFirestore(updated).catch(console.warn);
        return updated;
      })
    );
  };

  // Reset to initial schedule
  const handleResetData = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    if (confirm('¿Restablecer el horario de 2026 a los datos actuales de la plantilla (7 empleados sin Manu C. ni Alejandro G.)?')) {
      const initial = createInitial2026Schedule();
      setSchedules([initial]);
      setActiveYear(2026);
      saveScheduleToFirestore(initial).catch(console.warn);
    }
  };

  // Compute personal metrics for the logged in worker
  const workerPersonalStats = useMemo(() => {
    if (!currentUser) return null;
    const empId = currentUser.employeeId;
    if (!empId) return null;

    let monthHours = 0;
    let morningCount = 0;
    let afternoonCount = 0;
    let vacationDays = 0;
    let totalYearHours = 0;

    for (const day of currentSchedule.days) {
      const shift = day.shifts[empId];
      if (shift) {
        totalYearHours += shift.totalHours || 0;
        if (day.month === selectedMonth) {
          monthHours += shift.totalHours || 0;
          if (shift.morningIn && !shift.afternoonIn) morningCount++;
          else if (shift.afternoonIn && !shift.morningIn) afternoonCount++;
          if (shift.status === 'Vacaciones') vacationDays++;
        }
      }
    }
    return {
      monthHours,
      totalYearHours,
      morningCount,
      afternoonCount,
      vacationDays,
    };
  }, [currentUser, currentSchedule, selectedMonth]);

  // If no user is logged in, show dedicated Login Page
  if (!currentUser) {
    return (
      <LoginPage
        availableUsers={availableUsers}
        year={activeYear}
        onLogin={(user, remember) => {
          setCurrentUser(user);
          if (remember) {
            persistUser(user);
          } else {
            persistUser(null);
          }
          // Default tab: workers go directly to their personal calendar view!
          if (user.role !== 'admin') {
            setActiveTab('empleado');
          } else {
            setActiveTab('cuadrante');
          }
        }}
        onGuestAccess={() => {
          const guestUser: AppUser = {
            id: 'guest',
            name: 'Invitado (Consulta)',
            shortName: 'Invitado',
            email: 'invitado@consulta.com',
            role: 'worker',
          };
          setCurrentUser(guestUser);
          setActiveTab('cuadrante');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentSchedule={currentSchedule}
        allSchedules={schedules}
        onSelectYear={setActiveYear}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenNewYearModal={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
          } else {
            setIsNewYearModalOpen(true);
          }
        }}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenManageEmployeesModal={() => setIsEmployeesModalOpen(true)}
        onExportExcel={() => exportScheduleToExcel(currentSchedule)}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* User Status Bar */}
        {!isAdmin ? (
          <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: currentUser.color || '#2563eb' }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-blue-950">
                    Sesión iniciada: {currentUser.name}
                  </p>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded-md">
                    Modo Lectura (Consulta)
                  </span>
                </div>
                <p className="text-blue-800 text-[11px] mt-0.5">
                  Estás en vista de consulta. Puedes ver tus turnos, horarios y balance de horas sin riesgo de modificar datos por error.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-900 bg-white hover:bg-blue-100/50 border border-blue-200 transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                <span>Cambiar Usuario / PIN</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition-all flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-indigo-950 shadow-2xs">
            <div className="flex items-center gap-2.5 font-medium">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Sesión de Administrador activa ({currentUser.name}):</strong> Permisos totales para asignar turnos masivos, gestionar empleados, modificar cuadrantes y crear nuevos años.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[11px] font-semibold text-slate-600 hover:text-indigo-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Cambiar Usuario / PIN
              </button>
              <button
                onClick={handleLogout}
                className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                title="Cerrar sesión"
              >
                <LogOut className="w-3 h-3" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Notice for Bulk Assignment */}
        {bulkSuccessNotice && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:px-4 flex items-center justify-between text-xs text-amber-950 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5 font-medium">
              <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </span>
              <span>{bulkSuccessNotice}</span>
            </div>
            <button
              onClick={() => setBulkSuccessNotice(null)}
              className="text-amber-800 hover:text-amber-950 font-bold ml-3 text-[11px] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Header Banner - DIFFERENTIATED FOR ADMIN VS WORKER */}
        {!isAdmin ? (
          /* WORKER BANNER */
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-blue-700/40 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-[11px] font-bold text-blue-200 tracking-wide uppercase">
                    Portal del Empleado
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold text-emerald-200 tracking-wide flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-300" />
                    <span>{isCloudSynced ? 'Sincronizado' : 'Conectando...'}</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>¡Hola, {currentUser.name}!</span>
                  <span className="text-sm font-normal text-indigo-200">
                    · Cuadrante {currentSchedule.year}
                  </span>
                </h2>
                <p className="text-xs text-indigo-100/80 mt-0.5">
                  Consulta tu horario personal, balance de horas acumuladas y turnos de tus compañeros en tiempo real.
                </p>
              </div>

              {/* Worker Quick Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => setActiveTab('empleado')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'empleado'
                      ? 'bg-white text-indigo-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <span>📅 Mi Horario</span>
                </button>
                <button
                  onClick={() => setActiveTab('cuadrante')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'cuadrante'
                      ? 'bg-white text-indigo-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <span>👥 Cuadrante Equipo</span>
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-200 bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Cambiar PIN</span>
                </button>
              </div>
            </div>

            {/* Worker Personal Stats Strip */}
            {workerPersonalStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/10">
                <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">
                    Horas Mes Actual
                  </span>
                  <p className="text-xl font-black text-white mt-0.5">
                    {workerPersonalStats.monthHours} <span className="text-xs font-normal text-indigo-200">h</span>
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">
                    Turnos Mañana (9:30-15h)
                  </span>
                  <p className="text-xl font-black text-emerald-300 mt-0.5">
                    {workerPersonalStats.morningCount} <span className="text-xs font-normal text-indigo-200">días</span>
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">
                    Turnos Tarde (15-21h)
                  </span>
                  <p className="text-xl font-black text-amber-300 mt-0.5">
                    {workerPersonalStats.afternoonCount} <span className="text-xs font-normal text-indigo-200">días</span>
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">
                    Vacaciones Disfrutadas
                  </span>
                  <p className="text-xl font-black text-sky-300 mt-0.5">
                    {workerPersonalStats.vacationDays} <span className="text-xs font-normal text-indigo-200">días</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ADMIN BANNER */
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-indigo-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 tracking-wide uppercase">
                  Modo Administrador
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold text-emerald-200 tracking-wide flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-300" />
                  <span>{isCloudSynced ? 'Nube Firebase Conectada' : 'Conectando con Firebase...'}</span>
                </span>
                <span className="text-xs text-indigo-200">
                  Plantilla de {currentSchedule.employees.length} empleados activos
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Gestor de Horarios y Cuadrantes Anuales {currentSchedule.year}
              </h2>
              <p className="text-xs text-indigo-100/80 max-w-2xl leading-relaxed">
                Control total para editar turnos día a día, asignar masivamente por rango de fechas, gestionar empleados y crear nuevos años.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={() => setIsBulkAssignModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-400/30"
              >
                <CalendarRange className="w-4 h-4 text-amber-950" />
                <span>Asignar por Lote / Rango</span>
              </button>

              <button
                onClick={() => setIsEmployeesModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-100 bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-300" />
                <span>Plantilla ({currentSchedule.employees.length})</span>
              </button>

              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-100 bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-300" />
                <span>Ver Guía</span>
              </button>

              <button
                onClick={() => setIsNewYearModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-indigo-50 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-indigo-600" />
                <span>Crear Año {currentSchedule.year + 1}</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic View Tab Rendering */}
        {activeTab === 'cuadrante' && (
          <CuadranteTable
            schedule={currentSchedule}
            onUpdateShift={handleUpdateShift}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            isAdmin={isAdmin}
            onPromptAdminLogin={() => setIsLoginModalOpen(true)}
            currentUser={currentUser}
            onOpenBulkAssignModal={() => setIsBulkAssignModalOpen(true)}
          />
        )}

        {activeTab === 'semanal' && (
          <WeeklyView
            schedule={currentSchedule}
            onUpdateShift={handleUpdateShift}
            isAdmin={isAdmin}
            onPromptAdminLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'empleado' && (
          <EmployeeView
            schedule={currentSchedule}
            onUpdateShift={handleUpdateShift}
            isAdmin={isAdmin}
            onPromptAdminLogin={() => setIsLoginModalOpen(true)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'stats' && <StatsDashboard schedule={currentSchedule} />}

        {/* Bottom Actions and Reset */}
        <div className="pt-2 pb-6 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>
              Gestor de Cuadrantes · {currentSchedule.employees.length} empleados registrados en el año {currentSchedule.year} ({currentSchedule.employees.map(e => e.shortName || e.name).join(', ')}).
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-rose-600 underline text-[11px] transition-colors cursor-pointer"
            >
              Restablecer plantilla y cuadrante
            </button>
          )}
        </div>
      </main>

      {/* Modals */}
      <ManageEmployeesModal
        isOpen={isEmployeesModalOpen}
        onClose={() => setIsEmployeesModalOpen(false)}
        employees={currentSchedule.employees}
        onDeleteEmployee={handleDeleteEmployee}
        onAddEmployee={handleAddEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        isAdmin={isAdmin}
        onPromptAdminLogin={() => setIsLoginModalOpen(true)}
        onUpdatePin={handleUpdateUserPin}
      />

      <NewYearModal
        isOpen={isNewYearModalOpen}
        onClose={() => setIsNewYearModalOpen(false)}
        currentSchedule={currentSchedule}
        onYearCreated={handleYearCreated}
      />

      <BestPracticesGuide
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <UserLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        availableUsers={availableUsers}
        onLoginUser={handleLoginUser}
        onLogout={handleLogout}
        onUpdateUserPin={handleUpdateUserPin}
      />

      <BulkShiftAssignModal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        schedule={currentSchedule}
        onApply={handleApplyBulkShifts}
      />
    </div>
  );
}
