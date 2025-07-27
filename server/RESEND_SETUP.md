# Resend Email Setup Guide

## Environment Variables

Add these to your `.env` file in the server directory:

```env
# Resend API Key
RESEND_API_KEY=your-resend-api-key-here

# Client URL (for email links)
CLIENT_URL=http://localhost:3000

# For production, update CLIENT_URL to your actual domain
# CLIENT_URL=https://yourdomain.com
```

## Important Notes

1. **Domain Verification**:
   - For production, you'll need to verify your domain in Resend dashboard
   - Until then, you can only send to your own email address

2. **From Email**:
   - Currently set to `noreply@estatelink.com` in the code
   - Update this in `server/services/emailService.js` to match your verified domain

3. **Testing**:
   - With free tier, you can send test emails to your registered email
   - Perfect for development and testing

## Next Steps

1. Add your Resend API key to `.env`
2. Restart your server
3. Test the forgot password flow!

## Updating Email Templates

Email templates are in `server/services/emailService.js`. You can customize:

- Colors (currently using #036CA3)
- Logo/branding
- Email content
- Styling
