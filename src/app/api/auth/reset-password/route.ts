// /src/app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: 'Token and new password are required.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters long." }, { status: 400 });
        }

        // 1. Hash the incoming token to match the one stored in the DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Find the user with that token and ensure it has not expired
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, password_reset_expires')
            .eq('password_reset_token', hashedToken)
            .single();

        if (userError || !user) {
            return NextResponse.json({ message: 'Password reset token is invalid.' }, { status: 400 });
        }

        const expires = new Date(user.password_reset_expires).getTime();
        if (expires < Date.now()) {
            return NextResponse.json({ message: 'Password reset token has expired.' }, { status: 400 });
        }

        // 3. Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Update the user's password and clear the reset token fields
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                hashed_password: hashedPassword,
                password_reset_token: null,
                password_reset_expires: null,
                updated_at: new Date().toISOString(), // Also update the updated_at timestamp
            })
            .eq('id', user.id);

        if (updateError) {
            console.error("DB Error updating password:", updateError);
            throw new Error('Could not update your password. Please try again.');
        }

        return NextResponse.json({ message: 'Your password has been updated successfully!' });

    } catch (error: any) {
        console.error("API Error in reset-password:", error);
        return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
    }
}
