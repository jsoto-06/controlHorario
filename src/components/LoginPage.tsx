import { useState, FormEvent } from 'react';
import {
  Calendar,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppUser } from '../types';
import { authenticate } from '../utils/auth';

interface LoginPageProps {
  availableUsers: AppUser[];
  onLogin: (user: AppUser, remember: boolean) => void;
  onGuestAccess: () => void;
  year: number;
}

export default function LoginPage({
  availableUsers,
  onLogin,
  onGuestAccess,
  year,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPin = pin.trim();

    if (!cleanEmail) {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }

    if (!cleanPin) {
      setError('Por favor, introduce tu PIN de acceso.');
      return;
    }

    setIsLoading(true);

    const result = authenticate(cleanEmail, cleanPin, availableUsers);

    if (result.success && result.user) {
      onLogin(result.user, rememberMe);
    } else {
      setError(result.error || 'Correo electrónico o PIN incorrecto.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3.5">
          <Calendar className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Gestor de Turnos y Cuadrantes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Planificación anual de turnos {year}
        </p>
      </div>

      {/* Main Login Card - Typical Clean Standard Login without any names or suggestions */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-1">
              Introduce tu correo electrónico y PIN para acceder a tu cuadrante.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="ej: usuario@empresa.com"
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-medium outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label
                htmlFor="login-pin"
                className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
              >
                <span>PIN / Contraseña de Acceso</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="login-pin"
                  type={showPin ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  maxLength={16}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="Introduce tu PIN"
                  className="w-full text-xs font-mono tracking-widest pl-10 pr-10 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-slate-900 font-bold outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 animate-in fade-in flex items-center gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Remember Session Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                />
                <span>Recordar sesión en este equipo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </form>

          {/* Guest Consultation Link */}
          <div className="pt-5 mt-5 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onGuestAccess}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              O acceder en modo consulta anónima (sin permisos de edición)
            </button>
          </div>
        </div>

        {/* Security & Privacy Banner */}
        <div className="p-3.5 bg-slate-50/90 border-t border-slate-200 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Acceso privado y seguro · Cumplimiento de protección de datos (RGPD)</span>
        </div>
      </div>
    </div>
  );
}
