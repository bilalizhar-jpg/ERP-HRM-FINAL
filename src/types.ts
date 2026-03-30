export interface User {
  id: number;
  name: string;
  email: string;
  company_id?: number;
  role?: string;
  profile_picture?: string;
  isGuest?: boolean;
  chat_id?: number;
}

export interface Employee extends User {
  employee_id: string;
  department: string;
  designation: string;
  status: string;
  mobile_no: string;
  date_of_birth: string;
  joining_date: string;
  blood_group: string;
  location: string;
  city: string;
  employee_type: string;
  national_id: string;
  salary: number;
  tax_deduction: number;
  bank_name: string;
  bank_account_no: string;
  mode_of_payment: string;
  username: string;
  phone?: string;
  address?: string;
  custom_fields: Record<string, unknown>;
  created_at: string;
}

export interface Shift {
  id: string;
  name: string;
  type: 'Day' | 'Night';
  status: 'Active' | 'Inactive';
  start_time: string;
  end_time: string;
  break_duration: number;
  grace_period: number;
  description: string;
}

export interface AttendanceRecord {
  id: number;
  company_id: number;
  employee_id: number;
  shift_id?: number;
  date: string;
  date_str?: string;
  check_in?: string;
  check_out?: string;
  break_time?: number;
  status: string;
  is_late: boolean;
  working_hours?: number;
  overtime_hours?: number;
  created_at: string;
}
