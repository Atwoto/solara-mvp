// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { name, email, subject, message } = await req.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Configure Nodemailer transporter
    // Ensure your environment variables are set correctly
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT), // Convert string to number
      secure: process.env.EMAIL_SECURE === 'true', // Convert string to boolean
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      // Optional: Add debug and logger for development
      // logger: true,
      // debug: true,
    });
    
    // Verify connection configuration (optional, but good for debugging)
    // try {
    //   await transporter.verify();
    //   console.log("Nodemailer transporter verified successfully.");
    // } catch (error) {
    //   console.error("Nodemailer transporter verification failed:", error);
    //   return NextResponse.json({ message: 'Failed to configure email server.' }, { status: 500 });
    // }


    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_SERVER_USER}>`, // Sender address (shows name, uses your server email)
      replyTo: email, // Set the reply-to field to the user's email
      to: process.env.EMAIL_TO_ADDRESS, // List of receivers (your email address)
      subject: `New Contact Form Submission: ${subject}`, // Subject line
      text: `You have a new message from your website's contact form:
Name: ${name}
Email: ${email}
Subject: ${subject}
Message:
${message}`, // Plain text body
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${message}</p>
      </div>`, // HTML body
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Failed to send email:', error);
    let errorMessage = 'Failed to send message. Please try again later.';
    if (error instanceof Error) {
        // More specific error handling could be added here
        // For example, checking error.code for SMTP errors
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}