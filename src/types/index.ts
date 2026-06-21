export type UserRole = 'student' | 'teacher' | 'school_admin' | 'super_admin';

export interface School {
  id: string;
  name: string;
  subdomain?: string;
  logo_url?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  school_id: string | null;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  employee_id?: string;
  bio?: string;
  specialization?: string[];
  profile?: Profile;
}

export interface Parent {
  id: string;
  school_id: string;
  profile?: Profile;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  room_number?: string;
  created_at: string;
}

export interface Section {
  id: string;
  class_id: string;
  school_id: string;
  name: string;
  teacher_id?: string;
  created_at: string;
  class?: Class;
  teacher?: Teacher;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
}

export interface Student {
  id: string;
  school_id: string;
  student_id?: string;
  class_id?: string;
  section_id?: string;
  parent_id?: string;
  xp: number;
  level: number;
  streak_days: number;
  last_active?: string;
  profile?: Profile;
  class?: Class;
  section?: Section;
}

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  school_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive';
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface Attendance {
  id: string;
  school_id: string;
  student_id: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by?: string;
  remarks?: string;
  created_at: string;
  student?: Student;
}

export interface Homework {
  id: string;
  school_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  attachment_urls?: string[];
  due_date: string;
  max_marks: number;
  created_at: string;
  subject?: Subject;
  section?: Section;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  school_id: string;
  submitted_at: string;
  submission_text?: string;
  file_urls?: string[];
  marks_obtained?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  status: 'submitted' | 'graded' | 'late' | 'pending';
  student?: Student;
  homework?: Homework;
}

export interface Exam {
  id: string;
  school_id: string;
  section_id: string;
  subject_id: string;
  title: string;
  exam_date: string;
  max_marks: number;
  weightage: number;
  subject?: Subject;
  section?: Section;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  school_id: string;
  marks_obtained: number;
  remarks?: string;
  graded_by?: string;
  graded_at: string;
  student?: Student;
  exam?: Exam;
}

export interface Announcement {
  id: string;
  school_id: string;
  title: string;
  content: string;
  created_by: string;
  target_roles: UserRole[];
  created_at: string;
  creator?: Profile;
}

export interface Notification {
  id: string;
  school_id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type?: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  school_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  join_url: string;
  platform: 'Zoom' | 'Google Meet';
  scheduled_at: string;
  duration_minutes: number;
  is_live: boolean;
  subject?: Subject;
  section?: Section;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  requirement_type: string;
  requirement_value: number;
}

export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface AIReport {
  id: string;
  school_id: string;
  student_id?: string;
  report_type: 'risk_analysis' | 'parent_summary' | 'school_health';
  content: any; // Structured JSON matching the report schemas
  created_at: string;
}
