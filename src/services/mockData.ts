import type { 
  School, Profile, Teacher, Student, Parent, Class, Section, 
  Subject, Enrollment, Attendance, Homework, HomeworkSubmission, 
  Exam, ExamResult, Announcement, Notification, Meeting, Badge, StudentBadge, AttendanceStatus 
} from '../types';

// Let's create mock schools
export const mockSchools: School[] = [
  {
    id: 'school-alabaster',
    name: 'Alabaster Academy',
    subdomain: 'alabaster',
    logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=100&q=80',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  {
    id: 'school-deepforest',
    name: 'Deep Forest Institute',
    subdomain: 'deepforest',
    logo_url: 'https://images.unsplash.com/photo-1588072405306-7d8fa9e8f13a?auto=format&fit=crop&w=100&q=80',
    created_at: new Date(2025, 0, 1).toISOString()
  }
];

// Mock Profiles mapping to auth.users
export const mockProfiles: Profile[] = [
  // Super Admin
  {
    id: 'user-superadmin',
    school_id: null,
    first_name: 'Genevieve',
    last_name: 'Vance',
    email: 'superadmin@teachersdesk.ai',
    phone: '+1 (555) 010-0000',
    role: 'super_admin',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Genevieve',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  // Alabaster Academy Admin
  {
    id: 'user-admin-alabaster',
    school_id: 'school-alabaster',
    first_name: 'Arthur',
    last_name: 'Pendleton',
    email: 'admin@alabaster.edu',
    phone: '+1 (555) 010-1111',
    role: 'school_admin',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  // Deep Forest Admin
  {
    id: 'user-admin-deepforest',
    school_id: 'school-deepforest',
    first_name: 'Diana',
    last_name: 'Forest',
    email: 'admin@deepforest.edu',
    phone: '+1 (555) 010-2222',
    role: 'school_admin',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Diana',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  // Teachers
  {
    id: 'user-teacher-sarah',
    school_id: 'school-alabaster',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.jenkins@alabaster.edu',
    phone: '+1 (555) 020-0001',
    role: 'teacher',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  {
    id: 'user-teacher-robert',
    school_id: 'school-alabaster',
    first_name: 'Robert',
    last_name: 'Carter',
    email: 'robert.carter@alabaster.edu',
    phone: '+1 (555) 020-0002',
    role: 'teacher',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Robert',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  // Parents
  {
    id: 'user-parent-mark',
    school_id: 'school-alabaster',
    first_name: 'Mark',
    last_name: 'Mercer',
    email: 'parent.mercer@alabaster.edu',
    phone: '+1 (555) 030-0001',
    role: 'student', // Parents log into standard auth but resolving links them
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mark',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  // Students
  {
    id: 'user-student-alex',
    school_id: 'school-alabaster',
    first_name: 'Alex',
    last_name: 'Mercer',
    email: 'student.alex@alabaster.edu',
    phone: '+1 (555) 040-0001',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  {
    id: 'user-student-lily',
    school_id: 'school-alabaster',
    first_name: 'Lily',
    last_name: 'Chen',
    email: 'student.lily@alabaster.edu',
    phone: '+1 (555) 040-0002',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lily',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  {
    id: 'user-student-jordan',
    school_id: 'school-alabaster',
    first_name: 'Jordan',
    last_name: 'Sparks',
    email: 'student.jordan@alabaster.edu',
    phone: '+1 (555) 040-0003',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jordan',
    created_at: new Date(2025, 0, 1).toISOString()
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: 'user-teacher-sarah',
    school_id: 'school-alabaster',
    employee_id: 'EMP-001',
    bio: 'Mathematics teacher with 10+ years of experience in algebra and geometry.',
    specialization: ['Mathematics', 'Statistics']
  },
  {
    id: 'user-teacher-robert',
    school_id: 'school-alabaster',
    employee_id: 'EMP-002',
    bio: 'Science enthusiast teaching biology and chemistry with interactive lab designs.',
    specialization: ['Physics', 'Chemistry', 'Biology']
  }
];

export const mockParents: Parent[] = [
  {
    id: 'user-parent-mark',
    school_id: 'school-alabaster'
  }
];

export const mockClasses: Class[] = [
  {
    id: 'class-10',
    school_id: 'school-alabaster',
    name: 'Grade 10',
    room_number: 'Room 304',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  {
    id: 'class-11',
    school_id: 'school-alabaster',
    name: 'Grade 11',
    room_number: 'Room 306',
    created_at: new Date(2025, 0, 1).toISOString()
  }
];

export const mockSections: Section[] = [
  {
    id: 'section-10a',
    class_id: 'class-10',
    school_id: 'school-alabaster',
    name: 'Section A',
    teacher_id: 'user-teacher-sarah',
    created_at: new Date(2025, 0, 1).toISOString()
  },
  {
    id: 'section-10b',
    class_id: 'class-10',
    school_id: 'school-alabaster',
    name: 'Section B',
    teacher_id: 'user-teacher-robert',
    created_at: new Date(2025, 0, 1).toISOString()
  }
];

export const mockSubjects: Subject[] = [
  { id: 'subj-math', school_id: 'school-alabaster', name: 'Mathematics', code: 'MATH101' },
  { id: 'subj-science', school_id: 'school-alabaster', name: 'General Science', code: 'SCI101' },
  { id: 'subj-history', school_id: 'school-alabaster', name: 'World History', code: 'HIST101' }
];

export const mockStudents: Student[] = [
  {
    id: 'user-student-alex',
    school_id: 'school-alabaster',
    student_id: 'STU-001',
    class_id: 'class-10',
    section_id: 'section-10a',
    parent_id: 'user-parent-mark',
    xp: 1450,
    level: 4,
    streak_days: 12,
    last_active: new Date().toISOString().split('T')[0]
  },
  {
    id: 'user-student-lily',
    school_id: 'school-alabaster',
    student_id: 'STU-002',
    class_id: 'class-10',
    section_id: 'section-10a',
    parent_id: null as any,
    xp: 2200,
    level: 6,
    streak_days: 28,
    last_active: new Date().toISOString().split('T')[0]
  },
  {
    id: 'user-student-jordan',
    school_id: 'school-alabaster',
    student_id: 'STU-003',
    class_id: 'class-10',
    section_id: 'section-10a',
    parent_id: null as any,
    xp: 680,
    level: 2,
    streak_days: 0,
    last_active: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0] // 3 days ago, potential risk
  }
];

export const mockEnrollments: Enrollment[] = [
  { id: 'enroll-1', student_id: 'user-student-alex', section_id: 'section-10a', school_id: 'school-alabaster', enrolled_at: '2025-09-01', status: 'active' },
  { id: 'enroll-2', student_id: 'user-student-lily', section_id: 'section-10a', school_id: 'school-alabaster', enrolled_at: '2025-09-01', status: 'active' },
  { id: 'enroll-3', student_id: 'user-student-jordan', section_id: 'section-10a', school_id: 'school-alabaster', enrolled_at: '2025-09-01', status: 'active' }
];

// Seed some attendance records for the past 14 days
const generateMockAttendance = (): Attendance[] => {
  const records: Attendance[] = [];
  const studentIds = ['user-student-alex', 'user-student-lily', 'user-student-jordan'];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const dateString = d.toISOString().split('T')[0];
    
    studentIds.forEach(sid => {
      let status: AttendanceStatus = 'Present';
      
      if (sid === 'user-student-jordan') {
        // Jordan has high absences
        const rand = Math.random();
        status = rand < 0.6 ? 'Present' : rand < 0.85 ? 'Absent' : 'Late';
      } else if (sid === 'user-student-alex') {
        const rand = Math.random();
        status = rand < 0.9 ? 'Present' : 'Late';
      } else {
        // Lily is perfect
        status = 'Present';
      }
      
      records.push({
        id: `att-${sid}-${dateString}`,
        school_id: 'school-alabaster',
        student_id: sid,
        section_id: 'section-10a',
        date: dateString,
        status,
        marked_by: 'user-teacher-sarah',
        remarks: status !== 'Present' ? 'Calculated automatically' : '',
        created_at: new Date().toISOString()
      });
    });
  }
  return records;
};

export let localAttendance: Attendance[] = generateMockAttendance();

export const mockHomework: Homework[] = [
  {
    id: 'hw-algebra',
    school_id: 'school-alabaster',
    section_id: 'section-10a',
    subject_id: 'subj-math',
    teacher_id: 'user-teacher-sarah',
    title: 'Algebraic Equations & Factoring',
    description: 'Solve problems 1-15 on page 44 of the textbook. Show all work and equations clearly.',
    attachment_urls: ['https://example.com/homework-math-pg44.pdf'],
    due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), // 2 days in future
    max_marks: 100.00,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'hw-mechanics',
    school_id: 'school-alabaster',
    section_id: 'section-10a',
    subject_id: 'subj-science',
    teacher_id: 'user-teacher-robert',
    title: 'Newton\'s Laws of Motion Lab Report',
    description: 'Summarize our friction experiments. Conclude with real-world applications of Newton\'s Third Law.',
    attachment_urls: ['https://example.com/physics-newton-sheet.pdf'],
    due_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
    max_marks: 50.00,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];

export let localHomeworkSubmissions: HomeworkSubmission[] = [
  // Alex submitted Math (pending)
  {
    id: 'sub-alex-math',
    homework_id: 'hw-algebra',
    student_id: 'user-student-alex',
    school_id: 'school-alabaster',
    submitted_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    submission_text: 'Attached is my Math homework sheet. Let me know if there are formatting errors.',
    file_urls: ['https://example.com/alex-math-pg44-done.pdf'],
    status: 'submitted'
  },
  // Lily submitted Math (already graded)
  {
    id: 'sub-lily-math',
    homework_id: 'hw-algebra',
    student_id: 'user-student-lily',
    school_id: 'school-alabaster',
    submitted_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    submission_text: 'Solved using the quadratic formula where applicable.',
    file_urls: ['https://example.com/lily-math-completed.pdf'],
    marks_obtained: 98.00,
    feedback: 'Excellent work Lily! Clean calculations and clear logical steps.',
    graded_by: 'user-teacher-sarah',
    graded_at: new Date().toISOString(),
    status: 'graded'
  },
  // Mechanics Homework (submitted in the past, graded for both Alex and Lily, Jordan is pending/late)
  {
    id: 'sub-alex-mech',
    homework_id: 'hw-mechanics',
    student_id: 'user-student-alex',
    school_id: 'school-alabaster',
    submitted_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    submission_text: 'Lab report uploaded.',
    file_urls: ['https://example.com/alex-mech-report.pdf'],
    marks_obtained: 45.00,
    feedback: 'Well detailed experiment setup.',
    graded_by: 'user-teacher-robert',
    graded_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: 'graded'
  },
  {
    id: 'sub-lily-mech',
    homework_id: 'hw-mechanics',
    student_id: 'user-student-lily',
    school_id: 'school-alabaster',
    submitted_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    submission_text: 'Lab report on friction.',
    file_urls: ['https://example.com/lily-mech-report.pdf'],
    marks_obtained: 50.00,
    feedback: 'Perfect score. Outstanding graphical plots!',
    graded_by: 'user-teacher-robert',
    graded_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: 'graded'
  }
];

export const mockExams: Exam[] = [
  {
    id: 'exam-midterm-math',
    school_id: 'school-alabaster',
    section_id: 'section-10a',
    subject_id: 'subj-math',
    title: 'Algebra & Geometry Midterm',
    exam_date: '2026-05-15',
    max_marks: 100.00,
    weightage: 30.00
  },
  {
    id: 'exam-midterm-science',
    school_id: 'school-alabaster',
    section_id: 'section-10a',
    subject_id: 'subj-science',
    title: 'Physics & Chemistry Midterm',
    exam_date: '2026-05-18',
    max_marks: 100.00,
    weightage: 30.00
  }
];

export const mockExamResults: ExamResult[] = [
  { id: 'res-alex-math', exam_id: 'exam-midterm-math', student_id: 'user-student-alex', school_id: 'school-alabaster', marks_obtained: 88.50, remarks: 'Strong algebra section, minor geometry slips.', graded_by: 'user-teacher-sarah', graded_at: '2026-05-20' },
  { id: 'res-lily-math', exam_id: 'exam-midterm-math', student_id: 'user-student-lily', school_id: 'school-alabaster', marks_obtained: 97.00, remarks: 'Excellent score!', graded_by: 'user-teacher-sarah', graded_at: '2026-05-20' },
  { id: 'res-jordan-math', exam_id: 'exam-midterm-math', student_id: 'user-student-jordan', school_id: 'school-alabaster', marks_obtained: 54.00, remarks: 'Needs significant help in factoring. Commencing extra coaching.', graded_by: 'user-teacher-sarah', graded_at: '2026-05-20' },

  { id: 'res-alex-sci', exam_id: 'exam-midterm-science', student_id: 'user-student-alex', school_id: 'school-alabaster', marks_obtained: 82.00, remarks: 'Solid concepts.', graded_by: 'user-teacher-robert', graded_at: '2026-05-22' },
  { id: 'res-lily-sci', exam_id: 'exam-midterm-science', student_id: 'user-student-lily', school_id: 'school-alabaster', marks_obtained: 95.50, remarks: 'Brilliant mechanics work.', graded_by: 'user-teacher-robert', graded_at: '2026-05-22' },
  { id: 'res-jordan-sci', exam_id: 'exam-midterm-science', student_id: 'user-student-jordan', school_id: 'school-alabaster', marks_obtained: 61.00, remarks: 'Passed, but struggles with formulas.', graded_by: 'user-teacher-robert', graded_at: '2026-05-22' }
];

export let localAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    school_id: 'school-alabaster',
    title: 'Annual Science Fair Expo 2026',
    content: 'All Grade 10 & 11 students must submit their project outlines by Friday next week. Exhibition starts July 10th.',
    created_by: 'user-admin-alabaster',
    target_roles: ['student', 'teacher', 'school_admin'],
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'ann-2',
    school_id: 'school-alabaster',
    title: 'Midterm Grading Guidelines & Portal Open',
    content: 'Teachers, please ensure all midterm scores are entered and published by end of week. The student risk detector is open.',
    created_by: 'user-admin-alabaster',
    target_roles: ['teacher'],
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

export let localNotifications: Notification[] = [
  {
    id: 'notif-1',
    school_id: 'school-alabaster',
    user_id: 'user-student-alex',
    title: 'New Homework Assigned',
    message: 'Sarah Jenkins assigned "Algebraic Equations & Factoring" due in 2 days.',
    is_read: false,
    type: 'homework',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    school_id: 'school-alabaster',
    user_id: 'user-student-alex',
    title: 'Lab Report Graded',
    message: 'Robert Carter graded "Newton\'s Laws of Motion Lab Report": 45/50.',
    is_read: false,
    type: 'grades',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

export const mockMeetings: Meeting[] = [
  {
    id: 'meet-math',
    school_id: 'school-alabaster',
    section_id: 'section-10a',
    subject_id: 'subj-math',
    teacher_id: 'user-teacher-sarah',
    title: 'Quadratic Curves Doubt Clearing Session',
    join_url: 'https://meet.google.com/abc-defg-hij',
    platform: 'Google Meet',
    scheduled_at: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(), // starts in 1.5 hours
    duration_minutes: 45,
    is_live: false
  },
  {
    id: 'meet-science',
    school_id: 'school-alabaster',
    section_id: 'section-10a',
    subject_id: 'subj-science',
    teacher_id: 'user-teacher-robert',
    title: 'Newtonian Motion Live Demonstration',
    join_url: 'https://zoom.us/j/1234567890',
    platform: 'Zoom',
    scheduled_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // starts in 4 hours
    duration_minutes: 60,
    is_live: false
  }
];

export const mockBadges: Badge[] = [
  { id: 'badge-streak', name: 'Attendance Sentinel', description: 'Maintain a 10-day attendance streak.', requirement_type: 'attendance_streak', requirement_value: 10, icon_url: 'award' },
  { id: 'badge-perfect', name: 'Sovereign Scholar', description: 'Score a perfect grade (100% or A+) on an exam.', requirement_type: 'perfect_score', requirement_value: 100, icon_url: 'zap' },
  { id: 'badge-homework', name: 'Homework Overlord', description: 'Submit 5 homework solutions early.', requirement_type: 'homework_early', requirement_value: 5, icon_url: 'book-open' }
];

export const mockStudentBadges: StudentBadge[] = [
  { student_id: 'user-student-alex', badge_id: 'badge-streak', earned_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { student_id: 'user-student-lily', badge_id: 'badge-streak', earned_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
  { student_id: 'user-student-lily', badge_id: 'badge-perfect', earned_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
];

// Helper functions for mock mode operations
export const mockOperations = {
  // Auth operations
  login: (email: string): Profile | null => {
    const profile = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    return profile || null;
  },

  // Attendance actions
  markAttendance: (studentId: string, status: AttendanceStatus, date: string, teacherId: string) => {
    const index = localAttendance.findIndex(a => a.student_id === studentId && a.date === date);
    if (index >= 0) {
      localAttendance[index] = {
        ...localAttendance[index],
        status,
        marked_by: teacherId,
        created_at: new Date().toISOString()
      };
    } else {
      localAttendance.push({
        id: `att-${studentId}-${date}`,
        school_id: 'school-alabaster',
        student_id: studentId,
        section_id: 'section-10a',
        date,
        status,
        marked_by: teacherId,
        created_at: new Date().toISOString()
      });
    }
    return true;
  },

  // Homework submission
  submitHomework: (homeworkId: string, studentId: string, submissionText: string, fileUrls: string[]) => {
    const subId = `sub-${studentId}-${homeworkId}-${Date.now()}`;
    const newSubmission: HomeworkSubmission = {
      id: subId,
      homework_id: homeworkId,
      student_id: studentId,
      school_id: 'school-alabaster',
      submitted_at: new Date().toISOString(),
      submission_text: submissionText,
      file_urls: fileUrls,
      status: 'submitted'
    };
    localHomeworkSubmissions = localHomeworkSubmissions.filter(s => !(s.homework_id === homeworkId && s.student_id === studentId));
    localHomeworkSubmissions.push(newSubmission);

    // Give XP points to student
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      student.xp += 100;
      if (student.xp >= student.level * 500) {
        student.level += 1;
        // Trigger notification
        localNotifications.push({
          id: `notif-lvl-${Date.now()}`,
          school_id: student.school_id,
          user_id: studentId,
          title: 'Level Up!',
          message: `Congratulations! You reached Level ${student.level}!`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    }
    return newSubmission;
  },

  // Grade Homework
  gradeSubmission: (submissionId: string, marks: number, feedback: string, teacherId: string) => {
    const sub = localHomeworkSubmissions.find(s => s.id === submissionId);
    if (sub) {
      sub.marks_obtained = marks;
      sub.feedback = feedback;
      sub.graded_by = teacherId;
      sub.graded_at = new Date().toISOString();
      sub.status = 'graded';

      // Notify Student
      localNotifications.push({
        id: `notif-grade-${Date.now()}`,
        school_id: sub.school_id,
        user_id: sub.student_id,
        title: 'Homework Graded',
        message: `Your submission has been graded: ${marks} marks.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
      return true;
    }
    return false;
  },

  // Create Homework
  createHomework: (homework: Omit<Homework, 'id' | 'created_at'>) => {
    const newHw: Homework = {
      ...homework,
      id: `hw-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockHomework.push(newHw);

    // Notify Students in section
    mockStudents.forEach(stu => {
      if (stu.section_id === homework.section_id) {
        localNotifications.push({
          id: `notif-newhw-${Date.now()}-${stu.id}`,
          school_id: homework.school_id,
          user_id: stu.id,
          title: 'New Homework Assigned',
          message: `Homework: "${homework.title}" has been assigned.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    });

    return newHw;
  },

  // Notifications
  markNotificationsAsRead: (userId: string) => {
    localNotifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    return true;
  }
};
