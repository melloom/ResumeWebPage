const nodemailer = require('nodemailer');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { name, email, phone, company, subject, message, interest } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.HOSTINGER_SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.HOSTINGER_SMTP_USER,
        pass: process.env.HOSTINGER_SMTP_PASS,
      },
    });

    const time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.HOSTINGER_SMTP_USER}>`,
      to: process.env.HOSTINGER_SMTP_USER,
      replyTo: email,
      subject: `📥 New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">📥 New Contact Request</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #555; width: 140px;">🧑 Name:</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">📧 Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">☎️ Phone:</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
            ${company ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">🏢 Company:</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">🧠 Subject:</td><td style="padding: 8px 0;">${subject}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">🔍 Interest:</td><td style="padding: 8px 0;">${interest}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">🕒 Time:</td><td style="padding: 8px 0;">${time}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #4f46e5; border-radius: 4px;">
            <p style="font-weight: bold; color: #555; margin: 0 0 8px;">💬 Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Email sent via Hostinger SMTP' }),
    };
  } catch (error) {
    console.error('SMTP send error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
