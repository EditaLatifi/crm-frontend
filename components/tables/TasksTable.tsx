"use client";
import { useEffect, useState } from 'react';
import { Box, Flex, Heading, VStack, Text, Tag, Avatar, Spinner } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthProvider';
import { useToast } from '../ui/Toast';
interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assigneeName?: string;
  assignedToUserId?: string;
  assigneeIds?: string[];
  assignee?: { id: string; name?: string; email?: string } | null;
  project?: { id: string; name: string } | null;
  account?: { id: string; name: string } | null;
}

const PRIORITY_LABELS: Record<string, string> = { URGENT: 'Dringend', HIGH: 'Hoch', MEDIUM: 'Mittel', LOW: 'Niedrig' };
const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  URGENT: { bg: '#fef2f2', color: '#991b1b' },
  HIGH:   { bg: '#fef2f2', color: '#dc2626' },
  MEDIUM: { bg: '#fffbeb', color: '#d97706' },
  LOW:    { bg: '#f1f5f9', color: '#64748b' },
};

const statusColumns = [
  { key: 'OPEN', label: 'Offen', color: 'gray' },
  { key: 'IN_PROGRESS', label: 'In Bearbeitung', color: 'blue' },
  { key: 'DONE', label: 'Erledigt', color: 'green' },
];

