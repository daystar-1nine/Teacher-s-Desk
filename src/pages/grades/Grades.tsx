import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Exam, ExamResult } from '../../types';

export const Grades: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const studentIdParam = searchParams.get('studentId');

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [studentGrades, setStudentGrades] = useState<ExamResult[]>([]);

  const isTeacher = user?.role === 'teacher' || user?.role === 'school_admin';
  const targetStudentId = studentIdParam || (isTeacher ? 'user-student-alex' : user?.id || '');

  useEffect(() => {
    loadExamData();
  }, [user, targetStudentId]);

  const loadExamData = async () => {
    try {
      const ex = await api.getExams('section-10a');
      setExams(ex);
      if (ex.length > 0 && !selectedExam) {
        setSelectedExam(ex[0]);
        const res = await api.getExamResults(ex[0].id);
        setExamResults(res);
      } else if (selectedExam) {
        const res = await api.getExamResults(selectedExam.id);
        setExamResults(res);
      }

      if (targetStudentId) {
        const sg = await api.getStudentGrades(targetStudentId);
        setStudentGrades(sg);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectExam = async (exam: Exam) => {
    setSelectedExam(exam);
    try {
      const res = await api.getExamResults(exam.id);
      setExamResults(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to map score to letter grade
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 73) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-600 bg-emerald-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  // Calculate subject comparisons for BarChart
  const barChartData = studentGrades.map(sg => ({
    subject: sg.exam?.subject?.name || 'Quiz',
    score: sg.marks_obtained,
    max: sg.exam?.max_marks || 100
  }));

  // Average Score Calc
  const totalWeightScore = studentGrades.reduce((acc, curr) => acc + curr.marks_obtained, 0);
  const averagePercent = studentGrades.length > 0 ? totalWeightScore / studentGrades.length : 85;
  const targetStudentName = targetStudentId === 'user-student-alex' 
    ? 'Alex Mercer' 
    : targetStudentId === 'user-student-lily' 
    ? 'Lily Chen' 
    : targetStudentId === 'user-student-jordan'
    ? 'Jordan Sparks'
    : 'Active Student';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Gradebook & Exam Marks</h2>
          <p className="text-xs text-gray-500">Record, compute and graph student scores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Gradebook lists */}
        <div className="lg:col-span-2 space-y-6">
          {isTeacher ? (
            // TEACHER VIEW: Class Marks Grid
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Class Marks Entry</h3>
                  <p className="text-xs text-[#C5A880] font-semibold mt-0.5">{selectedExam?.title}</p>
                </div>
                <div className="flex gap-2">
                  {exams.map(e => (
                    <button
                      key={e.id}
                      onClick={() => handleSelectExam(e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedExam?.id === e.id
                          ? 'bg-[#1E3F20] text-white border-[#1E3F20]'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {e.title.split(' ')[0]} {/* Midterm label */}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider pb-2">
                      <th className="py-2">Student</th>
                      <th>Marks obtained</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Feedback / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {examResults.map((res) => {
                      const name = res.student_id === 'user-student-alex' ? 'Alex Mercer' : res.student_id === 'user-student-lily' ? 'Lily Chen' : 'Jordan Sparks';
                      const percent = (res.marks_obtained / (selectedExam?.max_marks || 100)) * 100;
                      const letter = getLetterGrade(percent);

                      return (
                        <tr key={res.id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-semibold text-gray-800">{name}</td>
                          <td className="font-bold text-gray-800">
                            {res.marks_obtained} / {selectedExam?.max_marks}
                          </td>
                          <td className="font-semibold">{percent.toFixed(1)}%</td>
                          <td>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getGradeColor(letter)}`}>
                              {letter}
                            </span>
                          </td>
                          <td className="text-gray-500 max-w-xs truncate">{res.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* STUDENT SCORE DETAILS */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              {isTeacher ? `Report Card: ${targetStudentName}` : 'Your Exam Records'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider pb-2">
                    <th className="py-2">Subject</th>
                    <th>Exam title</th>
                    <th>Weight</th>
                    <th>Score</th>
                    <th>Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {studentGrades.map((sg) => {
                    const percent = (sg.marks_obtained / (sg.exam?.max_marks || 100)) * 100;
                    const letter = getLetterGrade(percent);

                    return (
                      <tr key={sg.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-semibold text-gray-800">{sg.exam?.subject?.name}</td>
                        <td>{sg.exam?.title}</td>
                        <td>{sg.exam?.weightage}%</td>
                        <td className="font-bold text-[#1E3F20]">{sg.marks_obtained}%</td>
                        <td>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getGradeColor(letter)}`}>
                            {letter}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Subject performance bar charts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-[#1E3F20]" />
              <span>Subject Comparison</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Visual comparison of midterm percentage rates</p>
            <div className="h-64">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#1E3F20" radius={[4, 4, 0, 0]}>
                      {barChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E3F20' : '#C5A880'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  No data to chart.
                </div>
              )}
            </div>
          </div>

          {/* Quick GPA Summary Card */}
          <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg text-center">
            <Award className="h-10 w-10 text-[#C5A880] mx-auto mb-3" />
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Average Performance</h4>
            <p className="text-3xl font-extrabold text-[#F4F1EA] mt-1">
              {averagePercent.toFixed(1)}%
            </p>
            <p className="text-xs text-[#C5A880] mt-1 font-semibold">
              GPA Equivalent: {((averagePercent / 100) * 4).toFixed(2)} / 4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
