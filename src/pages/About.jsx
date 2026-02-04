import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaUser, FaLaptopCode, FaBriefcase, FaGraduationCap, 
  FaHeart, FaTrophy, FaList, FaTools, FaChartLine,
  FaGlobeAmericas, FaGuitar, FaRunning, FaUserTie, FaLightbulb
} from 'react-icons/fa';
import BackToTop from '../components/common/BackToTop';
import AboutHero from '../components/about/AboutHero/AboutHero';
import AboutBio from '../components/about/AboutBio/AboutBio';
import AboutSkills from '../components/about/AboutSkills/AboutSkills';
import AboutInterests from '../components/about/AboutInterests/AboutInterests';
import AboutValues from '../components/about/AboutValues/AboutValues';
import AboutTimeline from '../components/about/AboutTimeline/AboutTimeline';
import AboutPersonality from '../components/about/AboutPersonality/AboutPersonality';
import AboutHobbies from '../components/about/AboutHobbies/AboutHobbies';
import styles from './About.module.css';

const About = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Bio sections data with more personal details
  const bioSections = [
    {
      title: "My Story",
      icon: <FaUserTie />,
      content: "I'm Melvin Peralta, a sales development professional with a passion for technology. Born and raised in Maryland, I've always been fascinated by the intersection of business and technology. My journey began in customer service, where I developed strong people skills that would later become invaluable in my sales career. Outside of work, I enjoy music production, outdoor activities, and continuously expanding my technical skills through web development projects."
    },
    {
      title: "Professional Background",
      icon: <FaBriefcase />,
      content: "My professional journey combines extensive experience in sales development with emerging skills in web development. I've consistently exceeded targets in revenue generation and lead conversion while building my technical skills through self-directed learning and practical projects. I take pride in my ability to understand client needs and develop solutions that drive business growth."
    },
    {
      title: "Education & Learning",
      icon: <FaGraduationCap />,
      content: "I have a strong foundation in business principles and sales methodologies, complemented by continuous learning in web development technologies. I'm a firm believer in lifelong education and regularly take online courses to expand my skillset. Currently, I'm focused on deepening my knowledge of React, JavaScript, and modern frontend development techniques."
    }
  ];

  // Enhanced skills data with proficiency levels
  const skillsCategories = [
    {
      category: "Sales & Business",
      skills: [
        { name: "Lead Generation", level: 95 },
        { name: "Client Relationship Management", level: 90 },
        { name: "Sales Strategy", level: 88 },
        { name: "Business Development", level: 85 },
        { name: "Contract Negotiation", level: 82 }
      ]
    },
    {
      category: "Technical",
      skills: [
        { name: "HTML/CSS", level: 85 },
        { name: "JavaScript", level: 75 },
        { name: "React", level: 70 },
        { name: "Git/GitHub", level: 65 },
        { name: "UI/UX Fundamentals", level: 60 }
      ]
    },
    {
      category: "Communication",
      skills: [
        { name: "Verbal Communication", level: 95 },
        { name: "Written Communication", level: 90 },
        { name: "Presentation Skills", level: 85 },
        { name: "Active Listening", level: 92 },
        { name: "Conflict Resolution", level: 80 }
      ]
    }
  ];

  // Values with detailed descriptions
  const values = [
    {
      title: "Continuous Growth",
      icon: <FaChartLine />,
      description: "I believe in constantly expanding my skills and knowledge. Every day presents an opportunity to learn something new, and I actively seek out challenges that push me beyond my comfort zone."
    },
    {
      title: "Integrity",
      icon: <FaUserTie />,
      description: "Honesty and transparency are fundamental to how I approach both personal and professional relationships. I believe in doing what's right, even when it's difficult."
    },
    {
      title: "Client-Centered",
      icon: <FaHeart />,
      description: "Understanding and meeting client needs is at the core of my approach. I take the time to deeply understand problems before proposing solutions, ensuring value delivery at every step."
    },
    {
      title: "Innovation",
      icon: <FaLightbulb />,
      description: "I embrace creative thinking and novel approaches to problem-solving. I believe that innovation comes from questioning established methods and being willing to experiment with new ideas."
    }
  ];

  // Enhanced timeline with more detailed events
  const timelineEvents = [
    {
      year: "2022",
      title: "Web Development Journey",
      description: "Started building websites with React and modern JavaScript while continuing to excel in my sales role. Completed several personal projects and began contributing to open source."
    },
    {
      year: "2021",
      title: "Sales Team Leadership",
      description: "Promoted to lead a team of 8 representatives, implementing innovative strategies that increased conversion rates by 35% and streamlined communication processes."
    },
    {
      year: "2019",
      title: "Sales Excellence Award",
      description: "Recognized for generating over $10M in revenue through strategic client engagement and relationship building. Developed new outreach techniques that were adopted company-wide."
    },
    {
      year: "2018",
      title: "Advanced Sales Training",
      description: "Completed specialized training in consultative selling and complex sales methodologies. Started mentoring new sales representatives."
    },
    {
      year: "2016",
      title: "Career Start",
      description: "Began professional journey in sales development, quickly establishing myself as a top performer through dedication and a natural ability to connect with clients."
    }
  ];

  // Add personality traits section
  const personalityTraits = [
    {
      trait: "Ambitious",
      description: "I set high goals for myself and work persistently to achieve them, constantly pushing boundaries of what's possible."
    },
    {
      trait: "Adaptable",
      description: "I thrive in changing environments and view challenges as opportunities to develop new approaches and solutions."
    },
    {
      trait: "Analytical",
      description: "I approach problems methodically, breaking down complex issues into manageable components to find effective solutions."
    },
    {
      trait: "Empathetic",
      description: "I genuinely care about understanding others' perspectives, which helps me build strong relationships and trust."
    }
  ];

  // Detailed hobbies with descriptions
  const hobbies = [
    {
      name: "Music Production",
      icon: <FaGuitar />,
      description: "I create electronic and hip-hop beats in my home studio, experimenting with different sounds and production techniques."
    },
    {
      name: "Hiking & Nature",
      icon: <FaGlobeAmericas />,
      description: "Exploring trails around Maryland helps me disconnect and recharge. I try to discover a new trail at least once a month."
    },
    {
      name: "Fitness",
      icon: <FaRunning />,
      description: "I maintain a regular workout routine focusing on strength training and cardio to stay energized and focused."
    },
    {
      name: "Cooking",
      icon: <FaList />,
      description: "I enjoy experimenting with international cuisines and perfecting recipes that bring friends and family together."
    }
  ];

  // Enhanced interests with technologies and areas of focus
  const interests = [
    "Frontend Web Development", "UX/UI Design", "Digital Marketing", 
    "Sales Technology Integration", "Automation Tools", "Data Visualization", 
    "Public Speaking", "Leadership Development", "Business Strategy", 
    "Tech Industry Trends", "SaaS Solutions", "CRM Systems",
    "AI in Sales", "Productivity Methods", "Personal Finance"
  ];

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Check if navigation flagged for scrolling
      const needsScroll = sessionStorage.getItem('forceScrollTopAbout') === 'true';
      if (needsScroll) {
        window.scrollTo(0, 0);
        sessionStorage.removeItem('forceScrollTopAbout');
      }
      
      // Check for anchor navigation
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>About Me - Melvin Peralta | Full-Stack Developer & Sales Professional</title>
        <meta name="description" content="Learn about Melvin Peralta - a Full-Stack Developer and Sales Development Professional. Discover my background, skills, values, personality, and professional journey in technology and business." />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="keywords" content="Melvin Peralta, About Me, Full-Stack Developer, Sales Professional, Web Developer, React Developer, JavaScript, Maryland, Professional Background, Skills, Experience" />
        <meta name="author" content="Melvin Peralta" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mellowsites.com/about" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://mellowsites.com/about" />
        <meta property="og:title" content="About Me - Melvin Peralta | Full-Stack Developer & Sales Professional" />
        <meta property="og:description" content="Learn about Melvin Peralta - a Full-Stack Developer and Sales Development Professional. Discover my background, skills, values, and professional journey." />
        <meta property="og:image" content="https://mellowsites.com/photo-1.jpg" />
        <meta property="og:site_name" content="Melvin Peralta Portfolio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/about" />
        <meta name="twitter:title" content="About Me - Melvin Peralta | Full-Stack Developer & Sales Professional" />
        <meta name="twitter:description" content="Learn about Melvin Peralta - a Full-Stack Developer and Sales Development Professional. Discover my background, skills, and professional journey." />
        <meta name="twitter:image" content="https://mellowsites.com/photo-1.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Melvin Peralta",
            "url": "https://mellowsites.com/about",
            "image": "https://mellowsites.com/photo-1.jpg",
            "jobTitle": "Full-Stack Developer & Sales Professional",
            "description": "Full-Stack Developer and Sales Development Professional with expertise in React, JavaScript, and business development",
            "sameAs": [
              "https://www.linkedin.com/in/melvin-peralta-de-la-cruz-077557215",
              "https://github.com/melloom"
            ],
            "knowsAbout": ["React", "JavaScript", "Web Development", "Sales Development", "Lead Generation", "HTML/CSS"]
          })}
        </script>
      </Helmet>
      
      <main className={styles.aboutPage}>
        <BackToTop />
      
      {/* Hero Section */}
      <section id="about-hero" className={styles.section}>
        <AboutHero />
      </section>
      
      {/* Bio Section */}
      <section id="about-bio" className={`${styles.section} ${styles.bioSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaUser /></span>
            About Me
          </h2>
          <AboutBio sections={bioSections} />
        </div>
      </section>
      
      {/* Personality Traits Section */}
      <section id="about-personality" className={`${styles.section} ${styles.personalitySection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaUserTie /></span>
            My Personality
          </h2>
          <AboutPersonality traits={personalityTraits} />
        </div>
      </section>
      
      {/* Skills Section */}
      <section id="about-skills" className={`${styles.section} ${styles.skillsSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaTools /></span>
            Skills & Expertise
          </h2>
          <AboutSkills categories={skillsCategories} />
        </div>
      </section>
      
      {/* Values Section */}
      <section id="about-values" className={`${styles.section} ${styles.valuesSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaHeart /></span>
            My Values
          </h2>
          <AboutValues values={values} />
        </div>
      </section>
      
      {/* Hobbies Section */}
      <section id="about-hobbies" className={`${styles.section} ${styles.hobbiesSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaHeart /></span>
            Hobbies & Pastimes
          </h2>
          <AboutHobbies hobbies={hobbies} />
        </div>
      </section>
      
      {/* Timeline Section */}
      <section id="about-timeline" className={`${styles.section} ${styles.timelineSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaList /></span>
            My Journey
          </h2>
          <AboutTimeline events={timelineEvents} />
        </div>
      </section>
      
      {/* Interests Section */}
      <section id="about-interests" className={`${styles.section} ${styles.interestsSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}><FaLaptopCode /></span>
            Professional Interests
          </h2>
          <AboutInterests interests={interests} />
        </div>
      </section>
    </main>
    </>
  );
};

export default About;