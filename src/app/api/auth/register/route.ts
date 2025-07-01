// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing name, email, or password' }, { status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // --- THIS IS THE CORRECTED LOGIC ---
    // Check if user already exists using listUsers
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists. Please try logging in.' }, { status: 409 });
    }

    // --- Create user in Supabase Auth ---
    const { data: { user: newAuthUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name }
    });

    if (createError) {
      console.error('Supabase Auth user creation error:', createError);
      throw new Error(createError.message);
    }
    if (!newAuthUser) {
        throw new Error('User creation did not return a user object.');
    }
    
    // --- Create corresponding user profile ---
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newAuthUser.id,
        name: name,
        email: email,
      });

    if (profileError) {
      console.error('Supabase profile creation error:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.id);
      throw new Error("Failed to create user profile. Registration has been rolled back.");
    }
    
    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}