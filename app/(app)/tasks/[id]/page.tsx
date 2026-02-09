"use client";
import { Box, Heading, Text, VStack, HStack, Input, Textarea, Divider, Tag, Avatar, Button, Flex, Icon, Stack, Menu, MenuButton, MenuList, MenuItem, Select, useToast, extendTheme, ChakraProvider } from "@chakra-ui/react";
// Swiss/European B2B theme override for this page only
const b2bTheme = extendTheme({
  fonts: {
    heading: 'Inter, Helvetica Neue, Arial, sans-serif',
    body: 'Inter, Helvetica Neue, Arial, sans-serif',
  },
  colors: {
    brand: {
      50: '#f5f7fa',
      100: '#e4e7ed',
      200: '#c9d0db',
      300: '#aeb8c8',
      400: '#93a1b6',
      500: '#7889a3',
      600: '#5e6f87',
      700: '#475466',
      800: '#2f3946',
      900: '#181e26',
    },
    gray: {
      50: '#f8f9fa',
      100: '#f1f3f6',
      200: '#e2e6ea',
      300: '#cfd4da',
      400: '#b5bbc4',
      500: '#8e96a3',
      600: '#6c7684',
      700: '#49505a',
      800: '#2d3238',
      900: '#181a1d',
    },
    blue: {
      500: '#2a4365',
      600: '#223355',
    },
    purple: {
      500: '#5f4b8b',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '4px',
        fontWeight: 500,
      },
      variants: {
        solid: {
          bg: 'brand.700',
          color: 'white',
          _hover: { bg: 'brand.800' },
        },
        outline: {
          borderColor: 'brand.300',
          color: 'brand.700',
          _hover: { bg: 'brand.50' },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            borderRadius: '4px',
            _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px #7889a3' },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            borderRadius: '4px',
            _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px #7889a3' },
          },
        },
      },
    },
    Tag: {
      baseStyle: {
        borderRadius: '4px',
        fontWeight: 500,
        px: 3,
        py: 1,
      },
    },
    Box: {
      baseStyle: {
        borderRadius: '8px',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});
import { useEffect, useState } from "react";
import { loadTokenFromStorage } from "../../../../src/auth/tokenStore";
// import { fetchWithAuth } from '../../../../src/api/client';
import { useParams } from "next/navigation";
import { FiClock, FiUser, FiMessageCircle, FiList, FiEdit2 } from "react-icons/fi";
import { useAuth } from "../../../../src/auth/AuthProvider";
import { fetchWithAuth } from "../../../../src/api/client";

export default function TaskDetailsPage() {
  // Ensure token is loaded from storage on every mount
  useEffect(() => {
    loadTokenFromStorage();
  }, []);
  const { user } = useAuth();
  const params = useParams();
  const taskId = params?.id;
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newTime, setNewTime] = useState({ startedAt: '', endedAt: '', durationMinutes: '', description: '' });
  const [priority, setPriority] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingTime, setLoadingTime] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editEstimate, setEditEstimate] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchTask = () => {
    if (!taskId) return;
    fetch(`/api/tasks/${taskId}`)
      .then(res => res.json())
      .then(data => {
        setTask(data);
        setComments(data.comments || []);
        setHistory(data.history || []);
        setTimeEntries(data.timeEntries || []);
        setPriority(data.priority || '');
      });
  };
  useEffect(() => {
    fetchTask();
    loadTokenFromStorage(); // Ensure token is loaded from localStorage
    fetchWithAuth('/users')
      .then(data => {
        console.log('[TaskDetailsPage] /api/users response:', data);
        setUsers(Array.isArray(data) ? data : []);
      });
  }, [taskId]);
  const handleAssignUser = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setAssigning(true);
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToUserId: userId })
    });
    fetchTask();
    setAssigning(false);
    toast({ status: 'success', title: 'Task zuegwise!' });
  };


  const statusOptions = [
    { key: 'OPEN', label: 'Offe' },
    { key: 'IN_PROGRESS', label: 'Am mache' },
    { key: 'DONE', label: 'Erledigt' },
  ];

  const handleMove = async (newStatus: string) => {
    if (newStatus === task.status) return;
    await fetch(`/api/tasks/${task.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTask();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      // Use fetchWithAuth for authenticated requests
      const res = await fetchWithAuth(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });
      setNewComment("");
      fetchTask();
      toast({ status: 'success', title: 'Kommentar hinzugefügt!' });
    } catch (e: any) {
      toast({ status: 'error', title: 'Kommentar konnt nöd hinzugefügt werde', description: e?.message || String(e) });
    }
    setLoadingComment(false);
  };

  const handleAddTime = async () => {
    if (!newTime.startedAt || !newTime.endedAt || !newTime.durationMinutes) return;
    setLoadingTime(true);
    try {
      const accountId = task?.accountId;
      if (!accountId) {
        toast({ status: 'error', title: 'Kei Konto isch mit däm Task verknüpft.' });
        setLoadingTime(false);
        return;
      }
      const res = await fetch(`/api/tasks/${taskId}/time-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTime, userId: user?.id, accountId }),
      });
      if (res.ok) {
        setNewTime({ startedAt: '', endedAt: '', durationMinutes: '', description: '' });
        fetchTask();
        toast({ status: 'success', title: 'Zyt erfasst!' });
      } else {
        const err = await res.text();
        toast({ status: 'error', title: 'Zyt erfasse isch fehlgschlage', description: err });
      }
    } catch (e) {
      toast({ status: 'error', title: 'Zyt erfasse isch fehlgschlage', description: String(e) });
    }
    setLoadingTime(false);
  };

  const handlePriorityChange = async (e: any) => {
    const newPriority = e.target.value;
    setPriority(newPriority);
    await fetch(`/api/tasks/${taskId}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority })
    });
    fetchTask();
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    setEditEstimate(task.estimate || "");
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
  };
  const saveEdit = async () => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
          estimate: editEstimate !== '' ? Number(editEstimate) : null,
        }),
      });
      setEditMode(false);
      fetchTask();
      toast({ status: 'success', title: 'Task aktualisiert!' });
    } catch (e) {
      toast({ status: 'error', title: 'Task konnt nöd aktualisiert werde', description: String(e) });
    }
    setSaving(false);
  };

  if (!task) return (
    <ChakraProvider theme={b2bTheme} resetCSS>
      <Box p={8}>Lade...</Box>
    </ChakraProvider>
  );

  return (
    <ChakraProvider theme={b2bTheme} resetCSS>
      <Flex direction={{ base: "column", md: "row" }} gap={8} p={8}>
      {/* Main Task Info */}
      <Box flex={2} bg="#fff" p={6} borderRadius="lg" boxShadow="md">
        <HStack mb={4} spacing={4} align="center">
          <Tag colorScheme="blue" size="lg">TASK-{task.id?.slice(0, 6).toUpperCase()}</Tag>
          <Tag colorScheme="purple">{task.status}</Tag>
          <Select value={priority} onChange={handlePriorityChange} size="sm" width="140px" minW="140px">
            <option value="LOW">Nid so wichtig</option>
            <option value="MEDIUM">Mittel</option>
            <option value="HIGH">Wichtig</option>
          </Select>
          <Menu>
            <MenuButton as={Button} size="sm" colorScheme="blue" variant="outline">
              Verschiebe zu...
            </MenuButton>
            <MenuList>
              {statusOptions.filter(opt => opt.key !== task.status).map(opt => (
                <MenuItem key={opt.key} onClick={() => handleMove(opt.key)}>{opt.label}</MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
        <HStack mb={4} spacing={4}>
          <Avatar size="sm" name={task.assigneeName || "Assignee"} />
          <Select
            value={task.assignedToUserId || ''}
            onChange={handleAssignUser}
            size="sm"
            width="180px"
            minW="120px"
            isDisabled={assigning}
          >
            <option value="">Kei zuewiesene</option>
            {Array.isArray(users) && users.map(u => (
              <option key={u.id} value={u.id}>{u.name || u.email || u.id}</option>
            ))}
          </Select>
          <Icon as={FiClock} />
          {editMode ? (
            <Input
              type="date"
              size="sm"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              width="160px"
              minW="120px"
            />
          ) : (
            <Text>Fällig: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</Text>
          )}
          <Icon as={FiClock} />
          {editMode ? (
            <Input
              type="number"
              size="sm"
              value={editEstimate}
              onChange={e => setEditEstimate(e.target.value)}
              width="80px"
              minW="60px"
              min={0}
              placeholder="Estimate (h)"
            />
          ) : (
            <Text>Schätzung: {task.estimate || "-"}h</Text>
          )}
        </HStack>
        <Heading size="lg" mb={2} display="flex" alignItems="center" gap={2}>
          {editMode ? (
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} size="lg" fontWeight="bold" />
          ) : (
            <>{task.title}</>
          )}
          <Icon as={FiEdit2} boxSize={4} color="gray.400" cursor="pointer" onClick={startEdit} />
        </Heading>
        {editMode ? (
          <>
            <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} mb={2} />
            <HStack mb={4}>
              <Button colorScheme="blue" size="sm" onClick={saveEdit} isLoading={saving}>Save</Button>
              <Button size="sm" onClick={cancelEdit}>Cancel</Button>
            </HStack>
          </>
        ) : (
          <Text color="gray.600" mb={4}>{task.description || <i>Kei Beschreibung</i>}</Text>
        )}
        <Divider my={4} />
        {/* Subtasks/Parent */}
        {task.parentTaskId && (
          <Box mb={4}>
            <Text fontSize="sm" color="gray.500">Übergeordneter Task:</Text>
            <Tag colorScheme="blue">TASK-{task.parentTaskId}</Tag>
          </Box>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <Box mb={4}>
            <Text fontSize="sm" color="gray.500">Unteraufgabe:</Text>
            <Stack direction="column" spacing={1} mt={1}>
              {task.subtasks.map((sub: any) => (
                <Tag key={sub.id} colorScheme="blue" variant="outline">TASK-{sub.id}: {sub.title}</Tag>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Side Panel: Time, Comments & History */}
      <VStack flex={1} align="stretch" spacing={6}>
        {/* Time Tracking */}
        <Box bg="#fff" p={4} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={2} display="flex" alignItems="center" gap={2}>
            <Icon as={FiClock} /> Zyt Erfassung
          </Heading>
          <VStack align="stretch" spacing={2} maxH="150px" overflowY="auto">
            {timeEntries.length === 0 && <Text color="gray.400">No Zyt erfasst.</Text>}
            {timeEntries.map((t, i) => (
              <Box key={i} p={2} bg="gray.50" borderRadius="md">
                <HStack spacing={2} mb={1}>
                  <Avatar size="xs" name={t.user?.name || t.userId || 'User'} />
                  <Text fontWeight="bold" fontSize="sm">{t.user?.name || t.userId || 'User'}</Text>
                  {t.account?.name && (
                    <Text fontSize="xs" color="gray.500">Konto: {t.account.name}</Text>
                  )}
                  {t.task?.title && (
                    <Text fontSize="xs" color="gray.500">Task: {t.task.title}</Text>
                  )}
                  <Text fontSize="xs" color="gray.500">{t.startedAt ? new Date(t.startedAt).toLocaleString() : ''} - {t.endedAt ? new Date(t.endedAt).toLocaleString() : ''}</Text>
                </HStack>
                <Text fontSize="sm">{t.description || ''} ({t.durationMinutes} min)</Text>
              </Box>
            ))}
            {(() => {
              const totalMin = timeEntries.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
              const hours = Math.floor(totalMin / 60);
              const minutes = totalMin % 60;
              return (
                <Text fontWeight="bold" color="blue.600" mt={2}>
                  Total: {hours > 0 ? `${hours}h ` : ''}{minutes}min
                </Text>
              );
            })()}
          </VStack>
          <Stack direction="row" mt={3} spacing={2}>
            <Input type="datetime-local" size="sm" value={newTime.startedAt} onChange={e => setNewTime(nt => ({ ...nt, startedAt: e.target.value }))} placeholder="Start" />
            <Input type="datetime-local" size="sm" value={newTime.endedAt} onChange={e => setNewTime(nt => ({ ...nt, endedAt: e.target.value }))} placeholder="End" />
            <Input type="number" size="sm" value={newTime.durationMinutes} onChange={e => setNewTime(nt => ({ ...nt, durationMinutes: e.target.value }))} placeholder="Minutes" min={1} />
            <Input size="sm" value={newTime.description} onChange={e => setNewTime(nt => ({ ...nt, description: e.target.value }))} placeholder="Beschrieb" />
            <Button colorScheme="blue" size="sm" onClick={handleAddTime} isLoading={loadingTime}>Hinzufüge</Button>
          </Stack>
        </Box>

        {/* Comments */}
        <Box bg="#fff" p={4} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={2} display="flex" alignItems="center" gap={2}>
            <Icon as={FiMessageCircle} /> Kommentare
          </Heading>
          <VStack align="stretch" spacing={3} maxH="250px" overflowY="auto">
            {comments.length === 0 && <Text color="gray.400">No kei Kommentare.</Text>}
            {comments.map((c, i) => (
              <Box key={i} p={2} bg="gray.50" borderRadius="md">
                <HStack spacing={2} mb={1}>
                  <Avatar size="xs" name={c.author?.name || c.authorId || "User"} />
                  <Text fontWeight="bold" fontSize="sm">{c.author?.name || c.authorId || "User"}</Text>
                  <Text fontSize="xs" color="gray.500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</Text>
                </HStack>
                <Text fontSize="sm">{c.text}</Text>
              </Box>
            ))}
          </VStack>
          <HStack mt={3} spacing={2}>
            <Input
              placeholder="Kommentar schriebe..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              size="sm"
            />
            <Button colorScheme="blue" size="sm" onClick={handleAddComment} isLoading={loadingComment}>Kommentiere</Button>
          </HStack>
        </Box>

        {/* History */}
        <Box bg="#fff" p={4} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={2} display="flex" alignItems="center" gap={2}>
            <Icon as={FiList} /> Verlauf
          </Heading>
          <VStack align="stretch" spacing={2} maxH="150px" overflowY="auto">
            {history.length === 0 && <Text color="gray.400">No kei Verlauf.</Text>}
            {history.map((h, i) => (
              <Box key={i} p={2} bg="gray.50" borderRadius="md">
                <HStack spacing={2} mb={1}>
                  <Avatar size="xs" name={h.user?.name || h.userId || "User"} />
                  <Text fontWeight="bold" fontSize="sm">{h.user?.name || h.userId || "User"}</Text>
                  <Text fontSize="xs" color="gray.500">{h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}</Text>
                </HStack>
                <Text fontSize="sm">{h.action} {h.payload ? JSON.stringify(h.payload) : ''}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
      </Flex>
    </ChakraProvider>
  );
}
