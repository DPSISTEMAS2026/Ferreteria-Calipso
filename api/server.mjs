import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 3011);
const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const file = join(dataDir, "catalog.json");
const staffFile = join(dataDir, "staff.json");
const sessionFile = join(dataDir, "sessions.json");
const cajaFile = join(dataDir, "caja.json");
const raw = JSON.parse(readFileSync(file, "utf8"));

const publicProducts = raw.items.map((item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  categoryId: item.categoryId,
  salePrice: item.salePrice,
  note: item.note,
  imageUrl: item.imageUrl || null,
}));

const allowed = new Set([
  "http://localhost:3010",
  "http://127.0.0.1:3010",
  "http://localhost:3012",
  "http://127.0.0.1:3012",
]);

const attempts = new Map();

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value));
}

function checkPin(pin, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(String(pin), salt, 32);
  const prev = Buffer.from(hash, "hex");
  return next.length === prev.length && timingSafeEqual(next, prev);
}

function hashPin(pin) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(pin), salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function publicPerson(person) {
  return { id: person.id, name: person.name, role: person.role };
}

function userFrom(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const now = Date.now();
  const sessions = readJson(sessionFile, []).filter((row) => row.expires > now);
  const session = sessions.find((row) => row.token === token);
  if (!session) return null;
  return readJson(staffFile, []).find((person) => person.id === session.userId) || null;
}

function dayKey(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function applySale(item, price) {
  item.salePrice = price;
  if (price === item.priceF2) {
    item.saleFactor = "2";
    item.saleChosen = false;
  } else if (price === item.priceF3) {
    item.saleFactor = "3";
    item.saleChosen = false;
  } else if (price === item.priceF4) {
    item.saleFactor = "4";
    item.saleChosen = false;
  } else {
    item.saleFactor = "elegido";
    item.saleChosen = true;
  }
  const published = publicProducts.find((row) => row.slug === item.slug);
  if (published) published.salePrice = price;
  return {
    slug: item.slug,
    salePrice: item.salePrice,
    saleFactor: item.saleFactor,
    saleChosen: item.saleChosen,
  };
}

function send(res, origin, status, body) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (origin && allowed.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > limit) {
        reject(new Error("grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("json"));
      }
    });
  });
}

function guard(req, res, origin) {
  const user = userFrom(req);
  if (!user) {
    send(res, origin, 401, { error: "Inicia sesión" });
    return null;
  }
  return user;
}

