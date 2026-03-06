# 📚 Página Web Autor de Libros — Boris Mayer

Sitio web profesional para autor de libros con tienda digital integrada con Mercado Pago.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend + Backend | Next.js 15 App Router |
| Base de datos | Neon (Postgres Serverless) + Prisma ORM |
| Autenticación | NextAuth.js v5 |
| Internacionalización | next-intl (ES / EN) |
| Pagos | Mercado Pago Checkout Pro |
| Almacenamiento de archivos | Vercel Blob |
| Deploy | Vercel (desde GitHub) |

## Características

- **Vista pública**: Biografía del autor, grid de libros, ficha detallada con extracto inline, compra con Mercado Pago
- **Descarga segura**: Tokens HMAC firmados con expiración de 30 minutos y límite de descargas
- **Bilingüe**: Español e inglés con URLs amigables (`/es/libros`, `/en/books`)
- **Panel admin**: Gestión completa de libros, autor, precios y ventas

## Configuración rápida

```bash
# 1. Clonar
git clone https://github.com/borisMayer/pagina-libros-autor.git
cd pagina-libros-autor

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Migrar base de datos
npx prisma migrate dev --name init

# 5. Seed inicial (autor + libro de ejemplo)
npm run db:seed

# 6. Iniciar en desarrollo
npm run dev
```

## Variables de entorno requeridas

Ver [`.env.example`](.env.example) para la lista completa con explicaciones.

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres (pooled) |
| `DIRECT_URL` | Neon Postgres (directo, para migraciones) |
| `AUTH_SECRET` | Secreto para NextAuth (generar con `openssl rand -base64 32`) |
| `MP_ACCESS_TOKEN` | Token de acceso de Mercado Pago |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Clave pública de Mercado Pago |
| `MP_WEBHOOK_SECRET` | Clave para verificar webhooks de MP |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob |
| `DOWNLOAD_TOKEN_SECRET` | Clave para firmar tokens de descarga |

## Deploy en Vercel

1. **Conectar repositorio**: [vercel.com/new](https://vercel.com/new) → Import `borisMayer/pagina-libros-autor`
2. **Configurar env vars**: Agregar todas las variables de `.env.example` en el dashboard de Vercel
3. **Neon**: Conectar desde Vercel Dashboard → Storage → Neon
4. **Vercel Blob**: Crear desde Vercel Dashboard → Storage → Blob
5. **Webhook MP**: Configurar `https://tu-dominio.vercel.app/api/webhook/mercadopago` en el panel de Mercado Pago

## Admin

Acceder a `/admin/login` con las credenciales del seed:
- **Email**: `admin@librosautoror.com`
- **Contraseña**: `Admin1234!`

> ⚠️ Cambiar la contraseña en producción.

## Estructura del proyecto

```
src/
├── app/
│   ├── [locale]/          # Rutas públicas (ES/EN)
│   ├── admin/             # Panel de administración
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades (Prisma, Auth, MP, tokens)
├── i18n/                  # Configuración i18n
└── types/                 # TypeScript types
```

## Flujo de compra

1. Usuario elige libro y moneda → ingresa email
2. Click "Comprar con Mercado Pago" → POST `/api/payment/create`
3. Redirect a Checkout Pro de Mercado Pago
4. Usuario paga → MP envía webhook a `/api/webhook/mercadopago`
5. Webhook genera token firmado (válido 30 min) → guarda en DB
6. Usuario regresa al sitio → descarga PDF/EPUB

## Seguridad

- Tokens de descarga firmados con HMAC-SHA256
- Verificación de firma en webhooks de MP
- Rate limiting en endpoints sensibles
- Protección de rutas admin con NextAuth
- Security headers en todas las respuestas
