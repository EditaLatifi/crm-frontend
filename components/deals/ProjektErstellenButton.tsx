"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../src/api/client";
import { useToast } from "../ui/Toast";
import { FiArrowRight } from "react-icons/fi";

interface ProjektErstellenButtonProps {
  dealId: string;
  dealName: string;
  alreadyHasProject?: boolean;
  existingProjectId?: string;
}

export default function ProjektErstellenButton({
  dealId, dealName, alreadyHasProject, existingProjectId,
}: ProjektErstellenButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [creating, setCreating] = useState(false);

  if (alreadyHasProject && existingProjectId) {
    return (
      <button
        onClick={() => router.push(`/projects/${existingProjectId}`)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#f0fdf4", color: "#15803d", border: "1.5px solid #bbf7d0",
          borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}
      >
        Projekt öffnen <FiArrowRight size={12} />
      </button>
    );
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const project: any = await api.post(`/deals/${dealId}/create-project`, {});
      toast.success("Projekt erstellt.");
      setConfirming(false);
      if (project?.id) router.push(`/projects/${project.id}`);
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error("Projekt bereits aus diesem Deal erstellt.");
      } else {
        toast.error(err?.message || "Projekt konnte nicht erstellt werden.");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        style={{
          background: "#1a1a1a", color: "#fff", border: "none",
          borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}
      >
        Projekt erstellen
      </button>

      {confirming && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "22px 26px", maxWidth: 440, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Projekt aus Deal erstellen?</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 18 }}>
              Aus dem Deal <strong>{dealName}</strong> wird ein neues Projekt erstellt.
              Phasen, Aufgaben und das Stundenkontingent werden übernommen und bleiben mit dem Deal verbunden.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setConfirming(false)}
                disabled={creating}
                style={{ background: "#E8E4DE", color: "#64748b", border: "none", borderRadius: 7, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: creating ? 0.7 : 1 }}
              >
                {creating ? "Erstellen…" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
