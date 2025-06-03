import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
const resend = new Resend(RESEND_API_KEY);
const from = 'Alquilando <notificaciones@propimap.com>';

export async function sendOtpEmail(email: string, otp: number) {
	try {
		const { data, error } = await resend.emails.send({
			from,
			to: email,
			subject: 'Código de verificación - Aviso de Alquilando',
			text: `Tu código de verificación es: ${otp}`,
		});

		if (error) {
			console.error('Error sending OTP email:', { error, email });
			return null;
		}

		console.info('OTP email sent successfully', { email });
		return data;
	} catch (error) {
		console.error('Unexpected error sending OTP email:', { error, email });
		return null;
	}
}

export async function sendNewUserEmail(email: string, nombre: string, password: string) {
	try {
		const { data, error } = await resend.emails.send({
			from,
			to: email,
			subject: 'Bienvenido a Alquilando',
			text: `Hola ${nombre},\n\nTu cuenta ha sido creada. Tu contraseña temporal es: ${password}\n\nPor favor, cambia tu contraseña después de iniciar sesión.`
		});

		if (error) {
			console.error('Error sending password email:', { error, email });
			return null;
		}

		console.info('Password email sent successfully', { email });
		return data;
	} catch (error) {
		console.error('Unexpected error sending password email:', { error, email });
		return null;
	}
}