createServer((req, res) => {
  const origin = req.headers.origin || "";
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": allowed.has(origin) ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin",
    });
    res.end();
    return;
  }
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  if (req.method === "GET" && url.pathname === "/status") {
    send(res, origin, 200, { ok: true, products: publicProducts.length });
    return;
  }
  if (req.method === "GET" && url.pathname === "/public/catalog") {
    send(res, origin, 200, { categories: raw.categories, products: publicProducts });
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/login") {
    readBody(req, 2000).then((body) => {
      const ip = req.socket.remoteAddress || "";
      const stamp = attempts.get(ip) || { count: 0, until: 0 };
      if (stamp.until > Date.now()) {
        send(res, origin, 429, { error: "Espera un momento" });
        return;
      }
      const pin = String(body.pin || "");
      const person = /^\d{4}$/.test(pin) ? readJson(staffFile, []).find((row) => checkPin(pin, row.pinHash)) : null;
      if (!person) {
        stamp.count += 1;
        if (stamp.count >= 8) {
          stamp.until = Date.now() + 60_000;
          stamp.count = 0;
        }
        attempts.set(ip, stamp);
        send(res, origin, 401, { error: "PIN incorrecto" });
        return;
      }
      attempts.delete(ip);
      const token = randomBytes(24).toString("hex");
      const sessions = readJson(sessionFile, []).filter((row) => row.expires > Date.now());
      sessions.push({ token, userId: person.id, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
      writeJson(sessionFile, sessions);
      send(res, origin, 200, { token, user: publicPerson(person) });
    }).catch(() => send(res, origin, 400, { error: "No pude entrar" }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/logout") {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    writeJson(sessionFile, readJson(sessionFile, []).filter((row) => row.token !== token));
    send(res, origin, 200, { ok: true });
    return;
  }
  if (req.method === "GET" && url.pathname === "/admin/session") {
    const user = guard(req, res, origin);
    if (!user) return;
    send(res, origin, 200, { user: publicPerson(user) });
    return;
  }
  if (req.method === "GET" && url.pathname === "/admin/staff") {
    const user = guard(req, res, origin);
    if (!user) return;
    if (user.role !== "dueno") {
      send(res, origin, 403, { error: "No tienes acceso" });
      return;
    }
    send(res, origin, 200, { staff: readJson(staffFile, []).map(publicPerson) });
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/staff") {
    const user = guard(req, res, origin);
    if (!user || user.role !== "dueno") {
      if (user) send(res, origin, 403, { error: "No tienes acceso" });
      return;
    }
    readBody(req, 4000).then((body) => {
      const name = String(body.name || "").trim();
      const role = body.role === "caja" ? "caja" : body.role === "dueno" ? "dueno" : "";
      const pin = String(body.pin || "");
      if (name.length < 2 || !role || !/^\d{4}$/.test(pin)) {
        send(res, origin, 400, { error: "Revisa nombre, rol y PIN" });
        return;
      }
      const staff = readJson(staffFile, []);
      const person = { id: `p-${Date.now()}`, name, role, pinHash: hashPin(pin) };
      staff.push(person);
      writeJson(staffFile, staff);
      send(res, origin, 200, { person: publicPerson(person) });
    }).catch(() => send(res, origin, 400, { error: "No pude guardar" }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/staff/pin") {
    const user = guard(req, res, origin);
    if (!user || user.role !== "dueno") {
      if (user) send(res, origin, 403, { error: "No tienes acceso" });
      return;
    }
    readBody(req, 2000).then((body) => {
      const pin = String(body.pin || "");
      const staff = readJson(staffFile, []);
      const person = staff.find((row) => row.id === body.id);
      if (!person || !/^\d{4}$/.test(pin)) {
        send(res, origin, 400, { error: "PIN de 4 dígitos" });
        return;
      }
      person.pinHash = hashPin(pin);
      writeJson(staffFile, staff);
      send(res, origin, 200, { person: publicPerson(person) });
    }).catch(() => send(res, origin, 400, { error: "No pude guardar" }));
    return;
  }
  if (req.method === "GET" && url.pathname === "/admin/catalog") {
    if (!guard(req, res, origin)) return;
    send(res, origin, 200, { categories: raw.categories, items: raw.items });
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/price") {
    if (!guard(req, res, origin)) return;
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 10000) req.destroy();
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(data || "{}");
        const price = Math.round(Number(body.salePrice));
        const item = raw.items.find((row) => row.slug === body.slug);
        if (!item || !Number.isFinite(price) || price < 1 || price > 20000000) {
          send(res, origin, 400, { error: "Precio inválido" });
          return;
        }
        const saved = applySale(item, price);
        writeFileSync(file, JSON.stringify(raw));
        send(res, origin, 200, { item: saved });
      } catch {
        send(res, origin, 400, { error: "No pude guardar el precio" });
      }
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/factor") {
    if (!guard(req, res, origin)) return;
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 200000) req.destroy();
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(data || "{}");
        const key = { "2": "priceF2", "3": "priceF3", "4": "priceF4" }[body.factor];
        const slugs = Array.isArray(body.slugs) ? body.slugs : [];
        if (!key || slugs.length === 0 || slugs.length > 1000) {
          send(res, origin, 400, { error: "No pude aplicar el factor" });
          return;
        }
        const saved = [];
        for (const slug of slugs) {
          const item = raw.items.find((row) => row.slug === slug);
          if (item) saved.push(applySale(item, item[key]));
        }
        if (saved.length === 0) {
          send(res, origin, 404, { error: "No hay productos" });
          return;
        }
        writeFileSync(file, JSON.stringify(raw));
        send(res, origin, 200, { items: saved });
      } catch {
        send(res, origin, 400, { error: "No pude aplicar el factor" });
      }
    });
    return;
  }
  if (req.method === "GET" && url.pathname === "/admin/shift") {
    if (!guard(req, res, origin)) return;
    const caja = readJson(cajaFile, { shifts: [], sales: [] });
    const shift = caja.shifts.find((row) => !row.closedAt) || null;
    send(res, origin, 200, { shift });
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/shift") {
    const user = guard(req, res, origin);
    if (!user) return;
    readBody(req, 2000).then((body) => {
      const caja = readJson(cajaFile, { shifts: [], sales: [] });
      if (caja.shifts.some((row) => !row.closedAt)) {
        send(res, origin, 400, { error: "Ya hay una caja abierta" });
        return;
      }
      const openingFloat = Math.round(Number(body.float));
      if (!Number.isFinite(openingFloat) || openingFloat < 0 || openingFloat > 20000000) {
        send(res, origin, 400, { error: "Monto inicial inválido" });
        return;
      }
      const shift = {
        id: `t-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        openedAt: new Date().toISOString(),
        openingFloat,
        closedAt: null,
        countedCash: null,
      };
      caja.shifts.push(shift);
      writeJson(cajaFile, caja);
      send(res, origin, 200, { shift });
    }).catch(() => send(res, origin, 400, { error: "No pude abrir la caja" }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/shift/close") {
    const user = guard(req, res, origin);
    if (!user) return;
    readBody(req, 2000).then((body) => {
      const caja = readJson(cajaFile, { shifts: [], sales: [] });
      const shift = caja.shifts.find((row) => !row.closedAt);
      if (!shift) {
        send(res, origin, 400, { error: "No hay caja abierta" });
        return;
      }
      const counted = Math.round(Number(body.counted));
      if (!Number.isFinite(counted) || counted < 0) {
        send(res, origin, 400, { error: "Monto contado inválido" });
        return;
      }
      const sales = caja.sales.filter((row) => row.shiftId === shift.id);
      const cashSales = sales.filter((row) => row.method === "efectivo").reduce((sum, row) => sum + row.total, 0);
      shift.closedAt = new Date().toISOString();
      shift.countedCash = counted;
      shift.closedBy = user.name;
      shift.expectedCash = shift.openingFloat + cashSales;
      writeJson(cajaFile, caja);
      send(res, origin, 200, { shift });
    }).catch(() => send(res, origin, 400, { error: "No pude cerrar la caja" }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/admin/sale") {
    const user = guard(req, res, origin);
    if (!user) return;
    readBody(req, 20000).then((body) => {
      const caja = readJson(cajaFile, { shifts: [], sales: [] });
      const shift = caja.shifts.find((row) => !row.closedAt);
      if (!shift) {
        send(res, origin, 400, { error: "Abre la caja" });
        return;
      }
      const method = body.method;
      if (!["efectivo", "debito", "credito"].includes(method)) {
        send(res, origin, 400, { error: "Elige cómo se pagó" });
        return;
      }
      const incoming = Array.isArray(body.lines) ? body.lines : [];
      if (incoming.length === 0 || incoming.length > 80) {
        send(res, origin, 400, { error: "La venta está vacía" });
        return;
      }
      const lines = [];
      for (const line of incoming) {
        const item = raw.items.find((row) => row.slug === line.slug);
        const qty = Math.round(Number(line.qty));
        if (!item || !Number.isFinite(qty) || qty < 1 || qty > 99) {
          send(res, origin, 400, { error: "Hay un producto inválido" });
          return;
        }
        lines.push({ slug: item.slug, name: item.name, qty, price: item.salePrice });
      }
      const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
      let cashReceived = null;
      let change = null;
      if (method === "efectivo") {
        cashReceived = Math.round(Number(body.cashReceived));
        if (!Number.isFinite(cashReceived) || cashReceived < total) {
          send(res, origin, 400, { error: "El efectivo no alcanza" });
          return;
        }
        change = cashReceived - total;
      }
      const sale = {
        id: `v-${Date.now()}`,
        at: new Date().toISOString(),
        shiftId: shift.id,
        cashier: user.name,
        lines,
        total,
        method,
        cashReceived,
        change,
      };
      caja.sales.push(sale);
      writeJson(cajaFile, caja);
      send(res, origin, 200, { sale });
    }).catch(() => send(res, origin, 400, { error: "No pude guardar la venta" }));
    return;
  }
  if (req.method === "GET" && url.pathname === "/admin/sales") {
    if (!guard(req, res, origin)) return;
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";
    const slug = url.searchParams.get("slug") || "";
    const caja = readJson(cajaFile, { shifts: [], sales: [] });
    const sales = caja.sales.filter((sale) => {
      const day = dayKey(sale.at);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
    if (slug) {
      const rows = [];
      for (const sale of sales) {
        for (const line of sale.lines) {
          if (line.slug === slug) rows.push({ at: sale.at, qty: line.qty, amount: line.price * line.qty });
        }
      }
      send(res, origin, 200, {
        units: rows.reduce((sum, row) => sum + row.qty, 0),
        amount: rows.reduce((sum, row) => sum + row.amount, 0),
        rows: rows.slice(-30).reverse(),
      });
      return;
    }
    const bySlug = new Map();
    for (const sale of sales) {
      for (const line of sale.lines) {
        const current = bySlug.get(line.slug) || { slug: line.slug, name: line.name, qty: 0, amount: 0 };
        current.qty += line.qty;
        current.amount += line.price * line.qty;
        bySlug.set(line.slug, current);
      }
    }
    const products = [...bySlug.values()].sort((a, b) => b.qty - a.qty);
    send(res, origin, 200, {
      units: products.reduce((sum, row) => sum + row.qty, 0),
      amount: products.reduce((sum, row) => sum + row.amount, 0),
      products,
    });
    return;
  }
  send(res, origin, 404, { error: "No existe" });
}).listen(port, "0.0.0.0", () => {
  console.log(`API Calipso en http://0.0.0.0:${port}`);
});
