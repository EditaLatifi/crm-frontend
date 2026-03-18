import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IP3 Projektportal',
  description: 'Aktuellen Projektstatus einsehen – ohne Login.',
  openGraph: {
    title: 'IP3 Projektportal',
    description: 'Aktuellen Projektstatus einsehen – ohne Login.',
    siteName: 'IP3 CRM',
    images: [
      {
        url: 'https://crm-frontend-xi-three.vercel.app/logoip3.png',
        width: 512,
        height: 512,
        alt: 'IP3 CRM Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'IP3 Projektportal',
    description: 'Aktuellen Projektstatus einsehen – ohne Login.',
    images: ['https://crm-frontend-xi-three.vercel.app/logoip3.png'],
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
