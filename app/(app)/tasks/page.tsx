"use client";
import TasksTable from '../../../components/tables/TasksTable';
import React, { useState, useEffect } from 'react';
import { api } from '../../../src/api/client';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select, Textarea, useDisclosure, Spinner } from '@chakra-ui/react';
import { useAuth } from '../../../src/auth/AuthProvider';

export default function TasksPage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'LOW',
    dueDate: '',
    assignedToUserId: '',
    accountId: '',
    contactId: '',
    dealId: '',
  });
  const [users, setUsers] = useState<{ id: string; name?: string; email?: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      api.get('/users').then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/accounts').then(data => setAccounts(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/contacts').then(data => setContacts(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/deals').then(data => setDeals(Array.isArray(data) ? data : [])).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', form);
      setForm({ title: '', description: '', status: 'OPEN', priority: 'LOW', dueDate: '', assignedToUserId: '', accountId: '', contactId: '', dealId: '' });
      onClose();
      setRefreshKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tasks-page-main-container">
      <div className="tasks-header-row tasks-header-mobile">
        <h1 className="tasks-title tasks-title-mobile">Aufgaben</h1>
        <Button colorScheme="blue" size="lg" className="tasks-new-btn-mobile" onClick={onOpen}>+ Neue Aufgabe</Button>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
        <TasksTable key={refreshKey} />
      </div>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Neue Aufgabe</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <FormControl isRequired mb={3}>
                <FormLabel>Titel</FormLabel>
                <Input name="title" value={form.title} onChange={handleChange} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Beschreibung</FormLabel>
                <Textarea name="description" value={form.description} onChange={handleChange} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Status</FormLabel>
                <Select name="status" value={form.status} onChange={handleChange}>
                  <option value="OPEN">Offen</option>
                  <option value="IN_PROGRESS">In Bearbeitung</option>
                  <option value="DONE">Erledigt</option>
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Priorität</FormLabel>
                <Select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="LOW">Nicht so wichtig</option>
                  <option value="MEDIUM">Mittel</option>
                  <option value="HIGH">Wichtig</option>
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Fälligkeitsdatum</FormLabel>
                <Input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Zugewiesen an</FormLabel>
                <Select name="assignedToUserId" value={form.assignedToUserId} onChange={handleChange} placeholder="Keine zugewiesen">
                  {Array.isArray(users) && users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Konto</FormLabel>
                <Select name="accountId" value={form.accountId} onChange={handleChange} placeholder="Kein Konto">
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Kontakt</FormLabel>
                <Select name="contactId" value={form.contactId} onChange={handleChange} placeholder="Kein Kontakt">
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Deal</FormLabel>
                <Select name="dealId" value={form.dealId} onChange={handleChange} placeholder="Kein Deal">
                  {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit" isLoading={loading}>Erstellen</Button>
              <Button onClick={onClose}>Abbrechen</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
