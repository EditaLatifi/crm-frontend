"use client";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

interface ProjektErstellenButtonProps {
  dealId: string;
  dealName: string;
  alreadyHasProject?: boolean;
  existingProjectId?: string;
}

/**
 * Projects are now created automatically when a deal moves to a "won" stage
 * (see DealsService.changeStage). The manual "create project" action has been
 * removed; this component only links to the already-created project, if any.
 */
export default function ProjektErstellenButton({
  alreadyHasProject, existingProjectId,
}: ProjektErstellenButtonProps) {
  const router = useRouter();

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

  return null;
}
