import { useState, FormEvent } from 'react';
import { Users, UserMinus, UserPlus, X, Trash2, Edit2, Check, AlertTriangle, ShieldCheck, Lock, Shield, Mail, KeyRound } from 'lucide-react';
import { Employee, UserRole } from '../types';

interface ManageEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onDeleteEmployee: (employeeId: string) => void;
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  isAdmin?: boolean;
  onPromptAdminLogin?: () => void;
  onUpdatePin?: (userId: string, newPin: string) => void;
}

const COLOR_PALETTE = [
  '#0d9488', // teal-600
  '#7c3aed', // violet-600
  '#b45309', // amber-700
  '#4338ca', // indigo-700
  '#047857', // emerald-700
  '#c026d3', // fuchsia-600
  '#334155', // slate-700
  '#0284c7', // sky-600
  '#be185d', // pink-700
  '#ea580c', // orange-600
];

export default function ManageEmployeesModal({
  isOpen,
  onClose,
  employees,
  onDeleteEmployee,
  onAddEmployee,
  onUpdateEmployee,
  isAdmin = true,
  onPromptAdminLogin,
  onUpdatePin,
}: ManageEmployeesModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  // Form state for adding
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('worker');
  const [newPin, setNewPin] = useState('1234');
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [newHours, setNewHours] = useState(1760);
  const [newVacations, setNewVacations] = useState(30);

  // Form state for editing
  const [editName, setEditName] = useState('');
  const [editShortName, setEditShortName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('worker');
  const [editPin, setEditPin] = useState('1234');
  const [editColor, setEditColor] = useState('');
  const [editHours, setEditHours] = useState(1760);
  const [editVacations, setEditVacations] = useState(30);

  // Confirmation state for deleting
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    if (!isAdmin) {
      onClose();
      onPromptAdminLogin?.();
      return;
    }
    setIsAdding(true);
    setNewName('');
    setNewShortName('');
    setNewEmail('');
    setNewRole('worker');
    setNewPin('1234');
    setNewColor(COLOR_PALETTE[employees.length % COLOR_PALETTE.length]);
    setNewHours(1760);
    setNewVacations(30);
  };

  const handleSaveNew = (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newName.trim()) return;

    const id = (newShortName || newName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) || `emp_${Date.now()}`;

    const newEmpId = `${id}_${Date.now().toString().slice(-4)}`;
    const newEmp: Employee = {
      id: newEmpId,
      name: newName.trim().toUpperCase(),
      shortName: newShortName.trim() || newName.trim().split(' ')[0],
      email: newEmail.trim() || undefined,
      role: newRole,
      pin: newPin.trim() || '1234',
      color: newColor,
      contractHoursPerYear: Number(newHours) || 1760,
      vacationDaysTotal: Number(newVacations) || 30,
      active: true,
    };

    onAddEmployee(newEmp);
    if (onUpdatePin) {
      onUpdatePin(newEmpId, newPin.trim() || '1234');
    }
    setIsAdding(false);
  };

  const handleStartEdit = (emp: Employee) => {
    if (!isAdmin) {
      onClose();
      onPromptAdminLogin?.();
      return;
    }
    setEditingEmpId(emp.id);
    setEditName(emp.name);
    setEditShortName(emp.shortName);
    setEditEmail(emp.email || '');
    setEditRole(emp.role || 'worker');
    setEditPin(emp.pin || '1234');
    setEditColor(emp.color);
    setEditHours(emp.contractHoursPerYear);
    setEditVacations(emp.vacationDaysTotal);
  };

  const handleSaveEdit = (empId: string) => {
    if (!isAdmin) return;
    const existing = employees.find((e) => e.id === empId);
    if (!existing) return;

    const pinToSave = editPin.trim() || '1234';
    onUpdateEmployee({
      ...existing,
      name: editName.trim().toUpperCase() || existing.name,
      shortName: editShortName.trim() || existing.shortName,
      email: editEmail.trim() || undefined,
      role: editRole,
      pin: pinToSave,
      color: editColor || existing.color,
      contractHoursPerYear: Number(editHours) || 1760,
      vacationDaysTotal: Number(editVacations) || 30,
    });

    if (onUpdatePin) {
      onUpdatePin(empId, pinToSave);
    }

    setEditingEmpId(null);
  };

  const confirmDelete = (empId: string) => {
    if (!isAdmin) return;
    onDeleteEmployee(empId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Gestión de Plantilla de Empleados
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  {employees.length} activos
                </span>
              </h2>
              <p className="text-xs text-indigo-200/80">
                Añade, edita o elimina trabajadores de los cuadrantes y balances
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Read only notification */}
          {!isAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <p>
                  <strong>Modo Solo Lectura:</strong> Solo los administradores pueden añadir, editar o eliminar empleados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPromptAdminLogin?.();
                }}
                className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Acceder como Admin</span>
              </button>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Lista de empleados incluidos en el cálculo de horas, vacaciones y turnos:
            </p>
            {!isAdding && (
              <button
                onClick={handleStartAdd}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                  isAdmin
                    ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                    : 'text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {isAdmin ? <UserPlus className="w-4 h-4 text-indigo-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Añadir Nuevo Empleado / Usuario</span>
              </button>
            )}
          </div>

          {/* Add Employee Form */}
          {isAdding && isAdmin && (
            <form
              onSubmit={handleSaveNew}
              className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Nuevo Empleado / Usuario
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Nombre Completo (Apellidos y Nombre)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PÉREZ GÓMEZ LAURA"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Nombre Corto (para cuadrante)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Laura P."
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Rol en el Sistema
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  >
                    <option value="worker">Trabajador (Solo Lectura)</option>
                    <option value="admin">Administrador (Modificación Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Email / Identificador (Login)
                  </label>
                  <input
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                    <span>PIN de Acceso (Login)</span>
                    <span className="text-[10px] text-indigo-600 font-normal">Por defecto: 1234</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2 pl-7 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Horas de Convenio Anual
                  </label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Días de Vacaciones Anuales
                  </label>
                  <input
                    type="number"
                    value={newVacations}
                    onChange={(e) => setNewVacations(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Color Identificativo
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        newColor === c ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          )}

          {/* Employee list */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            {employees.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No hay ningún empleado registrado. Añade uno con el botón superior.
              </div>
            ) : (
              employees.map((emp) => {
                const isEditing = editingEmpId === emp.id;
                const isConfirming = confirmDeleteId === emp.id;

                if (isEditing) {
                  return (
                    <div key={emp.id} className="p-4 bg-slate-50 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Nombre Corto
                          </label>
                          <input
                            type="text"
                            value={editShortName}
                            onChange={(e) => setEditShortName(e.target.value)}
                            className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Rol en el Sistema
                          </label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="worker">Trabajador (Solo Lectura)</option>
                            <option value="admin">Administrador (Modificación Total)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Email / Login
                          </label>
                          <input
                            type="email"
                            placeholder="usuario@empresa.com"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            PIN de Acceso
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={editPin}
                              onChange={(e) => setEditPin(e.target.value)}
                              placeholder="1234"
                              className="w-full text-xs font-mono font-bold px-2.5 py-1.5 pl-6 bg-white border border-slate-300 rounded-lg"
                            />
                            <KeyRound className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Horas Convenio
                          </label>
                          <input
                            type="number"
                            value={editHours}
                            onChange={(e) => setEditHours(Number(e.target.value))}
                            className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Días Vacaciones
                          </label>
                          <input
                            type="number"
                            value={editVacations}
                            onChange={(e) => setEditVacations(Number(e.target.value))}
                            className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5">
                          {COLOR_PALETTE.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              className={`w-5 h-5 rounded-full border-2 transition-all ${
                                editColor === c ? 'scale-110 border-slate-900' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingEmpId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(emp.id)}
                            className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Actualizar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={emp.id}
                    className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: emp.color }}
                      >
                        {emp.shortName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {emp.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            {emp.shortName}
                          </span>
                          {emp.role === 'admin' ? (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                              <Shield className="w-2.5 h-2.5 text-indigo-600" /> Admin
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                              Trabajador
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{emp.contractHoursPerYear} horas/año</span>
                          <span>·</span>
                          <span>{emp.vacationDaysTotal} días vacaciones</span>
                          {emp.email && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400">{emp.email}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isAdmin ? (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
                          <Lock className="w-3 h-3 text-slate-400" /> Solo lectura
                        </span>
                      ) : isConfirming ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg animate-in fade-in duration-100">
                          <span className="text-[11px] font-bold text-rose-800 mr-1">
                            ¿Borrar a {emp.shortName}?
                          </span>
                          <button
                            onClick={() => confirmDelete(emp.id)}
                            className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer"
                          >
                            Sí, borrar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(emp)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar empleado"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Borrar empleado del cuadrante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Information Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cómputo y Cobertura Automáticos</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Al borrar un empleado, sus turnos se desasignan y se recalculan automáticamente las estadísticas del año, el total de horas de equipo y la barra de cobertura de mañanas y tardes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
