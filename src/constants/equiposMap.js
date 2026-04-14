/**
 * Sugerencias de especificaciones por tipo de equipo.
 * La clave debe estar en minúsculas porque se compara con
 * tipo.nombre_tipo.toLowerCase().includes(key).
 *
 * Cada sugerencia tiene:
 *   nombre      — nombre del campo de especificación
 *   placeholder — ejemplo de valor para mostrar en el input
 */
export const SPECS_MAP = {
  pc: [
    { nombre: "Procesador", placeholder: "Ej: Intel Core i7-12700, 3.6GHz" },
    { nombre: "Núcleos", placeholder: "Ej: 8" },
    { nombre: "Memoria RAM", placeholder: "Ej: 16 GB" },
    { nombre: "Disco Duro (HDD)", placeholder: "Ej: 1 TB" },
    { nombre: "SSD", placeholder: "Ej: 500 GB" },
    { nombre: "Tarjeta de Video", placeholder: "Ej: NVIDIA Quadro P1000" },
    { nombre: "VRAM", placeholder: "Ej: 4 GB" },
    { nombre: "Sistema Operativo", placeholder: "Ej: Windows 10 Pro 64 bits" },
  ],
  laptop: [
    { nombre: "Procesador", placeholder: "Ej: Intel Core i7-4810MQ, 2.7GHz" },
    { nombre: "Memoria RAM", placeholder: "Ej: 32 GB" },
    { nombre: "SSD", placeholder: "Ej: 446 GB" },
    { nombre: "Disco Duro (HDD)", placeholder: "Ej: 500 GB" },
    { nombre: "Tarjeta de Video", placeholder: "Ej: NVIDIA Quadro K2100M" },
    {
      nombre: "Sistema Operativo",
      placeholder: "Ej: Windows 10 Enterprise 64 bits",
    },
    { nombre: "Pantalla", placeholder: 'Ej: 15.6" FHD' },
  ],
  monitor: [
    { nombre: "Tamaño", placeholder: 'Ej: 24"' },
    { nombre: "Resolución", placeholder: "Ej: 1920x1080" },
    { nombre: "Panel", placeholder: "Ej: IPS, TN, VA" },
    { nombre: "Frecuencia", placeholder: "Ej: 144 Hz" },
    { nombre: "Tipo de conexión", placeholder: "Ej: HDMI, DisplayPort" },
  ],
  impresora: [
    { nombre: "Tipo", placeholder: "Ej: Láser, Inyección de tinta" },
    { nombre: "Tecnología", placeholder: "Ej: Monocromática, Color" },
    { nombre: "Conectividad", placeholder: "Ej: USB, WiFi, Red" },
    { nombre: "Velocidad", placeholder: "Ej: 30 ppm" },
  ],
  teléfono: [
    { nombre: "Memoria RAM", placeholder: "Ej: 3 GB" },
    { nombre: "Almacenamiento", placeholder: "Ej: 64 GB" },
    { nombre: "Sistema Operativo", placeholder: "Ej: Android 11" },
    { nombre: "IMEI", placeholder: "Ej: 867166067556000" },
  ],
  default: [
    { nombre: "Procesador", placeholder: "Ej: Intel Core i7" },
    { nombre: "Memoria RAM", placeholder: "Ej: 16 GB" },
    { nombre: "Almacenamiento", placeholder: "Ej: 500 GB" },
    { nombre: "Sistema Operativo", placeholder: "Ej: Windows 10" },
  ],
};
