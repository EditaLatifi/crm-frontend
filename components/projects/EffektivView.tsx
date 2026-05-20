"use client";

interface EffektivViewProps {
  budgetHours: number;
  usedHours: number;
  title?: string;
}

export default function EffektivView({ budgetHours, usedHours, title = "Effektiv" }: EffektivViewProps) {
  const remaining = budgetHours - usedHours;
  const pct = budgetHours > 0 ? Math.round((usedHours / budgetHours) * 100) : 0;
  const overBudget = usedHours > budgetHours && budgetHours > 0;

  const barColor =
    pct >= 100 ? "#dc2626" :
    pct >= 80  ? "#d97706" :
                 "#3b82f6";

  return (
    <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>{title}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Geplant</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>
            {budgetHours > 0 ? `${budgetHours.toFixed(1)}h` : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Erfasst</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>
            {usedHours.toFixed(1)}h
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Verbleibend</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: overBudget ? "#dc2626" : remaining > 0 ? "#16a34a" : "#64748b" }}>
            {budgetHours > 0 ? `${remaining.toFixed(1)}h` : "—"}
          </div>
        </div>
      </div>

      {budgetHours > 0 && (
        <>
          <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          {overBudget && (
            <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginTop: 6 }}>
              ⚠ {(usedHours - budgetHours).toFixed(1)}h über Budget
            </div>
          )}
        </>
      )}
    </div>
  );
}
