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
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: {
      template: '%s | Boris Mayer',
      default: 'Boris Mayer — Escritor',
    },
    description:
      locale === 'es'
        ? 'Sitio oficial de Boris Mayer, escritor argentino. Conocé sus libros, su biografía y comprá sus obras digitales.'
        : 'Official site of Boris Mayer, Argentine writer. Discover his books, biography and purchase his digital works.',
    openGraph: {
      siteName: 'Boris Mayer',
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
      <body className="min-h-screen bg-parchment font-body text-ink flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
