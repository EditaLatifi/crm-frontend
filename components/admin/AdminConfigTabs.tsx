"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Sub-navigation shared by the admin configuration pages. Only "Vorlagen" lives
// in the main sidebar; Bauschritte and Baubewilligungen are reached from here.
const TABS = [
  { href: '/admin/templates', label: 'Projektvorlagen' },
  { href: '/admin/milestones', label: 'Bauschritte' },
  { href: '/admin/permits', label: 'Baubewilligungen' },
];

export default function AdminConfigTabs() {
  const pathname = usePathname() || '';
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E8E4DE', flexWrap: 'wrap' }}>
      {TABS.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              textDecoration: 'none',
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              color: active ? '#1a1a1a' : '#64748b',
              borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
