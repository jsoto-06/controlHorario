import { X, CheckCircle, AlertTriangle, Lightbulb, FileSpreadsheet, RefreshCw, Clock, Users } from 'lucide-react';

interface BestPracticesGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BestPracticesGuide({ isOpen, onClose }: BestPracticesGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Guía de Gestión Laboral
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Mejores Prácticas: Cómo Gestionar, Crear y Modificar el Horario Anual
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-xs sm:text-sm">
          {/* Comparison box: Excel vs Gestor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Problemas clásicos en Excel
              </div>
              <ul className="space-y-1.5 text-xs text-rose-900/80 list-disc list-inside">
                <li>Cada año los días de la semana se desalinean (el 1 de enero cae en otro día).</li>
                <li>Escribir manualmente horas (9:30, 15:00) en miles de celdas genera errores como <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">#VALUE!</code> o errores de tipeo.</li>
                <li>Dificultad para saber si en un día específico la tienda o servicio queda desatendido en mañana o tarde.</li>
                <li>Borrar vacaciones del año anterior suele desconfigurar fórmulas de sumas anuales.</li>
              </ul>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                El flujo óptimo con este Gestor
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-900/80 list-disc list-inside">
                <li>El calendario y festivos se generan automáticamente con 1 solo clic para cualquier año.</li>
                <li>Turnos preconfigurados: asigna Mañana (5.5h) o Tarde (6.0h) con un clic o atajo.</li>
                <li>Línea de cobertura en tiempo real: sabes al instante cuántas personas hay en cada turno.</li>
                <li>Cómputo anual automático contra las horas de convenio (1.760 h) y saldo de vacaciones.</li>
              </ul>
            </div>
          </div>

          {/* 5-Step Roadmap */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              El Ciclo Anual de 5 Pasos para Gestionar tu Cuadrante
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-bold text-slate-800">Septiembre - Octubre: Generar el nuevo año</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Utiliza el botón <strong>"Crear / Duplicar Año"</strong> para 2027. La herramienta genera automáticamente los 365 días, semanas ISO y festivos oficiales de España.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-bold text-slate-800">Octubre - Noviembre: Replicar el patrón de rotación base</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Activa la opción de replicar el ciclo semanal (Semana par / Semana impar). Tu equipo mantiene el equilibrio entre turnos de mañana (9:30-15:00) y de tarde (15:00-21:00) con las libranzas de fin de semana repartidas equitativamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-bold text-slate-800">Diciembre: Planificación de Vacaciones Anuales</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Con las solicitudes de los empleados (quincenas en verano, semana santa o navidad), selecciona el preset <strong>Vacaciones (VAC)</strong>. La barra de cobertura te alertará de inmediato si coincide demasiada gente de vacaciones en la misma quincena.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <div className="font-bold text-slate-800">Durante el año: Gestión ágil del día a día</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Para bajas médicas asigna <strong>BAJA</strong> (aplica automáticamente el cómputo legal de 4.91 h/día). Para formaciones usa <strong>FORM</strong> (8.0 h). Para cambios de turno entre compañeros, edita la celda y añade una nota informativa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <div className="font-bold text-slate-800">Cierre Anual y Exportación a Excel</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Comprueba en la pestaña <strong>Estadísticas</strong> que ningún empleado supere el cómputo de horas de convenio o se quede por debajo. Exporta en cualquier momento el archivo <strong>.XLSX</strong> oficial para Recursos Humanos o Inspección Laboral.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Practical tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong>Consejo para el convenio colectivo:</strong> Mantener una plantilla con 9 personas permite rotar 4-5 personas por la mañana y 4-5 por la tarde, asegurando siempre 1 persona de respaldo ante imprevistos (baja o asuntos propios) sin alterar los descansos semanales.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
          >
            Entendido, cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
}
