/** Fotos de ejemplo en Cloudinary, carpeta calipso/ejemplos. Licencia CC0. */
const CLOUD = "w2k7kwva";

const photos: Record<string, string> = {
  gasfiteria: "calipso/ejemplos/gasfiteria",
  "fittings-y-canerias": "calipso/ejemplos/gasfiteria",
  griferia: "calipso/ejemplos/gasfiteria",
  gas: "calipso/ejemplos/gasfiteria",
  electricidad: "calipso/ejemplos/electricidad",
  fijaciones: "calipso/ejemplos/fijaciones",
  quincalleria: "calipso/ejemplos/quincalleria",
  herramientas: "calipso/ejemplos/herramientas",
  pinturas: "calipso/ejemplos/pinturas",
  "pinturas-y-quimicos": "calipso/ejemplos/pinturas",
  "adhesivos-y-cintas": "calipso/ejemplos/pinturas",
  lijas: "calipso/ejemplos/pinturas",
  construccion: "calipso/ejemplos/construccion",
  "aseo-y-hogar": "calipso/ejemplos/aseo",
  jardin: "calipso/ejemplos/jardin",
  soldadura: "calipso/ejemplos/soldadura",
  "coproad-505-mascara-soldar-economica": "calipso/ejemplos/soldadura",
};

function delivery(publicId: string, transform: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${publicId}`;
}

export function examplePhoto(keys: string[], transform = "f_auto,q_auto,c_fill,g_auto,w_480,h_360") {
  for (const key of keys) {
    const publicId = photos[key];
    if (publicId) return delivery(publicId, transform);
  }
  return null;
}
