// src/next-auth.d.ts

import 'next-auth'; // Ensures this file is treated as a module augmentation
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

// 1. Define your custom User structure.
// This should reflect what your `authorize` callback returns
// and what you want to have available in session.user and the JWT.
interface IUser extends DefaultUser {
  id: string;    // Make id non-optional and string
  email: string; // Make email non-optional and string
  // name?: string | null; // Inherited from DefaultUser, optional
  // image?: string | null; // Inherited from DefaultUser, optional
  // Add any other custom user properties you might have, e.g.:
  // role?: string; 
}

declare module 'next-auth' {
  /**
   * Augment the Session interface.
   * The `user` property will now conform to `IUser`.
   */
  interface Session extends DefaultSession { // Good practice to extend DefaultSession
    user: IUser;
  }

  /**
   * Augment the User interface.
   * This tells NextAuth that its internal representation of a User
   * (e.g., from providers or the adapter) should also conform to `IUser`.
   */
  interface User extends IUser {}
}

declare module 'next-auth/jwt' {
  /**
   * Augment the JWT interface.
   * This reflects the properties you add to the token in the `jwt` callback.
   */
  interface JWT extends DefaultJWT { // Good practice to extend DefaultJWT
    // Properties from DefaultJWT:
    // name?: string | null;
    // email?: string | null;
    // picture?: string | null; // Typically maps to user.image
    // sub?: string; // Usually the user ID

    // Your custom properties added in the jwt callback:
    id?: string;      // If you explicitly set token.id
    email?: string;   // If you explicitly ensure token.email is a string
    // role?: string; // Example if you add role to the token
  }
}