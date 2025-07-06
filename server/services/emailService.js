import { Resend } from 'resend';

import logger from '../utils/logger.js';

let resend;

const getResendClient = () => {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === 'test') {
    logger.info(`[TEST MODE] Would send password reset email to ${email} with token ${resetToken}`);
    return;
  }

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'EstateLink <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset Request - EstateLink',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #222;
                margin: 0;
                padding: 0;
                background-color: #f7f8fa;
              }
              .wrapper {
                background-color: #f7f8fa;
                padding: 40px 20px;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
              }
              .header { 
                background: linear-gradient(135deg, #036CA3 0%, #0284C7 100%);
                color: white; 
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
              }
              .content { 
                padding: 40px 30px;
              }
              .content p {
                color: #222;
                font-size: 16px;
                line-height: 1.6;
                margin: 0 0 20px 0;
                font-weight: 400;
              }
              .button-container {
                text-align: center;
                margin: 35px 0;
              }
              .button { 
                display: inline-block; 
                padding: 14px 32px;
                background-color: #036CA3;
                color: white !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: 0.01em;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px 0 rgba(3,108,163,0.15);
              }
              .button:hover {
                background-color: #025a8a;
                box-shadow: 0 4px 16px 0 rgba(3,108,163,0.25);
                transform: translateY(-1px);
              }
              .warning {
                background-color: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 8px;
                padding: 16px;
                margin: 25px 0;
              }
              .warning p {
                color: #92400e;
                font-size: 14px;
                margin: 0;
                font-weight: 500;
              }
              .footer { 
                background-color: #f7f8fa;
                padding: 30px;
                text-align: center;
              }
              .footer p {
                font-size: 13px;
                color: #6b7280;
                margin: 0 0 10px 0;
              }
              .footer a {
                color: #036CA3;
                text-decoration: none;
                font-weight: 500;
              }
              .footer a:hover {
                text-decoration: underline;
              }
              .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="header">
                  <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                  <p style="font-size: 18px; color: #111; font-weight: 500;">Hi there,</p>
                  <p>We received a request to reset your password for your EstateLink account. Click the button below to create a new password:</p>
                  
                  <div class="button-container">
                    <a href="${resetURL}" class="button">Reset Password</a>
                  </div>
                  
                  <div class="warning">
                    <p>⏰ This link will expire in 10 minutes for security reasons.</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.</p>
                  
                  <div class="divider"></div>
                  
                  <p style="margin-top: 30px; margin-bottom: 5px;">Best regards,</p>
                  <p style="font-weight: 600; color: #111;">The EstateLink Team</p>
                </div>
                <div class="footer">
                  <p>If the button doesn't work, copy and paste this link into your browser:</p>
                  <p><a href="${resetURL}">${resetURL}</a></p>
                  <div class="divider"></div>
                  <p style="margin-top: 20px;">© 2024 EstateLink. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error('Resend API error details:', error);
      throw new Error(
        `Failed to send password reset email: ${error.message || JSON.stringify(error)}`,
      );
    }

    return data;
  } catch (error) {
    logger.error('Email service error:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, verificationToken) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === 'test') {
    logger.info(`[TEST MODE] Would send verification email to ${email} with token ${verificationToken}`);
    return;
  }

  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'EstateLink <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Email - EstateLink',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #222;
                margin: 0;
                padding: 0;
                background-color: #f7f8fa;
              }
              .wrapper {
                background-color: #f7f8fa;
                padding: 40px 20px;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
              }
              .header { 
                background: linear-gradient(135deg, #036CA3 0%, #0284C7 100%);
                color: white; 
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
              }
              .welcome-icon {
                font-size: 48px;
                margin-bottom: 10px;
              }
              .content { 
                padding: 40px 30px;
              }
              .content p {
                color: #222;
                font-size: 16px;
                line-height: 1.6;
                margin: 0 0 20px 0;
                font-weight: 400;
              }
              .button-container {
                text-align: center;
                margin: 35px 0;
              }
              .button { 
                display: inline-block; 
                padding: 14px 32px;
                background-color: #036CA3;
                color: white !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: 0.01em;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px 0 rgba(3,108,163,0.15);
              }
              .button:hover {
                background-color: #025a8a;
                box-shadow: 0 4px 16px 0 rgba(3,108,163,0.25);
                transform: translateY(-1px);
              }
              .features {
                background-color: #f7f8fa;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
              }
              .features h3 {
                color: #111;
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 15px 0;
              }
              .features ul {
                margin: 0;
                padding: 0 0 0 20px;
              }
              .features li {
                color: #4b5563;
                font-size: 14px;
                margin-bottom: 8px;
              }
              .warning {
                background-color: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 8px;
                padding: 16px;
                margin: 25px 0;
              }
              .warning p {
                color: #92400e;
                font-size: 14px;
                margin: 0;
                font-weight: 500;
              }
              .footer { 
                background-color: #f7f8fa;
                padding: 30px;
                text-align: center;
              }
              .footer p {
                font-size: 13px;
                color: #6b7280;
                margin: 0 0 10px 0;
              }
              .footer a {
                color: #036CA3;
                text-decoration: none;
                font-weight: 500;
              }
              .footer a:hover {
                text-decoration: underline;
              }
              .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="header">
                  <div class="welcome-icon">🎉</div>
                  <h1>Welcome to EstateLink!</h1>
                </div>
                <div class="content">
                  <p style="font-size: 18px; color: #111; font-weight: 500;">Hi there,</p>
                  <p>Thanks for signing up for EstateLink! We're excited to have you on board. Please verify your email address to get started with your real estate management journey.</p>
                  
                  <div class="button-container">
                    <a href="${verifyURL}" class="button">Verify Email Address</a>
                  </div>
                  
                  <div class="features">
                    <h3>What you can do with EstateLink:</h3>
                    <ul>
                      <li>Manage your properties efficiently</li>
                      <li>Track rental income and expenses</li>
                      <li>Connect with tenants seamlessly</li>
                      <li>Generate professional reports</li>
                    </ul>
                  </div>
                  
                  <div class="warning">
                    <p>⏰ This verification link will expire in 10 minutes.</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">If you didn't create an account with EstateLink, please ignore this email.</p>
                  
                  <div class="divider"></div>
                  
                  <p style="margin-top: 30px; margin-bottom: 5px;">Best regards,</p>
                  <p style="font-weight: 600; color: #111;">The EstateLink Team</p>
                </div>
                <div class="footer">
                  <p>If the button doesn't work, copy and paste this link into your browser:</p>
                  <p><a href="${verifyURL}">${verifyURL}</a></p>
                  <div class="divider"></div>
                  <p style="margin-top: 20px;">© 2024 EstateLink. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error('Resend API error details:', error);
      throw new Error(
        `Failed to send verification email: ${error.message || JSON.stringify(error)}`,
      );
    }

    return data;
  } catch (error) {
    logger.error('Email service error:', error);
    throw error;
  }
};
