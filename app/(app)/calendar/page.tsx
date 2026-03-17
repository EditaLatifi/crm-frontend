"use client";
import { useEffect, useState } from "react";
import { api } from "../../../src/api/client";
import Modal from "../../../components/ui/Modal";
import { useToast } from "../../../components/ui/Toast";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  account?: { id: string; name: string };
  contact?: { id: string; name: string };
  deal?: { id: string; name: string };
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Start from Monday
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // 0=Mon
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function CalendarPage() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", startAt: "", endAt: "", accountId: "", contactId: "", dealId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/appointments").then((d: any) => setAppointments(Array.isArray(d) ? d : [])).catch(() => {});
    api.get("/accounts").then((d: any) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
    api.get("/contacts").then((d: any) => setContacts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const days = getMonthDays(year, month);

  function apptsByDay(date: Date) {
    return appointments.filter((a) => isSameDay(new Date(a.startAt), date));
  }

  function openNew(date: Date) {
    const dateStr = date.toISOString().slice(0, 10);
    setForm({ title: "", description: "", startAt: `${dateStr}T09:00`, endAt: `${dateStr}T10:00`, accountId: "", contactId: "", dealId: "" });
    setEditAppt(null);
    setModalOpen(true);
  }

  function openEdit(appt: Appointment, e: React.MouseEvent) {
    e.stopPropagation();
    setForm({
      title: appt.title,
      description: appt.description || "",
      startAt: new Date(appt.startAt).toISOString().slice(0, 16),
      endAt: new Date(appt.endAt).toISOString().slice(0, 16),
      accountId: appt.account?.id || "",
      contactId: appt.contact?.id || "",
      dealId: appt.deal?.id || "",
    });
    setEditAppt(appt);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startAt || !form.endAt) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        accountId: form.accountId || null,
        contactId: form.contactId || null,
        dealId: form.dealId || null,
      };
      if (editAppt) {
        await api.patch(`/appointments/${editAppt.id}`, payload);
        setAppointments((prev) => prev.map((a) => a.id === editAppt.id ? { ...a, ...payload, account: accounts.find(acc => acc.id === payload.accountId), contact: contacts.find(c => c.id === payload.contactId) } : a));
        toast.success("Termin aktualisiert.");
      } else {
        const created: any = await api.post("/appointments", payload);
        setAppointments((prev) => [...prev, created]);
        toast.success("Termin erstellt.");
      }
      setModalOpen(false);
    } catch {
      toast.error("Termin konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editAppt) return;
    setSaving(true);
    try {
      await api.delete(`/appointments/${editAppt.id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== editAppt.id));
      toast.success("Termin gelöscht.");
      setModalOpen(false);
    } catch {
      toast.error("Termin konnte nicht gelöscht werden.");
    } finally {
      setSaving(false);
    }
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>Kalender</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>‹</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", minWidth: 160, textAlign: "center" }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>›</button>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #e5e7eb" }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days.map((day, i) => {
            const isToday = day ? isSameDay(day, now) : false;
            const dayAppts = day ? apptsByDay(day) : [];
            return (
              <div
                key={i}
                onClick={() => day && openNew(day)}
                style={{
                  minHeight: 100, padding: "8px", borderRight: (i + 1) % 7 !== 0 ? "1px solid #f1f5f9" : "none",
                  borderBottom: "1px solid #f1f5f9", cursor: day ? "pointer" : "default",
                  background: day ? (isToday ? "#eff6ff" : "#fff") : "#fafafa",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (day) (e.currentTarget as HTMLDivElement).style.background = isToday ? "#dbeafe" : "#f8fafc"; }}
                onMouseLeave={(e) => { if (day) (e.currentTarget as HTMLDivElement).style.background = isToday ? "#eff6ff" : "#fff"; }}
              >
                {day && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? "#2563eb" : "#1e293b", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={isToday ? { background: "#2563eb", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 } : {}}>{day.getDate()}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayAppts.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          onClick={(e) => openEdit(a, e)}
                          style={{ background: "#2563eb", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 600, cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                        >
                          {new Date(a.startAt).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} {a.title}
                        </div>
                      ))}
                      {dayAppts.length > 3 && (
                        <div style={{ fontSize: 10, color: "#94a3b8", paddingLeft: 4 }}>+{dayAppts.length - 3} weitere</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming appointments list */}
      <div style={{ marginTop: 28, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Nächste Termine</span>
        </div>
        {appointments.filter(a => new Date(a.startAt) >= new Date()).slice(0, 10).length === 0 ? (
          <div style={{ padding: "20px", color: "#94a3b8", fontSize: 13 }}>Keine anstehenden Termine.</div>
        ) : (
          appointments
            .filter(a => new Date(a.startAt) >= new Date())
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
            .slice(0, 10)
            .map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width: 46, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{new Date(a.startAt).getDate()}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{MONTHS[new Date(a.startAt).getMonth()].slice(0, 3)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {new Date(a.startAt).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {new Date(a.endAt).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}
                    {a.account && <> · {a.account.name}</>}
                    {a.contact && <> · {a.contact.name}</>}
                  </div>
                </div>
                <button onClick={(e) => openEdit(a, e)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#64748b", cursor: "pointer" }}>Bearbeiten</button>
              </div>
            ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAppt ? "Termin bearbeiten" : "Neuer Termin"}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Titel *</label>
            <input
              required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Start *</label>
              <input
                type="datetime-local" required value={form.startAt} onChange={(e) => setForm(f => ({ ...f, startAt: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Ende *</label>
              <input
                type="datetime-local" required value={form.endAt} onChange={(e) => setForm(f => ({ ...f, endAt: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Beschreibung</label>
            <textarea
              value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Konto</label>
              <select value={form.accountId} onChange={(e) => setForm(f => ({ ...f, accountId: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}>
                <option value="">—</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Kontakt</label>
              <select value={form.contactId} onChange={(e) => setForm(f => ({ ...f, contactId: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}>
                <option value="">—</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 20 }}>
            <div>
              {editAppt && (
                <button type="button" onClick={handleDelete} disabled={saving}
                  style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: "8px 16px", fontWeight: 600, cursor: "pointer" }}>
                  Löschen
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setModalOpen(false)}
                style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>
                Abbrechen
              </button>
              <button type="submit" disabled={saving}
                style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
