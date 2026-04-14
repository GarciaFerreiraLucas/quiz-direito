import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_test');

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  // Overrides the to-address if we are not in production strictly
  const isProduction = process.env.NODE_ENV === 'production';
  let emailDestination = to;
  
  if (!isProduction && process.env.EMAIL_TEST_RECEIVER) {
    console.warn(`[DEV MODE] Redirecting email intended for ${to} to Test Receiver: ${process.env.EMAIL_TEST_RECEIVER}`);
    emailDestination = process.env.EMAIL_TEST_RECEIVER;
  }

  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Recuperação de Senha</h2>
      <p>Você solicitou uma recuperação de senha para a sua conta no Quiz Direito.</p>
      <p>Clique no botão abaixo para redefinir sua senha. Este link expira em 30 minutos.</p>
      <div style="margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #0d47a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Redefinir Minha Senha
        </a>
      </div>
      <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Se o botão não funcionar, copie e cole este link no seu navegador: ${resetLink}</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: `Quiz Direito <${fromAddress}>`,
      to: [emailDestination],
      subject: 'Recuperação de Senha - Quiz Direito',
      html: htmlContent,
      text: `Você solicitou uma recuperação de senha.\nAcesse: ${resetLink}\nEste link expira em 30 minutos.`,
    });
    console.log('E-mail eviado com sucesso', data);
    return data;
  } catch (error) {
    console.error('Falha ao enviar o e-mail de recuperação:', error);
    throw new Error('Não foi possível realizar o envio de email através do provedor.');
  }
}
