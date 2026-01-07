import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './ContactFAQ.module.css';

const ContactFAQ = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };
  
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button 
        className={styles.faqQuestion}
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <div className={styles.faqIcon}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>
      
      <div 
        className={styles.faqAnswer}
        style={{ maxHeight: isOpen ? '200px' : '0' }}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
};

export default ContactFAQ;
