import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const emailService = {
    async sendEmail(options: EmailOptions): Promise<void> {
        // If SMTP is not configured, log to console (Dev/Test mode)
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.log('📨 [EMAIL MOCK] ---------------------------------------------------');
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log('Body:');
            console.log(options.html);
            console.log('------------------------------------------------------------------');
            return;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${process.env.APP_NAME || 'Shiv Furniture'}" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    },

    async sendInvitation(email: string, token: string): Promise<void> {
        const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;

        // Simple HTML template
        const html = `
      <h1>Welcome to Shiv Furniture!</h1>
      <p>You have been invited to join the Shiv Furniture Budget Accounting System.</p>
      <p>Please click the link below to set your password and access your account:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">Set Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;

        await this.sendEmail({
            to: email,
            subject: 'Invitation to Shiv Furniture ERP',
            html,
        });
    },

    async sendPasswordReset(email: string, token: string): Promise<void> {
        const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;

        const html = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset it:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html,
        });
    }
};
