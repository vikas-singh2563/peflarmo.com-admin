import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Peflarmo Admin Dashboard',
  description: 'Enterprise Administration & Operations Control Center for Peflarmo PG, Flat, Room & Hostel Booking Platform',
  openGraph: {
    title: 'Peflarmo Admin Dashboard',
    description: 'Enterprise Administration & Operations Control Center for Peflarmo PG, Flat, Room & Hostel Booking Platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peflarmo Admin Dashboard',
    description: 'Enterprise Administration & Operations Control Center for Peflarmo PG, Flat, Room & Hostel Booking Platform',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
