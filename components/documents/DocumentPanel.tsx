"use client";
import { useEffect, useState, useRef } from 'react';
import { api } from '../../src/api/client';
import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_CATEGORY_ICONS } from '../permits/permitConfig';
import { FiPlus, FiTrash2, FiExternalLink, FiUpload, FiFile, FiX } from 'react-icons/fi';

const CATEGORIES = ['GRUNDRISS','SCHNITT','ANSICHT','BAUGESUCH','VERTRAG','OFFERTE','RECHNUNG','PROTOKOLL','FOTO','SONSTIGES'];

const ACCEPT = '.pdf,.dwg,.dxf,.png,.jpg,.jpeg,.svg,.xlsx,.xls,.docx,.doc,.zip,.rar';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['jpg','jpeg','png','svg','gif','webp'].includes(ext)) return '🖼️';
  if (ext === 'pdf') return '📄';
  if (['dwg','dxf'].includes(ext)) return '📐';
  if (['xlsx','xls'].includes(ext)) return '📊';
  if (['docx','doc'].includes(ext)) return '📝';
  if (['zip','rar'].includes(ext)) return '📦';
  return '📁';
}

export default function DocumentPanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ category: 'SONSTIGES' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    api.get(`/projects/${projectId}/documents`)
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!form.name) setForm((x: any) => ({ ...x, name: file.name.replace(/\.[^/.]+$/, '') }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { handleFileSelect(file); setShowForm(true); }
  };

  const save = async () => {
    if (!selectedFile && !form.url) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('name', form.name || selectedFile.name);
        fd.append('category', form.category || 'SONSTIGES');
        if (form.version) fd.append('version', form.version);
        if (form.notes) fd.append('notes', form.notes);
        // Simulate progress (no real progress API with fetch)
        const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 300);
        await api.upload(`/projects/${projectId}/documents/upload`, fd);
        clearInterval(interval);
        setUploadProgress(100);
      } else {
        await api.post(`/projects/${projectId}/documents`, form);
      }
      setShowForm(false);
      setSelectedFile(null);
      setForm({ category: 'SONSTIGES' });
      setUploadProgress(0);
      load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Dokument löschen?')) return;
    await api.delete(`/projects/${projectId}/documents/${id}`);
    load();
  };

  const filtered = categoryFilter ? docs.filter(d => d.category === categoryFilter) : docs;
  const grouped: Record<string, any[]> = {};
  filtered.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Dokumente ({docs.length})</div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#374151', background: '#f8fafc' }}>
            <option value="">Alle Kategorien</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        {canEdit && (
          <button onClick={() => { setForm({ category: 'SONSTIGES' }); setSelectedFile(null); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FiUpload size={14} /> Hochladen
          </button>
        )}
      </div>

      {/* Drag-and-drop zone */}
      {canEdit && docs.length === 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { setShowForm(true); setTimeout(() => fileRef.current?.click(), 50); }}
          style={{
            border: `2px dashed ${dragOver ? '#1a1a1a' : '#e2e8f0'}`,
            borderRadius: 16, padding: '48px 24px', textAlign: 'center',
            background: dragOver ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20,
          }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 6 }}>Dateien hierher ziehen</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>oder klicken zum Auswählen · PDF, DWG, DXF, Bilder, Office (max. 50 MB)</div>
        </div>
      )}

      {/* Drop overlay when files exist */}
      {canEdit && docs.length > 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#1a1a1a' : '#e2e8f0'}`,
            borderRadius: 10, padding: '14px 20px', textAlign: 'center',
            background: dragOver ? '#eff6ff' : 'transparent',
            cursor: 'pointer', marginBottom: 20, fontSize: 12, color: '#94a3b8', transition: 'all 0.2s',
          }}>
          Datei hierher ziehen zum Hochladen
        </div>
      )}

      {/* Document list */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(grouped).map(([cat, catDocs]) => (
            <div key={cat}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{DOCUMENT_CATEGORY_ICONS[cat] || '📁'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{DOCUMENT_CATEGORY_LABELS[cat] || cat}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '1px 7px', borderRadius: 20 }}>{catDocs.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
                {catDocs.map((doc: any) => (
                  <div key={doc.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{getFileIcon(doc.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {doc.version && `v${doc.version} · `}{doc.uploadedBy?.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                        <FiExternalLink size={13} />
                      </a>
                      {canEdit && (
                        <button onClick={() => remove(doc.id)}
                          style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#ef4444' }}>
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Dokument hochladen</span>
              <button onClick={() => { setShowForm(false); setSelectedFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                <FiX size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* File picker */}
              <div>
                <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: 20 }}>{getFileIcon(selectedFile.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{formatBytes(selectedFile.size)}</div>
                    </div>
                    <button onClick={() => { setSelectedFile(null); setForm((x: any) => ({ ...x, name: '' })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                    <FiUpload size={24} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Datei auswählen</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>PDF, DWG, DXF, Bilder, Office · max. 50 MB</div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>oder URL eingeben</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>

              {/* URL fallback */}
              {!selectedFile && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Externer Link</label>
                  <input value={form.url || ''} placeholder="https://drive.google.com/..." onChange={e => setForm((x: any) => ({ ...x, url: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
                </div>
              )}

              {/* Category */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Kategorie</label>
                <select value={form.category || 'SONSTIGES'} onChange={e => setForm((x: any) => ({ ...x, category: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>

              {/* Name */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Name{!selectedFile ? ' *' : ''}</label>
                <input value={form.name || ''} placeholder="z.B. Grundriss EG" onChange={e => setForm((x: any) => ({ ...x, name: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
              </div>

              {/* Version */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Version</label>
                <input value={form.version || ''} placeholder="z.B. 2.1" onChange={e => setForm((x: any) => ({ ...x, version: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
              </div>

              {/* Upload progress */}
              {uploading && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                    <span>Wird hochgeladen...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99 }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#1a1a1a', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowForm(false); setSelectedFile(null); }} disabled={uploading}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                Abbrechen
              </button>
              <button onClick={save} disabled={uploading || (!selectedFile && !form.url) || (!selectedFile && !form.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: uploading || (!selectedFile && !form.url) ? 0.7 : 1 }}>
                <FiUpload size={13} />
                {uploading ? 'Hochladen...' : selectedFile ? 'Hochladen' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
