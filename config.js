// config.js — ÚNICO lugar a tocar para cambios de último momento.
// Estados posibles de una tablet (clave interna: texto visible + color).
const ESTADOS = {
  PANOL: "En Pañol", LOCAL: "En Uso Local (Oficina)",
  EXTERNO: "En Uso Externo (Home Office)", SERVICIO: "En Servicio Técnico"
};
const COLOR = { PANOL: "#15803d", LOCAL: "#1d4ed8", EXTERNO: "#7c3aed", SERVICIO: "#b91c1c" };

// Campos de la tablet. k = clave en el QR/base, l = etiqueta, req = obligatorio.
// Agregar un campo = agregar UNA línea (aparece solo en el alta, el QR y la ficha).
// Ejemplos para descomentar en la defensa:
const CAMPOS = [
  { k: "serie", l: "Número de serie", req: true },
  { k: "cpu", l: "Procesador" },
  { k: "ram", l: "RAM" },
  { k: "alm", l: "Almacenamiento" },
  { k: "pantalla", l: "Pantalla" },
  { k: "puertos", l: "Puertos" },
  { k: "conectividad", l: "Conectividad" },
  // { k: "bateria", l: "Nivel de batería" },
  // { k: "cargador", l: "Cargador incluido (sí/no)" },
];
