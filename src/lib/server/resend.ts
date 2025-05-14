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
