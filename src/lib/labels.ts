export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin/Management',
  USER: 'Mitarbeiter',
  MANAGER: 'Mitarbeiter',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Offen',
  IN_PROGRESS: 'In Bearbeitung',
  DONE: 'Erledigt',
  PENDING: 'Ausstehend',
};

export const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Erstellt',
  UPDATE: 'Aktualisiert',
  DELETE: 'Gelöscht',
  change_stage: 'Phase geändert',
  PHASE_UPDATE: 'Phase aktualisiert',
  timer_stop: 'Zeit gestoppt',
  COMMENT: 'Kommentiert',
};
