export interface SIASubPhase {
  code: string;
  name: string;
}

export interface SIAMainPhase {
  code: string;
  name: string;
  sub: SIASubPhase[];
}

export const SIA_PHASES: SIAMainPhase[] = [
  { code: '10', name: 'Strategie/Planung', sub: [] },
  { code: '20', name: 'Vorstudie', sub: [] },
  {
    code: '31', name: 'Vorprojekt', sub: [
      { code: '31.1', name: 'Studium Lösungsmöglichkeiten' },
      { code: '31.2', name: 'Vorprojekt' },
    ],
  },
  {
    code: '32', name: 'Bauprojekt', sub: [
      { code: '32.1', name: 'Bauprojekt' },
      { code: '32.2', name: 'Detailstudien' },
      { code: '32.3', name: 'Kostenvoranschlag' },
    ],
  },
  {
    code: '33', name: 'Bewilligungsverfahren', sub: [
      { code: '33.1', name: 'Bewilligungsverfahren' },
    ],
  },
  {
    code: '41', name: 'Ausschreibung', sub: [
      { code: '41.1', name: 'Ausschreibungspläne' },
      { code: '41.2', name: 'Ausschreibung und Vergabe' },
    ],
  },
  {
    code: '51', name: 'Ausführungsplanung', sub: [
      { code: '51.1', name: 'Ausführungspläne' },
      { code: '51.2', name: 'Werkverträge' },
    ],
  },
  {
    code: '52', name: 'Ausführung', sub: [
      { code: '52.1', name: 'Gestalterische Leitung' },
      { code: '52.2', name: 'Bauleitung' },
    ],
  },
  {
    code: '53', name: 'Inbetriebnahme', sub: [
      { code: '53.1', name: 'Inbetriebnahme' },
      { code: '53.2', name: 'Dokumentation Bauwerk' },
      { code: '53.3', name: 'Leitung Garantiearbeiten' },
      { code: '53.4', name: 'Schlussabrechnung' },
    ],
  },
  { code: '61', name: 'Bewirtschaftung', sub: [] },
];

/** Flat list of all phase codes for dropdowns */
export function getAllPhaseCodes(): { code: string; label: string }[] {
  const result: { code: string; label: string }[] = [];
  for (const main of SIA_PHASES) {
    result.push({ code: main.code, label: `${main.code} ${main.name}` });
    for (const sub of main.sub) {
      result.push({ code: sub.code, label: `  ${sub.code} ${sub.name}` });
    }
  }
  return result;
}

/** Get phase label by code */
export function getPhaseLabel(code: string): string {
  for (const main of SIA_PHASES) {
    if (main.code === code) return `${main.code} ${main.name}`;
    for (const sub of main.sub) {
      if (sub.code === code) return `${sub.code} ${sub.name}`;
    }
  }
  return code;
}
