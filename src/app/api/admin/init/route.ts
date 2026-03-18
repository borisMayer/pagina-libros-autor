import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Endpoint de inicialización — solo funciona si NO existe ningún admin
// Se auto-deshabilita una vez que hay un admin en la DB
export async function POST(req: NextRequest) {
  // Verificar clave de setup desde env o body
  const { setupKey } = await req.json();
  const expectedKey = process.env.SETUP_KEY ?? 'setup-andrew-myer-2026';

  if (setupKey !== expectedKey) {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
  }

  // Solo permitir si no hay admins
  const existingAdmin = await prisma.adminUser.findFirst();
  if (existingAdmin) {
    return NextResponse.json({
      message: 'Admin ya existe',
      email: existingAdmin.email,
    });
  }

  // Crear admin inicial
  const hash = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.adminUser.create({
    data: {
      email:        'admin@andrewmyer.com',
      passwordHash: hash,
      name:         'Andrew Myer Admin',
    },
  });

  // Crear autor inicial si no existe
  const existingAuthor = await prisma.author.findFirst();
  if (!existingAuthor) {
    await prisma.author.create({
      data: {
        nameEs:      'Andrew Myer',
        nameEn:      'Andrew Myer',
        bioEs:       'Escritor de literatura latinoamericana. Autor de múltiples novelas y ensayos que exploran la identidad, la memoria y el tiempo. Su obra ha sido traducida a varios idiomas y reconocida con premios nacionales e internacionales.',
        bioEn:       'Latin American fiction writer. Author of multiple novels and essays exploring identity, memory, and time. His work has been translated into several languages and recognized with national and international awards.',
        nationality: 'Latinoamérica',
        milestones: {
          create: [
            { year: 2005, labelEs: 'Primera novela publicada',   labelEn: 'First novel published' },
            { year: 2010, labelEs: 'Premio Nacional de Literatura', labelEn: 'National Literature Award' },
            { year: 2018, labelEs: 'Traducción a múltiples idiomas', labelEn: 'Translation into multiple languages' },
          ],
        },
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Admin creado exitosamente',
    email:   admin.email,
    password: 'Admin1234!',
    note: 'Cambia la contraseña después del primer login',
  });
}
