// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; // Import your existing admin client

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // --- Validation ---
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing name, email, or password' }, { status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // --- Check if user already exists in Supabase Auth ---
    // Note: Using listUsers is okay for smaller apps, but for very large scale,
    // a direct query might be better. This is fine for now.
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    }

    // --- Create user in Supabase Auth (Supabase handles hashing) ---
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
    
    // --- Create corresponding user profile in your public 'users' table ---
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newAuthUser.id,
        name: name,
        email: email,
      });

    if (profileError) {
      console.error('Supabase profile creation error:', profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.id);
      throw new Error("Failed to create user profile. Registration has been rolled back.");
    }
    
    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}