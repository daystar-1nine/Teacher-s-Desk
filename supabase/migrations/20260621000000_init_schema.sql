-- 20260621000000_init_schema.sql
-- Teacher's Desk AI — Database Initializer Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schools (Multi-Tenant Isolation Units)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Roles Enum
CREATE TYPE user_role_type AS ENUM ('student', 'teacher', 'school_admin', 'super_admin');

-- 3. Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role_type NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Roles Overrides (Resilience)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    role user_role_type NOT NULL,
    UNIQUE (user_id, school_id, role)
);

-- 5. School Settings
CREATE TABLE IF NOT EXISTS school_settings (
    school_id UUID PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_start DATE,
    academic_year_end DATE,
    grading_scale JSONB DEFAULT '{"A+": 97, "A": 93, "B+": 87, "B": 83, "C": 73, "D": 60, "F": 0}'::jsonb,
    timezone TEXT DEFAULT 'UTC' NOT NULL
);

-- 6. Teachers
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    employee_id TEXT UNIQUE,
    bio TEXT,
    specialization TEXT[]
);

-- 7. Parents
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL
);

-- 8. Classes (Grade 10, Grade 11)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    room_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Sections (Section A, Section B)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    UNIQUE (school_id, code)
);

-- 11. Students (includes Gamification XP & Level parameters)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    student_id TEXT UNIQUE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    last_active DATE
);

-- 12. Enrollments Map
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    enrolled_at DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    UNIQUE (student_id, section_id)
);

-- 13. Attendance Ledgers
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')) NOT NULL,
    marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, date)
);

-- 14. Attendance Logs (Audit history)
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    old_status TEXT,
    new_status TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Homework Assignments
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    attachment_urls TEXT[],
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_marks NUMERIC(5, 2) DEFAULT 100.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Homework Submissions
CREATE TABLE IF NOT EXISTS homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID REFERENCES homework(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submission_text TEXT,
    file_urls TEXT[],
    marks_obtained NUMERIC(5, 2),
    feedback TEXT,
    graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('submitted', 'graded', 'late', 'pending')) DEFAULT 'submitted' NOT NULL,
    UNIQUE (homework_id, student_id)
);

-- 17. Exams
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    exam_date DATE NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL,
    weightage NUMERIC(5, 2) DEFAULT 100.00 NOT NULL
);

-- 18. Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    marks_obtained NUMERIC(5, 2) NOT NULL,
    remarks TEXT,
    graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (exam_id, student_id)
);

-- 19. Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    target_roles user_role_type[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 21. Live Classrooms / Meetings
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    join_url TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('Zoom', 'Google Meet')) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 45 NOT NULL,
    is_live BOOLEAN DEFAULT FALSE NOT NULL
);

-- 22. Gamification: Badges Definition
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL
);

-- 23. Student Earned Badges Map
CREATE TABLE IF NOT EXISTS student_badges (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (student_id, badge_id)
);

-- 24. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    row_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 25. AI Insights Cache
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    report_type TEXT CHECK (report_type IN ('risk_analysis', 'parent_summary', 'school_health')) NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES (RLS)
-- -------------------------------------------------------------

-- Profiles Policies
CREATE POLICY profiles_isolation ON profiles
    FOR ALL
    USING (
        auth.uid() = id OR
        school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- School Settings Policies
CREATE POLICY settings_isolation ON school_settings
    FOR ALL
    USING (
        school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- Attendance Policies
CREATE POLICY attendance_teacher_policy ON attendance
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = attendance.school_id AND role IN ('teacher', 'school_admin')
        )
    );

CREATE POLICY attendance_student_parent_policy ON attendance
    FOR SELECT
    USING (
        student_id = auth.uid() OR
        student_id IN (
            SELECT id FROM students WHERE parent_id = auth.uid()
        )
    );

-- Homework Policies
CREATE POLICY homework_academic_staff ON homework
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = homework.school_id AND role IN ('teacher', 'school_admin')
        )
    );

CREATE POLICY homework_enrolled_view ON homework
    FOR SELECT
    USING (
        section_id IN (
            SELECT section_id FROM enrollments WHERE student_id = auth.uid()
        )
    );

-- Homework Submissions Policies
CREATE POLICY submissions_student ON homework_submissions
    FOR ALL
    USING (
        student_id = auth.uid()
    );

CREATE POLICY submissions_teacher ON homework_submissions
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = homework_submissions.school_id AND role IN ('teacher', 'school_admin')
        )
    );

-- -------------------------------------------------------------
-- MOCK SEED DATA FOR ALABASTER ACADEMY
-- -------------------------------------------------------------

INSERT INTO schools (id, name, subdomain, logo_url) 
VALUES ('school-alabaster', 'Alabaster Academy', 'alabaster', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=100&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO badges (id, name, description, requirement_type, requirement_value) VALUES
('badge-streak', 'Attendance Sentinel', 'Maintain a 10-day attendance streak.', 'attendance_streak', 10),
('badge-perfect', 'Sovereign Scholar', 'Score a perfect grade (100% or A+) on an exam.', 'perfect_score', 100),
('badge-homework', 'Homework Overlord', 'Submit 5 homework solutions early.', 'homework_early', 5)
ON CONFLICT (id) DO NOTHING;
