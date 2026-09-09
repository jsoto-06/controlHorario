# Gestor de Turnos y Cuadrantes Laborales 📅

> Plataforma web corporativa para la planificación anual, gestión de turnos de trabajo (mañanas y tardes), cómputo automatizado de horas de convenio y exportación a Excel con sincronización en la nube mediante Firebase Firestore.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
6. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
7. [Cómo Subir a GitHub](#-cómo-subir-a-github)
8. [Roles y Permisos de Acceso](#-roles-y-permisos-de-acceso)
9. [Guía Rápida de Uso](#-guía-rápida-de-uso)
10. [Licencia](#-licencia)

---

## 📖 Descripción General

El **Gestor de Turnos y Cuadrantes** permite organizar de manera ágil y visual los turnos de trabajo de la plantilla a lo largo de los 365 días del año. Cumple estrictamente con los convenios laborales calculando automáticamente el saldo de horas trabajadas frente a las horas de contrato anuales (ej: 1.760 h), controlando festivos laborables, libranzas y días de vacaciones disfrutadas.

Cuenta con un diseño adaptable (*responsive*) y una pantalla de autenticación protegida bajo normativa **RGPD**, sin filtración de nombres ni sugerencias en la pantalla de inicio.

---

## ✨ Características Principales

- **📅 Matriz de Cuadrante Anual Completo**:
  - Visualización mensual y anual de todos los trabajadores.
  - Diferenciación visual clara de turnos de **Mañanas** (9:30 - 15:00 · 5.5 h) y **Tardes** (15:00 - 21:00 · 6.0 h).
  - Estados especiales: *Libranza (LIB)*, *Vacaciones (VAC)*, *Baja Médica (BAJ)*, *Asuntos Propios (AP)*, *Festivo Laborable (F-LAB)* y *Disfrute de Festivo (DISF)*.

- **⚡ Asignación Masiva por Rango de Fechas**:
  - Modal para asignar patrones de turnos a uno o varios empleados entre dos fechas seleccionadas con un solo clic.

- **⏱️ Cómputo de Horas y Auditoría en Tiempo Real**:
  - Balance en vivo de horas trabajadas vs. horas teóricas de contrato.
  - Indicador de saldo positivo (+) o negativo (-) de horas.
  - Conteo de días de vacaciones consumidos vs. totales asignados (30 días).

- **🔒 Seguridad y Protección de Datos (RGPD)**:
  - Pantalla de acceso neutral con Correo Electrónico y PIN.
  - Sin nombres de empleados ni correos visibles antes de autenticarse.
  - Mensajes de error seguros sin enumeración de usuarios.
  - Modo Administrador (edición completa) y Modo Empleado (portal personal de consulta).

- **📊 Exportación e Importación con Excel**:
  - Exportación de la cuadrícula anual completa a formato `.xlsx`.
  - Descarga de plantilla oficial e importación masiva de datos para migraciones rápidas.

- **☁️ Sincronización en la Nube (Firebase Firestore)**:
  - Respaldo automático de cuadrantes y credenciales en base de datos Firestore.
  - Almacenamiento local híbrido (*offline-first*) para máxima velocidad.

- **👥 Gestión de Plantilla y Nuevos Años**:
  - Crear, editar y dar de baja a empleados.
  - Creación de nuevos años fiscales/laborales (2026, 2027, etc.) manteniendo o reiniciando la plantilla.

---

## 💻 Stack Tecnológico

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador:** [Vite 6](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Hojas de Cálculo:** [SheetJS (xlsx)](https://docs.sheetjs.com/)
- **Base de Datos:** [Firebase Firestore](https://firebase.google.com/)
- **Servidor / Proxy:** [Express](https://expressjs.com/) + [tsx](https://github.com/privatenumber/tsx)

---

## 📁 Estructura del Proyecto

```text
├── index.html                  # Punto de entrada HTML
├── metadata.json               # Configuración de metadatos de la aplicación
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración TypeScript
├── vite.config.ts              # Configuración de Vite y plugins
├── src/
│   ├── main.tsx                # Entrada de la aplicación React
│   ├── App.tsx                 # Componente raíz y orquestador del estado
│   ├── types.ts                # Tipos e interfaces globales TypeScript
│   ├── index.css               # Estilos globales con Tailwind CSS
│   ├── firebase.ts             # Configuración e integración con Firestore
│   ├── components/
│   │   ├── LoginPage.tsx       # Pantalla de Login seguro (RGPD)
│   │   ├── CuadranteTable.tsx  # Tabla anual con vista mensual y filtros
│   │   ├── ShiftEditorModal.tsx# Modal para editar turnos de un día concreto
│   │   ├── RangeAssignmentModal.tsx # Asignación masiva por rango de fechas
│   │   ├── EmployeeManagerModal.tsx # Gestión de plantilla de trabajadores
│   │   ├── HoursSummaryModal.tsx    # Cómputo global y balance de horas
│   │   ├── ExcelExportModal.tsx     # Importador y exportador de Excel (.xlsx)
│   │   ├── NewYearModal.tsx    # Asistente para crear cuadrante de nuevo año
│   │   └── UserLoginModal.tsx  # Cambio de usuario y actualización de PIN
│   ├── data/
│   │   ├── initialEmployees.ts # Plantilla base de empleados iniciales
│   │   └── seedSchedule.ts     # Generador del calendario y cuadrante base
│   └── utils/
│       ├── auth.ts             # Lógica de autenticación, roles y PINs
│       ├── calendarGenerator.ts# Utilidades de fechas, días festivos y meses
│       └── excelUtils.ts       # Procesamiento y lectura de archivos Excel
└── GUIA_DE_USO.md              # Manual de usuario detallado paso a paso
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Gestor de paquetes `npm`

### Pasos

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone https://github.com/TU-USUARIO/gestor-horarios-cuadrantes.git
   cd gestor-horarios-cuadrantes
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## ⚙️ Configuración de Variables de Entorno

El proyecto incluye un archivo `.env.example`. Crea un archivo `.env` en la raíz si deseas personalizar la conexión con tu propio proyecto de Firebase:

```env
# Variables opcionales para Firebase Firestore (si no se configuran, utiliza el almacenamiento local)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🐙 Cómo Subir a GitHub

### Opción A: Desde Google AI Studio (Recomendada y Directa)
1. En la esquina superior de la interfaz de Google AI Studio, abre el menú de opciones (**Settings** / **Export**).
2. Selecciona **"Export to GitHub"** (o "Descargar ZIP").
3. Selecciona tu cuenta de GitHub y el nombre del repositorio deseado. ¡AI Studio subirá todo el código listo con este README y la guía!

### Opción B: Mediante Línea de Comandos (Git)
Si descargaste el código o estás trabajando en tu terminal:

1. **Crea un nuevo repositorio vacío en [GitHub](https://github.com/new)** (por ejemplo: `gestor-horarios-cuadrantes`).
2. **Ejecuta los siguientes comandos en la carpeta del proyecto**:
   ```bash
   # Inicializar git
   git init

   # Añadir todos los archivos
   git add .

   # Crear el commit inicial
   git commit -m "feat: versión inicial del Gestor de Horarios y Cuadrantes"

   # Vincular con tu repositorio de GitHub (reemplaza TU-USUARIO por tu usuario)
   git remote add origin https://github.com/TU-USUARIO/gestor-horarios-cuadrantes.git

   # Subir a la rama principal
   git branch -M main
   git push -u origin main
   ```

---

## 🔑 Roles y Permisos de Acceso

| Perfil | Correo por Defecto | PIN Inicial | Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@empresa.com` | `1234` | Edición de cualquier turno, asignación por lotes, creación de años, gestión de empleados, exportación/importación Excel. |
| **Empleado** | Correo asignado al empleado (ej: `aitor@empresa.com`) | `1234` | Consulta personal de sus turnos, balance de horas acumuladas, días de vacaciones restantes (modo lectura). |
| **Invitado** | N/A (Acceso anónimo) | N/A | Visualización del cuadrante general sin permisos de modificación. |

---

## 📚 Documentación Adicional

Para consultar el manual de usuario exhaustivo con capturas y resolución de dudas, revisa:
👉 **[GUIA_DE_USO.md](./GUIA_DE_USO.md)**

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