export default function TasksTable() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);

  const fetchTasks = () => {
    api.get('/tasks?pageSize=200')
      .then((res: any) => {
        const data = res?.data ?? (Array.isArray(res) ? res : []);
        if (Array.isArray(data)) setTasks(data);
        else if (data && Array.isArray((data as any).tasks)) setTasks((data as any).tasks);
        else setTasks([]);
        setLoading(false);
      })
      .catch(() => { setTasks([]); setLoading(false); });
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  // Mobile detection (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(max-width: 700px)');
      setIsMobile(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  if (loading) return <Flex justify="center" align="center" minH="200px"><Spinner size="lg" /></Flex>;

  // ── Filters (S5): responsible person + priority ──
  const assigneeOptions = Array.from(
    new Map(
      tasks
        .filter((t: Task) => t.assignedToUserId)
        .map((t: Task) => [t.assignedToUserId as string, t.assignee?.name || t.assignee?.email || t.assigneeName || '—']),
    ).entries(),
  ).map(([id, name]) => ({ id, name }));

  const mine = (t: Task) => !!user?.id && (t.assignedToUserId === user.id || (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(user.id)));
  const filtered = tasks.filter((t: Task) => {
    if (onlyMine && !mine(t)) return false;
    if (assigneeFilter && t.assignedToUserId !== assigneeFilter) return false;
    if (priorityFilter && (t.priority || 'LOW') !== priorityFilter) return false;
    return true;
  });

  const selStyle: React.CSSProperties = { fontSize: 13, padding: '9px 12px', borderRadius: 8, border: '1px solid #E8E4DE', background: '#fff', color: '#1a1a1a' };
  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
      <button
        onClick={() => setOnlyMine(v => !v)}
        style={{ ...selStyle, cursor: 'pointer', fontWeight: 600, background: onlyMine ? '#1a1a1a' : '#fff', color: onlyMine ? '#fff' : '#1a1a1a', border: onlyMine ? '1px solid #1a1a1a' : '1px solid #E8E4DE' }}
      >
        {onlyMine ? '✓ Meine Aufgaben' : 'Meine Aufgaben'}
      </button>
      <select style={selStyle} value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
        <option value="">Alle Mitarbeiter</option>
        {assigneeOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <select style={selStyle} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
        <option value="">Alle Prioritäten</option>
        <option value="URGENT">Dringend</option>
        <option value="HIGH">Hoch</option>
        <option value="MEDIUM">Mittel</option>
        <option value="LOW">Niedrig</option>
      </select>
      {(assigneeFilter || priorityFilter || onlyMine) && (
        <button onClick={() => { setAssigneeFilter(''); setPriorityFilter(''); setOnlyMine(false); }} style={{ ...selStyle, cursor: 'pointer', color: '#64748b' }}>Zurücksetzen</button>
      )}
    </div>
  );

  // Group filtered tasks by status for columns
  const tasksByStatus: Record<string, Task[]> = {};
  statusColumns.forEach(col => {
    tasksByStatus[col.key] = filtered.filter((t: Task) => t.status === col.key);
  });

  // Kanban drag logic
  const changeStatus = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map((t: Task) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (e: any) {
      toast?.error?.(e?.message || 'Status konnte nicht geändert werden.');
    }
    fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    setTasks(prev => prev.filter((t: Task) => t.id !== taskId));
    try { await api.delete(`/tasks/${taskId}`); toast?.success?.('Aufgabe gelöscht.'); }
    catch (e: any) { toast?.error?.(e?.message || 'Löschen fehlgeschlagen.'); fetchTasks(); }
  };

  const archiveTask = async (taskId: string) => {
    setTasks(prev => prev.filter((t: Task) => t.id !== taskId)); // remove from the active board
    try { await api.patch(`/tasks/${taskId}/archive`, { archived: true }); toast?.success?.('Aufgabe archiviert.'); }
    catch (e: any) { toast?.error?.(e?.message || 'Archivieren fehlgeschlagen.'); fetchTasks(); }
  };

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    await changeStatus(draggableId, destination.droppableId);
  };

  // Render mobile: tasks grouped by status, each group in a box with status label
  if (isMobile) {
    return (
      <Box px={2} py={2}>
        {filterBar}
        {statusColumns.map(col => (
          <Box key={col.key} mb={4} className="tasks-mobile-status-group" bg="#f8f9fb" borderRadius="lg" p={2}>
            <Text fontWeight="bold" fontSize="lg" color={col.color + ".600"} mb={2} ml={1}>{col.label}</Text>
            {tasksByStatus[col.key].length === 0 ? (
              <Text color="gray.400" fontSize="md" ml={2}>Keine Aufgaben</Text>
            ) : (
              tasksByStatus[col.key].map((t: Task) => {
                const assigneeName = t.assignee?.name || t.assignee?.email || t.assigneeName || 'Keine Zuweisung';
                const initials = assigneeName === 'Keine Zuweisung' ? '?' : assigneeName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                const pc = PRIORITY_COLORS[t.priority || 'LOW'];
                return (
                  <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                    <Box bg="#fff" borderRadius="md" p={4} boxShadow="sm" mb={3} _hover={{ boxShadow: 'lg', bg: '#f0f4ff' }} transition="all 0.2s">
                      <Flex align="center" justify="space-between" mb={2}>
                        <Text fontWeight="bold" fontSize="md">{t.title}</Text>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pc.bg, color: pc.color }}>{PRIORITY_LABELS[t.priority || 'LOW']}</span>
                      </Flex>
                      {(t.project?.name || t.account?.name) && (
                        <Flex gap={2} fontSize="xs" color="gray.500" mb={1} flexWrap="wrap">
                          {t.project?.name && <span style={{ background: '#ede9fe', color: '#7c3aed', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{t.project.name}</span>}
                          {t.account?.name && <span style={{ background: '#dbeafe', color: '#2563eb', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{t.account.name}</span>}
                        </Flex>
                      )}
                      <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                        <Text>{assigneeName}</Text>
                        {t.dueDate && <Text ml={2} color={new Date(t.dueDate) < new Date() ? 'red.500' : 'gray.400'}>Fällig: {new Date(t.dueDate).toLocaleDateString('de-CH')}</Text>}
                      </Flex>
                      {/* One-click status — mobile (no drag) */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }} onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                        {t.status !== 'DONE' && (
                          <button onClick={() => changeStatus(t.id, 'DONE')} style={{ flex: 1, fontSize: 13, fontWeight: 600, padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#f0fdf4', color: '#16a34a' }}>✓ Erledigt</button>
                        )}
                        {t.status === 'DONE' && (
                          <button onClick={() => changeStatus(t.id, 'OPEN')} style={{ flex: 1, fontSize: 13, fontWeight: 600, padding: '9px 10px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#64748b' }}>↩ Wieder öffnen</button>
                        )}
                        <button onClick={() => archiveTask(t.id)} title="Archivieren" style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#64748b' }}>📦</button>
                        <button onClick={() => deleteTask(t.id)} title="Löschen" style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '1px solid #fecaca', cursor: 'pointer', background: '#fff', color: '#dc2626' }}>🗑</button>
                      </div>
                    </Box>
                  </Link>
                );
              })
            )}
          </Box>
        ))}
      </Box>
    );
  }

  // Render Kanban board for desktop
  return (
    <div>
      {filterBar}
      <DragDropContext onDragEnd={onDragEnd}>
      <Flex gap={6} overflowX={{ base: 'auto', md: 'visible' }} py={4}>
        {statusColumns.map(col => (
          <Droppable droppableId={col.key} key={col.key}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                bg={snapshot.isDraggingOver ? '#e3e9f7' : '#f7f8fa'}
                borderRadius="lg"
                minW="320px"
                p={4}
                boxShadow="md"
                flex={1}
              >
                <Heading size="md" mb={4} color={col.color + '.600'}>{col.label}</Heading>
                <VStack align="stretch" spacing={4} minH="80px">
                  {tasksByStatus[col.key].length === 0 && (
                    <Text color="gray.400" fontSize="sm">Keine Aufgaben</Text>
                  )}
                  {tasksByStatus[col.key].map((t: Task, idx: number) => {
                    const assigneeName = t.assignee?.name || t.assignee?.email || t.assigneeName || 'Keine Zuweisung';
                    const initials = assigneeName === 'Keine Zuweisung' ? '?' : assigneeName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                    const pc = PRIORITY_COLORS[t.priority || 'LOW'];
                    return (
                      <Draggable draggableId={t.id} index={idx} key={t.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.7 : 1 }}
                          >
                            <Link href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                              <Box bg="#fff" borderRadius="md" p={4} boxShadow="sm" _hover={{ boxShadow: 'lg', bg: '#f0f4ff' }} transition="all 0.2s">
                                <Flex align="center" justify="space-between" mb={2}>
                                  <Text fontWeight="bold" fontSize="md">{t.title}</Text>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pc.bg, color: pc.color }}>{PRIORITY_LABELS[t.priority || 'LOW']}</span>
                                </Flex>
                                {((t as any).phase || (t as any).isPaymentReminder) && (
                                  <div style={{ marginBottom: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {(t as any).phase && (
                                      <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', borderRadius: 4, padding: '1px 6px' }}>Phase {(t as any).phase}</span>
                                    )}
                                    {(t as any).isPaymentReminder && (
                                      <span style={{ fontSize: 10, fontWeight: 700, color: '#b45309', background: '#fef3c7', borderRadius: 4, padding: '1px 6px' }}>💰 Zahlung</span>
                                    )}
                                  </div>
                                )}
                                <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                                  <Text>{assigneeName}</Text>
                                  {t.dueDate && <Text ml={2} color={new Date(t.dueDate) < new Date() ? 'red.500' : 'gray.400'}>Fällig: {new Date(t.dueDate).toLocaleDateString('de-CH')}</Text>}
                                </Flex>
                                {/* One-click status — no drag needed */}
                                <div style={{ display: 'flex', gap: 6, marginTop: 8 }} onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                                  {t.status !== 'DONE' && (
                                    <button onClick={() => changeStatus(t.id, 'DONE')} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: '#f0fdf4', color: '#16a34a' }}>✓ Erledigt</button>
                                  )}
                                  {t.status === 'DONE' && (
                                    <button onClick={() => changeStatus(t.id, 'OPEN')} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#64748b' }}>↩ Wieder öffnen</button>
                                  )}
                                  <button onClick={() => archiveTask(t.id)} title="Archivieren" style={{ fontSize: 11, padding: '4px 9px', borderRadius: 7, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#64748b' }}>📦</button>
                                  <button onClick={() => deleteTask(t.id)} title="Löschen" style={{ fontSize: 11, padding: '4px 9px', borderRadius: 7, border: '1px solid #fecaca', cursor: 'pointer', background: '#fff', color: '#dc2626' }}>🗑</button>
                                </div>
                                {/* Checklist mini progress */}
                                {Array.isArray((t as any).checklists) && (t as any).checklists.length > 0 && (() => {
                                  const allItems = (t as any).checklists.flatMap((cl: any) => cl.items || []);
                                  const total = allItems.length;
                                  const done = allItems.filter((i: any) => i.done).length;
                                  if (total === 0) return null;
                                  const pct = Math.round((done / total) * 100);
                                  return (
                                    <div style={{ marginTop: 6 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span style={{ fontSize: 10, color: done === total ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                                          {done}/{total} erledigt
                                        </span>
                                      </div>
                                      <div style={{ background: '#e5e7eb', borderRadius: 20, height: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: done === total ? '#16a34a' : '#2563eb', borderRadius: 20, width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </Box>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </VStack>
              </Box>
            )}
          </Droppable>
        ))}
      </Flex>
      </DragDropContext>
    </div>
  );
}
