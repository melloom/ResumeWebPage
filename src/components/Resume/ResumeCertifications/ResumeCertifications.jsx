import React from 'react';
import { 
  FaCertificate, 
  FaCalendarAlt, 
  FaBuilding, 
  FaAward, 
  FaLaptopCode,
  FaUserGraduate,
  FaToolbox,
  FaCode,
  FaServer,
  FaShieldAlt,
  FaDatabase,
  FaChartLine,
  FaDesktop,
  FaBrain,
  FaRocket,
  FaBook,
  FaLaptop,
  FaMobile,
  FaCloud,
  FaNetworkWired,
  FaUsers,
  FaHeadset,
  FaHandshake,
  FaComments,
  FaChalkboardTeacher
} from 'react-icons/fa';
import styles from './ResumeCertifications.module.css';

const ResumeCertifications = () => {
  // Enhanced certification data with a mix of difficulty levels and updated dates
  const allCertifications = [
    {
      id: 'comp-tia',
      title: 'CompTIA A+ Certification',
      issuer: 'CompTIA',
      status: 'In Progress',
      targetDate: 'Expected August 2025',
      description: 'Industry-standard certification validating comprehensive understanding of IT technical support, hardware, software troubleshooting, and networking fundamentals.',
      skills: ['Hardware', 'Troubleshooting', 'Operating Systems', 'Network Configuration', 'Security'],
      icon: <FaLaptopCode />,
      color: '#00A94F',
      planned: false,
      category: 'technical'
    },
    {
      id: 'google-it',
      title: 'Google IT Support Professional',
      issuer: 'Google via Coursera',
      status: 'In Progress',
      targetDate: 'Expected June 2025',
      description: 'Comprehensive program covering IT support, system administration, operating systems, networking, and security - designed by Google to prepare for entry-level IT roles.',
      skills: ['IT Support', 'System Administration', 'Networking', 'Troubleshooting', 'Cloud Computing'],
      icon: <FaDesktop />,
      color: '#4285F4',
      planned: false,
      category: 'technical'
    },
    {
      id: 'aws-cloud',
      title: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      status: 'Planned',
      targetDate: 'Q4 2025',
      description: 'Entry-level certification demonstrating understanding of AWS Cloud services, architecture, security, and billing - perfect for technical and non-technical roles.',
      skills: ['Cloud Computing', 'AWS Services', 'Cloud Architecture', 'Security Basics', 'Cost Management'],
      icon: <FaServer />,
      color: '#FF9900',
      planned: true,
      category: 'technical'
    },
    {
      id: 'meta-frontend',
      title: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Meta via Coursera',
      status: 'In Progress',
      targetDate: 'Expected July 2025',
      description: 'Comprehensive front-end development program created by Meta engineers covering React, JavaScript, HTML/CSS, and modern UI development practices.',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'UI/UX Principles', 'Web Development'],
      icon: <FaCode />,
      color: '#1877F2',
      planned: false,
      category: 'technical'
    },
    {
      id: 'microsoft-azure',
      title: 'Microsoft Azure Fundamentals (AZ-900)',
      issuer: 'Microsoft',
      status: 'Planned',
      targetDate: 'Q1 2026',
      description: 'Entry-level certification covering Azure cloud concepts, core services, security, privacy, compliance, pricing and support.',
      skills: ['Cloud Computing', 'Azure Services', 'Security Compliance', 'Azure Management', 'Cost Models'],
      icon: <FaShieldAlt />,
      color: '#0078D4',
      planned: true,
      category: 'technical'
    },
    {
      id: 'salesforce-admin',
      title: 'Salesforce Certified Administrator',
      issuer: 'Salesforce',
      status: 'Planned',
      targetDate: 'Q3 2025',
      description: 'Demonstrates expertise in administering and configuring Salesforce, managing users, data, and security while deploying apps from AppExchange.',
      skills: ['CRM Administration', 'User Management', 'Security Controls', 'Data Management', 'Reports & Dashboards'],
      icon: <FaDatabase />,
      color: '#00A1E0',
      planned: true,
      category: 'technical'
    },
    {
      id: 'sales-cert',
      title: 'Certified Sales Professional (CSP)',
      issuer: 'National Association of Sales Professionals',
      status: 'In Progress',
      targetDate: 'Expected May 2025',
      description: 'Professional certification focused on advanced sales techniques, ethical sales practices, and consultative selling approaches.',
      skills: ['Sales Strategy', 'Client Relationship Management', 'Consultative Selling', 'Negotiation', 'Business Development'],
      icon: <FaUserGraduate />,
      color: '#3666B0',
      planned: false,
      category: 'business'
    },
    {
      id: 'google-analytics',
      title: 'Google Analytics Certification',
      issuer: 'Google',
      status: 'Completed',
      targetDate: 'February 2025',
      description: 'Industry-recognized credential validating proficiency in digital analytics, web traffic data interpretation, and actionable business insights.',
      skills: ['Data Analysis', 'Web Analytics', 'User Behavior Tracking', 'Conversion Optimization', 'Reporting'],
      icon: <FaChartLine />,
      color: '#F4B400',
      planned: false,
      category: 'business'
    },
    // NEW: Customer Service Certifications
    {
      id: 'customer-service-prof',
      title: 'Certified Customer Service Professional',
      issuer: 'National Customer Service Association',
      status: 'In Progress',
      targetDate: 'Expected April 2025',
      description: 'Comprehensive certification recognizing excellence in customer service principles, conflict resolution, and effective communication strategies.',
      skills: ['Customer Support', 'Conflict Resolution', 'Communication', 'Problem Solving', 'Service Recovery'],
      icon: <FaHeadset />,
      color: '#E94F37',
      planned: false,
      category: 'customer-service'
    },
    {
      id: 'customer-experience',
      title: 'Customer Experience Management',
      issuer: 'Customer Experience Institute',
      status: 'Planned',
      targetDate: 'Q3 2025',
      description: 'Specialized program focused on designing and implementing exceptional customer experiences across multiple touchpoints and channels.',
      skills: ['Experience Design', 'Journey Mapping', 'Voice of Customer', 'Service Design', 'CX Strategy'],
      icon: <FaUsers />,
      color: '#44BBA4',
      planned: true,
      category: 'customer-service'
    },
    // NEW: Business & Leadership Certifications
    {
      id: 'project-management',
      title: 'Project Management Essentials',
      issuer: 'Project Management Institute',
      status: 'Planned',
      targetDate: 'Q2 2025',
      description: 'Foundation-level certification covering project management methodologies, team coordination, and resource planning fundamentals.',
      skills: ['Project Planning', 'Team Management', 'Resource Allocation', 'Timeline Development', 'Risk Management'],
      icon: <FaChalkboardTeacher />,
      color: '#3A6EA5',
      planned: true,
      category: 'business'
    },
    {
      id: 'business-communication',
      title: 'Professional Business Communication',
      issuer: 'American Management Association',
      status: 'In Progress',
      targetDate: 'Expected May 2025',
      description: 'Certification program focused on developing effective business communication skills for presentations, meetings, and professional correspondence.',
      skills: ['Presentation Skills', 'Written Communication', 'Interpersonal Communication', 'Active Listening', 'Meeting Management'],
      icon: <FaComments />,
      color: '#6C4F70',
      planned: false,
      category: 'business'
    },
    {
      id: 'negotiation-skills',
      title: 'Professional Negotiation Skills',
      issuer: 'Negotiation Institute',
      status: 'Planned',
      targetDate: 'Q4 2025',
      description: 'Advanced program focused on developing negotiation tactics, conflict resolution strategies, and win-win agreement skills.',
      skills: ['Negotiation Tactics', 'Conflict Resolution', 'Deal Structuring', 'Value Creation', 'Stakeholder Management'],
      icon: <FaHandshake />,
      color: '#F18F01',
      planned: true,
      category: 'business'
    }
  ];

  // Separate certifications by category and status
  const currentTechnicalCerts = allCertifications.filter(cert => !cert.planned && cert.category === 'technical');
  const currentBusinessCerts = allCertifications.filter(cert => !cert.planned && (cert.category === 'business' || cert.category === 'customer-service'));
  const plannedCertifications = allCertifications.filter(cert => cert.planned);

  // Define current tech learning focus areas
  const techLearningFocus = [
    {
      id: 'webdev',
      title: 'Full-Stack Web Development',
      description: 'Building skills in modern JavaScript frameworks including React, focusing on responsive design principles and progressive web applications.',
      icon: <FaCode />,
      progress: 65
    },
    {
      id: 'cloud',
      title: 'Cloud Computing Fundamentals',
      description: 'Learning core concepts of cloud infrastructure, focusing on AWS and Microsoft Azure platforms for scalable application deployment.',
      icon: <FaCloud />,
      progress: 40
    },
    {
      id: 'networking',
      title: 'IT Infrastructure & Networking',
      description: 'Gaining practical knowledge of network configurations, troubleshooting, and system administration for business environments.',
      icon: <FaNetworkWired />,
      progress: 75
    },
    {
      id: 'mobile',
      title: 'Mobile App Development',
      description: 'Exploring cross-platform development with React Native to create mobile applications for both iOS and Android platforms.',
      icon: <FaMobile />,
      progress: 25
    }
  ];
  
  // Define professional skills learning focus areas
  const businessLearningFocus = [
    {
      id: 'customer-experience',
      title: 'Customer Experience Excellence',
      description: 'Developing advanced strategies for creating exceptional customer journeys and building long-term client relationships.',
      icon: <FaUsers />,
      progress: 80
    },
    {
      id: 'leadership',
      title: 'Team Leadership & Management',
      description: 'Enhancing skills in team motivation, performance coaching, and creating collaborative work environments.',
      icon: <FaChalkboardTeacher />,
      progress: 65
    },
    {
      id: 'negotiation',
      title: 'Advanced Negotiation',
      description: 'Mastering complex negotiation scenarios, conflict resolution strategies, and collaborative problem-solving approaches.',
      icon: <FaHandshake />,
      progress: 60
    }
  ];

  return (
    <section className={styles.certificationsSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.titleIcon}><FaCertificate /></span>
        Certifications & Professional Development
      </h2>
      
      {/* Technical Certifications Grid */}
      <h3 className={styles.categoryTitle}>
        <FaLaptopCode className={styles.categoryIcon} />
        Technical Certifications
      </h3>
      <div className={styles.certificationCards}>
        {currentTechnicalCerts.map(cert => (
          <div key={cert.id} className={styles.certCard} style={{'--job-color': cert.color}}>
            <div className={styles.cardHeader} style={{background: cert.color}}>
              <div className={styles.cardIcon}>
                {cert.icon}
              </div>
              <div className={styles.statusBadge}>
                {cert.status}
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.certTitle}>{cert.title}</h3>
              <div className={styles.certMeta}>
                <div className={styles.metaItem}>
                  <FaBuilding className={styles.metaIcon} />
                  <span>{cert.issuer}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaCalendarAlt className={styles.metaIcon} />
                  <span>{cert.targetDate}</span>
                </div>
              </div>
              <div className={styles.certDescription}>
                <p>{cert.description}</p>
              </div>
              <div className={styles.skillsGrid}>
                {cert.skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Business & Customer Service Certifications Grid */}
      <h3 className={styles.categoryTitle}>
        <FaHandshake className={styles.categoryIcon} />
        Business & Customer Service Certifications
      </h3>
      <div className={styles.certificationCards}>
        {currentBusinessCerts.map(cert => (
          <div key={cert.id} className={styles.certCard} style={{'--job-color': cert.color}}>
            <div className={styles.cardHeader} style={{background: cert.color}}>
              <div className={styles.cardIcon}>
                {cert.icon}
              </div>
              <div className={styles.statusBadge}>
                {cert.status}
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.certTitle}>{cert.title}</h3>
              <div className={styles.certMeta}>
                <div className={styles.metaItem}>
                  <FaBuilding className={styles.metaIcon} />
                  <span>{cert.issuer}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaCalendarAlt className={styles.metaIcon} />
                  <span>{cert.targetDate}</span>
                </div>
              </div>
              <div className={styles.certDescription}>
                <p>{cert.description}</p>
              </div>
              <div className={styles.skillsGrid}>
                {cert.skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Learning Focus */}
      <div className={styles.techFocusSection}>
        <h3 className={styles.techFocusTitle}>
          <FaBrain className={styles.techFocusIcon} />
          Technical Learning Focus
        </h3>
        
        <div className={styles.techFocusGrid}>
          {techLearningFocus.map(focus => (
            <div key={focus.id} className={styles.techFocusCard}>
              <div className={styles.focusIconWrapper}>
                {focus.icon}
              </div>
              <div className={styles.focusContent}>
                <h4 className={styles.focusTitle}>{focus.title}</h4>
                <p className={styles.focusDescription}>{focus.description}</p>
                <div className={styles.progressWrapper}>
                  <div className={styles.progressLabel}>
                    <span>Learning Progress</span>
                    <span className={styles.progressPercentage}>{focus.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{width: `${focus.progress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Professional Skills Learning Focus */}
      <div className={styles.businessFocusSection}>
        <h3 className={styles.businessFocusTitle}>
          <FaUsers className={styles.businessFocusIcon} />
          Professional Skills Development
        </h3>
        
        <div className={styles.techFocusGrid}>
          {businessLearningFocus.map(focus => (
            <div key={focus.id} className={styles.businessFocusCard}>
              <div className={styles.businessIconWrapper}>
                {focus.icon}
              </div>
              <div className={styles.focusContent}>
                <h4 className={styles.focusTitle}>{focus.title}</h4>
                <p className={styles.focusDescription}>{focus.description}</p>
                <div className={styles.progressWrapper}>
                  <div className={styles.progressLabel}>
                    <span>Skill Proficiency</span>
                    <span className={styles.progressPercentage}>{focus.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.businessProgressFill} 
                      style={{width: `${focus.progress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planned Certifications Section */}
      <div className={styles.plannedCertsSection}>
        <h3 className={styles.plannedCertsTitle}>
          <FaRocket className={styles.titleIcon} />
          Certifications in My Learning Plan
        </h3>

        <div className={styles.plannedCertsGrid}>
          {plannedCertifications.map(cert => (
            <div key={cert.id} className={styles.plannedCertCard}>
              <div className={styles.plannedCertIcon} style={{color: cert.color}}>
                {cert.icon}
              </div>
              <div className={styles.plannedCertContent}>
                <h4 className={styles.plannedCertTitle}>{cert.title}</h4>
                <div className={styles.plannedCertInfo}>
                  <div className={styles.plannedCertIssuer}>
                    <FaBuilding className={styles.metaIcon} /> {cert.issuer}
                  </div>
                  <div className={styles.plannedCertDate}>
                    <FaCalendarAlt className={styles.metaIcon} /> {cert.targetDate}
                  </div>
                </div>
                <div className={styles.skillsGrid}>
                  {cert.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Development Section */}
        <div className={styles.profDevSection}>
          <h3 className={styles.profDevTitle}>Continuous Learning Resources</h3>
          <p className={styles.profDevIntro}>
            Beyond formal certifications, I continuously expand my skills through these platforms and resources:
          </p>
          <div className={styles.learningPathsGrid}>
            <div className={styles.learningPath}>
              <FaLaptop className={styles.pathIcon} />
              <div className={styles.pathContent}>
                <h4 className={styles.pathTitle}>Online Courses</h4>
                <p className={styles.pathDesc}>Coursera, Udemy, LinkedIn Learning, and freeCodeCamp for structured learning paths in both technical and business domains.</p>
              </div>
            </div>
            <div className={styles.learningPath}>
              <FaBook className={styles.pathIcon} />
              <div className={styles.pathContent}>
                <h4 className={styles.pathTitle}>Technical Documentation</h4>
                <p className={styles.pathDesc}>Official documentation, technical blogs, and industry publications to stay current with best practices and emerging technologies.</p>
              </div>
            </div>
            <div className={styles.learningPath}>
              <FaToolbox className={styles.pathIcon} />
              <div className={styles.pathContent}>
                <h4 className={styles.pathTitle}>Hands-on Projects</h4>
                <p className={styles.pathDesc}>Personal coding projects, open-source contributions, and practical workshops to apply theoretical knowledge in real-world scenarios.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeCertifications;
