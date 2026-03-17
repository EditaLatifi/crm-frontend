"use client";
import { useState, useRef } from "react";
import { api } from "../../src/api/client";
import { useToast } from "./Toast";
import Modal from "./Modal";

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: "contacts" | "accounts";
  onImported?: () => void;
}

const CONTACT_COLUMNS = ["name", "email", "phone", "title"];
const ACCOUNT_COLUMNS = ["name", "type", "address", "phone", "email"];

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
  return { headers, rows };
}

export default function CsvImportModal({ open, onClose, entityType, onImported }: CsvImportModalProps) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  const expectedCols = entityType === "contacts" ? CONTACT_COLUMNS : ACCOUNT_COLUMNS;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows.slice(0, 200)); // limit preview
      // Auto-map matching headers
      const autoMap: Record<string, string> = {};
      expectedCols.forEach((col) => {
        const match = parsed.headers.find((h) => h.toLowerCase() === col.toLowerCase());
        if (match) autoMap[col] = match;
      });
      setMapping(autoMap);
      setStep("preview");
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleImport() {
    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const row of rows) {
      const payload: Record<string, string> = {};
      expectedCols.forEach((col) => {
        if (mapping[col]) payload[col] = row[mapping[col]] || "";
      });
      // Skip rows missing required fields
      if (!payload.name || (entityType === "contacts" && !payload.email)) { failed++; continue; }
      if (entityType === "accounts" && !payload.type) payload.type = "POTENTIAL_CLIENT";
      try {
        await api.post(`/${entityType}`, payload);
        success++;
      } catch {
        failed++;
      }
    }
    setResults({ success, failed });
    setStep("done");
    setImporting(false);
    if (success > 0) {
      onImported?.();
      toast.success(`${success} Einträge importiert.`);
    }
    if (failed > 0) {
      toast.error(`${failed} Einträge konnten nicht importiert werden.`);
    }
  }

  function handleClose() {
    setStep("upload");
    setRows([]);
    setHeaders([]);
    setMapping({});
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  }

  const entityLabel = entityType === "contacts" ? "Kontakte" : "Konten";

  return (
    <Modal open={open} onClose={handleClose} title={`CSV-Import: ${entityLabel}`}>
      {step === "upload" && (
        <div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
            Lade eine CSV-Datei hoch. Erwartete Spalten:{" "}
            <b style={{ color: "#1e293b" }}>{expectedCols.join(", ")}</b>
            {entityType === "contacts" && <> (name, email sind Pflichtfelder)</>}
            {entityType === "accounts" && <> (name ist Pflichtfeld)</>}
          </p>
          <div
            style={{
              border: "2px dashed #d1d5db", borderRadius: 10, padding: "32px 20px",
              textAlign: "center", background: "#f8fafc", cursor: "pointer",
            }}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>CSV-Datei auswählen</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>oder hier klicken</div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                entityType === "contacts"
                  ? "name,email,phone,title\nMax Mustermann,max@example.com,+41791234567,CEO"
                  : "name,type,address,phone,email\nMuster AG,CLIENT,Musterstrasse 1,+41791234567,info@muster.ch"
              )}`}
              download={`${entityType}-template.csv`}
              style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
            >
              Vorlage herunterladen
            </a>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              Spalten-Zuordnung ({rows.length} Zeilen gefunden)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {expectedCols.map((col) => (
                <div key={col}>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 3 }}>
                    {col} {col === "name" || (col === "email" && entityType === "contacts") ? "*" : ""}
                  </label>
                  <select
                    value={mapping[col] || ""}
                    onChange={(e) => setMapping((m) => ({ ...m, [col]: e.target.value }))}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 13 }}
                  >
                    <option value="">— nicht importieren —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {expectedCols.filter((c) => mapping[c]).map((c) => (
                    <th key={c} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 700, borderBottom: "1px solid #e5e7eb" }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {expectedCols.filter((c) => mapping[c]).map((c) => (
                      <td key={c} style={{ padding: "7px 12px", borderBottom: "1px solid #f1f5f9", color: "#1e293b" }}>
                        {row[mapping[c]] || <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <div style={{ padding: "8px 12px", color: "#94a3b8", fontSize: 11 }}>
                und {rows.length - 5} weitere Zeilen…
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setStep("upload")}
              style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Zurück
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: importing ? "not-allowed" : "pointer", opacity: importing ? 0.7 : 1 }}
            >
              {importing ? `Importiere…` : `${rows.length} Einträge importieren`}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Import abgeschlossen</div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 4 }}>
            <b style={{ color: "#16a34a" }}>{results.success}</b> erfolgreich importiert
          </div>
          {results.failed > 0 && (
            <div style={{ fontSize: 14, color: "#ef4444", marginBottom: 4 }}>
              <b>{results.failed}</b> fehlgeschlagen
            </div>
          )}
          <button
            onClick={handleClose}
            style={{ marginTop: 20, background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "9px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Schließen
          </button>
        </div>
      )}
    </Modal>
  );
}
