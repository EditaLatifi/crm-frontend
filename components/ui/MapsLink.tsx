"use client";
import React from 'react';

type Props = {
  address?: string | null;
  parts?: Array<string | null | undefined>;
  label?: string;
  style?: React.CSSProperties;
};

export function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function MapsLink({ address, parts, label, style }: Props) {
  const composed = address?.trim() || (parts || []).filter(Boolean).join(', ').trim();
  if (!composed) return null;

  return (
    <a
      href={buildMapsUrl(composed)}
      target="_blank"
      rel="noopener noreferrer"
      title="In Google Maps öffnen"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: '#2563eb',
        textDecoration: 'none',
        fontSize: 12,
        fontWeight: 600,
        ...style,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {label || 'Karte'}
    </a>
  );
}
