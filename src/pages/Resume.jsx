import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaFileDownload } from 'react-icons/fa';
import SideNav from '../components/navigation/SideNav';
import BackToTop from '../components/common/BackToTop';
import MobileNavDrawer from '../components/navigation/MobileNavDrawer';
import ShareButton from '../components/common/ShareButton';
import ResumeHeader from '../components/Resume/header/ResumeHeader';
import ProfessionalSummary from '../components/Resume/ProfessionalSummary/ProfessionalSummary';
import ResumeSkills from '../components/Resume/ResumeSkills/ResumeSkills';
import ResumeExperience from '../components/Resume/ResumeExperience/ResumeExperience';
import ResumeEducation from '../components/Resume/ResumeEducation/ResumeEducation';
import ResumeCertifications from '../components/Resume/ResumeCertifications/ResumeCertifications';
import styles from './Resume.module.css';

const Resume = () => {
  // Reset scroll position on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Resume - Melvin Peralta | Full-Stack Developer & Sales Professional</title>
        <meta name="description" content="View Melvin Peralta's professional resume. Full-Stack Developer and Sales Development Professional with expertise in React, JavaScript, team leadership, client relationship management, and business development. Download PDF resume." />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="keywords" content="Melvin Peralta, Resume, CV, Full-Stack Developer, Sales Professional, Web Developer, React Developer, JavaScript, Professional Experience, Skills, Education, Download Resume" />
        <meta name="author" content="Melvin Peralta" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mellowsites.com/resume" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://mellowsites.com/resume" />
        <meta property="og:title" content="Resume - Melvin Peralta | Full-Stack Developer & Sales Professional" />
        <meta property="og:description" content="View Melvin Peralta's professional resume. Full-Stack Developer and Sales Development Professional with expertise in React, JavaScript, and business development." />
        <meta property="og:image" content="https://mellowsites.com/photo-1.jpg" />
        <meta property="og:site_name" content="Melvin Peralta Portfolio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/resume" />
        <meta name="twitter:title" content="Resume - Melvin Peralta | Full-Stack Developer & Sales Professional" />
        <meta name="twitter:description" content="View Melvin Peralta's professional resume. Full-Stack Developer and Sales Development Professional with expertise in React, JavaScript, and business development." />
        <meta name="twitter:image" content="https://mellowsites.com/photo-1.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Melvin Peralta",
            "url": "https://mellowsites.com/resume",
            "image": "https://mellowsites.com/photo-1.jpg",
            "jobTitle": "Full-Stack Developer & Sales Professional",
            "description": "Professional resume of Melvin Peralta - Full-Stack Developer and Sales Development Professional",
            "sameAs": [
              "https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215",
              "https://github.com/melloom"
            ],
            "knowsAbout": ["React", "JavaScript", "Web Development", "Sales Development", "Team Leadership", "HTML/CSS"],
            "hasOccupation": {
              "@type": "Occupation",
              "name": "Full-Stack Developer & Sales Professional",
              "skills": "React, JavaScript, Sales Development, Lead Generation, Client Relationship Management"
            }
          })}
        </script>
      </Helmet>

      <SideNav />
      <BackToTop />
      <MobileNavDrawer />

      {/* Action buttons - Download and Share Resume - Positioned at bottom right */}
      <div className={styles.stickyActions}>
        <a
          href="/images/school/Resume/Resume.pdf"
          download="Melvin_Peralta_Resume_UPDATED_optimized.pdf"
          className={styles.stickyDownload}
          aria-label="Download Resume PDF"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFileDownload />
          <span>Download CV</span>
        </a>

        {/* Share Resume Button with explicit icon rendering */}
        <ShareButton
          type="resume"
          className={styles.stickyShare}
          showLabel={true}
          title="Melvin Peralta | Professional Resume"
          text="Check out Melvin Peralta's professional resume!"
          forceShowIcon={true} // Add this prop to force icon display
        />
      </div>

      <main className={styles.resumePage} id="top">
        <div className={styles.resumeBackground}></div>

        <div className="container">
          <motion.div
            className={styles.resumeContainer}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Resume Header - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="resume-header">
              <ResumeHeader />
            </motion.div>

            {/* Professional Summary Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="summary">
              <ProfessionalSummary />
            </motion.div>

            {/* Experience Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="experience">
              <ResumeExperience />
            </motion.div>

            {/* Skills Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="skills">
              <ResumeSkills />
            </motion.div>

            {/* Education Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="education">
              <ResumeEducation />
            </motion.div>

            {/* Certifications Section - Ensure ID matches what SideNav expects */}
            <motion.div variants={sectionVariants} id="certifications">
              <ResumeCertifications />
            </motion.div>

            {/* Call to Action - Use a known ID */}
            <motion.div variants={sectionVariants} className={styles.resumeCta} id="contact">
              <p className={styles.ctaText}>
                Interested in discussing how my skills can contribute to your team?
              </p>
              <div className={styles.ctaButtons}>
                <a href="/contact" className={styles.ctaPrimary}>Contact Me</a>
                <a
                  href="/images/school/Resume/Resume.pdf"
                  download="Melvin_Peralta_Resume_UPDATED_optimized.pdf"
                  className={styles.ctaSecondary}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Resume;