"use client";
import { useEffect, useState } from 'react';
import { Box, Flex, Heading, VStack, Text, Tag, Avatar, Spinner } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { api } from '../../src/api/client';
interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assigneeName?: string;
  assignedToUserId?: string;
  assignedTo?: { id: string; name?: string; email?: string } | null;
}

const PRIORITY_LABELS: Record<string, string> = { HIGH: 'Wichtig', MEDIUM: 'Mittel', LOW: 'Niedrig' };
const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const fetchTasks = () => {
    api.get('/tasks')
      .then(data => {
        if (Array.isArray(data)) setTasks(data);
        else if (data && Array.isArray(data.tasks)) setTasks(data.tasks);
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

  // Group tasks by status for columns
  const tasksByStatus: Record<string, Task[]> = {};
  statusColumns.forEach(col => {
    tasksByStatus[col.key] = tasks.filter((t: Task) => t.status === col.key);
  });

  // Kanban drag logic
  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    const taskId = draggableId;
    const newStatus = destination.droppableId;
    setTasks(prev => prev.map((t: Task) => t.id === taskId ? { ...t, status: newStatus } : t));
    await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    fetchTasks();
  };

  // Render mobile: tasks grouped by status, each group in a box with status label
  if (isMobile) {
    return (
      <Box px={2} py={2}>
        {statusColumns.map(col => (
          <Box key={col.key} mb={4} className="tasks-mobile-status-group" bg="#f8f9fb" borderRadius="lg" p={2}>
            <Text fontWeight="bold" fontSize="lg" color={col.color + ".600"} mb={2} ml={1}>{col.label}</Text>
            {tasksByStatus[col.key].length === 0 ? (
              <Text color="gray.400" fontSize="md" ml={2}>Keine Aufgaben</Text>
            ) : (
              tasksByStatus[col.key].map((t: Task) => {
                const assigneeName = t.assignedTo?.name || t.assignedTo?.email || t.assigneeName || 'Keine Zuweisung';
                const initials = assigneeName === 'Keine Zuweisung' ? '?' : assigneeName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                const pc = PRIORITY_COLORS[t.priority || 'LOW'];
                return (
                  <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                    <Box bg="#fff" borderRadius="md" p={4} boxShadow="sm" mb={3} _hover={{ boxShadow: 'lg', bg: '#f0f4ff' }} transition="all 0.2s">
                      <Flex align="center" justify="space-between" mb={2}>
                        <Text fontWeight="bold" fontSize="md">{t.title}</Text>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pc.bg, color: pc.color }}>{PRIORITY_LABELS[t.priority || 'LOW']}</span>
                      </Flex>
                      <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                        <Text>{assigneeName}</Text>
                        {t.dueDate && <Text ml={2} color={new Date(t.dueDate) < new Date() ? 'red.500' : 'gray.400'}>Fällig: {new Date(t.dueDate).toLocaleDateString('de-CH')}</Text>}
                      </Flex>
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
                    const assigneeName = t.assignedTo?.name || t.assignedTo?.email || t.assigneeName || 'Keine Zuweisung';
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
                                <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                                  <Text>{assigneeName}</Text>
                                  {t.dueDate && <Text ml={2} color={new Date(t.dueDate) < new Date() ? 'red.500' : 'gray.400'}>Fällig: {new Date(t.dueDate).toLocaleDateString('de-CH')}</Text>}
                                </Flex>
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
  );
}
