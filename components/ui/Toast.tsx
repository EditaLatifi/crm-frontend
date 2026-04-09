"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
  success: { bg: "#f0fdf4", border: "#86efac", color: "#15803d", icon: <FiCheckCircle size={16} /> },
  error:   { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626", icon: <FiAlertCircle size={16} /> },
  warning: { bg: "#fffbeb", border: "#fcd34d", color: "#d97706", icon: <FiAlertCircle size={16} /> },
  info:    { bg: "#eff6ff", border: "#93c5fd", color: "#2563eb", icon: <FiInfo size={16} /> },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => { setMounted(true); }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
    timers.current[id] = setTimeout(() => remove(id), 4000);
  }, [remove]);

  const ctx: ToastContextValue = {
    success: (msg) => add("success", msg),
    error:   (msg) => add("error", msg),
    info:    (msg) => add("info", msg),
    warning: (msg) => add("warning", msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {mounted && <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end",
        pointerEvents: "none",
      }}>
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: s.bg, border: `1.5px solid ${s.border}`,
                borderRadius: 10, padding: "12px 16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                fontSize: 13, fontWeight: 500, color: s.color,
                minWidth: 260, maxWidth: 380,
                animation: "toastIn 0.2s ease",
                pointerEvents: "all",
              }}
            >
              <span style={{ flexShrink: 0 }}>{s.icon}</span>
              <span style={{ flex: 1, color: "#1e293b" }}>{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, display: "flex", flexShrink: 0 }}
              >
                <FiX size={14} />
              </button>
            </div>
          );
        })}
      </div>}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
