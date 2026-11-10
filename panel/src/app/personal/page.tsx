"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, authHeaders } from "@/lib/session";

type Person = { id: string; name: string; role: "dueno" | "caja" };

export default function PersonalPage() {
  const [staff, setStaff] = useState<Person[]>([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"dueno" | "caja">("caja");
  const [pin, setPin] = useState("");
  const [pins, setPins] = useState<Record<string, string>>({});

  function load() {
    fetch(`${api}/admin/staff`, { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("No pude leer el personal");
        return res.json();
      })
      .then((body) => setStaff(body.staff))
      .catch((err) => setError(err instanceof Error ? err.message : "No pude leer el personal"));
  }

  useEffect(() => { load(); }, []);

  async function add(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`${api}/admin/staff`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, role, pin }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "No pude guardar");
      return;
    }
    setName("");
    setPin("");
    load();
  }

  async function changePin(id: string) {
    setError("");
    const res = await fetch(`${api}/admin/staff/pin`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ id, pin: pins[id] || "" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "No pude cambiar el PIN");
      return;
    }
    setPins((current) => ({ ...current, [id]: "" }));
  }

  return (
    <main>
      <h1>Personal</h1>
      {error && <p>{error}</p>}
      <form className="staff-add" onSubmit={add}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" aria-label="Nombre" />
        <select aria-label="Rol" value={role} onChange={(event) => setRole(event.target.value as "dueno" | "caja")}>
          <option value="caja">Caja</option>
          <option value="dueno">Dueño</option>
        </select>
        <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="PIN" aria-label="PIN" />
        <button type="submit" className="save">Agregar</button>
      </form>
      <div className="sheet">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>PIN</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person.id}>
                <td><strong>{person.name}</strong></td>
                <td>{person.role === "dueno" ? "Dueño" : "Caja"}</td>
                <td>
                  <div className="price-cell">
                    <input
                      inputMode="numeric"
                      aria-label={`PIN de ${person.name}`}
                      value={pins[person.id] || ""}
                      placeholder="Nuevo"
                      onChange={(event) => setPins((current) => ({ ...current, [person.id]: event.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    />
                    <button type="button" className="edit" onClick={() => changePin(person.id)}>Guardar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
