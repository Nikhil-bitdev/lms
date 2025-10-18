# Email Invitation Setup Guide 📧

## ✅ Implementation Complete!

Your LMS now has automatic email sending for teacher invitations using **Nodemailer**!

---

## 🎯 What Was Added

### 1. **Email Service** (`/server/src/services/emailService.js`)
- Beautiful HTML email templates
- Automatic email sending
- Error handling and logging
- Fallback to manual link sharing

### 2. **Updated Admin Controller**
- Automatically sends email when inviting teachers
- Provides fallback if email fails
- Returns email status in response

### 3. **Email Configuration** (`.env`)
- Gmail/SMTP configuration
- Secure app password support

---

## 📋 Setup Instructions

### Step 1: Get Gmail App Password

#### Why App Password?
Gmail requires an "App Password" instead of your regular password for security.

#### How to Get It:

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Under "2-Step Verification", turn it ON
   - Complete the setup

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Name it: "LMS Teacher Invitations"
   - Click **Generate**
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Important**: Remove spaces from the password when copying

---

### Step 2: Configure Email in `.env`

Open `/server/.env` and update these lines:

```env
# Replace with your Gmail address
EMAIL_USER=your-email@gmail.com

# Replace with your App Password (no spaces)
EMAIL_PASSWORD=abcdefghijklmnop
```

**Example:**
```env
EMAIL_USER=admin@yourschool.com
EMAIL_PASSWORD=xyzw abcd efgh ijkl  # Remove spaces! → xyzwabcdefghijkl
```

---

### Step 3: Restart the Server

```bash
# Kill current server
Ctrl+C

# Restart
npm run dev
```

---

## 🧪 Testing Email

### Test 1: Verify Email Configuration

Create a test file `/server/test-email.js`:

```javascript
const { testEmailConfig, sendTeacherInvitation } = require('./src/services/emailService');
require('dotenv').config();

async function test() {
  console.log('Testing email configuration...');
  const result = await testEmailConfig();
  console.log(result);
  
  if (result.success) {
    console.log('\n✅ Email is configured correctly!');
    console.log('\nSending test invitation...');
    
    const testResult = await sendTeacherInvitation({
      email: 'test@example.com', // Replace with your test email
      firstName: 'Test',
      lastName: 'Teacher',
      invitationLink: 'http://localhost:5173/register/teacher/test123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    console.log('\nTest email result:', testResult);
  }
  
  process.exit(0);
}

test();
```

Run it:
```bash
cd server
node test-email.js
```

### Test 2: Send Real Invitation

1. Login as admin: http://localhost:5173/admin
2. Click "Invite Teacher"
3. Fill in teacher details (use your own email for testing)
4. Click "Send Invitation"
5. Check your email! 📬

---

## 📧 Email Features

### What the Email Includes:

✅ **Professional Design**
- Beautiful gradient header
- Responsive layout
- Mobile-friendly

✅ **Clear Information**
- Teacher's name and email
- Registration link (button)
- Expiration date
- Step-by-step instructions

✅ **Security Features**
- Link expiration notice
- One-time use warning
- Security reminder

✅ **Accessibility**
- Plain text version included
- Works with all email clients
- Copy-paste link fallback

---

## 🎨 Email Preview

```
┌─────────────────────────────────────┐
│  🎓 Welcome to Our LMS!             │
│  Teacher Invitation                 │
└─────────────────────────────────────┘

Hello [Name],

You've been invited to join our Learning 
Management System as a Teacher!

[Complete Registration Button]

📧 Your Email: teacher@example.com
👤 Role: Teacher
⏰ Expires: October 24, 2025

What's Next?
1. Click the button above
2. Verify your information
3. Create a secure password
4. Start teaching!

⚠️ Important:
- Link expires in 7 days
- One-time use only
```

---

## 🔧 Configuration Options

### Using Other Email Services

#### Outlook/Hotmail:
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```
Change in `emailService.js`:
```javascript
service: 'outlook' // instead of 'gmail'
```

#### Yahoo Mail:
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```
Change in `emailService.js`:
```javascript
service: 'yahoo'
```

