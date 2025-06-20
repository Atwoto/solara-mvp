import type { NextAuthOptions, User, Session } from 'next-auth';

let myOptions: NextAuthOptions;
let myUser: User;
let mySession: Session;

console.log(myOptions, myUser, mySession);