export const PHASE_COLORS: Record<string, string> = {
  PENDING: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  SKIPPED: '#e2e8f0',
};

export const PHASE_BG: Record<string, string> = {
  PENDING: '#f8fafc',
  IN_PROGRESS: '#eff6ff',
  COMPLETED: '#f0fdf4',
  SKIPPED: '#f8fafc',
};

export const PHASE_LABELS: Record<string, string> = {
  PENDING: 'Ausstehend',
  IN_PROGRESS: 'In Bearbeitung',
  COMPLETED: 'Abgeschlossen',
  SKIPPED: 'Übersprungen',
};

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#3b82f6',
  ON_HOLD: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};

export const STATUS_BG: Record<string, string> = {
  ACTIVE: '#eff6ff',
  ON_HOLD: '#fffbeb',
  COMPLETED: '#f0fdf4',
  CANCELLED: '#fef2f2',
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktiv',
  ON_HOLD: 'Pausiert',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
};

export const TYPE_LABELS: Record<string, string> = {
  ARCHITECTURE: 'Architektur',
  INTERIOR_DESIGN: 'Innenarchitektur',
  CONSTRUCTION_MANAGEMENT: 'Bauleitung',
  VISUALIZATION: 'Visualisierung',
  REAL_ESTATE: 'Immobilien',
  DIGITIZATION: 'Digitalisierung',
};

export const TYPE_ICONS: Record<string, string> = {
  ARCHITECTURE: '🏛️',
  INTERIOR_DESIGN: '🛋️',
  CONSTRUCTION_MANAGEMENT: '🏗️',
  VISUALIZATION: '🎨',
  REAL_ESTATE: '🏠',
  DIGITIZATION: '💻',
};
