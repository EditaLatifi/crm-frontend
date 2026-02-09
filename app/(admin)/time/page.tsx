"use client";
import React, { useState, useEffect } from "react";
import TimeEntriesTable from '../../../components/tables/TimeEntriesTable';

interface TimeEntry {
  id: string;
  user?: { id: string; name: string };
  userId?: string;
  accountId?: string;
  taskId?: string;
  task?: { id: string; title: string };
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  description?: string;
}

import ProtectedRoute from '../../../src/routes/ProtectedRoute';

function AdminTimePageContent() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/time-entries`)
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  console.log("ENTRIES", entries);
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 24 }}>Ziit-Erfassig vo allne Benutzer</h1>
      <div style={{ background: "#fff", borderRadius: 8,}}>
        <TimeEntriesTable entries={entries} showUserColumn={true} />
      </div>
    </div>
  );
}

export default function AdminTimePage() {
  return (
    <ProtectedRoute role="ADMIN">
      <AdminTimePageContent />
    </ProtectedRoute>
  );
}
