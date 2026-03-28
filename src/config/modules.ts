import { 
  LayoutDashboard, 
  Clock, 
  Network, 
  CalendarCheck, 
  Award, 
  Building2, 
  Users, 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  CalendarOff, 
  Bell, 
  DollarSign, 
  Target, 
  Laptop, 
  ClipboardList, 
  Megaphone, 
  FileText, 
  CircleDot, 
  MessageSquare, 
  Package, 
  Briefcase, 
  Receipt, 
  UsersRound, 
  ShoppingBag, 
  Settings
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

export interface SubItem {
  name: string;
  path: string;
}

export interface ModuleItem {
  name: string;
  icon: LucideIcon;
  path: string;
  hasDropdown?: boolean;
  subItems?: SubItem[];
}

export const employerModules: ModuleItem[] = [
  { name: 'DASHBOARD', icon: LayoutDashboard, path: '/super-admin/employer/dashboard' },
  { name: 'TIME TRACK', icon: Clock, path: '/super-admin/employer/time-track' },
  { 
    name: 'ORG CHART', 
    icon: Network, 
    path: '/super-admin/employer/org-chart', 
    hasDropdown: true,
    subItems: [
      { name: 'ORGANIZATION CHART', path: '/chart' },
      { name: 'COMPANY POLICY', path: '/policy' },
    ]
  },
  { name: 'ATTENDANCE', icon: CalendarCheck, path: '/super-admin/employer/attendance' },
  { name: 'AWARD', icon: Award, path: '/super-admin/employer/award' },
  { name: 'DEPARTMENT', icon: Building2, path: '/super-admin/employer/department' },
  { name: 'DESIGNATION', icon: Users, path: '/super-admin/employer/designation' },
  { name: 'EMPLOYEE', icon: Users, path: '/super-admin/employer/employee' },
  { 
    name: 'RECRUITMENT', 
    icon: UserPlus, 
    path: '/super-admin/employer/recruitment',
    hasDropdown: true,
    subItems: [
      { name: 'JOBS LIST', path: '/jobs-list' },
      { name: 'JOB POSTING', path: '/job-posting' },
      { name: 'VIEW POSTED JOBS', path: '/view-posted-jobs' },
      { name: 'SEARCH CANDIDATES', path: '/search-candidates' },
      { name: 'BULK CV UPLOAD', path: '/bulk-cv-upload' },
      { name: 'OFFER LETTERS', path: '/offer-letters' },
      { name: 'AGREEMENTS', path: '/agreements' },
      { name: 'CAREER PAGE', path: '/career-page' },
      { name: 'VIEW LIVE PAGE', path: '/view-live-page' },
    ]
  },
  { name: 'TRAINING', icon: Briefcase, path: '/super-admin/employer/training' },
  { 
    name: 'ONBOARDING', 
    icon: UserCheck, 
    path: '/super-admin/employer/onboarding',
    hasDropdown: true,
    subItems: [
      { name: 'OFFER LETTER', path: '/offer-letter' },
      { name: 'CONTACT LETTER', path: '/contact-letter' },
      { name: 'WARNING LETTER', path: '/warning-letter' },
      { name: 'TERMINATION LETTER', path: '/termination-letter' },
      { name: 'COMPLAINT LETTER', path: '/complaint-letter' },
    ]
  },
  { 
    name: 'OFFBOARDING', 
    icon: UserMinus, 
    path: '/super-admin/employer/offboarding',
    hasDropdown: true,
    subItems: [
      { name: 'RESIGNATION ACCEPTANCE LETTER', path: '/resignation-acceptance' },
      { name: 'TERMINATION LETTER', path: '/termination-letter' },
      { name: 'EXPERIENCE LETTER', path: '/experience-letter' },
      { name: 'RELIEVING LETTER', path: '/relieving-letter' },
      { name: 'FULL & FINAL SETTLEMENT (FNF)', path: '/fnf-settlement' },
      { name: 'NO DUES / CLEARANCE CERTIFICATE', path: '/no-dues' },
      { name: 'EXIT INTERVIEW FORM', path: '/exit-interview' },
      { name: 'NDA / CONFIDENTIALITY REMINDER', path: '/nda-reminder' },
    ]
  },
  { name: 'LEAVES', icon: CalendarOff, path: '/super-admin/employer/leaves' },
  { name: 'SHIFTS', icon: Clock, path: '/super-admin/employer/shifts' },
  { name: 'NOTICE BOARD', icon: Bell, path: '/super-admin/employer/notice-board' },
  { 
    name: 'PAYROLL', 
    icon: DollarSign, 
    path: '/super-admin/employer/payroll',
    hasDropdown: true,
    subItems: [
      { name: 'COMPANY PAYROLL', path: '/company-payroll' },
      { name: 'SALARY ADVANCE', path: '/salary-advance' },
      { name: 'SALARY GENERATE', path: '/salary-generate' },
      { name: 'MANAGE EMPLOYEE SALARY', path: '/manage-salary' },
      { name: 'SALES TAX FORMAT', path: '/sales-tax' },
    ]
  },
  { name: 'PERFORMANCE', icon: Target, path: '/super-admin/employer/performance' },
  { name: 'ASSETS', icon: Laptop, path: '/super-admin/employer/assets' },
  { name: 'EXPENSES', icon: Receipt, path: '/super-admin/employer/expenses' },
  { name: 'PROJECT MANAGEMENT', icon: ClipboardList, path: '/super-admin/employer/projects' },
  { name: 'MARKETING', icon: Megaphone, path: '/super-admin/employer/marketing' },
  { name: 'REPORTS', icon: FileText, path: '/super-admin/employer/reports' },
  { name: 'REWARD POINTS', icon: CircleDot, path: '/super-admin/employer/rewards' },
  { name: 'MESSAGE', icon: MessageSquare, path: '/super-admin/employer/message' },
  { name: 'SUPPLY CHAIN MANAGEMENT', icon: Package, path: '/super-admin/employer/supply-chain' },
  { name: 'PROCUREMENT', icon: Briefcase, path: '/super-admin/employer/procurement' },
  { name: 'ACCOUNTING', icon: Receipt, path: '/super-admin/employer/accounting' },
  { name: 'CRM', icon: UsersRound, path: '/super-admin/employer/crm' },
  { name: 'PURCHASE DEP', icon: ShoppingBag, path: '/super-admin/employer/purchase' },
  { 
    name: 'SETTINGS', 
    icon: Settings, 
    path: '/super-admin/employer/settings', 
    hasDropdown: true,
    subItems: [
      { name: 'GENERAL SETTINGS', path: '/general' },
      { name: 'GMAIL INTEGRATION', path: '/gmail' },
      { name: 'WHATSAPP INTEGRATION', path: '/whatsapp' },
      { name: 'RULES', path: '/rules' },
      { name: 'ROLES & PERMISSIONS', path: '/roles-permissions' },
      { name: 'MENU PERMISSIONS', path: '/menu-permissions' },
    ]
  },
];
