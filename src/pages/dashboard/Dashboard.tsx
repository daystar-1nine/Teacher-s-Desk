import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, Flame, Zap, Trophy, Calendar, BookOpen, 
  Sparkles, AlertTriangle, CheckCircle, Users, Plus, 
  Building, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, PieChart, Pie 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { 
  mockStudents, mockTeachers, 
  localHomeworkSubmissions, mockSchools 
} from '../../services/mockData';
import type { Student, Teacher, ExamResult, Announcement } from '../../types';

// --- STUDENT DASHBOARD VIEW ---
const StudentDashboard: React.FC<{ studentId: string }> = ({ studentId }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<ExamResult[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  useEffect(() => {
    // Fetch student info
    const s = mockStudents.find(st => st.id === studentId);
    if (s) {
      setStudent({
        ...s,
        profile: mockStudents.map(st => st.profile).find(p => p?.id === studentId) || undefined
      });
    }
    api.getStudentGrades(studentId).then(setGrades).catch(console.error);
    api.getStudentBadges(studentId).then(setBadges).catch(console.error);
    api.getAnnouncements('school-alabaster', 'student').then(setAnnouncements).catch(console.error);
  }, [studentId]);

  if (!student) return <div>Loading Student Profile...</div>;

  // Calculate cumulative GPA
  // Midterm Math grade + Midterm Science grade
  const mathResult = grades.find(g => g.exam?.subject_id === 'subj-math')?.marks_obtained || 0;
  const sciResult = grades.find(g => g.exam?.subject_id === 'subj-science')?.marks_obtained || 0;
  const avgGrade = (mathResult + sciResult) / 2 || 85; // Fallback average
  
  // Map average grade percentage to standard 4.0 GPA
  const gpa = (avgGrade / 100) * 4;

  const gpaData = [
    { name: 'Jan', gpa: 3.2 },
    { name: 'Feb', gpa: 3.4 },
    { name: 'Mar', gpa: 3.5 },
    { name: 'Apr', gpa: 3.4 },
    { name: 'May', gpa: Number(gpa.toFixed(2)) }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3F20] to-[#2C3E35] p-6 text-white border border-[#C5A880]/30 shadow-lg relative overflow-hidden">
        <div className="absolute right-[-5%] top-[-20%] w-64 h-64 rounded-full bg-[#C5A880]/10 blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold font-sans">Welcome Back, {student.profile?.first_name || 'Scholar'}!</h2>
            <p className="text-[#C5A880] text-sm mt-1">"Learning is a treasure that will follow its owner everywhere."</p>
          </div>
          {/* Gamification Core */}
          <div className="flex items-center gap-6 bg-[#121A17]/60 rounded-xl p-3 border border-[#C5A880]/20">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#C5A880]/20 text-[#C5A880]">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">STREAK</p>
                <p className="text-sm font-extrabold text-white">{student.streak_days} Days</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">LEVEL</p>
                <p className="text-sm font-extrabold text-white">{student.level}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">XP Progress</p>
              <div className="w-24 bg-gray-800 rounded-full h-2.5 mt-1 border border-gray-700 overflow-hidden">
                <div 
                  className="bg-[#C5A880] h-2.5 rounded-full" 
                  style={{ width: `${(student.xp % 500) / 5}%` }}
                ></div>
              </div>
              <span className="text-[9px] text-gray-400 mt-0.5 block text-right">{student.xp % 500}/500 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Analytics and Grades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Charts */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">GPA performance trend</h3>
                <p className="text-xs text-gray-500">Overview of academic progression points</p>
              </div>
              <div className="bg-[#FAF9F6] border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Award className="h-4 w-4 text-[#C5A880]" />
                <span className="text-xs font-bold text-gray-700">GPA: {gpa.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3F20" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1E3F20" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                  <YAxis domain={[0, 4.0]} ticks={[1.0, 2.0, 3.0, 4.0]} stroke="#9CA3AF" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="gpa" stroke="#1E3F20" strokeWidth={2} fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exam Grade records */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Midterm quiz results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider pb-2">
                    <th className="py-2">Subject</th>
                    <th>Exam title</th>
                    <th>Marks obtained</th>
                    <th>Teacher's remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grades.map((res, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-semibold text-gray-800">{res.exam?.subject?.name}</td>
                      <td>{res.exam?.title}</td>
                      <td className="font-bold text-[#1E3F20]">{res.marks_obtained}%</td>
                      <td className="text-gray-500 max-w-xs truncate">{res.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Badges, Streaks, Announcements */}
        <div className="space-y-6">
          {/* Badges showcase */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-[#C5A880]" />
              <span>Earned Achievements</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 text-center hover:scale-105 transition-all">
                  <div className="h-10 w-10 rounded-full bg-[#1E3F20]/10 flex items-center justify-center text-[#1E3F20] mb-2 border border-[#1E3F20]/20">
                    {b.badge?.icon_url === 'award' ? <Award className="h-5 w-5 text-[#C5A880]" /> : <Zap className="h-5 w-5 text-[#C5A880]" />}
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight truncate w-full">{b.badge?.name}</span>
                  <span className="text-[8px] text-gray-400 mt-0.5 uppercase tracking-widest leading-none font-semibold">Earned</span>
                </div>
              ))}
            </div>
          </div>

          {/* School Announcements */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Latest school bulletins</h3>
            <div className="space-y-4">
              {announcements.map((ann, idx) => (
                <div key={idx} className="border-l-4 border-[#1E3F20] pl-3 py-0.5">
                  <h4 className="text-xs font-bold text-gray-800">{ann.title}</h4>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                  <span className="text-[9px] text-gray-400 mt-1 block">
                    Posted by Admin • {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- TEACHER DASHBOARD VIEW ---
const TeacherDashboard: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);

  useEffect(() => {
    const t = mockTeachers.find(tch => tch.id === teacherId);
    if (t) {
      setTeacher({
        ...t,
        profile: mockTeachers.map(tc => tc.profile).find(p => p?.id === teacherId) || undefined
      });
    }
    api.getStudents('school-alabaster').then(setStudents).catch(console.error);
    api.getHomework('section-10a').then(setHomeworks).catch(console.error);
  }, [teacherId]);

  if (!teacher) return <div>Loading Instructor Profile...</div>;

  // Calculate quick metrics
  const totalStudents = students.length;
  const criticalCount = students.filter(s => s.xp < 1000).length; // simple threshold
  const pendingGradings = localHomeworkSubmissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Active Class size</p>
            <p className="text-xl font-bold text-gray-800">{totalStudents} Students</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Assigned Homeworks</p>
            <p className="text-xl font-bold text-gray-800">{homeworks.length} Active</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Submissions to Grade</p>
            <p className="text-xl font-bold text-gray-800">{pendingGradings} Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
          <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Risk Level Alerts</p>
            <p className="text-xl font-bold text-gray-800">{criticalCount} Critical</p>
          </div>
        </div>
      </div>

      {/* Classroom quick actions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Quick Classroom Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/attendance')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#1E3F20] bg-[#FAF9F6] text-center hover:scale-102 transition-all cursor-pointer"
          >
            <Calendar className="h-6 w-6 text-[#1E3F20] mb-2" />
            <span className="text-xs font-bold text-gray-800">Mark Attendance</span>
          </button>
          <button 
            onClick={() => navigate('/homework')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#1E3F20] bg-[#FAF9F6] text-center hover:scale-102 transition-all cursor-pointer"
          >
            <Plus className="h-6 w-6 text-[#1E3F20] mb-2" />
            <span className="text-xs font-bold text-gray-800">Assign Homework</span>
          </button>
          <button 
            onClick={() => navigate('/ai?tab=explainer')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#1E3F20] bg-[#FAF9F6] text-center hover:scale-102 transition-all cursor-pointer"
          >
            <Sparkles className="h-6 w-6 text-[#C5A880] mb-2" />
            <span className="text-xs font-bold text-gray-800">AI Topic Explainer</span>
          </button>
          <button 
            onClick={() => navigate('/ai?tab=papers')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#1E3F20] bg-[#FAF9F6] text-center hover:scale-102 transition-all cursor-pointer"
          >
            <Sparkles className="h-6 w-6 text-[#C5A880] mb-2" />
            <span className="text-xs font-bold text-gray-800">Generate Exam Paper</span>
          </button>
        </div>
      </div>

      {/* Student list Roster */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Class 10A Roster</h3>
            <p className="text-xs text-gray-500">Monitor academic performance, levels and attendance streaks</p>
          </div>
          <button 
            onClick={() => navigate('/ai?tab=risk')}
            className="flex items-center gap-2 bg-[#1E3F20] text-white hover:bg-[#28532C] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Risk Predictor</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider pb-2">
                <th className="py-2">Student ID</th>
                <th>Full Name</th>
                <th>XP Level</th>
                <th>Streak</th>
                <th>Academic Risk</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((stu) => {
                const name = stu.id === 'user-student-alex' ? 'Alex Mercer' : stu.id === 'user-student-lily' ? 'Lily Chen' : 'Jordan Sparks';
                const hasCriticalRisk = stu.xp < 1000;
                
                return (
                  <tr key={stu.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{stu.student_id}</td>
                    <td className="font-medium text-gray-800">{name}</td>
                    <td>Level {stu.level} ({stu.xp} XP)</td>
                    <td className="font-semibold text-orange-600">
                      {stu.streak_days > 0 ? `🔥 ${stu.streak_days} days` : '0 days'}
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasCriticalRisk 
                          ? 'bg-red-50 text-red-600 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {hasCriticalRisk ? 'At Risk' : 'On Track'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => navigate(`/grades?studentId=${stu.id}`)}
                        className="text-xs text-[#1E3F20] font-bold hover:underline cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// --- SCHOOL ADMIN DASHBOARD VIEW ---
const SchoolAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Simple static distribution
  const gradeDistribution = [
    { name: 'Grade A', value: 45 },
    { name: 'Grade B', value: 35 },
    { name: 'Grade C', value: 12 },
    { name: 'Grade D/F', value: 8 },
  ];
  const COLORS = ['#1E3F20', '#C5A880', '#2C3E35', '#DC2626'];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#C5A880] font-bold uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-2xl font-bold mt-1">350 Students</h3>
            </div>
            <Users className="h-6 w-6 text-[#C5A880]" />
          </div>
        </div>
        <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#C5A880] font-bold uppercase tracking-wider">Active Faculty</p>
              <h3 className="text-2xl font-bold mt-1">28 Instructors</h3>
            </div>
            <Building className="h-6 w-6 text-[#C5A880]" />
          </div>
        </div>
        <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#C5A880] font-bold uppercase tracking-wider">Daily Attendance</p>
              <h3 className="text-2xl font-bold mt-1">94.2%</h3>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Roster & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Faculty list & status</h3>
            <button 
              onClick={() => navigate('/ai?tab=school-health')}
              className="flex items-center gap-2 bg-[#1E3F20] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-[#28532C] cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Institutional Health Report</span>
            </button>
          </div>

          <div className="space-y-4">
            {mockTeachers.map((t, idx) => {
              const name = t.id === 'user-teacher-sarah' ? 'Sarah Jenkins' : 'Robert Carter';
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#1E3F20]/15 flex items-center justify-center font-bold text-[#1E3F20]">
                      {name.split(' ')[0][0]}{name.split(' ')[1][0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{name}</h4>
                      <p className="text-[10px] text-gray-500">Employee ID: {t.employee_id} • Spec: {t.specialization?.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-semibold border border-emerald-200">Active</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade pie distribution */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-800 mb-4 w-full text-left">Grade distribution</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={gradeDistribution} 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {gradeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[10px] text-gray-600 w-full">
            {gradeDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: COLORS[idx] }}></div>
                <span>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- SUPER ADMIN DASHBOARD VIEW ---
const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg">
        <h2 className="text-lg font-bold">Multi-School Platform Cockpit</h2>
        <p className="text-xs text-gray-400 mt-1">Super Administrator global portal metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Managed schools list */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Provisioned Schools (Tenants)</h3>
          <div className="space-y-4">
            {mockSchools.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-gray-200">
                <div className="flex items-center gap-3">
                  <img src={s.logo_url} alt="Logo" className="h-10 w-10 rounded bg-gray-200 object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{s.name}</h4>
                    <p className="text-[10px] text-gray-500">Domain: {s.subdomain}.teachersdesk.ai</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded font-bold">RLS Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global audit log list */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Platform Audit Logs</h3>
          <div className="space-y-3 text-xs text-gray-600">
            <div className="p-2.5 rounded bg-gray-50 border-l-4 border-[#C5A880]">
              <p className="font-semibold text-gray-800">user-admin-alabaster changed profiles table</p>
              <span className="text-[10px] text-gray-400">Action: UPDATE • Row ID: user-student-jordan • Just now</span>
            </div>
            <div className="p-2.5 rounded bg-gray-50 border-l-4 border-[#C5A880]">
              <p className="font-semibold text-gray-800">system-cron triggered attendance streak cache</p>
              <span className="text-[10px] text-gray-400">Action: UPDATE • Row ID: user-student-alex • 15 minutes ago</span>
            </div>
            <div className="p-2.5 rounded bg-gray-50 border-l-4 border-gray-400">
              <p className="font-semibold text-gray-800">user-teacher-sarah marked daily attendance</p>
              <span className="text-[10px] text-gray-400">Action: INSERT • Row ID: att-list-10a • 1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <div>Authenticating User...</div>;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'school_admin':
      return <SchoolAdminDashboard />;
    case 'teacher':
      return <TeacherDashboard teacherId={user.id} />;
    default:
      return <StudentDashboard studentId={user.id} />;
  }
};
