import { supabase, isMockMode } from '../supabase';
import * as mockData from '../mockData';
import type { 
  Attendance, AttendanceStatus, Homework, HomeworkSubmission, 
  Exam, ExamResult, Announcement, Notification, Meeting, 
  Badge, StudentBadge, Student, Teacher, Class, Section 
} from '../../types';

export const api = {
  // --- Attendance ---
  getAttendance: async (sectionId: string, date: string): Promise<Attendance[]> => {
    if (isMockMode) {
      // Filter local attendance by section and date
      const records = mockData.localAttendance.filter(a => a.section_id === sectionId && a.date === date);
      // Map student profiles
      return records.map(r => ({
        ...r,
        student: mockData.mockStudents.find(s => s.id === r.student_id)
      }));
    }
    const { data, error } = await supabase
      .from('attendance')
      .select('*, student:students(*, profile:profiles(*))')
      .eq('section_id', sectionId)
      .eq('date', date);
    if (error) throw error;
    return data || [];
  },

  markAttendance: async (studentId: string, status: AttendanceStatus, date: string, teacherId: string): Promise<boolean> => {
    if (isMockMode) {
      return mockData.mockOperations.markAttendance(studentId, status, date, teacherId);
    }
    const { data: current } = await supabase
      .from('attendance')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle();

    let success = false;
    if (current) {
      const { error } = await supabase
        .from('attendance')
        .update({ status, marked_by: teacherId })
        .eq('id', current.id);
      if (error) throw error;

      // Log the change
      await supabase.from('attendance_logs').insert({
        attendance_id: current.id,
        changed_by: teacherId,
        old_status: current.status,
        new_status: status
      });
      success = true;
    } else {
      const { data: inserted, error } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          section_id: (await api.getStudentSection(studentId)),
          school_id: (await api.getStudentSchool(studentId)),
          date,
          status,
          marked_by: teacherId
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('attendance_logs').insert({
        attendance_id: inserted.id,
        changed_by: teacherId,
        new_status: status
      });
      success = true;
    }
    return success;
  },

  getStudentSection: async (studentId: string): Promise<string> => {
    if (isMockMode) {
      return mockData.mockStudents.find(s => s.id === studentId)?.section_id || '';
    }
    const { data } = await supabase.from('students').select('section_id').eq('id', studentId).single();
    return data?.section_id || '';
  },

  getStudentSchool: async (studentId: string): Promise<string> => {
    if (isMockMode) {
      return mockData.mockStudents.find(s => s.id === studentId)?.school_id || '';
    }
    const { data } = await supabase.from('students').select('school_id').eq('id', studentId).single();
    return data?.school_id || '';
  },

  // --- Homework ---
  getHomework: async (sectionId: string): Promise<Homework[]> => {
    if (isMockMode) {
      return mockData.mockHomework
        .filter(h => h.section_id === sectionId)
        .map(h => ({
          ...h,
          subject: mockData.mockSubjects.find(s => s.id === h.subject_id),
          section: mockData.mockSections.find(s => s.id === h.section_id)
        }));
    }
    const { data, error } = await supabase
      .from('homework')
      .select('*, subject:subjects(*), section:sections(*)')
      .eq('section_id', sectionId);
    if (error) throw error;
    return data || [];
  },

  createHomework: async (homework: Omit<Homework, 'id' | 'created_at'>): Promise<Homework> => {
    if (isMockMode) {
      return mockData.mockOperations.createHomework(homework);
    }
    const { data, error } = await supabase
      .from('homework')
      .insert(homework)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getHomeworkSubmissions: async (homeworkId: string): Promise<HomeworkSubmission[]> => {
    if (isMockMode) {
      return mockData.localHomeworkSubmissions
        .filter(s => s.homework_id === homeworkId)
        .map(s => ({
          ...s,
          student: mockData.mockStudents.find(st => st.id === s.student_id),
          homework: mockData.mockHomework.find(hw => hw.id === s.homework_id)
        }));
    }
    const { data, error } = await supabase
      .from('homework_submissions')
      .select('*, student:students(*, profile:profiles(*)), homework:homework(*)')
      .eq('homework_id', homeworkId);
    if (error) throw error;
    return data || [];
  },

  getStudentSubmissions: async (studentId: string): Promise<HomeworkSubmission[]> => {
    if (isMockMode) {
      return mockData.localHomeworkSubmissions
        .filter(s => s.student_id === studentId)
        .map(s => ({
          ...s,
          homework: mockData.mockHomework.find(h => h.id === s.homework_id),
          student: mockData.mockStudents.find(st => st.id === s.student_id)
        }));
    }
    const { data, error } = await supabase
      .from('homework_submissions')
      .select('*, homework:homework(*, subject:subjects(*))')
      .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  },

  submitHomework: async (homeworkId: string, studentId: string, text: string, fileUrls: string[]): Promise<HomeworkSubmission> => {
    if (isMockMode) {
      return mockData.mockOperations.submitHomework(homeworkId, studentId, text, fileUrls);
    }
    const schoolId = await api.getStudentSchool(studentId);
    const { data, error } = await supabase
      .from('homework_submissions')
      .upsert({
        homework_id: homeworkId,
        student_id: studentId,
        school_id: schoolId,
        submission_text: text,
        file_urls: fileUrls,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }, { onConflict: 'homework_id,student_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  gradeSubmission: async (submissionId: string, marks: number, feedback: string, teacherId: string): Promise<boolean> => {
    if (isMockMode) {
      return mockData.mockOperations.gradeSubmission(submissionId, marks, feedback, teacherId);
    }
    const { error } = await supabase
      .from('homework_submissions')
      .update({
        marks_obtained: marks,
        feedback,
        graded_by: teacherId,
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId);
    if (error) throw error;
    return true;
  },

  // --- Exams & Grades ---
  getExams: async (sectionId: string): Promise<Exam[]> => {
    if (isMockMode) {
      return mockData.mockExams
        .filter(e => e.section_id === sectionId)
        .map(e => ({
          ...e,
          subject: mockData.mockSubjects.find(s => s.id === e.subject_id),
          section: mockData.mockSections.find(s => s.id === e.section_id)
        }));
    }
    const { data, error } = await supabase
      .from('exams')
      .select('*, subject:subjects(*), section:sections(*)')
      .eq('section_id', sectionId);
    if (error) throw error;
    return data || [];
  },

  getExamResults: async (examId: string): Promise<ExamResult[]> => {
    if (isMockMode) {
      return mockData.mockExamResults
        .filter(r => r.exam_id === examId)
        .map(r => ({
          ...r,
          student: mockData.mockStudents.find(s => s.id === r.student_id)
        }));
    }
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, student:students(*, profile:profiles(*))')
      .eq('exam_id', examId);
    if (error) throw error;
    return data || [];
  },

  getStudentGrades: async (studentId: string): Promise<ExamResult[]> => {
    if (isMockMode) {
      return mockData.mockExamResults
        .filter(r => r.student_id === studentId)
        .map(r => ({
          ...r,
          exam: mockData.mockExams.find(e => e.id === r.exam_id)
        }));
    }
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, exam:exams(*, subject:subjects(*))')
      .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  },

  // --- Virtual Classrooms ---
  getMeetings: async (sectionId: string): Promise<Meeting[]> => {
    if (isMockMode) {
      return mockData.mockMeetings
        .filter(m => m.section_id === sectionId)
        .map(m => ({
          ...m,
          subject: mockData.mockSubjects.find(s => s.id === m.subject_id)
        }));
    }
    const { data, error } = await supabase
      .from('meetings')
      .select('*, subject:subjects(*)')
      .eq('section_id', sectionId);
    if (error) throw error;
    return data || [];
  },

  // --- Directory Queries ---
  getStudents: async (schoolId: string): Promise<Student[]> => {
    if (isMockMode) {
      return mockData.mockStudents
        .filter(s => s.school_id === schoolId)
        .map(s => ({
          ...s,
          profile: mockData.mockProfiles.find(p => p.id === s.id),
          class: mockData.mockClasses.find(c => c.id === s.class_id),
          section: mockData.mockSections.find(sec => sec.id === s.section_id)
        }));
    }
    const { data, error } = await supabase
      .from('students')
      .select('*, profile:profiles(*), class:classes(*), section:sections(*)')
      .eq('school_id', schoolId);
    if (error) throw error;
    return data || [];
  },

  getTeachers: async (schoolId: string): Promise<Teacher[]> => {
    if (isMockMode) {
      return mockData.mockTeachers
        .filter(t => t.school_id === schoolId)
        .map(t => ({
          ...t,
          profile: mockData.mockProfiles.find(p => p.id === t.id)
        }));
    }
    const { data, error } = await supabase
      .from('teachers')
      .select('*, profile:profiles(*)')
      .eq('school_id', schoolId);
    if (error) throw error;
    return data || [];
  },

  getClasses: async (schoolId: string): Promise<Class[]> => {
    if (isMockMode) {
      return mockData.mockClasses.filter(c => c.school_id === schoolId);
    }
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
    if (error) throw error;
    return data || [];
  },

  getSections: async (classId: string): Promise<Section[]> => {
    if (isMockMode) {
      return mockData.mockSections.filter(s => s.class_id === classId);
    }
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('class_id', classId);
    if (error) throw error;
    return data || [];
  },

  // --- Announcements & Notifications ---
  getAnnouncements: async (schoolId: string, role: string): Promise<Announcement[]> => {
    if (isMockMode) {
      return mockData.localAnnouncements
        .filter(a => a.school_id === schoolId && a.target_roles.includes(role as any))
        .map(a => ({
          ...a,
          creator: mockData.mockProfiles.find(p => p.id === a.created_by)
        }));
    }
    const { data, error } = await supabase
      .from('announcements')
      .select('*, creator:profiles(*)')
      .eq('school_id', schoolId)
      .contains('target_roles', [role]);
    if (error) throw error;
    return data || [];
  },

  getNotifications: async (userId: string): Promise<Notification[]> => {
    if (isMockMode) {
      return mockData.localNotifications.filter(n => n.user_id === userId);
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  markNotificationsRead: async (userId: string): Promise<boolean> => {
    if (isMockMode) {
      return mockData.mockOperations.markNotificationsAsRead(userId);
    }
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  // --- Gamification ---
  getBadges: async (): Promise<Badge[]> => {
    if (isMockMode) return mockData.mockBadges;
    const { data, error } = await supabase.from('badges').select('*');
    if (error) throw error;
    return data || [];
  },

  getStudentBadges: async (studentId: string): Promise<StudentBadge[]> => {
    if (isMockMode) {
      return mockData.mockStudentBadges
        .filter(sb => sb.student_id === studentId)
        .map(sb => ({
          ...sb,
          badge: mockData.mockBadges.find(b => b.id === sb.badge_id)
        }));
    }
    const { data, error } = await supabase
      .from('student_badges')
      .select('*, badge:badges(*)')
      .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  }
};
