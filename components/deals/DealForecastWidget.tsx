"use client";
import { useEffect, useState } from "react";
import { api } from "../../src/api/client";

interface MonthBucket {
  label: string;
  expected: number;
  weighted: number;
}

export default function DealForecastWidget() {
  const [buckets, setBuckets] = useState<MonthBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWeighted, setTotalWeighted] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/deals").catch(() => []),
      api.get("/deals/deal-stages").catch(() => []),
    ]).then(([dealsData, stagesData]: any) => {
      const deals = Array.isArray(dealsData) ? dealsData : [];
      const stages = Array.isArray(stagesData) ? stagesData : [];
      const stageMap = Object.fromEntries(stages.map((s: any) => [s.id, s]));

      // Only open deals with a close date
      const openDeals = deals.filter((d: any) => {
        const stage = stageMap[d.stageId];
        return stage && !stage.isWon && !stage.isLost && d.expectedCloseDate;
      });

      // Build next 6 months
      const now = new Date();
      const months: MonthBucket[] = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        months.push({
          label: date.toLocaleDateString("de-CH", { month: "short", year: "2-digit" }),
          expected: 0,
          weighted: 0,
        });
      }

      openDeals.forEach((d: any) => {
        const close = new Date(d.expectedCloseDate);
        const monthIdx = (close.getFullYear() - now.getFullYear()) * 12 + (close.getMonth() - now.getMonth());
        if (monthIdx >= 0 && monthIdx < 6) {
          months[monthIdx].expected += d.amount || 0;
          months[monthIdx].weighted += ((d.amount || 0) * (d.probability || 0)) / 100;
        }
      });

      setBuckets(months);
      setTotalWeighted(months.reduce((s, m) => s + m.weighted, 0));
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ color: "#94a3b8", fontSize: 13 }}>Lade Prognose…</div>;

  const maxVal = Math.max(...buckets.map((b) => b.expected), 1);

  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
        Gewichtet gesamt: <b style={{ color: "#2563eb" }}>{Math.round(totalWeighted).toLocaleString("de-CH")} CHF</b>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {buckets.map((b) => {
          const heightPct = (b.expected / maxVal) * 100;
          const weightedPct = (b.weighted / maxVal) * 100;
          return (
            <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>
                {b.expected > 0 ? `${Math.round(b.expected / 1000)}k` : "—"}
              </div>
              <div style={{ width: "100%", position: "relative", height: 90, display: "flex", alignItems: "flex-end" }}>
                {/* Expected bar */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: `${heightPct}%`, background: "#dbeafe", borderRadius: "4px 4px 0 0",
                  minHeight: b.expected > 0 ? 4 : 0,
                }} />
                {/* Weighted bar */}
                <div style={{
                  position: "absolute", bottom: 0, left: "15%", right: "15%",
                  height: `${weightedPct}%`, background: "#2563eb", borderRadius: "4px 4px 0 0",
                  minHeight: b.weighted > 0 ? 4 : 0,
                }} />
              </div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{b.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
          <div style={{ width: 10, height: 10, background: "#dbeafe", borderRadius: 2 }} /> Erwarteter Wert
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
          <div style={{ width: 10, height: 10, background: "#2563eb", borderRadius: 2 }} /> Gewichteter Wert
        </div>
      </div>
    </div>
  );
}
