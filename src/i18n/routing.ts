import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/biografia': {
      es: '/biografia',
      en: '/about',
    },
    '/libros': {
      es: '/libros',
      en: '/books',
    },
    '/libros/[slug]': {
      es: '/libros/[slug]',
      en: '/books/[slug]',
    },
    '/pago/exito': {
      es: '/pago/exito',
      en: '/payment/success',
    },
    '/pago/error': {
      es: '/pago/error',
      en: '/payment/error',
    },
    '/descarga/[token]': {
      es: '/descarga/[token]',
      en: '/download/[token]',
    },
  },
});
