"use client";
import { useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Fehler beim Senden. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF9F6" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 14, border: "1.5px solid #e5e7eb", padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Passwort vergessen</h1>

        {sent ? (
          <div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, marginBottom: 20 }}>
              Falls ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link gesendet. Prüfe dein Postfach.
            </p>
            <Link href="/login" style={{ color: "#2563eb", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Zurück zum Login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>E-Mail</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              {error && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <button type="submit" disabled={submitting} style={{
                width: "100%", padding: "11px 0", borderRadius: 9, border: "none",
                background: "#1a1a1a", color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? "Sende..." : "Reset-Link senden"}
              </button>
            </form>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Link href="/login" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>Zurück zum Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
