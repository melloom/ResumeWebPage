import React from 'react';
import { 
  FaTools, 
  FaUsers, 
  FaChartLine, 
  FaLaptopCode, 
  FaBrain
} from 'react-icons/fa';
import styles from './ResumeSkills.module.css';

const ResumeSkills = () => {
  // Define skill categories
  const skillCategories = [
    {
      category: "Sales & Marketing",
      icon: <FaChartLine />,
      skills: [
        { name: "Lead Generation", rating: 95 },
        { name: "Sales Strategy", rating: 90 },
        { name: "Customer Engagement", rating: 95 },
        { name: "Social Selling", rating: 85 },
        { name: "Sales Analytics", rating: 80 }
      ]
    },
    {
      category: "Leadership",
      icon: <FaUsers />,
      skills: [
        { name: "Team Management", rating: 85 },
        { name: "Performance Coaching", rating: 80 },
        { name: "Process Optimization", rating: 85 },
        { name: "Strategic Planning", rating: 80 },
        { name: "Conflict Resolution", rating: 75 }
      ]
    },
    {
      category: "Technical",
      icon: <FaLaptopCode />,
      skills: [
        { name: "CRM Systems", rating: 90 },
        { name: "MS Office", rating: 85 },
        { name: "Data Analysis", rating: 75 },
        { name: "HTML/CSS", rating: 70 },
        { name: "JavaScript", rating: 65 }
      ]
    },
    {
      category: "Soft Skills",
      icon: <FaBrain />,
      skills: [
        { name: "Communication", rating: 95 },
        { name: "Negotiation", rating: 90 },
        { name: "Problem Solving", rating: 85 },
        { name: "Adaptability", rating: 90 },
        { name: "Time Management", rating: 85 }
      ]
    }
  ];

  return (
    <section className={styles.skillsSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.titleIcon}><FaTools /></span>
        Skills & Expertise
      </h2>
      
      <div className={styles.skillsGrid}>
        {skillCategories.map((category, idx) => (
          <div className={styles.skillCategory} key={idx}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <h3 className={styles.categoryTitle}>{category.category}</h3>
            </div>
            
            <div className={styles.skillsList}>
              {category.skills.map((skill, i) => (
                <div className={styles.skillItem} key={i}>
                  <div className={styles.skillInfo}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillRating}>{skill.rating}%</span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${skill.rating}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.additionalSkills}>
        <h3 className={styles.additionalTitle}>Additional Skills</h3>
        <div className={styles.skillTags}>
          {[
            "Salesforce", "HubSpot", "Lead Nurturing", "Pipeline Management",
            "Customer Success", "Report Generation", "Training & Development",
            "Microsoft Dynamics", "Social Media", "Market Research",
            "Email Marketing", "Zoom", "Google Workspace", "Sales Automation",
            "Outbound Campaigns", "Contract Negotiation"
          ].map((skill, i) => (
            <span className={styles.skillTag} key={i}>{skill}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResumeSkills;
