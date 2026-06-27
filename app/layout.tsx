
import './globals.css';
import { Providers } from './providers';
import AppShell from './AppShell';

export const metadata = {
  title: 'IP3 CRM',
  description: 'IP3 CRM - Customer Relationship Management',
  icons: {
    icon: '/logoip3.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
