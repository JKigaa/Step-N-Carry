/* CV Chap — domain types for the CV data model */

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Volunteer'
  | 'Freelance';

export type EducationLevel =
  | 'KCSE'
  | 'Certificate'
  | 'Diploma'
  | 'Higher Diploma'
  | 'Degree'
  | 'Postgraduate Diploma'
  | "Master's"
  | 'PhD'
  | 'TVET'
  | 'Professional Certification'
  | 'Other';

export type LanguageProficiency = 'Basic' | 'Intermediate' | 'Fluent' | 'Native';

export type TemplateId = 'modern' | 'professional' | 'ats';

export type FontFamily = 'Inter' | 'Lato' | 'Merriweather' | 'Roboto Slab';

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: EmploymentType | '';
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  currentlyWorking: boolean;
  description: string;
  achievements: string; // newline separated
}

export interface Education {
  id: string;
  institution: string;
  qualification: EducationLevel | '';
  course: string;
  location: string;
  startYear: string;
  endYear: string;
  grade: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: LanguageProficiency | '';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string; // YYYY-MM
  expiryDate: string; // YYYY-MM
  credentialId: string;
  credentialUrl: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

export interface Referee {
  id: string;
  name: string;
  position: string;
  organization: string;
  phone: string;
  email: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  portfolio: string;
  photo: string; // data URL or empty
  summary: string;
}

export interface CvSettings {
  template: TemplateId;
  accentColor: string; // hex
  fontFamily: FontFamily;
  fontSize: number; // base px
  sectionSpacing: 'compact' | 'normal' | 'relaxed';
  showReferees: boolean;
  refereesAvailableUponRequest: boolean;
}

export interface CvData {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
  referees: Referee[];
  interests: string[];
  customSections: CustomSection[];
  settings: CvSettings;
}

export interface SavedState {
  cv: CvData;
  updatedAt: string;
}

export const STORAGE_KEY = 'cv-chap-data';
