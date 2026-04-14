# 📦 Sistema de Inventario IUCA

Sistema web para la gestión del inventario institucional del IUCA – Tulancingo. Permite administrar equipos de cómputo, mobiliario, responsables y accesos al sistema, con soporte de auditoría, control de concurrencia y permisos por módulo.

---

## 🚀 Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| [Vue 3](https://vuejs.org/) | ^3.3 | Framework principal (Composition API) |
| [Vite](https://vitejs.dev/) | ^5.0 | Bundler y servidor de desarrollo |
| [Pinia](https://pinia.vuejs.org/) | ^2.1 | Gestión de estado global |
| [Vue Router](https://router.vuejs.org/) | ^4.2 | Enrutamiento SPA |
| [Axios](https://axios-http.com/) | ^1.6 | Peticiones HTTP al backend |

---

## 📁 Estructura del proyecto

```
src/
├── assets/             # Estilos globales (variables, tablas, modales, formularios)
├── components/
│   └── ui/             # Componentes reutilizables (modales, paginación, badges, etc.)
├── composables/        # Lógica reutilizable (CRUD, paginación, toasts, permisos, etc.)
├── constants/          # Mapeos y configuraciones estáticas
├── router/             # Configuración de rutas y guards de autenticación
├── services/           # Cliente HTTP (api.js) y gestión de concurrencia
├── stores/             # Store de autenticación (Pinia)
├── utils/              # Formateadores de fechas y textos
└── views/              # Vistas principales de la aplicación
```

---

## 🗂️ Módulos del sistema

| Módulo | Descripción |
|---|---|
| **Equipos** | Inventario de equipos de cómputo con especificaciones técnicas y responsables asignados |
| **Mobiliario** | Inventario de muebles con características, estado y responsables |
| **Responsables** | Catálogo de personas asignables como responsables de activos |
| **Accesos** | Gestión de usuarios del sistema con permisos granulares por módulo |
| **Catálogos** | Administración de áreas, estados, tipos de activo y tipos de mobiliario |
| **Historial** | Auditoría completa de todos los cambios realizados en el sistema |

---

## ⚙️ Instalación y uso

### Prerrequisitos

- Node.js >= 18
- npm >= 8

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd iuca-inventario

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y definir VITE_API_URL

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Compilar para producción
npm run build
```

### Variables de entorno

```env
VITE_API_URL=https://tu-backend.com
```

---

## 🔐 Autenticación y permisos

El sistema utiliza **JWT** almacenado en `localStorage`. Cada usuario tiene permisos configurados por módulo con cuatro acciones posibles:

- `puede_leer` — Ver registros
- `puede_crear` — Crear nuevos registros
- `puede_actualizar` — Editar registros existentes
- `puede_eliminar` — Eliminar registros

La navegación se adapta automáticamente mostrando solo los módulos a los que el usuario tiene acceso de lectura.

El sistema detecta y gestiona sesiones activas en otros dispositivos o desde la misma IP, mostrando avisos o diálogos de confirmación según el caso.

---

## 🔒 Control de concurrencia

Para evitar conflictos al editar registros simultáneamente, el sistema implementa un mecanismo de **bloqueos optimistas**:

- Al abrir un formulario de edición se adquiere un bloqueo temporal en el backend.
- El bloqueo se renueva automáticamente cada 5 minutos mientras el formulario esté abierto.
- Si otro usuario ya tiene el registro bloqueado, se muestra una alerta con la información del usuario que lo tiene en uso.
- Al cerrar el formulario (guardar o cancelar) el bloqueo se libera inmediatamente.
- En caso de conflicto de versión (edición simultánea), se ofrece recargar los datos más recientes.

---

## 🧩 Componentes UI principales

| Componente | Descripción |
|---|---|
| `BaseModal` | Modal base reutilizable con header, body y footer |
| `ConfirmDialog` | Diálogo de confirmación para acciones destructivas |
| `ConcurrencyAlert` | Alerta cuando un registro está en uso por otro usuario |
| `ConflictModal` | Modal para resolver conflictos de versión |
| `ToastNotification` | Sistema de notificaciones tipo toast (success, error, warning, info) |
| `Pagination` | Paginación con puntos suspensivos y navegación completa |
| `ResponsablesSelector` | Selector múltiple con búsqueda para asignar responsables a un activo en formularios |
| `ResponsablesFilter` | Filtro tipo dropdown con checkboxes para filtrar por responsable en las tablas |
| `StatusBadge` | Badge de estado con color dinámico |
| `TableActions` | Botones de acción (ver, editar, eliminar) con control de permisos |
| `FilterBar` | Barra de filtros configurable |
| `LockWarningBanner` | Banner de advertencia cuando un registro estaba siendo editado |

---

## 🛠️ Composables principales

| Composable | Descripción |
|---|---|
| `useCrud` | Lógica completa de CRUD con concurrencia, modales y locks |
| `usePagination` | Estado y helpers de paginación |
| `useSort` | Ordenamiento de tablas con indicadores visuales |
| `useToast` | Sistema de notificaciones global (singleton) |
| `useFormErrors` | Gestión de errores de validación por campo |
| `useCatalogos` | Carga en paralelo de catálogos necesarios por vista |
| `useCatalogosData` | Carga de datos, contadores por tab y paginación para la vista de catálogos |
| `useCatalogosForm` | Lógica de formulario, validación, CRUD y concurrencia para la vista de catálogos |
| `usePermisos` | Lógica de permisos con dependencias entre acciones |
| `useSpecsEditor` | Editor de especificaciones dinámicas con sugerencias por tipo de equipo |
| `useConcurrencyHandlers` | Handlers de eventos de concurrencia y conflicto reutilizables entre vistas |

---

## 📐 Constantes principales

| Archivo | Descripción |
|---|---|
| `constants/accesos.js` | Módulos disponibles, permisos, estructura de permisos por defecto y nombres legibles de módulos |
| `constants/catalogos.js` | Tabs, mapeos de tablas/métodos API/campos, helpers `getItemId`, `getItemNombre`, `resolveField` |
| `constants/equiposMap.js` | `SPECS_MAP` — sugerencias de especificaciones técnicas agrupadas por tipo de equipo (PC, laptop, monitor, etc.) |
| `constants/historial.js` | Nombres legibles de campos, tablas y operaciones para la vista de historial |

---

## 📡 API

El cliente HTTP (`src/services/api.js`) configura un interceptor que:

- Adjunta el token JWT en cada petición.
- Redirige al login si la sesión expira (`401`) o es invalidada remotamente.
- Serializa arrays como múltiples parámetros del mismo nombre en la query string (ej. `usuario_id=1&usuario_id=2`).

Los endpoints se organizan por dominio: `authApi`, `equiposApi`, `mobiliarioApi`, `catalogosApi`, `usuariosApi`, `historialApi`, `vistasApi` y `concurrencyApi`.

---

## 📝 Notas de desarrollo

- Los estilos están organizados en archivos CSS separados importados desde `main.css`: variables, tablas, formularios, modales y responsive.
- El diseño es responsive con breakpoints en 768px (móvil) y 1600px/1920px (pantallas grandes).
- Las fuentes utilizadas son **DM Sans** (cuerpo) y **Space Mono** (monoespaciado) vía Google Fonts.
- Los errores del backend (constraints de PostgreSQL, unicidad, claves foráneas, etc.) son traducidos automáticamente a mensajes legibles en español por `useToast.parseBackendError`.
- Los filtros de responsables en equipos y mobiliario admiten selección múltiple; la query se envía como múltiples parámetros `usuario_id` y el backend aplica un filtro AND (el activo debe tener asignados todos los responsables seleccionados).