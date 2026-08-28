import type {
  CvData,
  CvSettings,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Project,
  Referee,
  CustomSection,
} from '@/types/cv';

export const uid = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

export const defaultSettings: CvSettings = {
  template: 'modern',
  accentColor: '#2563eb',
  fontFamily: 'Inter',
  fontSize: 13,
  sectionSpacing: 'normal',
  showReferees: true,
  refereesAvailableUponRequest: false,
};

export const createEmptyCv = (): CvData => ({
  personal: {
    fullName: '',
    professionalTitle: '',
    phone: '',
    email: '',
    location: '',
    linkedin: '',
    portfolio: '',
    photo: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  referees: [],
  interests: [],
  customSections: [],
  settings: { ...defaultSettings },
});

export const emptyExperience = (): Experience => ({
  id: uid(),
  jobTitle: '',
  company: '',
  location: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
  achievements: '',
});

export const emptyEducation = (): Education => ({
  id: uid(),
  institution: '',
  qualification: '',
  course: '',
  location: '',
  startYear: '',
  endYear: '',
  grade: '',
  description: '',
});

export const emptySkill = (name = ''): Skill => ({ id: uid(), name });

export const emptyLanguage = (): Language => ({
  id: uid(),
  name: '',
  proficiency: '',
});

export const emptyCertification = (): Certification => ({
  id: uid(),
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
});

export const emptyProject = (): Project => ({
  id: uid(),
  name: '',
  description: '',
  technologies: '',
  url: '',
});

export const emptyReferee = (): Referee => ({
  id: uid(),
  name: '',
  position: '',
  organization: '',
  phone: '',
  email: '',
});

export const emptyCustomSection = (): CustomSection => ({
  id: uid(),
  title: '',
  content: '',
});

/* Sample CV — used only for the Templates page preview and "Load sample" demo.
   Not loaded into a new user's CV automatically. */
export const sampleCv = (): CvData => ({
  personal: {
    fullName: 'Amani Wanjiru',
    professionalTitle: 'Customer Service Representative',
    phone: '+254 712 345 678',
    email: 'amani.wanjiru@email.com',
    location: 'Nairobi, Kenya',
    linkedin: 'linkedin.com/in/amaniwanjiru',
    portfolio: '',
    photo: '',
    summary:
      'Results-driven customer service professional with over 5 years of experience in telecommunications and retail. Skilled in M-Pesa operations, complaint resolution, and building lasting customer relationships. Proven track record of improving customer satisfaction scores across high-volume service centres in Nairobi.',
  },
  experience: [
    {
      id: uid(),
      jobTitle: 'Senior Customer Service Representative',
      company: 'Safaricom PLC',
      location: 'Nairobi, Kenya',
      employmentType: 'Full-time',
      startDate: '2021-03',
      endDate: '',
      currentlyWorking: true,
      description:
        'Manage customer escalations across voice, data, and M-Pesa product lines. Train new agents on CRM tools and service standards.',
      achievements:
        'Increased customer satisfaction (CSAT) from 78% to 92% over 12 months\nResolved 300+ M-Pesa transaction disputes per month\nMentored 6 junior agents, 3 of whom were promoted within a year',
    },
    {
      id: uid(),
      jobTitle: 'Customer Service Agent',
      company: 'ABC Enterprises Ltd',
      location: 'Nairobi, Kenya',
      employmentType: 'Full-time',
      startDate: '2018-06',
      endDate: '2021-02',
      currentlyWorking: false,
      description:
        'Handled inbound customer queries across retail and wholesale accounts. Maintained accurate records in the company CRM.',
      achievements:
        'Processed an average of 120 customer orders per day\nReduced average call handling time by 18%\nRecognised as Agent of the Quarter, Q2 2020',
    },
  ],
  education: [
    {
      id: uid(),
      institution: 'University of Nairobi',
      qualification: 'Degree',
      course: 'Bachelor of Commerce — Finance',
      location: 'Nairobi, Kenya',
      startYear: '2015',
      endYear: '2019',
      grade: 'Second Class Honours, Upper Division',
      description: '',
    },
    {
      id: uid(),
      institution: 'Kenya High School',
      qualification: 'KCSE',
      course: '',
      location: 'Nairobi, Kenya',
      startYear: '2011',
      endYear: '2014',
      grade: 'Mean Grade A- (79 points)',
      description: '',
    },
  ],
  skills: [
    emptySkill('M-Pesa Operations'),
    emptySkill('Customer Service'),
    emptySkill('Microsoft Excel'),
    emptySkill('Sales'),
    emptySkill('Complaint Resolution'),
    emptySkill('Communication'),
    emptySkill('Data Analysis'),
    emptySkill('Leadership'),
  ],
  languages: [
    { id: uid(), name: 'English', proficiency: 'Fluent' },
    { id: uid(), name: 'Kiswahili', proficiency: 'Native' },
  ],
  certifications: [
    {
      id: uid(),
      name: 'Safaricom Customer Excellence Certification',
      issuer: 'Safaricom PLC',
      issueDate: '2022-04',
      expiryDate: '',
      credentialId: 'SCE-2022-0451',
      credentialUrl: '',
    },
  ],
  projects: [
    {
      id: uid(),
      name: 'Agent Onboarding Playbook',
      description:
        'Authored a 40-page onboarding playbook now used across 3 regional service centres to standardise new-hire training.',
      technologies: 'Training Design, CRM, Process Documentation',
      url: '',
    },
  ],
  referees: [
    {
      id: uid(),
      name: 'James Otieno',
      position: 'Customer Experience Manager',
      organization: 'Safaricom PLC',
      phone: '+254 700 112 233',
      email: 'j.otieno@safaricom.co.ke',
    },
  ],
  interests: ['Reading business books', 'Community volunteering', 'Hiking'],
  customSections: [],
  settings: { ...defaultSettings },
});
