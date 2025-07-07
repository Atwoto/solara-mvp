// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  // We keep the method check as a best practice.
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { name, email, subject, message } = await req.json();

    // Basic validation to ensure all fields are filled out.
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // This section reads the environment variables you set in Vercel.
    // It will use your Gmail App Password for authentication.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SECURE === 'true', // Use true for port 465
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // These are the details for the email that will be sent.
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_SERVER_USER}>`, // Shows the sender's name but sends from your email
      replyTo: email, // So when you hit "Reply", it goes to the user's email
      to: process.env.EMAIL_TO_ADDRESS, // The email address where you receive the notifications
      subject: `New Contact Form Submission: ${subject}`,
      text: `You have a new message from your website's contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${message}</p>
      </div>`,
    };

    // This command sends the email.
    await transporter.sendMail(mailOptions);

    // If successful, send back a success message.
    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });

  } catch (error) {
    // If anything goes wrong, log the detailed error on the server for debugging.
    console.error('Failed to send email:', error);

    // And send back a generic error message to the user.
    return NextResponse.json({ message: 'Failed to send message due to a server error.' }, { status: 500 });
  }
}
