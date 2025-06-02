import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generatePassword } from '$lib/utils';
import { sendEmail } from '$lib/email';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || (locals.user.rol !== 'admin' && locals.user.rol !== 'empleado')) {
        throw redirect(302, '/');
    }
};

export const actions: Actions = {
    crear: async ({ request }) => {
        const formData = await request.formData();
        const nombre = formData.get('nombre') as string;
        const apellido = formData.get('apellido') as string;
        const dni = formData.get('dni') as string;
        const fechaNacimiento = formData.get('fechaNacimiento') as string;
        const email = formData.get('email') as string;
        const telefono = formData.get('telefono') as string;

        if (!nombre || !apellido || !dni || !fechaNacimiento || !email || !telefono) {
            return fail(400, { error: 'Todos los campos son requeridos' });
        }

        // Check if email is already in use
        const existingUser = await db.query.usuarios.findFirst({
            where: eq(usuarios.email, email)
        });

        if (existingUser) {
            return fail(400, { error: 'El email ya está en uso' });
        }

        // check if user is at least 18 years old
        const today = new Date();
        const birthDate = new Date(fechaNacimiento);
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 18) {
            return fail(400, { error: 'El cliente debe tener al menos 18 años' });
        }

        // Generar contraseña aleatoria
        const password = generatePassword();
        const hashedPassword = await hash(password);

        try {
            const [newUser] = await db.insert(usuarios).values({
                nombre,
                apellido,
                dni: parseInt(dni).toString(),
                fechaNacimiento: new Date(fechaNacimiento),
                email,
                telefono: parseInt(telefono).toString(),
                passwordHash: hashedPassword,
                rol: 'cliente' as const
            }).returning({ id: usuarios.id });

            if (!newUser) {
                return fail(500, { error: 'Error al crear el usuario' });
            }

            // Enviar email con la contraseña
            await sendEmail({
                to: email,
                subject: 'Bienvenido a nuestro sistema',
                text: `Hola ${nombre},\n\nTu cuenta ha sido creada. Tu contraseña temporal es: ${password}\n\nPor favor, cambia tu contraseña después de iniciar sesión.`
            });

            return {
                success: true
            };
        } catch (error) {
            console.error('Error al crear usuario:', error);
            return fail(500, {
                error: 'Error al crear el usuario'
            });
        }
    }
}; 