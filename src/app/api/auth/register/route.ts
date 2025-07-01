// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json({ message: 'Valid name, email, and a password of at least 8 characters are required.' }, { status: 400 });
    }

    // --- Check if user already exists ---
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    // --- Create user in Supabase Auth ---
    // The database trigger will handle creating the public profile.
    const { data: { user: newAuthUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm for direct creation
      user_metadata: { name: name }
    });

    if (createError) throw createError;
    if (!newAuthUser) throw new Error('User creation failed to return a user object.');

    // --- THIS IS THE FIX ---
    // Instead of INSERTING a new profile, we UPDATE the one that the trigger just created.
    // This adds the 'name' field which the trigger might not have added.
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ name: name })
      .eq('id', newAuthUser.id);
      
    if (updateError) {
        // If the update fails, it's not critical, but we should log it.
        // The user account still exists.
        console.error("Failed to update user's name after creation:", updateError);
    }

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration API Error:', error.message);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}