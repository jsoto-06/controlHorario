# 📖 Guía Completa de Uso: Gestor de Turnos y Cuadrantes

Bienvenido al manual oficial de usuario del **Gestor de Turnos y Cuadrantes Laborales**. Esta guía explica detalladamente cada funcionalidad del sistema, tanto para administradores como para trabajadores.

---

## 📑 Índice de Contenidos

1. [Acceso al Sistema (Login Seguro)](#1-acceso-al-sistema-login-seguro)
2. [Estructura de la Pantalla Principal](#2-estructura-de-la-pantalla-principal)
3. [Nomenclatura y Códigos de Turnos](#3-nomenclatura-y-códigos-de-turnos)
4. [Cómo Asignar y Modificar Turnos de un Día](#4-cómo-asignar-y-modificar-turnos-de-un-día)
5. [Asignación Masiva por Rango de Fechas](#5-asignación-masiva-por-rango-de-fechas)
6. [Control de Balance de Horas y Vacaciones](#6-control-de-balance-de-horas-y-vacaciones)
7. [Gestión de la Plantilla de Empleados](#7-gestión-de-la-plantilla-de-empleados)
8. [Creación de Nuevos Años (2026, 2027...)](#8-creación-de-nuevos-años-2026-2027)
9. [Exportación e Importación con Excel](#9-exportación-e-importación-con-excel)
10. [Cambio de PIN y Seguridad](#10-cambio-de-pin-y-seguridad)
11. [Preguntas Frecuentes (FAQ)](#11-preguntas-frecuentes-faq)

---

## 1. Acceso al Sistema (Login Seguro)

Por cumplimiento con la normativa de **Protección de Datos (RGPD)**, la pantalla de inicio de sesión no muestra nombres, correos predeterminados ni sugerencias de la plantilla.

### Pasos para Iniciar Sesión:
1. Introduce tu **Correo Electrónico**:
   - Administrador: `admin@empresa.com`.
   - Empleado: Tu correo asignado (ej: `aitor@empresa.com`, `javier@empresa.com`, etc.).
2. Introduce tu **PIN**:
   - PIN general por defecto: `1234`.
3. *(Opcional)* Marca la casilla **"Recordar sesión en este equipo"** para no tener que introducir las credenciales en cada visita.
4. Pulsa el botón **"Iniciar Sesión"**.

> 💡 **Nota:** Si solo deseas ver el cuadrante general sin identificarte, puedes pulsar el enlace inferior: *"O acceder en modo consulta anónima"*.

---

## 2. Estructura de la Pantalla Principal

Una vez dentro, la interfaz se divide en 3 zonas clave:

1. **Barra Superior de Navegación**:
   - **Selector de Año:** Permite alternar entre los años creados (ej. 2026) o crear uno nuevo con el botón `+`.
   - **Indicador de Usuario:** Muestra quién está conectado (`Administrador` o el nombre del trabajador).
   - **Botón "Cambiar Usuario / PIN":** Permite cambiar tu clave de acceso o cerrar sesión.
   - **Botones de Acción (solo Administrador):**
     - ⚡ **Asignar por Rango**: Para programar varios días seguidos.
     - 👥 **Plantilla**: Para dar de alta o editar trabajadores.
     - ⏱️ **Cómputo**: Resumen de horas trabajadas y saldo de horas.
     - 📊 **Excel**: Exportar o importar cuadrantes en formato `.xlsx`.

2. **Filtros Rápidos y Navegación de Meses**:
   - Botones con los 12 meses del año (Enero a Diciembre) para saltar rápidamente a cualquier periodo.
   - Botón **"Ver Todo el Año"** para una vista panorámica continua.
   - Filtro por empleado individual o visualización del equipo completo.

3. **Matriz de Cuadrante**:
   - Cada fila representa a un empleado (con su color identificativo).
   - Cada columna representa un día del mes. Los fines de semana y festivos se destacan automáticamente en tonos diferenciados.

---

## 3. Nomenclatura y Códigos de Turnos

El sistema reconoce los siguientes códigos estándar:

| Código | Significado | Horario Habitual | Horas Computadas | Color Visual |
| :--- | :--- | :--- | :--- | :--- |
| **M** | Turno de Mañana | 09:30 – 15:00 | **5.5 h** | Verde / Esmeralda |
| **T** | Turno de Tarde | 15:00 – 21:00 | **6.0 h** | Azul |
| **M+T** | Turno Partido / Doble | 09:30–15:00 y 15:00–21:00 | **11.5 h** | Púrpura |
| **LIB** | Libranza / Descanso | – | **0.0 h** | Gris Neutro |
| **VAC** | Vacaciones | – | 0.0 h *(Resta 1 día del total)* | Ámbar |
| **BAJ** | Baja Médica (IT) | – | 0.0 h | Rojo suave |
| **AP** | Asuntos Propios | – | 0.0 h | Naranja |
| **F-LAB** | Festivo Trabajado | Según turno | Horas correspondientes | Fucsia / Borde festivo |
| **DISF** | Disfrute de Festivo | – | **0.0 h** *(Compensación)* | Cian |

---

## 4. Cómo Asignar y Modificar Turnos de un Día

1. En la tabla del cuadrante, **haz clic sobre la celda** del día y empleado que deseas editar.
2. Se abrirá la ventana emergente **"Editar Turno"**:
   - **Botones Rápidos:** Haz clic en `Mañana (9:30 - 15:00)`, `Tarde (15:00 - 21:00)`, `Libranza`, o `Vacaciones` para rellenar los datos automáticamente.
   - **Horario Personalizado:** Si el empleado realiza horas extraordinarias o un horario diferente, puedes escribir libremente la hora de entrada y salida de mañana y de tarde. El sistema recalculará automáticamente las horas totales.
   - **Casillas Especiales:**
     - ☑️ *Festivo Laborable:* Marca esta opción si el empleado trabaja en un día festivo oficial.
     - ☑️ *Disfrute de Festivo:* Marca esta opción si el empleado está compensando un festivo no trabajado.
   - **Notas:** Puedes escribir observaciones internas (ej: *"Sustitución de turno con Javier"*).
3. Pulsa **"Guardar Cambios"**. La celda se actualizará instantáneamente y se recalculará el cómputo total de horas.

---

## 5. Asignación Masiva por Rango de Fechas

Esta herramienta permite ahorrar tiempo al planificar semanas o meses completos:

1. En la barra superior, pulsa el botón **"⚡ Asignar por Rango"**.
2. **Paso 1: Seleccionar Empleado(s)**:
   - Elige a un trabajador específico o marca la opción *"Toda la plantilla"*.
3. **Paso 2: Definir el Periodo**:
   - Selecciona la **Fecha de Inicio** (ej: `01/03/2026`) y la **Fecha de Fin** (ej: `31/03/2026`).
4. **Paso 3: Seleccionar los Días de la Semana**:
   - Puedes activar o desactivar días concretos (ej: aplicar solo de *Lunes a Viernes* y dejar los fines de semana sin tocar).
5. **Paso 4: Elegir el Turno**:
   - Selecciona `Mañana`, `Tarde`, `Libranza` o `Vacaciones`.
6. Pulsa **"Aplicar Asignación en Lote"**. Todos los días seleccionados se actualizarán a la vez.

---

## 6. Control de Balance de Horas y Vacaciones

Pulsa el botón **"⏱️ Cómputo de Horas"** en la barra superior para abrir el panel de auditoría:

- **Horas de Contrato:** Muestra las horas fijadas por convenio para el año (por defecto `1.760 h`).
- **Horas Planificadas:** Suma exacta de todas las horas asignadas hasta la fecha en el cuadrante.
- **Saldo de Horas:**
  - En **verde (+):** Horas extras acumuladas por encima del contrato.
  - En **rojo (-):** Horas pendientes de realizar para cumplir el convenio anual.
- **Contador de Vacaciones:** Controla cuántos días de los 30 asignados han sido programados (`VAC`).

---

## 7. Gestión de la Plantilla de Empleados

Desde el botón **"👥 Plantilla"** (disponible para Administradores):

- **Dar de alta un nuevo empleado:**
  - Pulsa *"Nuevo Empleado"*.
  - Rellena: Nombre completo, Nombre corto (para la tabla), Correo electrónico, Horas de contrato y Color representativo.
- **Editar datos existentes:** Modifica contratos o información de contacto de cualquier trabajador.
- **Dar de baja:** Desactiva empleados sin perder el histórico de turnos de años anteriores.

---

## 8. Creación de Nuevos Años (2026, 2027...)

El sistema es multi-anual y permite proyectar cuadrantes hacia el futuro:

1. Haz clic en el botón **`+`** junto al selector de año en la cabecera.
2. Introduce el nuevo año (ej: `2027`).
3. Elige si deseas:
   - *Copiar la plantilla de empleados actual.*
   - *Comenzar con cuadrante limpio o clonar los patrones.*
4. Pulsa **"Crear Año"**. El nuevo calendario se generará con todos los días y meses calculados automáticamente.

---

## 9. Exportación e Importación con Excel

Pulsa el botón **"📊 Excel"**:

- **Exportar Cuadrante:**
  - Genera un archivo `.xlsx` compatible con Microsoft Excel, Google Sheets y LibreOffice Calc.
  - Incluye todas las filas de empleados, fechas, turnos y cómputo de horas totales.
- **Descargar Plantilla Oficial:** Descarga el formato preparado para rellenar externamente.
- **Importar Archivo Excel:** Sube un archivo modificado para sincronizar los turnos en masa en la aplicación.

---

## 10. Cambio de PIN y Seguridad

Cada usuario puede cambiar su propia clave de acceso en cualquier momento:

1. Haz clic en tu perfil en la esquina superior derecha (**"Cambiar Usuario / PIN"**).
2. Pulsa en el enlace **"Cambiar mi PIN"**.
3. Introduce tu PIN actual y el nuevo PIN deseado (mínimo 4 caracteres).
4. Pulsa **"Guardar Nuevo PIN"**. La nueva clave se guardará de forma segura en tu navegador y en la base de datos Firestore.

---

## 11. Preguntas Frecuentes (FAQ)

### ¿Qué ocurre si me quedo sin conexión a Internet?
La aplicación cuenta con arquitectura *offline-first*. Todos tus cambios se guardan localmente en el navegador y, en cuanto recuperes la conexión, se sincronizarán con la base de datos de Firebase Firestore.

### ¿Puede un empleado modificar turnos de sus compañeros?
No. Si un empleado inicia sesión con su correo personal, entra automáticamente en **Modo Consulta**, lo que le permite consultar su horario, vacaciones y saldo de horas pero bloquea los controles de edición.

### ¿Cómo cambio las horas de convenio de un empleado?
Ve al botón **"👥 Plantilla"**, selecciona el empleado, pulsa en editar y modifica el campo *"Horas de Contrato Anual"* (por ejemplo de 1.760 h a 1.600 h si es jornada reducida).
