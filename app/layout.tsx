
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logoip3.png" type="image/png" />
        <title>IP3 CRM</title>
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
