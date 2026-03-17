"use client";
import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Link from "next/link";
import { api } from "../../src/api/client";
import { useToast } from "../ui/Toast";
import { FiEdit2, FiTrash2, FiCalendar, FiDollarSign } from "react-icons/fi";

interface Stage { id: string; name: string; order: number; isWon: boolean; isLost: boolean; }
interface Deal {
  id: string; name: string; amount: number; currency: string;
  probability: number; dealScore: number; stageId: string;
  expectedCloseDate?: string;
  account?: { name: string }; owner?: { name: string };
}

function stageColor(stage: Stage): string {
  if (stage.isWon) return "#16a34a";
  if (stage.isLost) return "#dc2626";
  const palette = ["#2563eb", "#7c3aed", "#0891b2", "#d97706", "#db2777"];
  return palette[stage.order % palette.length];
}

export default function DealsKanbanBoard({ onEdit, onRefresh }: { onEdit?: (deal: Deal) => void; onRefresh?: () => void }) {
  const toast = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [stagesData, dealsData] = await Promise.all([
        api.get("/deals/deal-stages"),
        api.get("/deals"),
      ]);
      setStages(Array.isArray(stagesData) ? stagesData.sort((a: Stage, b: Stage) => a.order - b.order) : []);
      setDeals(Array.isArray(dealsData) ? dealsData : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    const newStageId = destination.droppableId;
    const newStage = stages.find((s) => s.id === newStageId);
    setDeals((prev) => prev.map((d) => d.id === draggableId ? { ...d, stageId: newStageId } : d));
    try {
      await api.post(`/deals/${draggableId}/change-stage`, { toStageId: newStageId });
      if (newStage?.isWon) toast.success("Deal als gewonnen markiert! 🎉");
      else if (newStage?.isLost) toast.warning("Deal als verloren markiert.");
      else toast.info(`Deal verschoben nach „${newStage?.name}".`);
      onRefresh?.();
    } catch {
      toast.error("Phase konnte nicht geändert werden.");
      fetchAll();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Diesen Deal wirklich löschen?")) return;
    try {
      await api.delete(`/deals/${id}`);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      toast.success("Deal gelöscht.");
      onRefresh?.();
    } catch {
      toast.error("Deal konnte nicht gelöscht werden.");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 64 }}>
      <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const activePipelineValue = deals
    .filter((d) => { const s = stages.find((s) => s.id === d.stageId); return s && !s.isWon && !s.isLost; })
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Pipeline-Wert", value: `${activePipelineValue.toLocaleString("de-CH")} CHF`, color: "#2563eb" },
          { label: "Deals gesamt", value: String(deals.length), color: "#64748b" },
          { label: "Gewonnen", value: String(deals.filter((d) => stages.find((s) => s.id === d.stageId)?.isWon).length), color: "#16a34a" },
          { label: "Verloren", value: String(deals.filter((d) => stages.find((s) => s.id === d.stageId)?.isLost).length), color: "#dc2626" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 18px", minWidth: 130 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16 }}>
          {stages.map((stage) => {
            const color = stageColor(stage);
            const columnDeals = deals.filter((d) => d.stageId === stage.id);
            const colValue = columnDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

            return (
              <div key={stage.id} style={{ minWidth: 272, maxWidth: 290, flex: "0 0 272px" }}>
                {/* Column header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 8, padding: "9px 12px",
                  background: "#fff", borderRadius: 10,
                  borderTop: `3px solid ${color}`,
                  border: `1px solid #e5e7eb`,
                  borderTopColor: color,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{stage.name}</span>
                    <span style={{ background: `${color}18`, color, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 8px" }}>
                      {columnDeals.length}
                    </span>
                  </div>
                  {colValue > 0 && (
                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                      {colValue.toLocaleString("de-CH")}
                    </span>
                  )}
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 140, borderRadius: 10, padding: 8,
                        background: snapshot.isDraggingOver ? `${color}08` : "#f1f5f9",
                        border: snapshot.isDraggingOver ? `2px dashed ${color}60` : "2px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      {columnDeals.length === 0 && !snapshot.isDraggingOver && (
                        <div style={{ color: "#cbd5e1", fontSize: 12, textAlign: "center", padding: "24px 0", userSelect: "none" }}>
                          Keine Deals
                        </div>
                      )}
                      {columnDeals.map((deal, index) => (
                        <Draggable draggableId={deal.id} index={index} key={deal.id}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              style={{
                                ...prov.draggableProps.style,
                                background: "#fff",
                                borderRadius: 10,
                                border: snap.isDragging ? `1.5px solid ${color}` : "1px solid #e5e7eb",
                                boxShadow: snap.isDragging ? `0 12px 32px rgba(0,0,0,0.18)` : "0 1px 4px rgba(0,0,0,0.05)",
                                padding: "12px 14px",
                                marginBottom: 10,
                                cursor: "grab",
                                userSelect: "none",
                              }}
                            >
                              <Link href={`/deals/${deal.id}`} style={{ textDecoration: "none" }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 4, lineHeight: 1.35 }}>
                                  {deal.name}
                                </div>
                              </Link>
                              {deal.account?.name && (
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{deal.account.name}</div>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                                  <FiDollarSign size={12} color="#94a3b8" />
                                  {deal.amount?.toLocaleString("de-CH")} {deal.currency}
                                </span>
                                {deal.probability > 0 && (
                                  <span style={{ fontSize: 11, color, fontWeight: 700, background: `${color}12`, borderRadius: 6, padding: "1px 7px" }}>
                                    {deal.probability}%
                                  </span>
                                )}
                              </div>
                              {deal.expectedCloseDate && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                                  <FiCalendar size={11} />
                                  {new Date(deal.expectedCloseDate).toLocaleDateString("de-CH")}
                                </div>
                              )}
                              <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                                {onEdit && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
                                    style={{ background: "#eff6ff", border: "none", borderRadius: 6, padding: "4px 9px", cursor: "pointer", color: "#2563eb", display: "flex", alignItems: "center" }}
                                  >
                                    <FiEdit2 size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}
                                  style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "4px 9px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
