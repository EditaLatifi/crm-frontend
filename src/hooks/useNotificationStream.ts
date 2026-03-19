'use client';
import { useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '../auth/tokenStore';
import { AppNotification } from '../api/notifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface StreamEvent {
  event: 'connected' | 'notification';
  unreadCount?: number;
  data?: AppNotification;
}

export function useNotificationStream(onEvent: (event: StreamEvent) => void) {
  const abortRef = useRef<AbortController | null>(null);
  const retryDelayRef = useRef(3000);

  const connect = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
        credentials: 'include',
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE failed: ${res.status}`);
      }

      retryDelayRef.current = 3000; // reset on success

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done || signal.aborted) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              onEvent(payload);
            } catch {
              // skip malformed
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      // reconnect with backoff
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, 30000);
      setTimeout(connect, delay);
    }
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      abortRef.current?.abort();
    };
  }, [connect]);
}
