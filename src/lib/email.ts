// /src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
    to: string;
    resetUrl: string;
}

export const sendPasswordResetEmail = async ({ to, resetUrl }: EmailParams) => {
    const subject = "Reset Your Password for Bills On Solar";
    const body = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because a password reset request was made for your account.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${resetUrl}" target="_blank" style="background-color: #FDB813; color: #1a202c; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Your Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br>
        <p>Thank you,</p>
        <p>The Bills On Solar Team</p>
    `;

    try {
        await resend.emails.send({
            from: 'Bills On Solar <no-reply@yourdomain.com>', // Replace with your verified sending domain
            to: [to],
            subject: subject,
            html: body,
        });
        console.log(`Password reset email sent to ${to}`);
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        // In a real app, you might have more robust error handling or a fallback
        throw new Error("Could not send the password reset email.");
    }
};
