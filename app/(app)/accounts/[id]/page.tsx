"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import Modal from '../../../../components/ui/Modal';
import AccountEditForm from '../../../../components/forms/AccountEditForm';

export default function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchAccount = () => {
    fetch(`/api/accounts/${id}`)
      .then(res => res.json())
      .then(data => {
        setAccount(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const handleEdit = async (data: any) => {
    await fetch(`/api/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditOpen(false);
    fetchAccount();
  };

  if (loading) return <div style={{ padding: 32 }}>Loading account...</div>;
  if (!account) return <div style={{ padding: 32 }}>Account not found.</div>;

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <div style={{ marginBottom: 16, fontSize: 14 }}>
        <Link href="/accounts" style={{ color: '#0052cc', textDecoration: 'underline' }}>Accounts</Link> &gt; <span style={{ color: '#222', fontWeight: 600 }}>{account.name}</span>
      </div>
      {/* Title and Edit Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{account.name}</h1>
        <button onClick={() => setEditOpen(true)} style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
      </div>
      <div style={{ color: '#888', marginBottom: 24 }}>{account.type}</div>
      {/* Main Info Card */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div><b>Owner:</b> {account.owner?.name || account.ownerUserId || '-'}</div>
        <div><b>Address:</b> {account.address || '-'}</div>
        <div><b>Phone:</b> {account.phone || '-'}</div>
        <div><b>Email:</b> {account.email || '-'}</div>
        <div><b>Notes:</b> {account.notes || '-'}</div>
        <div><b>Created:</b> {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '-'}</div>
      </div>
      {/* Related Data */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: '#f4f5f7', borderRadius: 8, padding: 16 }}>
          <h3>Contacts</h3>
          <div style={{ color: '#888' }}>Related contacts will appear here.</div>
        </div>
        <div style={{ flex: 1, background: '#f4f5f7', borderRadius: 8, padding: 16 }}>
          <h3>Deals</h3>
          <div style={{ color: '#888' }}>Related deals will appear here.</div>
        </div>
      </div>
      {/* Activity Feed */}
      <div style={{ background: '#f4f5f7', borderRadius: 8, padding: 16 }}>
        <h3>Activity Feed</h3>
        <div style={{ color: '#888' }}>Activity timeline will appear here.</div>
      </div>
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Account">
        {editOpen && <AccountEditForm initialData={account} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />}
      </Modal>
    </div>
  );
}
