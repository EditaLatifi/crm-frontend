"use client";
import { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

export default function Tooltip({ text, children }: { text: string; children?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || <FiInfo size={13} color="#94a3b8" />}
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', fontSize: 11, fontWeight: 500,
          padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap',
          zIndex: 100, marginBottom: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent', borderTop: '5px solid #1e293b',
          }} />
        </div>
      )}
    </span>
  );
}
