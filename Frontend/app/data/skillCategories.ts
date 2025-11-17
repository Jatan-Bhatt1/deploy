import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";

export interface Skill {
  name: string;
  description?: string;
  icon?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  image: any;
  route: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "technical",
    title: "Technical & Digital Skills",
    description: "Skills related to computers, data, and technology.",
    color: "#B2E7C9",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.creative },
    route: "screens/batches/creative",
    skills: [
      { name: "Programming", description: "C++, Python, Java, etc." },
      { name: "Web Development", description: "HTML, CSS, JavaScript, React, etc." },
      { name: "Data Science & Machine Learning" },
      { name: "Artificial Intelligence (AI)" },
      { name: "Cybersecurity & Ethical Hacking" },
      { name: "Cloud Computing", description: "AWS, Azure, Google Cloud" },
      { name: "Blockchain Development" },
      { name: "App Development", description: "Android/iOS" },
      { name: "Robotics & IoT", description: "Internet of Things" },
      { name: "Game Development & AR/VR" }
    ]
  },
  {
    id: "engineering",
    title: "Engineering & Physical Sciences",
    description: "Skills involving design, creation, and application of scientific principles.",
    color: "#FFD6A5",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.mentorships },
    route: "screens/batches/mentorships",
    skills: [
      { name: "Electrical & Electronics Engineering" },
      { name: "Mechanical & Civil Engineering" },
      { name: "Chemical & Industrial Engineering" },
      { name: "Aerospace & Automobile Engineering" },
      { name: "Architecture & Structural Design" },
      { name: "Renewable Energy & Sustainability" },
      { name: "Manufacturing & Automation" },
      { name: "CAD/CAM & 3D Modeling" },
      { name: "Nanotechnology & Material Science" }
    ]
  },
  {
    id: "business",
    title: "Business, Finance & Management Skills",
    description: "Skills for leadership, organization, and economic understanding.",
    color: "#A7D8FF",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.music },
    route: "screens/batches/music",
    skills: [
      { name: "Business Strategy & Entrepreneurship" },
      { name: "Financial Analysis & Accounting" },
      { name: "Marketing & Digital Marketing" },
      { name: "Economics & Market Research" },
      { name: "Project Management", description: "Agile, Scrum" },
      { name: "Human Resource Management (HR)" },
      { name: "Supply Chain & Operations Management" },
      { name: "Sales & Negotiation" },
      { name: "Investment & Stock Market" },
      { name: "E-commerce & Business Analytics" }
    ]
  },
  {
    id: "creative",
    title: "Creative, Media & Communication Skills",
    description: "Skills for artistic, expressive, and media-related fields.",
    color: "#D0B3FF",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.studies },
    route: "screens/batches/studies",
    skills: [
      { name: "Graphic Design & Animation" },
      { name: "UI/UX Design" },
      { name: "Video Editing & Filmmaking" },
      { name: "Photography & Cinematography" },
      { name: "Music Production & Sound Engineering" },
      { name: "Writing & Storytelling" },
      { name: "Journalism & Public Relations" },
      { name: "Social Media Management" },
      { name: "Advertising & Branding" },
      { name: "Fashion Design & Interior Design" }
    ]
  },
  {
    id: "science",
    title: "Science, Health & Research Skills",
    description: "Skills focused on discovery, innovation, and human well-being.",
    color: "#FFF59D",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.competition },
    route: "screens/batches/competition",
    skills: [
      { name: "Biology, Chemistry, Physics" },
      { name: "Biotechnology & Genetics" },
      { name: "Medical & Healthcare Skills", description: "Nursing, Surgery, Diagnostics" },
      { name: "Psychology & Neuroscience" },
      { name: "Pharmaceutical Research" },
      { name: "Environmental Science & Ecology" },
      { name: "Food Science & Nutrition" },
      { name: "Epidemiology & Public Health" },
      { name: "Lab Research & Scientific Writing" }
    ]
  },
  {
    id: "personal",
    title: "Personal Development & Social Skills",
    description: "Skills that improve human interaction, mindset, and lifestyle.",
    color: "#F6A5C0",
    image: { uri: CLOUDINARY_ASSETS.CATEGORY_IMAGES.more },
    route: "screens/batches/more",
    skills: [
      { name: "Communication & Public Speaking" },
      { name: "Leadership & Teamwork" },
      { name: "Critical Thinking & Problem Solving" },
      { name: "Emotional Intelligence (EQ)" },
      { name: "Time Management & Productivity" },
      { name: "Negotiation & Persuasion" },
      { name: "Language Learning" },
      { name: "Teaching & Mentoring" },
      { name: "Stress Management & Mindfulness" },
      { name: "Ethics & Cultural Awareness" }
    ]
  }
];