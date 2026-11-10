"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, readSession, writeSession } from "@/lib/session";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (readSession()) router.replace("/");
  }, [router]);

  async function submit(value: string) {
    if (loading || value.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${api}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "PIN incorrecto");
      writeSession(body.token, body.user);
      router.replace(body.user.role === "caja" ? "/caja" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PIN incorrecto");
      setPin("");
      setLoading(false);
    }
  }

  function press(key: string) {
    if (loading) return;
    if (key === "del") {
      setPin((value) => value.slice(0, -1));
      setError("");
      return;
    }
    if (!key || pin.length >= 4) return;
    const next = `${pin}${key}`;
    setPin(next);
    if (next.length === 4) void submit(next);
  }

  return (
    <main className="login">
      <section>
        <img src="/marca/logo.png" alt="Ferretería Calipso" />
        <h1>Panel</h1>
        <p>PIN de 4 dígitos</p>
        <div className="pin-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => <span key={index} className={pin.length > index ? "is-on" : ""} />)}
        </div>
        {error && <p className="pin-error">{error}</p>}
        <div className="pin-pad">
          {KEYS.map((key, index) => {
            if (key === "") return <span key={`empty-${index}`} />;
            return (
              <button key={key === "del" ? "del" : key} type="button" disabled={loading} onClick={() => press(key)}>
                {key === "del" ? "Borrar" : key}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
