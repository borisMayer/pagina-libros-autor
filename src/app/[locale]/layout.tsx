import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  await getTranslations({ locale, namespace: 'nav' });
  return {
    title: {
      template: '%s | Andrew Myer',
      default:  'Andrew Myer — Escritor',
    },
    description:
      locale === 'es'
        ? 'Sitio oficial de Andrew Myer, escritor. Descubre sus libros, su biografía y compra sus obras digitales.'
        : 'Official site of Andrew Myer, writer. Discover his books, biography and purchase his digital works.',
    openGraph: {
      siteName: 'Andrew Myer',
      locale:    locale === 'es' ? 'es_AR' : 'en_US',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className="min-h-screen bg-parchment font-body text-ink flex flex-col"
        style={{ margin: 0, backgroundColor: '#fdf8f0', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
      >
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
