/**
 * Test SendGrid Configuration
 * 
 * This script tests if SendGrid is properly configured
 * Run: node test-sendgrid.js
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
  console.log('\n📧 Testing SendGrid Configuration...\n');

  // Check configuration
  console.log('1️⃣ Checking environment variables...');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const emailService = process.env.EMAIL_SERVICE;

  if (!apiKey) {
    console.error('❌ SENDGRID_API_KEY not found in .env');
    console.log('   Add: SENDGRID_API_KEY=SG.your_key_here');
    return;
  }

  if (!apiKey.startsWith('SG.')) {
    console.error('❌ SENDGRID_API_KEY should start with "SG."');
    console.log('   Current value starts with:', apiKey.substring(0, 5));
    return;
  }

  if (!fromEmail) {
    console.error('❌ SENDGRID_FROM_EMAIL not found in .env');
    console.log('   Add: SENDGRID_FROM_EMAIL=your-verified-email@example.com');
    return;
  }

  if (emailService !== 'sendgrid') {
    console.warn('⚠️  EMAIL_SERVICE is not set to "sendgrid"');
    console.log('   Current value:', emailService);
    console.log('   Set: EMAIL_SERVICE=sendgrid');
    return;
  }

  console.log('✅ Configuration looks good!');
  console.log('   EMAIL_SERVICE:', emailService);
  console.log('   API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
  console.log('   From Email:', fromEmail);

  // Test sending
  console.log('\n2️⃣ Attempting to send test email...');
  
  try {
    sgMail.setApiKey(apiKey);

    const msg = {
      to: fromEmail, // Send to yourself for testing
      from: fromEmail, // Must be verified sender
      subject: '🎉 SendGrid Test - LMS System',
      text: 'This is a test email from your LMS application. If you received this, SendGrid is working correctly!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { padding: 30px; background: #f9f9f9; margin-top: 20px; border-radius: 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 SendGrid Test Email</h1>
            </div>
            <div class="content">
              <div class="success">
                <strong>✅ Success!</strong>
                <p>If you're reading this, your SendGrid configuration is working correctly!</p>
              </div>
              <h2>Test Details:</h2>
              <ul>
                <li><strong>From:</strong> ${fromEmail}</li>
                <li><strong>Service:</strong> SendGrid</li>
                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <p>Your LMS email system is ready to send teacher invitations! 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your inbox:', fromEmail);
    console.log('   (Check spam folder if you don\'t see it)');
    console.log('\n🎉 SendGrid is working correctly!');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    
    if (error.code === 403) {
      console.log('\n💡 Fix: API key is invalid or lacks permissions');
      console.log('   1. Go to https://app.sendgrid.com/settings/api_keys');
      console.log('   2. Create a new API key with "Full Access"');
      console.log('   3. Update SENDGRID_API_KEY in .env');
    }
    
    if (error.response?.body?.errors) {
      console.log('\nDetailed errors:');
      error.response.body.errors.forEach(err => {
        console.log(`   - ${err.message}`);
        if (err.field) console.log(`     Field: ${err.field}`);
      });
      
      // Check for sender verification issue
      if (error.response.body.errors.some(e => e.message.includes('does not match'))) {
        console.log('\n💡 Fix: Sender email not verified');
        console.log('   1. Go to https://app.sendgrid.com/settings/sender_auth');
        console.log('   2. Verify your sender email:', fromEmail);
        console.log('   3. Check your email for verification link');
      }
    }
  }

  console.log('\n📚 For setup help, see: SENDGRID_SETUP_GUIDE.md\n');
}

// Run test
testSendGrid().catch(console.error);
