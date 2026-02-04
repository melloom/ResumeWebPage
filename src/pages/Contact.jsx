import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ShareButton from '../components/common/ShareButton';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaQuestionCircle, FaGlobe } from 'react-icons/fa';
import ContactHero from '../components/contact/ContactHero/ContactHero';
import ContactForm from '../components/contact/ContactForm/ContactForm';
import ContactInfo from '../components/contact/ContactInfo/ContactInfo';
import ContactFAQ from '../components/contact/ContactFAQ/ContactFAQ';
import BackToTop from '../components/common/BackToTop';
import styles from './Contact.module.css';

const Contact = () => {
  const [isFastTransition, setIsFastTransition] = useState(false);

  // Contact information data
  const contactMethods = [
    {
      id: 'email',
      icon: <FaEnvelope />,
      title: 'Email',
      value: 'Melvin.a.p.cruz@gmail.com',
      link: 'mailto:Melvin.a.p.cruz@gmail.com',
      description: 'For any inquiries, feel free to email me'
    },
    {
      id: 'phone',
      icon: <FaPhone />,
      title: 'Phone',
      value: '(667) 200-9784',
      link: 'tel:6672009784',
      description: 'Available Monday-Friday, 9am-5pm ET'
    },
    {
      id: 'location',
      icon: <FaMapMarkerAlt />,
      title: 'Location',
      value: 'Maryland, USA',
      description: 'Currently based in Maryland'
    },
    {
      id: 'socialhub',
      icon: <FaGlobe />,
      title: 'Social Hub',
      value: 'MelHub.bio',
      link: 'https://melhub.bio/',
      description: 'Access all my social media links in one place'
    },
    {
      id: 'linkedin',
      icon: <FaLinkedin />,
      title: 'LinkedIn',
      value: 'Connect on LinkedIn',
      link: 'https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215',
      description: 'Let\'s connect professionally'
    },
    {
      id: 'github',
      icon: <FaGithub />,
      title: 'GitHub',
      value: 'View my repositories',
      link: 'https://github.com/melloom',
      description: 'Check out my coding projects'
    }
  ];
  
  // FAQ data
  const faqs = [
    {
      question: 'What services do you offer?',
      answer: 'I specialize in sales development, lead generation, and team leadership in sales environments. I also have emerging skills in web development, particularly with React and frontend technologies.'
    },
    {
      question: 'What is your availability?',
      answer: 'I am currently available for both part-time and full-time opportunities in sales development and entry-level web development roles.'
    },
    {
      question: 'How quickly do you respond to inquiries?',
      answer: 'I typically respond to all messages within 24-48 hours during business days. Urgent inquiries are addressed as promptly as possible.'
    },
    {
      question: 'Do you work remotely or onsite?',
      answer: 'I am open to both remote and onsite positions, with a preference for hybrid arrangements that combine the best of both worlds.'
    },
    {
      question: 'What makes you different from other professionals?',
      answer: 'My unique combination of sales expertise and technical skills allows me to bridge the gap between business development and technical implementation, making me especially valuable for roles that require both client-facing skills and technical understanding.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Me - Melvin Peralta | Get In Touch</title>
        <meta name="description" content="Get in touch with Melvin Peralta - Full-Stack Developer and Sales Development Professional. Available for freelance projects, job opportunities, and collaborations. Contact via email, phone, or LinkedIn." />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="keywords" content="Melvin Peralta, Contact, Email, LinkedIn, Hire Developer, Freelance Developer, Web Developer, Sales Professional, Maryland Developer, Contact Form" />
        <meta name="author" content="Melvin Peralta" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mellowsites.com/contact" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mellowsites.com/contact" />
        <meta property="og:title" content="Contact Me - Melvin Peralta | Get In Touch" />
        <meta property="og:description" content="Get in touch with Melvin Peralta - Full-Stack Developer and Sales Development Professional. Available for freelance projects, job opportunities, and collaborations." />
        <meta property="og:image" content="https://mellowsites.com/photo-1.jpg" />
        <meta property="og:site_name" content="Melvin Peralta Portfolio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/contact" />
        <meta name="twitter:title" content="Contact Me - Melvin Peralta | Get In Touch" />
        <meta name="twitter:description" content="Get in touch with Melvin Peralta - Full-Stack Developer and Sales Development Professional. Available for freelance projects and job opportunities." />
        <meta name="twitter:image" content="https://mellowsites.com/photo-1.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Melvin Peralta",
            "description": "Get in touch with Melvin Peralta for freelance projects, job opportunities, and collaborations",
            "url": "https://mellowsites.com/contact",
            "mainEntity": {
              "@type": "Person",
              "name": "Melvin Peralta",
              "email": "Melvin.a.p.cruz@gmail.com",
              "telephone": "+1-667-200-9784",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Maryland",
                "addressCountry": "US"
              }
            }
          })}
        </script>
      </Helmet>

      {/* Sticky Share Button */}
      <div className={styles.stickyActions}>
        <ShareButton 
          type="page" 
          className={styles.stickyShare} 
          showLabel={true}
          title="Melvin Peralta | Contact"
          text="Connect with Melvin Peralta!"
        />
      </div>
      
      <main className={styles.contactPage} id="top">
        <BackToTop />
        
        {/* Hero Section */}
        <section id="top" className={styles.section}>
          <ContactHero />
        </section>
        
        {/* Contact Information Section */}
        <section id="contact-info" className={`${styles.section} ${styles.infoSection}`}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}><FaMapMarkerAlt /></span>
              Contact Information
            </h2>
            <div className={styles.contactCardsGrid}>
              {contactMethods.map(method => (
                <ContactInfo 
                  key={method.id}
                  icon={method.icon}
                  title={method.title}
                  value={method.value}
                  link={method.link}
                  description={method.description}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Form Section */}
        <section id="contact-form" className={`${styles.section} ${styles.formSection}`}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}><FaEnvelope /></span>
              Send Me a Message
            </h2>
            <div className={styles.formContainer}>
              <ContactForm isContactPage={true} />
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}><FaQuestionCircle /></span>
              Frequently Asked Questions
            </h2>
            <div className={styles.faqContainer}>
              {faqs.map((faq, index) => (
                <ContactFAQ 
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;