#### Custom SMTP:
```env
SMTP_HOST=smtp.your-server.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

Update `emailService.js`:
```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

---

## 🛡️ Security Best Practices

### ✅ Do's:
- ✅ Use App Passwords (not regular passwords)
- ✅ Keep credentials in `.env` (not in code)
- ✅ Add `.env` to `.gitignore`
- ✅ Enable 2FA on your email account
- ✅ Use a dedicated email for the LMS

### ❌ Don'ts:
- ❌ Never commit `.env` to GitHub
- ❌ Don't share your App Password
- ❌ Don't use your personal email password
- ❌ Don't hardcode credentials

---

## 🚨 Troubleshooting

### Problem: "Email not configured"

**Solution:**
1. Check `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
2. Verify no extra spaces in the password
3. Restart the server after updating `.env`

### Problem: "Invalid login" error

**Solution:**
1. Make sure you're using an **App Password**, not your regular password
2. Enable 2-Factor Authentication first
3. Generate a new App Password
4. Remove all spaces from the password

### Problem: "Connection timeout"

**Solution:**
1. Check your internet connection
2. Try a different email service
3. Check firewall settings
4. Verify SMTP port is not blocked

### Problem: Email goes to spam

**Solution:**
1. Use a verified sender email
2. Add SPF/DKIM records (for custom domains)
3. Ask recipient to mark as "Not Spam"
4. Consider using SendGrid/AWS SES for production

---

## 📊 Monitoring

### Server Logs

When invitation is sent, you'll see:
```
✅ Email sent: <message-id>
📧 Preview URL: https://ethereal.email/message/...
```

### In Admin Response

The API response includes:
```json
{
  "message": "Teacher invitation sent successfully via email",
  "emailSent": true,
  "invitation": { ... },
  "invitationLink": "..."
}
```

---

## 🔄 Fallback Behavior

### If Email Fails:

1. Invitation still created in database
2. Invitation link returned in response
3. Admin sees the link in an alert
4. Admin can manually share the link
5. System continues to work!

**Console shows:**
```
⚠️ Email not configured. Invitation link: http://...
```

---

## 🚀 Production Recommendations

### For Production Use:

1. **Use Professional Email Service**
   - SendGrid (100 emails/day free)
   - AWS SES (very cheap, reliable)
   - Mailgun
   - Postmark

2. **Add Email Tracking**
   - Track opens
   - Track clicks
   - Monitor bounces

3. **Improve Templates**
   - Add school logo
   - Customize branding
   - Add social links

4. **Add More Emails**
   - Welcome email after registration
   - Password reset
   - Course enrollment notifications
   - Assignment reminders

---

## 📝 Quick Setup Checklist

- [ ] Install nodemailer (✅ Already done)
- [ ] Enable 2FA on Gmail
- [ ] Generate App Password
- [ ] Update `.env` with email credentials
- [ ] Restart server
- [ ] Test email configuration
- [ ] Send test invitation
- [ ] Check spam folder
- [ ] Verify email received
- [ ] Click invitation link
- [ ] Complete registration

---

## 🎉 Success!

Once configured, every teacher invitation will:

1. ✅ Create invitation in database
2. ✅ Generate unique secure link
3. ✅ Send beautiful HTML email
4. ✅ Log success/failure
5. ✅ Provide fallback link if needed

**No more manual copy-paste needed!** 🚀

---

## 💡 Next Steps

After email is working:

1. **Test with real email**
2. **Customize email template** (colors, logo, branding)
3. **Add email for password reset**
4. **Add welcome email after registration**
5. **Set up email monitoring dashboard**

---

## 📞 Support

### Need Help?

**Common Issues:**
1. Email not sending → Check App Password
2. Wrong credentials → Regenerate App Password
3. Timeout errors → Check firewall/internet
4. Spam folder → Add to contacts

**Test Email Command:**
```bash
cd server
node test-email.js
```

---

*Setup Date: October 17, 2025*
*Status: ✅ Ready (requires email configuration)*
