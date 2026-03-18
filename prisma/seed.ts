import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash('Admin1234!', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@librosautoror.com' },
    update: {},
    create: {
      email: 'admin@librosautoror.com',
      passwordHash: hash,
      name: 'Administrador',
    },
  });

  // Author
  const author = await prisma.author.upsert({
    where: { id: 'author-main' },
    update: {},
    create: {
      id: 'author-main',
      nameEs: 'Andrew Myer',
      nameEn: 'Andrew Myer',
      bioEs:
        'Escritor argentino nacido en Buenos Aires. Autor de múltiples novelas y ensayos que exploran la identidad latinoamericana, la memoria y el tiempo. Su obra ha sido traducida a varios idiomas y reconocida con premios nacionales e internacionales.',
      bioEn:
        'Argentine writer born in Buenos Aires. Author of multiple novels and essays exploring Latin American identity, memory, and time. His work has been translated into several languages and recognized with national and international awards.',
      nationality: 'Argentina',
      milestones: {
        create: [
          { year: 1980, labelEs: 'Nacimiento en Buenos Aires', labelEn: 'Born in Buenos Aires' },
          { year: 2005, labelEs: 'Primera novela publicada', labelEn: 'First novel published' },
          { year: 2010, labelEs: 'Premio Nacional de Literatura', labelEn: 'National Literature Award' },
          { year: 2018, labelEs: 'Traducción al inglés y francés', labelEn: 'Translation into English and French' },
        ],
      },
    },
  });

  // Sample book
  await prisma.book.upsert({
    where: { slug: 'el-tiempo-entre-nosotros' },
    update: {},
    create: {
      slug: 'el-tiempo-entre-nosotros',
      titleEs: 'El tiempo entre nosotros',
      titleEn: 'The Time Between Us',
      descriptionEs:
        'Una novela profunda sobre la memoria y el olvido. Dos hermanos separados por décadas se reencuentran en el umbral de la vejez y deben reconciliar sus versiones del pasado.',
      descriptionEn:
        'A profound novel about memory and forgetting. Two siblings separated for decades reunite on the threshold of old age and must reconcile their versions of the past.',
      authorName: 'Andrew Myer',
      coverUrl: 'https://placehold.co/400x600/1a1a2e/ffffff?text=El+Tiempo+Entre+Nosotros',
      pageCount: 320,
      genre: 'Novela',
      isPublished: true,
      publishedAt: new Date('2023-06-15'),
      prices: {
        create: [
          { currency: 'ARS', amount: 2500 },
          { currency: 'USD', amount: 9.99 },
          { currency: 'EUR', amount: 8.99 },
        ],
      },
    },
  });

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
