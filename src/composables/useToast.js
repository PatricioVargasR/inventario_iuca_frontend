/**
 * useToast — composable global de notificaciones
 *
 * Uso:
 *   import { useToast } from '@/composables/useToast'
 *   const { toast } = useToast()
 *
 *   toast.success('Equipo guardado')
 *   toast.error('Error al guardar', 'El número de serie ya existe')
 *   toast.warning('Atención', 'Este registro está siendo editado')
 *   toast.info('Información')
 */

import { reactive } from "vue";

// Estado compartido (singleton fuera del composable)
const state = reactive({
  toasts: [],
});

let nextId = 1;

function add({ type = "info", title = "", message = "", duration = 4000 }) {
  const id = nextId++;

  state.toasts.push({ id, type, title, message, duration });

  if (duration > 0) {
    setTimeout(() => remove(id), duration);
  }

  return id;
}

function remove(id) {
  const idx = state.toasts.findIndex((t) => t.id === id);
  if (idx !== -1) state.toasts.splice(idx, 1);
}

/**
 * Traduce errores del backend a mensajes legibles.
 * Recibe el objeto `error.response?.data` de axios.
 */
function parseBackendError(errorData) {
  if (!errorData) return "Ocurrió un error inesperado";

  const raw = errorData.error || errorData.mensaje || errorData.message || "";

  // Errores de constraint de PostgreSQL
  if (typeof raw === "string") {
    if (
      raw.includes("unique constraint") ||
      raw.includes("UniqueViolation") ||
      raw.includes("duplicate key")
    ) {
      // Intentar extraer el nombre del campo
      const match = raw.match(/Key \((.+?)\)/);
      if (match) {
        const campo = match[1].replace(/_/g, " ");
        return `Ya existe un registro con ese ${campo}`;
      }
      return "Ya existe un registro con esos datos";
    }
    if (
      raw.includes("not null") ||
      raw.includes("NotNullViolation") ||
      raw.includes("null value")
    ) {
      const match = raw.match(/column "(.+?)"/);
      if (match) {
        const campo = match[1].replace(/_/g, " ");
        return `El campo "${campo}" es obligatorio`;
      }
      return "Hay campos obligatorios sin completar";
    }
    if (raw.includes("foreign key") || raw.includes("ForeignKeyViolation")) {
      return "El registro está relacionado con otros datos y no se puede modificar";
    }
    if (raw.includes("check constraint") || raw.includes("CheckViolation")) {
      return "Los datos no cumplen con las reglas del sistema";
    }
    if (raw.includes("CONNECT") || raw.includes("Connection")) {
      return "Error de conexión con la base de datos";
    }
  }

  // Si el backend mandó mensaje legible directamente
  if (raw) return raw;

  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

export function useToast() {
  const toast = {
    success(message, title = "") {
      return add({ type: "success", title, message, duration: 3500 });
    },
    error(message, title = "Error") {
      return add({ type: "error", title, message, duration: 6000 });
    },
    warning(message, title = "Atención") {
      return add({ type: "warning", title, message, duration: 5000 });
    },
    info(message, title = "") {
      return add({ type: "info", title, message, duration: 4000 });
    },
    /**
     * Maneja automáticamente un error de axios.
     * Uso: toast.fromError(e.response?.data)
     */
    fromError(errorData, fallback = "") {
      const message = parseBackendError(errorData) || fallback;
      return add({ type: "error", title: "Error", message, duration: 6000 });
    },
  };

  return {
    toasts: state.toasts,
    toast,
    remove,
  };
}
