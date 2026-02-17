// EmailJS service for handling contact form submissions
import emailjs from '@emailjs/browser';
import { 
  HOME_EMAIL_CONFIG, 
  CONTACT_EMAIL_CONFIG,
  EMAILJS_PUBLIC_KEY,
  formatEmailParams 
} from '../config/emailConfig';

// Initialize EmailJS with public key
export const initEmailJS = () => {
  console.log('Initializing EmailJS service');
  emailjs.init(EMAILJS_PUBLIC_KEY);
};

// Send email function for home page contact form
export const sendHomeEmail = async (formData) => {
  try {
    const params = formatEmailParams(formData);
    
    await emailjs.send(
      HOME_EMAIL_CONFIG.serviceId,
      HOME_EMAIL_CONFIG.templateId,
      params
    );
    
    return { 
      success: true, 
      message: 'Email sent successfully!' 
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      message: 'Failed to send email. Please try again.' 
    };
  }
};

// Send via Hostinger SMTP through Netlify function
const sendViaHostinger = async (formData) => {
  const response = await fetch('/.netlify/functions/send-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'SMTP send failed');
  return data;
};

// Send email function for contact page form - sends via both Hostinger SMTP and EmailJS
export const sendContactEmail = async (formData) => {
  const params = formatEmailParams(formData);
  const results = await Promise.allSettled([
    sendViaHostinger(formData),
    emailjs.send(
      CONTACT_EMAIL_CONFIG.serviceId,
      CONTACT_EMAIL_CONFIG.templateId,
      params
    ),
  ]);

  const smtpResult = results[0];
  const emailjsResult = results[1];

  const smtpOk = smtpResult.status === 'fulfilled';
  const emailjsOk = emailjsResult.status === 'fulfilled';

  if (smtpOk || emailjsOk) {
    if (!smtpOk) console.warn('Hostinger SMTP failed:', smtpResult.reason);
    if (!emailjsOk) console.warn('EmailJS failed:', emailjsResult.reason);
    return {
      success: true,
      message: 'Your message has been sent! I will respond within 24-48 hours.',
    };
  }

  console.error('Both email methods failed:', smtpResult.reason, emailjsResult.reason);
  return {
    success: false,
    message: 'Failed to send message. Please contact me directly or try again later.',
  };
};

// General send email function (fallback for backward compatibility)
export const sendEmail = async (formData, isContactPage = false) => {
  if (isContactPage) {
    return sendContactEmail(formData);
  } else {
    return sendHomeEmail(formData);
  }
};