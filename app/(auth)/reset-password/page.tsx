"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Passwort muss mindestens 6 Zeichen haben."); return; }
    if (password !== confirm) { setError("Passwörter stimmen nicht überein."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Fehler");
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Token ungültig oder abgelaufen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, background: "#fff", borderRadius: 14, border: "1.5px solid #e5e7eb", padding: 32, textAlign: "center" }}>
        <p style={{ color: "#dc2626", fontSize: 14 }}>Kein Token angegeben.</p>
        <Link href="/forgot-password" style={{ color: "#2563eb", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Neuen Reset-Link anfordern
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 14, border: "1.5px solid #e5e7eb", padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Neues Passwort setzen</h1>

      {done ? (
        <div>
          <p style={{ fontSize: 14, color: "#16a34a", lineHeight: 1.5, marginBottom: 20 }}>
            Passwort erfolgreich zurückgesetzt! Du kannst dich jetzt einloggen.
          </p>
          <Link href="/login" style={{ color: "#2563eb", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Zum Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Neues Passwort</label>
            <input
              type="password" required value={password} minLength={6}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Passwort bestätigen</label>
            <input
              type="password" required value={confirm} minLength={6}
              onChange={e => setConfirm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          {error && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={submitting} style={{
            width: "100%", padding: "11px 0", borderRadius: 9, border: "none",
            background: "#1a1a1a", color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? "Speichern..." : "Passwort speichern"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF9F6" }}>
      <Suspense fallback={<div style={{ color: "#94a3b8", fontSize: 14 }}>Laden...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
