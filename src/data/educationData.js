export const educationData = [
  {
    id: 'aacc',
    name: "Anne Arundel Community College",
    degree: "MBA in Business Administration and Management",
    period: "2023 - Present",
    location: "Arnold, MD",
    status: "Graduated",
    description: "Pursuing a comprehensive business education with focus on organizational leadership and strategic management. Specializing in sales optimization, client relationship management, and business development strategies.",
    achievements: [
      "Dean's List 2023-2024",
      "Student Ambassador Program participant",
      "Business Leadership Seminar Series attendee",
      "Sales Strategy Competition - 2nd Place"
    ],
    courses: [
      "Strategic Management",
      "Organizational Behavior",
      "Financial Analysis",
      "Marketing Strategy",
      "Business Ethics",
      "Sales Development",
      "Customer Relationship Management"
    ],
    image: "/images/school/aacc.jpg",
    color: "#0072CE" // School color
  },
  {
    id: 'cat-north',
    name: "Center of Applied Technology North",
    degree: "Technical Certification",
    period: "2018 - 2020",
    location: "Severn, Maryland",
    status: "Graduated",
    description: "Completed specialized technical education focused on practical skills and career preparation. Gained comprehensive training in business technology, client management systems, and professional communication.",
    achievements: [
      "Technical Excellence Award recipient",
      "Perfect Attendance Recognition",
      "Skills USA Competition participant",
      "Student Leadership Council representative"
    ],
    courses: [
      "Advanced Systems Administration",
      "Network Security",
      "Technical Support Fundamentals",
      "IT Infrastructure",
      "Business Communications",
      "Client Management Systems"
    ],
    projects: [
      "Advanced Computer Systems Assembly & Troubleshooting",
      "Network Configuration & Security Implementation",
      "Business Technology Integration Solutions",
      "Sales Tracking System Development"
    ],
    image: "/images/school/CentreAppliedTech.jpg",
    color: "#B22234" // School color
  },
  {
    id: 'meade',
    name: "Meade Senior High School",
    degree: "High School Diploma",
    period: "2016 - 2020",
    location: "Fort Meade, MD",
    status: "Graduated",
    description: "College preparatory education with honors coursework and technical specialization. Balanced academic excellence with active participation in sports and leadership activities.",
    achievements: [
      "Honor Roll Student 2018-2020",
      "Principal's Award for Academic Excellence",
      "Perfect Attendance Award",
      "Leadership Excellence Recognition"
    ],
    activities: [
      "Student Government Association - Class Representative",
      "Technology Club - Founding Member",
      "Varsity Basketball Team - Captain (2019-2020)",
      "Community Service Club - 100+ volunteer hours"
    ],
    sports: [
      "Varsity Basketball - Team Captain (2019-2020)",
      "Track & Field - Sprinter (2018-2020)",
      "Intramural Soccer"
    ],
    // Use EXACT file name with correct capitalization and spaces as found on disk
    image: "/images/school/Meade-High-school.jpg",
    // Add multiple fallback options
    imageFallbacks: [
      "/images/school/meade-high-school.jpg",
      "/images/school/meadehighschool.jpg",
      "/images/school/meade.jpg"
    ],
    color: "#2E3192" // School color
  }
];
