"use client";
import { useEffect, useState } from 'react';
import { Box, Flex, Heading, VStack, Text, Tag, Avatar, Spinner } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assigneeName?: string;
  assignedToUserId?: string;
}

const statusColumns = [
  { key: 'OPEN', label: 'Offe', color: 'gray' },
  { key: 'IN_PROGRESS', label: 'Am mache', color: 'blue' },
  { key: 'DONE', label: 'Erledigt', color: 'green' },
];

export default function TasksTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch tasks
  const fetchTasks = () => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else if (data && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        } else {
          setTasks([]);
        }
        setLoading(false);
      });
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
    await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
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
              <Text color="gray.400" fontSize="md" ml={2}>Kei Tasks</Text>
            ) : (
              tasksByStatus[col.key].map((t: Task) => (
                <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                  <Box bg="#fff" borderRadius="md" p={4} boxShadow="sm" mb={3} _hover={{ boxShadow: 'lg', bg: '#f0f4ff' }} transition="all 0.2s">
                    <Flex align="center" justify="space-between" mb={2}>
                      <Text fontWeight="bold" fontSize="md">{t.title}</Text>
                      <Tag colorScheme={col.color} size="sm">{t.priority}</Tag>
                    </Flex>
                    <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                      <Avatar size="xs" name={t.assigneeName || t.assignedToUserId || 'Kei zuewiesene'} />
                      <Text>{t.assigneeName || t.assignedToUserId || 'Kei zuewiesene'}</Text>
                      {t.dueDate && <Text ml={2}>Fällig: {new Date(t.dueDate).toLocaleDateString()}</Text>}
                    </Flex>
                  </Box>
                </Link>
              ))
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
                    <Text color="gray.400" fontSize="sm">Kei Tasks</Text>
                  )}
                  {tasksByStatus[col.key].map((t: Task, idx: number) => (
                    <Draggable draggableId={t.id} index={idx} key={t.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.7 : 1,
                          }}
                        >
                          <Link href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                            <Box bg="#fff" borderRadius="md" p={4} boxShadow="sm" _hover={{ boxShadow: 'lg', bg: '#f0f4ff' }} transition="all 0.2s">
                              <Flex align="center" justify="space-between" mb={2}>
                                <Text fontWeight="bold" fontSize="md">{t.title}</Text>
                                <Tag colorScheme={col.color} size="sm">{t.priority}</Tag>
                              </Flex>
                              <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                                <Avatar size="xs" name={t.assigneeName || t.assignedToUserId || 'Kei zuewiesene'} />
                                <Text>{t.assigneeName || t.assignedToUserId || 'Kei zuewiesene'}</Text>
                                {t.dueDate && <Text ml={2}>Fällig: {new Date(t.dueDate).toLocaleDateString()}</Text>}
                              </Flex>
                            </Box>
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
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
