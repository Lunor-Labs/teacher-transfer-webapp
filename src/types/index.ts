export interface User {
  uid: string;
  email?: string;
  phoneNumber?: string;
  nicNumber: string; // Hidden field for duplicate prevention
  fullName: string;
  subject: string;
  mediumOfInstruction: 'Sinhala' | 'Tamil' | 'English';
  currentProvince: string;
  currentDistrict: string;
  currentSchool: string;
  desiredProvince: string;
  desiredDistrict: string;
  gradeTaught: string;
  schoolType: 'National' | 'Provincial';
  whatsappNumber: string;
  hideContact: boolean;
  isAdmin?: boolean;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Language {
  code: 'en' | 'si' | 'ta';
  name: string;
  flag: string;
}

export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userSchool: string;
  userDistrict: string;
  message: string;
  isApproved: boolean;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}