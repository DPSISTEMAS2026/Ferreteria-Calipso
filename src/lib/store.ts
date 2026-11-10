export const store = {
  name: "Ferretería Calipso",
  city: "Villa Alemana",
  address: "Lourdes 884, Villa Alemana",
  phone: "+56 9 8865 1871",
  phoneHref: "tel:+56988651871",
  whatsapp: "https://wa.me/56988651871",
  instagram: "https://www.instagram.com/ferreteriacalipsova/",
  maps: "https://www.google.com/maps/search/?api=1&query=Ferreteria+Calipso+Lourdes+884+Villa+Alemana",
  waze: "https://waze.com/ul?ll=-33.059173,-71.373054&navigate=yes",
  latitude: -33.059173,
  longitude: -71.373054,
};

/** Cotización de envío prevista con Blue Express. Todavía sin conectar. */
export const shippingCarrier = "bluexpress";

/** El envío es gratis desde este monto. Bajo eso, el pedido se retira en la tienda. */
export const freeShippingFrom = 40000;

/**
 * Pago previsto, todavía sin conectar:
 * en línea, Mercado Pago Checkout Pro;
 * en el local, la máquina Point 2.
 * Hoy el pedido se confirma por WhatsApp.
 */
export const payments = {
  online: "mercadopago-checkout-pro",
  inStore: "point-2",
} as const;

/** Horario pintado en la puerta: 9 a 21 hrs, lunes a lunes. */
export const weekHours: Record<number, [string, string] | null> = {
  0: ["09:00", "21:00"],
  1: ["09:00", "21:00"],
  2: ["09:00", "21:00"],
  3: ["09:00", "21:00"],
  4: ["09:00", "21:00"],
  5: ["09:00", "21:00"],
  6: ["09:00", "21:00"],
};

export function santiagoParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || "";
  const weekday = pick("weekday");
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: map[weekday] ?? date.getDay(),
    minutes: Number(pick("hour")) * 60 + Number(pick("minute")),
  };
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function isStoreOpen(date = new Date()) {
  const { day, minutes } = santiagoParts(date);
  const range = weekHours[day];
  if (!range) return false;
  return minutes >= toMinutes(range[0]) && minutes < toMinutes(range[1]);
}

export function todayLabel() {
  return "Todos los días, 9:00 a 21:00";
}
