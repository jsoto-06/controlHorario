import { useState, FormEvent, useEffect } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  User,
  Users,
  Eye,
  EyeOff,
  X,
  Check,
  ArrowRight,
  LogOut,
  Info,
  Sparkles,
} from 'lucide-react';
import { AppUser, Employee } from '../types';
import { saveUserPin } from '../utils/auth';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  availableUsers: AppUser[];
  onLoginUser: (user: AppUser) => void;
  onLogout: () => void;
  onUpdateUserPin: (userId: string, newPin: string) => void;
}

export default function UserLoginModal({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onLoginUser,
  onLogout,
  onUpdateUserPin,
}: UserLoginModalProps) {
  // Selected user for login
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentUser ? currentUser.id : availableUsers[0]?.id || 'admin'
  );
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab: 'input' (type email/username) or 'cards' (visual cards)
  const [loginMode, setLoginMode] = useState<'cards' | 'input'>('input');
  const [manualIdentifier, setManualIdentifier] = useState('');

  // Pin change mode for the selected/logged-in user
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEnteredPin('');
      setIsChangingPin(false);
      if (currentUser) {
        setSelectedUserId(currentUser.id);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const targetUser = availableUsers.find((u) => u.id === selectedUserId) || availableUsers[0];

  const handleCardLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    const validPin = targetUser.pin || '1234';
    if (enteredPin.trim() === validPin.trim()) {
      setError(null);
      setEnteredPin('');
      onLoginUser(targetUser);
      onClose();
    } else {
      setError('PIN incorrecto. Introduce el PIN asignado (PIN por defecto: 1234).');
    }
  };

  const handleManualLogin = (e: FormEvent) => {
    e.preventDefault();
    const cleanId = manualIdentifier.trim().toLowerCase();
    const adminUser = availableUsers.find((u) => u.role === 'admin');
    const validAdminPin = (adminUser?.pin || '1234').trim();

    const user = availableUsers.find(
      (u) =>
        u.id.toLowerCase() === cleanId ||
        u.email?.toLowerCase() === cleanId ||
        u.shortName?.toLowerCase() === cleanId ||
        u.name.toLowerCase() === cleanId
    );

    // If typed email is an admin email or enters admin PIN
    if (!user && (cleanId.includes('admin') || enteredPin.trim() === validAdminPin)) {
      if (enteredPin.trim() === validAdminPin) {
        const customAdmin: AppUser = {
          id: 'admin',
          name: cleanId.includes('@') ? cleanId.split('@')[0].toUpperCase() : 'Administrador',
          shortName: 'Admin',
          email: manualIdentifier.trim(),
          role: 'admin',
          pin: validAdminPin,
        };
        setError(null);
        setEnteredPin('');
        onLoginUser(customAdmin);
        onClose();
        return;
      }
    }

    if (!user) {
      setError('Usuario o correo no encontrado en la plantilla.');
      return;
    }

    const validPin = user.pin || '1234';
    if (enteredPin.trim() === validPin.trim() || enteredPin.trim() === validAdminPin) {
      setError(null);
      setEnteredPin('');
      onLoginUser(user);
      onClose();
    } else {
      setError('PIN incorrecto. (PIN por defecto: 1234).');
    }
  };

  const handleChangePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    const validPin = targetUser.pin || '1234';
    if (currentPinInput.trim() !== validPin.trim()) {
      setError('El PIN actual no es correcto.');
      return;
    }
    if (newPinInput.trim().length < 4) {
      setError('El nuevo PIN debe tener al menos 4 dígitos o caracteres.');
      return;
    }

    saveUserPin(targetUser.id, newPinInput.trim());
    onUpdateUserPin(targetUser.id, newPinInput.trim());

    setPinChangeSuccess(true);
    setError(null);
    setCurrentPinInput('');
    setNewPinInput('');
    setTimeout(() => {
      setPinChangeSuccess(false);
      setIsChangingPin(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Iniciar Sesión de Usuario
              </h2>
              <p className="text-xs text-indigo-200/80">
                Acceso individual para cada trabajador y administradores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Current Session Banner if logged in */}
          {currentUser && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                  style={{ backgroundColor: currentUser.color || '#4f46e5' }}
                >
                  {currentUser.shortName ? currentUser.shortName.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {currentUser.name}
                    </span>
                    {currentUser.role === 'admin' ? (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Admin (Edición Total)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-slate-500" /> Trabajador (Modo Lectura)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentUser.email || 'Sin correo asociado'} · Conectado en este equipo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setError(null);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                title="Cerrar sesión actual"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}

          {/* Change PIN Form */}
          {isChangingPin && targetUser ? (
            <form onSubmit={handleChangePinSubmit} className="space-y-3.5 p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  Cambiar PIN de {targetUser.shortName || targetUser.name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  PIN Actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  placeholder="Introduce el PIN actual (por defecto 1234)"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Nuevo PIN
                </label>
                <input
                  type="password"
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Nuevo PIN (mínimo 4 dígitos o caracteres)"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-indigo-500"
                />
              </div>

              {pinChangeSuccess && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  PIN actualizado correctamente para {targetUser.shortName || targetUser.name}
                </div>
              )}

              {error && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setError(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Nuevo PIN
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Select Mode Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selecciona tu usuario:
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('cards');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      loginMode === 'cards'
                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Galería de Plantilla
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('input');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      loginMode === 'input'
                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por Correo / ID
                  </button>
                </div>
              </div>

              {loginMode === 'cards' ? (
                /* Visual User Selector */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableUsers.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    const isUserAdmin = u.role === 'admin';
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setError(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-2xs"
                            style={{ backgroundColor: u.color || '#4f46e5' }}
                          >
                            {isUserAdmin ? (
                              <Shield className="w-3.5 h-3.5" />
                            ) : (
                              u.shortName?.slice(0, 2).toUpperCase() || 'TR'
                            )}
                          </div>
                          {isUserAdmin ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-1 py-0.5 rounded">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                              Lectura
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {u.shortName || u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {u.email || u.id}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Manual Input Form */
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Correo Electrónico o Usuario
                    </label>
                    <input
                      type="text"
                      placeholder="ej. admin@empresa.com o aitor@empresa.com"
                      value={manualIdentifier}
                      onChange={(e) => {
                        setManualIdentifier(e.target.value);
                        setError(null);
                      }}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Password / PIN Form */}
              <form
                onSubmit={loginMode === 'cards' ? handleCardLogin : handleManualLogin}
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                {loginMode === 'cards' && targetUser && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Iniciando sesión como:{' '}
                      <strong className="text-slate-900 font-bold">
                        {targetUser.shortName || targetUser.name}
                      </strong>{' '}
                      ({targetUser.role === 'admin' ? 'Administrador' : 'Trabajador'})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingPin(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] underline font-medium cursor-pointer"
                    >
                      Cambiar mi PIN
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    PIN / Contraseña de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      autoFocus
                      required
                      placeholder="Introduce el PIN (PIN inicial: 1234)"
                      value={enteredPin}
                      onChange={(e) => {
                        setEnteredPin(e.target.value);
                        setError(null);
                      }}
                      className="w-full text-sm font-mono tracking-widest px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPin ? 'Ocultar PIN' : 'Ver PIN'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      Todos los usuarios y trabajadores tienen asignado inicialmente el PIN{' '}
                      <strong className="font-mono text-slate-700">1234</strong>.
                    </span>
                  </p>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Entrar a mi Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Permissions explanation box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              ¿Qué permisos tiene cada tipo de usuario?
            </p>
            <ul className="space-y-1 pl-4 list-disc text-slate-500">
              <li>
                <strong className="text-slate-700">Trabajador (Modo Lectura):</strong> Consulta su propio horario destacado, visualiza el cuadrante general de la plantilla, horas anuales acumuladas y vacaciones. No puede alterar turnos involuntariamente.
              </li>
              <li>
                <strong className="text-slate-700">Administrador:</strong> Acceso completo para editar y reasignar turnos de cualquier día, gestionar empleados, dar de alta nuevos usuarios y generar nuevos años.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
