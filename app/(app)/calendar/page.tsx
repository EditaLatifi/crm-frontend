"use client";
import { useEffect, useState, useMemo } from "react";
import './calendar-mobile.css';
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
const WEEKDAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00–21:00
const HOUR_H = 56;

/* ─── Helpers ─── */
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDow = first.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(date: Date): Date[] {
  const s = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return d; });
}

function isMultiDay(a: Appointment) {
  return !isSameDay(new Date(a.startAt), new Date(a.endAt));
}

function dayOverlaps(a: Appointment, day: Date) {
  const ds = new Date(day); ds.setHours(0, 0, 0, 0);
  const de = new Date(day); de.setHours(23, 59, 59, 999);
  return new Date(a.startAt) <= de && new Date(a.endAt) >= ds;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
function dateStr(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function timeStr(d: Date) { return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }); }

const APPT_COLORS = ['#1a1a1a', '#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#db2777'];
function apptColor(idx: number) { return APPT_COLORS[idx % APPT_COLORS.length]; }

/* ─── Page ─── */
export default function CalendarPage() {
  const toast = useToast();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '', accountId: '', contactId: '', dealId: '', assigneeUserId: '' });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/appointments').then((d: any) => setAppointments(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/accounts').then((d: any) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/contacts').then((d: any) => setContacts(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/users').then((d: any) => setAllUsers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  /* ─ Navigation ─ */
  function navigate(dir: -1 | 1) {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      else if (view === 'week') d.setDate(d.getDate() + 7 * dir);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  }
  function goToday() { setCurrentDate(new Date()); }

  const navLabel = useMemo(() => {
    if (view === 'month') return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const wd = getWeekDays(currentDate);
      return `${wd[0].toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })} – ${wd[6].toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    const dow = currentDate.getDay();
    return `${WEEKDAYS_LONG[dow === 0 ? 6 : dow - 1]}, ${currentDate.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }, [view, currentDate]);

  /* ─ Appointments for a day ─ */
  function apptsForDay(day: Date) {
    return appointments.filter(a => dayOverlaps(a, day));
  }

  /* ─ Create / Edit ─ */
  function openNewOnDay(date: Date) {
    const ds = dateStr(date);
    setForm({ title: '', description: '', startAt: `${ds}T09:00`, endAt: `${ds}T10:00`, accountId: '', contactId: '', dealId: '', assigneeUserId: '' });
    setEditAppt(null);
    setModalOpen(true);
  }

  function openNewAtTime(date: Date, hour: number) {
    const ds = dateStr(date);
    setForm({ title: '', description: '', startAt: `${ds}T${pad2(hour)}:00`, endAt: `${ds}T${pad2(hour + 1)}:00`, accountId: '', contactId: '', dealId: '', assigneeUserId: '' });
    setEditAppt(null);
    setModalOpen(true);
  }

  function openEdit(appt: Appointment, e?: React.MouseEvent) {
    e?.stopPropagation();
    setForm({
      title: appt.title, description: appt.description || '',
      startAt: new Date(appt.startAt).toISOString().slice(0, 16),
      endAt: new Date(appt.endAt).toISOString().slice(0, 16),
      accountId: appt.account?.id || '', contactId: appt.contact?.id || '', dealId: appt.deal?.id || '', assigneeUserId: (appt as any).assigneeUserId || '',
    });
    setEditAppt(appt);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startAt || !form.endAt) return;
    setSaving(true);
    try {
      const payload = { ...form, accountId: form.accountId || null, contactId: form.contactId || null, dealId: form.dealId || null, assigneeUserId: form.assigneeUserId || null };
      if (editAppt) {
        const updated: any = await api.patch(`/appointments/${editAppt.id}`, payload);
        setAppointments(prev => prev.map(a => a.id === editAppt.id ? updated : a));
        toast.success('Termin aktualisiert.');
      } else {
        const created: any = await api.post('/appointments', payload);
        setAppointments(prev => [...prev, created]);
        toast.success('Termin erstellt.');
      }
      setModalOpen(false);
    } catch {
      toast.error('Termin konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editAppt) return;
    if (!confirm('Termin wirklich löschen?')) return;
    setSaving(true);
    try {
      await api.delete(`/appointments/${editAppt.id}`);
      setAppointments(prev => prev.filter(a => a.id !== editAppt.id));
      toast.success('Termin gelöscht.');
      setModalOpen(false);
    } catch {
      toast.error('Termin konnte nicht gelöscht werden.');
    } finally {
      setSaving(false);
    }
  }

  /* ─────────────────── RENDER ─────────────────── */
  const inputS: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E8E4DE', fontSize: 13, boxSizing: 'border-box', background: '#FAF9F6', color: '#1a1a1a' };

  return (
    <div className="calendar-container" style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Kalender</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderRadius: 8, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
            {(['month', 'week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '8px 16px', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: view === v ? '#1a1a1a' : '#fff', color: view === v ? '#fff' : '#666',
              }}>
                {{ month: 'Monat', week: 'Woche', day: 'Tag' }[v]}
              </button>
            ))}
          </div>
          {/* Nav */}
          <button onClick={goToday} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #E8E4DE', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a' }}>
            Heute
          </button>
          <button onClick={() => navigate(-1)} style={{ background: '#E8E4DE', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', minWidth: 180, textAlign: 'center' }}>{navLabel}</span>
          <button onClick={() => navigate(1)} style={{ background: '#E8E4DE', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>›</button>
        </div>
      </div>

      {/* ─── MONTH VIEW ─── */}
      {view === 'month' && <MonthView days={getMonthDays(currentDate.getFullYear(), currentDate.getMonth())} today={today} apptsForDay={apptsForDay} openNew={openNewOnDay} openEdit={openEdit} />}

      {/* ─── WEEK VIEW ─── */}
      {view === 'week' && <WeekView weekDays={getWeekDays(currentDate)} today={today} appointments={appointments} openNewAtTime={openNewAtTime} openEdit={openEdit} />}

      {/* ─── DAY VIEW ─── */}
      {view === 'day' && <DayView date={currentDate} today={today} appointments={appointments} openNewAtTime={openNewAtTime} openEdit={openEdit} />}

      {/* Upcoming */}
      <div style={{ marginTop: 28, background: '#fff', border: '1.5px solid #E8E4DE', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E8E4DE' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Nächste Termine</span>
        </div>
        {appointments.filter(a => new Date(a.startAt) >= today).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()).slice(0, 8).length === 0 ? (
          <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>Keine anstehenden Termine.</div>
        ) : (
          appointments.filter(a => new Date(a.startAt) >= today).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()).slice(0, 8).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid #FAF9F6' }}>
              <div style={{ width: 46, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>{new Date(a.startAt).getDate()}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{MONTHS[new Date(a.startAt).getMonth()].slice(0, 3)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {timeStr(new Date(a.startAt))} – {!isSameDay(new Date(a.startAt), new Date(a.endAt)) && <>{new Date(a.endAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })} </>}{timeStr(new Date(a.endAt))}
                  {a.account && <> · {a.account.name}</>}
                </div>
              </div>
              <button onClick={e => openEdit(a, e)} style={{ background: 'none', border: '1px solid #E8E4DE', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>Bearbeiten</button>
            </div>
          ))
        )}
      </div>

      {/* ─── Modal ─── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAppt ? 'Termin bearbeiten' : 'Neuer Termin'}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Titel *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputS} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Start *</label>
              <input type="datetime-local" required value={form.startAt} onChange={e => setForm(f => ({ ...f, startAt: e.target.value }))} style={{ ...inputS, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Ende *</label>
              <input type="datetime-local" required value={form.endAt} onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))} style={{ ...inputS, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputS, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Konto</label>
              <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} style={inputS}>
                <option value="">—</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Kontakt</label>
              <select value={form.contactId} onChange={e => setForm(f => ({ ...f, contactId: e.target.value }))} style={inputS}>
                <option value="">—</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Verantwortlich</label>
            <select value={form.assigneeUserId} onChange={e => setForm(f => ({ ...f, assigneeUserId: e.target.value }))} style={inputS}>
              <option value="">— Kein Verantwortlicher —</option>
              {allUsers.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 20 }}>
            <div>
              {editAppt && <button type="button" onClick={handleDelete} disabled={saving} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Löschen</button>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#fff', color: '#666', border: '1px solid #E8E4DE', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Abbrechen</button>
              <button type="submit" disabled={saving} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ══════════════════════ MONTH VIEW ══════════════════════ */
function MonthView({ days, today, apptsForDay, openNew, openEdit }: {
  days: (Date | null)[]; today: Date;
  apptsForDay: (d: Date) => Appointment[];
  openNew: (d: Date) => void;
  openEdit: (a: Appointment, e?: React.MouseEvent) => void;
}) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8E4DE', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E8E4DE' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, i) => {
          const isToday = day ? isSameDay(day, today) : false;
          const dayAppts = day ? apptsForDay(day) : [];
          return (
            <div key={i} onClick={() => day && openNew(day)} style={{
              minHeight: 100, padding: 8,
              borderRight: (i + 1) % 7 !== 0 ? '1px solid #E8E4DE' : 'none',
              borderBottom: '1px solid #E8E4DE',
              cursor: day ? 'pointer' : 'default',
              background: day ? (isToday ? '#FFF8EC' : '#fff') : '#FAF9F6',
            }}>
              {day && (
                <>
                  <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? '#1a1a1a' : '#1e293b', marginBottom: 4 }}>
                    <span style={isToday ? { background: '#1a1a1a', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 } : {}}>{day.getDate()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayAppts.slice(0, 3).map((a, idx) => (
                      <div key={a.id} onClick={e => openEdit(a, e)} style={{ background: apptColor(idx), color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {timeStr(new Date(a.startAt))} {a.title}
                      </div>
                    ))}
                    {dayAppts.length > 3 && <div style={{ fontSize: 10, color: '#94a3b8', paddingLeft: 4 }}>+{dayAppts.length - 3} weitere</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════ WEEK VIEW ══════════════════════ */
function WeekView({ weekDays, today, appointments, openNewAtTime, openEdit }: {
  weekDays: Date[]; today: Date; appointments: Appointment[];
  openNewAtTime: (d: Date, h: number) => void;
  openEdit: (a: Appointment, e?: React.MouseEvent) => void;
}) {
  // Multi-day appointments for the banner area
  const multiDay = appointments.filter(a => isMultiDay(a) && weekDays.some(d => dayOverlaps(a, d)));

  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8E4DE', borderRadius: 14, overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #E8E4DE' }}>
        <div />
        {weekDays.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={i} style={{ padding: '10px 8px', textAlign: 'center', borderLeft: '1px solid #E8E4DE' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{WEEKDAYS[i]}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: isToday ? '#fff' : '#1e293b', background: isToday ? '#1a1a1a' : 'transparent', borderRadius: '50%', width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-day banners */}
      {multiDay.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #E8E4DE', padding: '4px 0' }}>
          <div />
          {weekDays.map((day, di) => (
            <div key={di} style={{ paddingRight: 4, borderLeft: '1px solid #E8E4DE' }}>
              {multiDay.filter(a => dayOverlaps(a, day)).map((a, idx) => {
                const isStart = isSameDay(new Date(a.startAt), day);
                return (
                  <div key={a.id} onClick={e => openEdit(a, e)} style={{
                    background: apptColor(idx), color: '#fff', borderRadius: isStart ? '4px 0 0 4px' : 0,
                    padding: '2px 6px', fontSize: 10, fontWeight: 600, cursor: 'pointer', marginBottom: 2,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {isStart ? a.title : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', position: 'relative' }}>
          {/* Hour labels + rows */}
          {HOURS.map(h => (
            <div key={h} style={{ gridColumn: '1', height: HOUR_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 0 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: -6 }}>{pad2(h)}:00</span>
            </div>
          ))}

          {/* Day columns */}
          {weekDays.map((day, di) => (
            <div key={di} style={{ gridColumn: di + 2, gridRow: `1 / ${HOURS.length + 1}`, position: 'relative', borderLeft: '1px solid #E8E4DE' }}>
              {/* Hour cells – clickable */}
              {HOURS.map(h => (
                <div key={h} onClick={() => openNewAtTime(day, h)} style={{ height: HOUR_H, borderBottom: '1px solid #E8E4DE', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAF9F6'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                />
              ))}

              {/* Appointments (single-day only, multi-day is in banner) */}
              {appointments.filter(a => !isMultiDay(a) && dayOverlaps(a, day)).map((a, idx) => {
                const startD = new Date(a.startAt);
                const endD = new Date(a.endAt);
                const startMin = startD.getHours() * 60 + startD.getMinutes();
                const endMin = endD.getHours() * 60 + endD.getMinutes();
                const gridStart = HOURS[0] * 60;
                const gridEnd = (HOURS[HOURS.length - 1] + 1) * 60;
                const clampStart = Math.max(startMin, gridStart);
                const clampEnd = Math.min(endMin, gridEnd);
                if (clampEnd <= clampStart) return null;
                const top = ((clampStart - gridStart) / 60) * HOUR_H;
                const height = Math.max(((clampEnd - clampStart) / 60) * HOUR_H, 20);
                return (
                  <div key={a.id} onClick={e => openEdit(a, e)} style={{
                    position: 'absolute', top, height, left: 3, right: 3,
                    background: apptColor(idx), color: '#fff', borderRadius: 5,
                    padding: '3px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    overflow: 'hidden', zIndex: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                    {height > 30 && <div style={{ fontSize: 10, opacity: 0.85 }}>{timeStr(startD)} – {timeStr(endD)}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ DAY VIEW ══════════════════════ */
function DayView({ date, today, appointments, openNewAtTime, openEdit }: {
  date: Date; today: Date; appointments: Appointment[];
  openNewAtTime: (d: Date, h: number) => void;
  openEdit: (a: Appointment, e?: React.MouseEvent) => void;
}) {
  const isToday = isSameDay(date, today);
  const dayAppts = appointments.filter(a => dayOverlaps(a, date));
  const multiDay = dayAppts.filter(a => isMultiDay(a));
  const singleDay = dayAppts.filter(a => !isMultiDay(a));

  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8E4DE', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #E8E4DE', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: isToday ? '#fff' : '#1e293b', background: isToday ? '#1a1a1a' : '#E8E4DE', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {date.getDate()}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            {WEEKDAYS_LONG[date.getDay() === 0 ? 6 : date.getDay() - 1]}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {date.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>
          {dayAppts.length} Termin{dayAppts.length !== 1 ? 'e' : ''}
        </div>
      </div>

      {/* Multi-day banners */}
      {multiDay.length > 0 && (
        <div style={{ padding: '6px 20px 6px 76px', borderBottom: '1px solid #E8E4DE', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {multiDay.map((a, idx) => (
            <div key={a.id} onClick={e => openEdit(a, e)} style={{
              background: apptColor(idx), color: '#fff', borderRadius: 5,
              padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {a.title} · {new Date(a.startAt).toLocaleDateString('de-CH')} – {new Date(a.endAt).toLocaleDateString('de-CH')}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', position: 'relative' }}>
          {/* Hour labels */}
          {HOURS.map(h => (
            <div key={h} style={{ height: HOUR_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 10, paddingTop: 0 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: -6 }}>{pad2(h)}:00</span>
            </div>
          ))}

          {/* Time column */}
          <div style={{ gridColumn: 2, gridRow: `1 / ${HOURS.length + 1}`, position: 'relative', borderLeft: '1px solid #E8E4DE' }}>
            {/* Clickable hour cells */}
            {HOURS.map(h => (
              <div key={h} onClick={() => openNewAtTime(date, h)} style={{ height: HOUR_H, borderBottom: '1px solid #E8E4DE', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAF9F6'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              />
            ))}

            {/* Appointments */}
            {singleDay.map((a, idx) => {
              const startD = new Date(a.startAt);
              const endD = new Date(a.endAt);
              const startMin = startD.getHours() * 60 + startD.getMinutes();
              const endMin = endD.getHours() * 60 + endD.getMinutes();
              const gridStart = HOURS[0] * 60;
              const gridEnd = (HOURS[HOURS.length - 1] + 1) * 60;
              const clampStart = Math.max(startMin, gridStart);
              const clampEnd = Math.min(endMin, gridEnd);
              if (clampEnd <= clampStart) return null;
              const top = ((clampStart - gridStart) / 60) * HOUR_H;
              const height = Math.max(((clampEnd - clampStart) / 60) * HOUR_H, 24);
              return (
                <div key={a.id} onClick={e => openEdit(a, e)} style={{
                  position: 'absolute', top, height, left: 8, right: 8,
                  background: apptColor(idx), color: '#fff', borderRadius: 6,
                  padding: '6px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  overflow: 'hidden', zIndex: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                }}>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                    {timeStr(startD)} – {timeStr(endD)}
                    {a.account && <> · {a.account.name}</>}
                  </div>
                  {height > 60 && a.description && (
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</div>
                  )}
                </div>
              );
            })}

            {/* Current time indicator */}
            {isToday && (() => {
              const now = new Date();
              const nowMin = now.getHours() * 60 + now.getMinutes();
              const gridStart = HOURS[0] * 60;
              const gridEnd = (HOURS[HOURS.length - 1] + 1) * 60;
              if (nowMin < gridStart || nowMin > gridEnd) return null;
              const top = ((nowMin - gridStart) / 60) * HOUR_H;
              return <div style={{ position: 'absolute', top, left: 0, right: 0, height: 2, background: '#dc2626', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: -4, top: -3, width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
              </div>;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
