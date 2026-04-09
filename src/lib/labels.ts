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
  change_stage: 'Phasenänderung',
  PHASE_UPDATE: 'Phasenänderung',
  DEAL_CREATED: 'Deal erstellt',
  DEAL_UPDATED: 'Deal aktualisiert',
  timer_stop: 'Zeit gestoppt',
  COMMENT: 'Kommentiert',
};
