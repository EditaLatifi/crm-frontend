"use client";
import TasksTable from '../../../components/tables/TasksTable';
import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select, Textarea, useDisclosure, Spinner } from '@chakra-ui/react';

export default function TasksPage() {
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
      fetch('/api/users').then(res => res.json()).then(setUsers);
      fetch('/api/accounts').then(res => res.json()).then(setAccounts);
      fetch('/api/contacts').then(res => res.json()).then(setContacts);
      fetch('/api/deals').then(res => res.json()).then(setDeals);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // You may want to get the current user from context/auth for createdByUserId
    let createdByUserId = users[0]?.id || '';
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createdByUserId }),
      });
      if (res.ok) {
        setForm({ title: '', description: '', status: 'OPEN', priority: 'LOW', dueDate: '', assignedToUserId: '', accountId: '', contactId: '', dealId: '' });
        onClose();
        setRefreshKey(k => k + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tasks-page-main-container">
      <div className="tasks-header-row tasks-header-mobile">
        <h1 className="tasks-title tasks-title-mobile">Tasks</h1>
        <Button colorScheme="blue" size="lg" className="tasks-new-btn-mobile" onClick={onOpen}>+ New Task</Button>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
        <TasksTable key={refreshKey} />
      </div>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Task</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <FormControl isRequired mb={3}>
                <FormLabel>Title</FormLabel>
                <Input name="title" value={form.title} onChange={handleChange} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Description</FormLabel>
                <Textarea name="description" value={form.description} onChange={handleChange} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Status</FormLabel>
                <Select name="status" value={form.status} onChange={handleChange}>
                  <option value="OPEN">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Priority</FormLabel>
                <Select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Due Date</FormLabel>
                <Input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Assignee</FormLabel>
                <Select name="assignedToUserId" value={form.assignedToUserId} onChange={handleChange} placeholder="Unassigned">
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Account</FormLabel>
                <Select name="accountId" value={form.accountId} onChange={handleChange} placeholder="None">
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Contact</FormLabel>
                <Select name="contactId" value={form.contactId} onChange={handleChange} placeholder="None">
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Deal</FormLabel>
                <Select name="dealId" value={form.dealId} onChange={handleChange} placeholder="None">
                  {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit" isLoading={loading}>Create</Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
