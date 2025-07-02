// /src/app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';
// You will need to set up an email sending service. Here we assume a helper function.
// Popular choices are Resend, SendGrid, or Nodemailer.
import { sendPasswordResetEmail } from '@/lib/email'; 

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
        }

        // 1. Find the user by email
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (userError || !user) {
            // IMPORTANT: For security, do not reveal if an email exists or not.
            // Always return a success-like message.
            console.warn(`Password reset attempt for non-existent email: ${email}`);
            return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // 2. Generate a secure, random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // 3. Set an expiry date for the token (e.g., 1 hour from now)
        const passwordResetExpires = new Date(Date.now() + 3600000).toISOString();

        // 4. Update the user record in the database with the hashed token and expiry
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                password_reset_token: passwordResetToken,
                password_reset_expires: passwordResetExpires,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error("DB Error updating user for password reset:", updateError);
            throw new Error('Could not create a password reset request. Please try again.');
        }

        // 5. Send the password reset email
        // The URL must match the page you created in the frontend.
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
        
        await sendPasswordResetEmail({
            to: user.email,
            resetUrl: resetUrl,
        });

        return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error: any) {
        console.error("API Error in forgot-password:", error);
        return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
    }
}
