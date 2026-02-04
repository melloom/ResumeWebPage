/**
 * EmailJS Configuration
 * 
 * This file contains the configuration for EmailJS service
 * including service IDs, template IDs, and public key.
 * 
 * SECURITY: All sensitive keys are loaded from environment variables.
 */

// Shared EmailJS public key for authentication (from environment variables)
export const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Shared service ID used for all email templates (from environment variables)
export const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';

// Validate that required environment variables are present
if (!EMAILJS_PUBLIC_KEY || !EMAIL_SERVICE_ID) {
  console.warn('EmailJS configuration missing. Please set VITE_EMAILJS_PUBLIC_KEY and VITE_EMAILJS_SERVICE_ID in your .env file.');
}

// Email template configuration for the home page contact form
export const HOME_EMAIL_CONFIG = {
  templateId: 'TemPID101',
  serviceId: EMAIL_SERVICE_ID,
  publicKey: EMAILJS_PUBLIC_KEY,
  // Template format:
  // {{name}}
  // {{time}}
  // {{email}}
  // {{subject}}
  // {{message}}
};

// Email template configuration for the contact page form
export const CONTACT_EMAIL_CONFIG = {
  templateId: 'TempID202',
  serviceId: EMAIL_SERVICE_ID,
  publicKey: EMAILJS_PUBLIC_KEY,
  // Template format:
  // 👤
  // 📥 New Contact Request Received
  // - 🧑 Name: {{name}}
  // - 🕒 Time Sent: {{time}}
  // - 📧 Email: {{email}}
  // - ☎️ Phone: {{phone}}
  // - 🏢 Company: {{company}}
  // - 🧠 Subject: {{subject}}
  // - 💬 Message: {{message}}
  // 🔍 Interest Area: {{interest}}
};

// Helper function to format email parameters
export const formatEmailParams = (formData, includeTime = true) => {
  const params = { ...formData };
  
  // Add current time if needed
  if (includeTime) {
    params.time = new Date().toLocaleString();
  }
  
  return params;
};

// Default export for easier imports
export default {
  HOME_EMAIL_CONFIG,
  CONTACT_EMAIL_CONFIG,
  EMAILJS_PUBLIC_KEY,
  EMAIL_SERVICE_ID,
  formatEmailParams
};
