import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@sprintfit.com';
    const adminPassword = 'adminPassword123'; // Cambia esto en producción

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await prisma.user.create({
            data: {
                email: adminEmail,
                fullName: 'Administrador SprintFit',
                passwordHash: passwordHash,
                role: Role.ADMIN,
            },
        });

        console.log('✅ Usuario Administrador inicial creado con éxito:');
        console.log(`Email: ${adminEmail}`);
    } else {
        console.log('ℹ️ El usuario administrador ya existe.');
    }
}

main()
    .catch((e) => {
        console.error('❌ Error al sembrar la base de datos:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
