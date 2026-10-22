import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Restaurant Website Template | Durrani Web Developers',
  description:
    'A customizable restaurant website template with online ordering, menu management, and daily sales reporting.',
  keywords: [
    'restaurant website template',
    'online ordering',
    'restaurant admin dashboard',
    'daily sales report',
    'Chicken Karahi',
    'Malai Boti',
  ],
  authors: [{ name: 'Durrani Web Developers' }],
  openGraph: {
    title: 'Restaurant Website Template',
    description: 'A customizable restaurant website and management dashboard.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-grill-black text-grill-text-primary min-h-screen flex flex-col selection:bg-grill-gold selection:text-black">
        <CartProvider>
          <AnnouncementBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
