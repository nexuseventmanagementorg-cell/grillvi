import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

export const metadata: Metadata = {
  title: 'GRILLVI — BBQ. RICE. KARAHI | Authentic Charcoal Barbecue Lahore',
  description:
    'Order authentic live charcoal BBQ, Chicken Malai Boti, Handi Karahi, and Royal Thaal Feasts from GRILLVI on Main GT Road, Baghbanpura, Lahore. Fast delivery & WhatsApp ordering.',
  keywords: [
    'GRILLVI',
    'Grillvi Lahore',
    'BBQ Lahore',
    'Baghbanpura Restaurant',
    'GT Road Karahi',
    'Thaal Deal Lahore',
    'Chicken Karahi',
    'Malai Boti',
    'Online Food Delivery Lahore',
  ],
  authors: [{ name: 'GRILLVI Restaurant' }],
  icons: {
    icon: '/images/grillvi-logo.png',
  },
  openGraph: {
    title: 'GRILLVI — BBQ. RICE. KARAHI | Lahore',
    description: 'Experience the authentic taste of live charcoal BBQ, rice & karahi on Main Grand Trunk Road, Lahore.',
    images: ['/images/grillvi-logo.png'],
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
          <WhatsAppFloatingButton />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
