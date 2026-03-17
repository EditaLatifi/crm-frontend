"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, fetchWithAuth } from '../../src/api/client';
import { useToast } from '../ui/Toast';
import { FiTrash2, FiChevronRight, FiMail, FiPhone } from 'react-icons/fi';

function Avatar({ name }: { name: string }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: color + '18', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13, flexShrink: 0,
      border: `1.5px solid ${color}30`,
    }}>
      {initials}
    </div>
  );
}

export default function ContactsTable({
  search = "",
  refresh = 0,
  adminView = false,
  onRefresh,
}: {
  search?: string;
  refresh?: number;
  adminView?: boolean;
  onRefresh?: () => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(adminView ? '/contacts?admin=1' : '/contacts'),
      api.get('/accounts'),
    ]).then(([cData, aData]) => {
      setContacts(Array.isArray(cData) ? cData : []);
      setAccounts(Array.isArray(aData) ? aData : []);
    }).catch(() => {
      setContacts([]);
      setAccounts([]);
    }).finally(() => setLoading(false));
  }, [refresh, adminView]);

  const filtered = search
    ? contacts.filter((c: any) =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selected.length} Kontakte wirklich löschen?`)) return;
    setDeleting(true);
    try {
      await fetchWithAuth('/contacts/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      setContacts(contacts.filter(c => !selected.includes(c.id)));
      setSelected([]);
      toast.success(`${selected.length} Kontakte gelöscht.`);
    } catch {
      toast.error('Bulk-Löschen fehlgeschlagen');
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async (c: any) => {
    if (!window.confirm(`Kontakt '${c.name}' löschen?`)) return;
    try {
      await api.delete(`/contacts/${c.id}`);
      setContacts(contacts.filter(x => x.id !== c.id));
      toast.success('Kontakt gelöscht.');
    } catch {
      toast.error('Löschen fehlgeschlagen');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
        Lade Kontakte...
      </div>
    );
  }

  return (
    <div>
      {/* Bulk action bar — only when items selected */}
      {adminView && selected.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 20px', background: '#fef2f2',
          borderBottom: '1px solid #fecaca',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
            {selected.length} ausgewählt
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#dc2626', color: '#fff', border: 'none',
              borderRadius: 7, padding: '6px 14px', fontSize: 13,
              fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            <FiTrash2 size={13} />
            {deleting ? 'Lösche...' : 'Ausgewählte löschen'}
          </button>
          <button
            onClick={() => setSelected([])}
            style={{ fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {adminView && (
                <th style={{ width: 44, padding: '12px 16px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={e => setSelected(e.target.checked ? filtered.map(c => c.id) : [])}
                    style={{ cursor: 'pointer', width: 15, height: 15 }}
                  />
                </th>
              )}
              <th style={thStyle}>Kontakt</th>
              <th style={thStyle}>E-Mail</th>
              <th style={thStyle}>Telefon</th>
              <th style={thStyle}>Firma</th>
              {adminView && <th style={{ ...thStyle, width: 60 }}></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={adminView ? 6 : 5}
                  style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}
                >
                  Keine Kontakte gefunden.
                </td>
              </tr>
            ) : (
              filtered.map((c: any, idx) => {
                const account = accounts.find((a: any) => a.id === c.accountId);
                const isSelected = selected.includes(c.id);
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                      background: isSelected ? '#eff6ff' : '#fff',
                      transition: 'background 0.1s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSelected ? '#eff6ff' : '#fff'; }}
                    onClick={() => router.push(`/contacts/${c.id}`)}
                  >
                    {adminView && (
                      <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => setSelected(e.target.checked
                            ? [...selected, c.id]
                            : selected.filter(id => id !== c.id)
                          )}
                          style={{ cursor: 'pointer', width: 15, height: 15 }}
                        />
                      </td>
                    )}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={c.name || '?'} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{c.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          onClick={e => e.stopPropagation()}
                          style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <FiMail size={13} />
                          {c.email}
                        </a>
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      {c.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569' }}>
                          <FiPhone size={13} />
                          {c.phone}
                        </span>
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      {account ? (
                        <span style={{
                          display: 'inline-block', background: '#eff6ff', color: '#2563eb',
                          borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500,
                        }}>
                          {account.name}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: 13 }}>Keine Firma</span>
                      )}
                    </td>
                    {adminView && (
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Kontakt löschen"
                          style={{
                            background: 'none', border: '1px solid #fecaca',
                            borderRadius: 7, padding: '5px 8px',
                            cursor: 'pointer', color: '#ef4444',
                            display: 'flex', alignItems: 'center',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#fef2f2';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'none';
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
          {filtered.length} Kontakt{filtered.length !== 1 ? 'e' : ''}
          {search && contacts.length !== filtered.length && ` von ${contacts.length}`}
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  color: '#475569',
  fontSize: 14,
  verticalAlign: 'middle',
};
