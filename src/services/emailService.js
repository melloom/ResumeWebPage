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

// Send email function for contact page form
export const sendContactEmail = async (formData) => {
  try {
    console.log('Sending contact email with EmailJS', formData);
    const params = formatEmailParams(formData);
    
    const response = await emailjs.send(
      CONTACT_EMAIL_CONFIG.serviceId,
      CONTACT_EMAIL_CONFIG.templateId,
      params
    );
    
    console.log('Email sent successfully:', response);
    return { 
      success: true, 
      message: 'Your message has been sent! I will respond within 24-48 hours.' 
    };
  } catch (error) {
    console.error('Contact email sending failed:', error);
    return { 
      success: false, 
      message: 'Failed to send message. Please contact me directly or try again later.' 
    };
  }
};

// General send email function (fallback for backward compatibility)
export const sendEmail = async (formData, isContactPage = false) => {
  if (isContactPage) {
    return sendContactEmail(formData);
  } else {
    return sendHomeEmail(formData);
  }
};