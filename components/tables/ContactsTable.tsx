
"use client";
import { useEffect, useState } from 'react';




export default function ContactsTable({ search = "", refresh = 0, adminView = false }: { search?: string, refresh?: number, adminView?: boolean }) {
  // All hooks at the top
  const [contacts, setContacts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch contacts
    fetch(adminView ? '/api/contacts?admin=1' : '/api/contacts')
      .then(async res => {
        try {
          const data = await res.json();
          setContacts(Array.isArray(data) ? data : []);
        } catch (e) {
          setContacts([]);
        }
        setLoading(false);
      });
    // Fetch accounts for mapping
    fetch('/accounts')
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
  }, [refresh, adminView]);

  useEffect(() => {
    setHydrated(true);
    function handleResize() {
      setIsMobile(window.innerWidth <= 700);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filtered = search
    ? contacts.filter((c: any) =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const showCards = hydrated && isMobile;

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Lade Kontakte...</div>;

  return (
    <div className="contacts-table-responsive">
      {adminView && (
        <div className="mb-6 flex items-center gap-4 bg-gray-50 rounded-xl px-6 py-4 shadow-sm" style={{ maxWidth: 600 }}>
          <span className="font-bold text-lg text-gray-700">Ausgwählt lösche ({selected.length})</span>
          <button
            className="ml-8 mr-4 pl-4 px-6 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition disabled:opacity-50 text-lg"
            style={{ background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 18, minWidth: 100 , marginLeft: 10, marginBottom: 2}}
            disabled={selected.length === 0 || deleting}
            onClick={async () => {
              if (!window.confirm(`Sicher, dass du die ${selected.length} ausgewählte Kontakte wotsch lösche?`)) return;
              setDeleting(true);
              try {
                const res = await fetch('/api/contacts/bulk', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ids: selected }),
                });
                if (res.ok) {
                  setContacts(contacts.filter(c => !selected.includes(c.id)));
                  setSelected([]);
                } else {
                  alert('Bulk delete failed');
                }
              } finally {
                setDeleting(false);
              }
            }}
          >
            Lösche
          </button>
        </div>
      )}
      {showCards ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#888', background: '#fff', borderRadius: 10 }}>Kei Kontakte gfunde.</div>
          ) : (
            filtered.map((c: any) => (
              <div key={c.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(80,120,200,0.10)', border: '1.5px solid #f0f4fa', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {adminView && (
                  <div style={{ marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={e => setSelected(e.target.checked ? [...selected, c.id] : selected.filter(id => id !== c.id))}
                      aria-label={`Select contact ${c.name}`}
                      style={{ verticalAlign: 'middle', transform: 'scale(1.25)', marginRight: 8 }}
                    />
                  </div>
                )}
                <div><span style={{ fontWeight: 700, color: '#2563eb' }}>Name:</span> {c.name}</div>
                <div><span style={{ fontWeight: 700, color: '#2563eb' }}>E-Mail:</span> {c.email}</div>
                <div><span style={{ fontWeight: 700, color: '#2563eb' }}>Telefon:</span> {c.phone}</div>
                <div><span style={{ fontWeight: 700, color: '#2563eb' }}>Firma:</span> {c.accountId
                  ? <span style={{ color: '#0052cc' }}>{accounts.find((acc: any) => acc.id === c.accountId)?.name || <span style={{ color: '#bbb' }}>Unbekannt</span>}</span>
                  : <span style={{ color: '#bbb' }}>Kei Firma</span>
                }</div>
                {adminView && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      style={{ background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 16, width: '100%', borderRadius: 8, padding: '12px 0', letterSpacing: '0.5px', boxShadow: '0 1px 4px rgba(229,57,53,0.07)' }}
                      onClick={async () => {
                        if (!window.confirm(`Sicher, dass du Kontakt '${c.name}' wotsch lösche?`)) return;
                        try {
                          const res = await fetch(`/api/contacts/${c.id}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                          });
                          if (res.ok) {
                            setContacts(contacts.filter(contact => contact.id !== c.id));
                          } else {
                            alert('Delete failed');
                          }
                        } catch {
                          alert('Delete failed');
                        }
                      }}
                    >Lösche</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <table className="contacts-table" style={{ width: '100%' }}>
          <thead>
            <tr className="bg-gray-100 text-gray-800 font-semibold">
              {adminView && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={e => setSelected(e.target.checked ? filtered.map(c => c.id) : [])}
                    aria-label="Select all"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left rounded-tl-lg text-xl font-bold">Name</th>
              <th className="px-6 py-3 text-left text-xl font-bold">E-Mail</th>
              <th className="px-6 py-3 text-left text-xl font-bold">Telefon</th>
              <th className="px-6 py-3 text-left rounded-tr-lg text-xl font-bold">Firma</th>
              {adminView && <th className="px-6 py-3 text-left text-xl font-bold">Aktionen</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={adminView ? 6 : 4} className="py-8 text-center text-gray-400">Kei Kontakte gfunde.</td></tr>
            ) : (
              filtered.map((c: any) => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-gray-50 transition" style={{ height: 72 }}>
                  {adminView && (
                    <td className="px-4 py-3" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={e => setSelected(e.target.checked ? [...selected, c.id] : selected.filter(id => id !== c.id))}
                        aria-label={`Select contact ${c.name}`}
                        style={{ verticalAlign: 'middle', transform: 'scale(1.25)' }}
                      />
                    </td>
                  )}
                  <td data-label="Name">{c.name}</td>
                  <td data-label="Email">{c.email}</td>
                  <td data-label="Phone">{c.phone}</td>
                  <td data-label="Account">
                    {c.accountId
                      ? <span className="contacts-account">{accounts.find((acc: any) => acc.id === c.accountId)?.name || <span className="contacts-no-account">Unbekannt</span>}</span>
                      : <span className="contacts-no-account">Kei Firma</span>
                    }
                  </td>
                  {adminView && (
                    <td data-label="Actions">
                      <button
                        className="contacts-delete-btn"
                        onClick={async () => {
                          if (!window.confirm(`Sicher, dass du Kontakt '${c.name}' wotsch lösche?`)) return;
                          try {
                            const res = await fetch(`/api/contacts/${c.id}`, {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                            });
                            if (res.ok) {
                              setContacts(contacts.filter(contact => contact.id !== c.id));
                            } else {
                              alert('Delete failed');
                            }
                          } catch {
                            alert('Delete failed');
                          }
                        }}
                      >Lösche</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
