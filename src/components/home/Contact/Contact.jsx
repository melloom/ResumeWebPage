import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaLinkedin,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { 
  HOME_EMAIL_CONFIG,
  formatEmailParams
} from '../../../config/emailConfig';
import styles from './Contact.module.css';

// Get environment variables or use the config
const serviceId = HOME_EMAIL_CONFIG?.serviceId;
const templateId = HOME_EMAIL_CONFIG?.templateId;
const publicKey = HOME_EMAIL_CONFIG?.publicKey;
// Add definition for contactLayoutKey with a fallback value
const contactLayoutKey = import.meta.env.VITE_CONTACT_LAYOUT_KEY || 'standard';

// Function to use layout based on the layout key
const useContactLayout = () => {
  // Default to standard layout
  const [layout, setLayout] = useState('standard');

  useEffect(() => {
    // Only change layout if contactLayoutKey is defined and has a specific value
    if (contactLayoutKey === 'alternative') {
      setLayout('alternative');
    } else if (contactLayoutKey === 'minimal') {
      setLayout('minimal');
    }
    // Otherwise, it will use the default 'standard' layout
  }, []);

  return layout;
};

const Contact = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const layout = useContactLayout();

  // Scroll to section when directly accessing via URL hash
  useEffect(() => {
    if (window.location.hash === '#contact') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  // Initialize EmailJS with credentials from config
  useEffect(() => {
    try {
      if (publicKey) {
        emailjs.init(publicKey);
        console.log("EmailJS initialized successfully");
      } else {
        console.error("EmailJS Public Key is missing");
      }
    } catch (error) {
      console.error("EmailJS initialization error:", error);
    }
  }, []);

  // Disable mouse-following animations that cause glitches
  useEffect(() => {
    const contactSection = document.getElementById('contact');

    if (contactSection) {
      const disableMouseEffect = (e) => {
        e.stopPropagation();
      };

      contactSection.addEventListener('mousemove', disableMouseEffect, true);

      return () => {
        contactSection.removeEventListener('mousemove', disableMouseEffect, true);
      };
    }
  }, []);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.subject?.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.message?.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message is too short (minimum 10 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Check if email configuration is available
      if (!serviceId || !templateId || !publicKey) {
        console.error('Missing EmailJS configuration:', { serviceId, templateId, publicKey });
        throw new Error('Email configuration is incomplete. Please check your settings.');
      }

      // Format template parameters
      const templateParams = formatEmailParams({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      console.log('Sending email with params:', templateParams);
      console.log('Using service:', serviceId, 'template:', templateId);

      // Send the email
      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('EmailJS Response:', result);

      if (result.status === 200) {
        setSubmitResult({
          success: true,
          message: "Thank you for your message! I'll respond within 1-2 business days."
        });

        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(`Failed with status: ${result.status}`);
      }
    } catch (error) {
      console.error('Contact Form Error:', error);

      // More user-friendly error message
      setSubmitResult({
        success: false,
        message: "I'm having trouble sending your message right now. Please try again or reach out directly via email or phone."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Class names based on layout
  const getSectionClass = () => {
    if (layout === 'alternative') {
      return `${styles.contactSection} ${styles.alternativeLayout}`;
    } else if (layout === 'minimal') {
      return `${styles.contactSection} ${styles.minimalLayout}`;
    }
    return styles.contactSection;
  };

  return (
    <section className={getSectionClass()} id="contact">
      <div className="container">
        <div className={styles.contactHeader}>
          <h2 className={styles.contactTitle}>Get In Touch</h2>
          <div className={styles.contactTitleLine}></div>
          <p className={styles.contactSubtitle}>
            Interested in working together? Feel free to reach out using any of the methods below.
          </p>
          <Link
            to="/contact"
            className={styles.fullContactLink}
          >
            Visit full contact page <FaArrowRight />
          </Link>
        </div>

        <div className={styles.contactContent}>
          <div className={styles.contactInfoColumn}>
            <div className={styles.contactInfo}>
              <div className={styles.contactInfoHeader}>
                <h3>Contact Information</h3>
                <p>Reach out through any of these channels</p>
              </div>

              <div className={styles.contactCards}>
                <div className={styles.contactCard}>
                  <div className={styles.contactCardIcon}>
                    <FaEnvelope />
                  </div>
                  <div className={styles.contactCardContent}>
                    <h4>Email</h4>
                    <a href="mailto:Melvin.a.p.cruz@gmail.com">Melvin.a.p.cruz@gmail.com</a>
                  </div>
                </div>

                <div className={styles.contactCard}>
                  <div className={styles.contactCardIcon}>
                    <FaPhoneAlt />
                  </div>
                  <div className={styles.contactCardContent}>
                    <h4>Phone</h4>
                    <a href="tel:6672009784">(667) 200-9784</a>
                  </div>
                </div>

                <div className={styles.contactCard}>
                  <div className={styles.contactCardIcon}>
                    <FaMapMarkerAlt />
                  </div>
                  <div className={styles.contactCardContent}>
                    <h4>Location</h4>
                    <p>Laurel, MD 20708</p>
                  </div>
                </div>

                <div className={styles.contactCard}>
                  <div className={styles.contactCardIcon}>
                    <FaLinkedin />
                  </div>
                  <div className={styles.contactCardContent}>
                    <h4>LinkedIn</h4>
                    <a
                      href="https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Connect with me
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactFormColumn}>
            {submitResult && submitResult.success ? (
              <div className={styles.successMessage}>
                <FaCheck />
                {submitResult.message}
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={formErrors.name ? styles.errorInput : ''}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                  />
                  {formErrors.name && (
                    <p id="name-error" className={styles.errorText}>
                      <FaExclamationTriangle /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={formErrors.email ? styles.errorInput : ''}
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className={styles.errorText}>
                      <FaExclamationTriangle /> {formErrors.email}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={formErrors.subject ? styles.errorInput : ''}
                    aria-invalid={!!formErrors.subject}
                    aria-describedby={formErrors.subject ? "subject-error" : undefined}
                  />
                  {formErrors.subject && (
                    <p id="subject-error" className={styles.errorText}>
                      <FaExclamationTriangle /> {formErrors.subject}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={formErrors.message ? styles.errorInput : ''}
                    aria-invalid={!!formErrors.message}
                    aria-describedby={formErrors.message ? "message-error" : undefined}
                  ></textarea>
                  {formErrors.message && (
                    <p id="message-error" className={styles.errorText}>
                      <FaExclamationTriangle /> {formErrors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <FaPaperPlane className={styles.submitIcon} />}
                </button>

                {submitResult && !submitResult.success && (
                  <div className={styles.errorMessage}>
                    <FaExclamationTriangle /> {submitResult.message}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Add non-interactive glow effect that won't cause performance issues */}
      <div className={styles.glowOverlay} aria-hidden="true"></div>
    </section>
  );
};

export default Contact;