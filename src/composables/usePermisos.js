import { computed } from "vue";
import { DEFAULT_PERMISOS } from "@/constants/accesos";

const DEPENDEN_DE_LEER = ["puede_crear", "puede_actualizar", "puede_eliminar"];

export function usePermisos(form) {
  function permisosComoArray() {
    if (Array.isArray(form.permisos)) return form.permisos;
    return Object.values(form.permisos);
  }

  function togglePermiso(p, campo) {
    const nuevoValor = !p[campo];
    p[campo] = nuevoValor;

    // Si activas crear/editar/eliminar, leer se activa automáticamente
    if (nuevoValor && DEPENDEN_DE_LEER.includes(campo) && !p.puede_leer) {
      p.puede_leer = true;
    }

    // Si desactivas leer, se desactivan todos los demás
    if (!nuevoValor && campo === "puede_leer") {
      p.puede_crear = false;
      p.puede_actualizar = false;
      p.puede_eliminar = false;
    }
  }

  const todosSeleccionados = computed(() =>
    permisosComoArray().every(
      (p) =>
        p.puede_leer && p.puede_crear && p.puede_actualizar && p.puede_eliminar,
    ),
  );

  const algunosSeleccionados = computed(
    () =>
      !todosSeleccionados.value &&
      permisosComoArray().some(
        (p) =>
          p.puede_leer ||
          p.puede_crear ||
          p.puede_actualizar ||
          p.puede_eliminar,
      ),
  );

  function toggleTodos() {
    const activar = !todosSeleccionados.value;
    permisosComoArray().forEach((p) => {
      p.puede_leer = activar;
      p.puede_crear = activar;
      p.puede_actualizar = activar;
      p.puede_eliminar = activar;
    });
  }

  function resetPermisos() {
    form.permisos = JSON.parse(JSON.stringify(DEFAULT_PERMISOS));
  }

  function permisosDetalleComoArray(permisos) {
    if (!permisos) return [];
    if (Array.isArray(permisos)) return permisos;
    return Object.values(permisos);
  }

  return {
    permisosComoArray,
    permisosDetalleComoArray,
    togglePermiso,
    todosSeleccionados,
    algunosSeleccionados,
    toggleTodos,
    resetPermisos,
  };
}
