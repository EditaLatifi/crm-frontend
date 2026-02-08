
"use client";
import { useEffect, useState } from "react";

export default function DealDetailsPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentFilename, setAttachmentFilename] = useState("");
  const [loading, setLoading] = useState(true);
  const [deal, setDeal] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  const fetchNotes = async () => {
    const res = await fetch(`/api/deals/${params.id}/notes`);
    setNotes(await res.json());
  };
  const fetchAttachments = async () => {
    const res = await fetch(`/api/deals/${params.id}/attachments`);
    setAttachments(await res.json());
  };
  const fetchDeal = async () => {
    const res = await fetch(`/api/deals/${params.id}`);
    const d = await res.json();
    setDeal(d);
    // Fetch related account
    if (d.accountId) {
      const accRes = await fetch(`/api/accounts/${d.accountId}`);
      setAccount(await accRes.json());
    }
    // Fetch related tasks
    const tasksRes = await fetch(`/api/tasks?dealId=${params.id}`);
    setTasks(await tasksRes.json());
    // Fetch related contacts (via account)
    if (d.accountId) {
      const contactsRes = await fetch(`/api/contacts?accountId=${d.accountId}`);
      setContacts(await contactsRes.json());
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchNotes(), fetchAttachments(), fetchDeal()]).then(() => setLoading(false));
  }, []);

  const handleAddNote = async (e: any) => {
    e.preventDefault();
    await fetch(`/api/deals/${params.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent }),
    });
    setNoteContent("");
    fetchNotes();
  };

  const handleAddAttachment = async (e: any) => {
    e.preventDefault();
    await fetch(`/api/deals/${params.id}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: attachmentUrl, filename: attachmentFilename }),
    });
    setAttachmentUrl("");
    setAttachmentFilename("");
    fetchAttachments();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Deal-Details</h1>
      {deal && (
        <div style={{ marginBottom: 32 }}>
          <div><b>Name:</b> {deal.name}</div>
          <div><b>Betrag:</b> {deal.amount} {deal.currency}</div>
          <div><b>Wahrscheinlichkeit:</b> {deal.probability}%</div>
          <div><b>Score:</b> {deal.dealScore}</div>
          <div><b>Phase:</b> {deal.stageId}</div>
          <div><b>Erwartetes Abschlussdatum:</b> {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : ''}</div>
        </div>
      )}
      {account && (
        <div style={{ marginBottom: 24 }}>
          <h2>Firma</h2>
          <div><b>Name:</b> {account.name}</div>
          <div><b>Typ:</b> {account.type}</div>
        </div>
      )}
      {contacts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2>Kontakte</h2>
          <ul>
            {contacts.map((c: any) => (
              <li key={c.id}>{c.name} ({c.email})</li>
            ))}
          </ul>
        </div>
      )}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2>Tasks</h2>
          <ul>
            {tasks.map((t: any) => (
              <li key={t.id}>{t.title} - {t.status}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginBottom: 32 }}>
        <h2>Notizen</h2>
        <form onSubmit={handleAddNote} style={{ marginBottom: 16 }}>
          <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Notiz hinzufügen..." style={{ width: 320, minHeight: 60, borderRadius: 4, border: '1px solid #ccc', padding: 8 }} />
          <br />
          <button type="submit" style={{ marginTop: 8, background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Notiz hinzufügen</button>
        </form>
        <div>
          {notes.length === 0 && <div style={{ color: '#888' }}>No Notes bis jetzt.</div>}
          {notes.map((n: any) => (
            <div key={n.id} style={{ background: '#fafbfc', border: '1px solid #eee', borderRadius: 4, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 14 }}>{n.content}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Vo {n.createdByUserId} am {new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <h2>Anhänge</h2>
        <form onSubmit={handleAddAttachment} style={{ marginBottom: 16 }}>
          <input value={attachmentFilename} onChange={e => setAttachmentFilename(e.target.value)} placeholder="Dateiname" style={{ width: 180, marginRight: 8, borderRadius: 4, border: '1px solid #ccc', padding: 6 }} />
          <input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} placeholder="Datei-URL" style={{ width: 220, marginRight: 8, borderRadius: 4, border: '1px solid #ccc', padding: 6 }} />
          <button type="submit" style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Anhang hinzufügen</button>
        </form>
        <div>
          {attachments.length === 0 && <div style={{ color: '#888' }}>No Anhänge bis jetzt.</div>}
          {attachments.map((a: any) => (
            <div key={a.id} style={{ background: '#fafbfc', border: '1px solid #eee', borderRadius: 4, padding: 12, marginBottom: 8 }}>
              <a href={a.url} target="_blank" rel="noopener noreferrer">{a.filename}</a>
              <div style={{ fontSize: 12, color: '#888' }}>Vo {a.uploadedByUserId} am {new Date(a.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

