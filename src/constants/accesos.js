export const MODULOS_DISPONIBLES = {
  acceso: "Acceso",
  catalogos: "Catálogos",
  computo: "Cómputo",
  historial: "Historial",
  mobiliario: "Mobiliario",
  responsable: "Responsable",
};

export const PERMISOS_DISPONIBLES = {
  puede_actualizar: "Actualizar",
  puede_crear: "Crear",
  puede_eliminar: "Eliminar",
  puede_leer: "Leer",
};

export const DEFAULT_PERMISOS = [
  {
    modulo: "acceso",
    puede_leer: false,
    puede_crear: false,
    puede_actualizar: false,
    puede_eliminar: false,
  },
  {
    modulo: "catalogos",
    puede_leer: false,
    puede_crear: false,
    puede_actualizar: false,
    puede_eliminar: false,
  },
  {
    modulo: "computo",
    puede_leer: false,
    puede_crear: false,
    puede_actualizar: false,
    puede_eliminar: false,
  },
  {
    modulo: "historial",
    puede_leer: false,
    puede_crear: false,
    puede_actualizar: false,
    puede_eliminar: false,
  },
  {
    modulo: "mobiliario",
    puede_leer: false,
    puede_crear: false,
    puede_actualizar: false,
    puede_eliminar: false,
  },
  {
    modulo: "responsable",
    puede_leer: false,
    puede_crear: false,
    puede_actualizar: false,
    puede_eliminar: false,
  },
];

// Se usa en formatModuloNombre dentro de AccesosView
export const NOMBRES_MODULOS = {
  computo: "Cómputo",
  mobiliario: "Mobiliario",
  responsable: "Responsables",
  catalogos: "Catálogos",
  historial: "Historial",
  acceso: "Accesos",
};
