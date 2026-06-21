import React, { useState, useEffect } from 'react';
import { 
  Check, X, Clock, AlertCircle, Calendar, 
  Users, CheckSquare, Flame
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Attendance, AttendanceStatus, Student } from '../../types';

export const AttendanceGrid: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.school_id) {
      api.getStudents(user.school_id).then(setStudents).catch(console.error);
    }
  }, [user]);

  // Load records whenever date changes
  useEffect(() => {
    loadAttendance();
  }, [date, students]);

  const loadAttendance = async () => {
    try {
      const records = await api.getAttendance('section-10a', date);
      setAttendanceRecords(records);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    if (!user) return;
    setSaving(true);
    try {
      await api.markAttendance(studentId, status, date, user.id);
      await loadAttendance();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkMark = async (status: AttendanceStatus) => {
    if (!user) return;
    setSaving(true);
    try {
      for (const s of students) {
        await api.markAttendance(s.id, status, date, user.id);
      }
      await loadAttendance();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const getRecordStatus = (studentId: string): AttendanceStatus | null => {
    const rec = attendanceRecords.find(r => r.student_id === studentId);
    return rec ? rec.status : null;
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'school_admin';

  // Calculate statistics
  const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
  const excusedCount = attendanceRecords.filter(r => r.status === 'Excused').length;
  const rate = students.length > 0 ? ((presentCount + lateCount) / students.length) * 100 : 100;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Smart Attendance Board</h2>
          <p className="text-xs text-gray-500">Track and record classroom attendance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4.5 w-4.5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!isTeacher}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 bg-[#FAF9F6] outline-none"
          />
        </div>
      </div>

      {isTeacher ? (
        // TEACHER GRID VIEW
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Roster Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#1E3F20]" />
                <span>Grade 10 - Section A Roster</span>
              </h3>
              {/* Bulk actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkMark('Present')}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/20 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Mark All Present</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {students.map((stu) => {
                const status = getRecordStatus(stu.id);
                const name = stu.id === 'user-student-alex' ? 'Alex Mercer' : stu.id === 'user-student-lily' ? 'Lily Chen' : 'Jordan Sparks';

                return (
                  <div key={stu.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-100 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#1E3F20]/10 flex items-center justify-center font-bold text-[#1E3F20] text-xs">
                        {name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">{name}</h4>
                        <span className="text-[9px] text-gray-400 font-semibold">{stu.student_id}</span>
                      </div>
                    </div>

                    {/* Marking options */}
                    <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center">
                      <button
                        onClick={() => handleStatusChange(stu.id, 'Present')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-500/30'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Pres</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(stu.id, 'Absent')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          status === 'Absent'
                            ? 'bg-red-100 text-red-800 border-red-500/30'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Abs</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(stu.id, 'Late')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          status === 'Late'
                            ? 'bg-amber-100 text-amber-800 border-amber-500/30'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Late</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(stu.id, 'Excused')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          status === 'Excused'
                            ? 'bg-blue-100 text-blue-800 border-blue-500/30'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Exc</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics sidebar */}
          <div className="space-y-6">
            <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg">
              <h3 className="text-sm font-bold border-b border-[#2C3E35] pb-2 text-[#C5A880]">Attendance stats</h3>
              <div className="space-y-4 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Marked Rate:</span>
                  <span className="font-bold text-white">{rate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#121A17] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#C5A880] h-2" style={{ width: `${rate}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 rounded-lg bg-[#2C3E35] border border-[#C5A880]/15">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Present</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{presentCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2C3E35] border border-[#C5A880]/15">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Late</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">{lateCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2C3E35] border border-[#C5A880]/15">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Absent</p>
                    <p className="text-lg font-bold text-red-400 mt-1">{absentCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#2C3E35] border border-[#C5A880]/15">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Excused</p>
                    <p className="text-lg font-bold text-blue-400 mt-1">{excusedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // STUDENT ATTENDANCE CALENDAR VIEW
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-[#1E3F20]" />
              <span>Personal Monthly Calendar</span>
            </h3>
            
            {/* Hardcoded 30-day Calendar Grid mock */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="font-bold text-gray-400 py-2">{d}</div>
              ))}
              {Array.from({ length: 30 }).map((_, idx) => {
                const day = idx + 1;
                // mock attendance markings
                const isAbsent = day === 5 || day === 14;
                const isLate = day === 8;
                const isPresent = day < 21 && !isAbsent && !isLate;
                
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border font-bold flex flex-col items-center justify-between h-14 transition-all ${
                      isPresent 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100/50' 
                        : isAbsent 
                        ? 'bg-red-50 text-red-800 border-red-100 hover:bg-red-100/50'
                        : isLate 
                        ? 'bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100/50'
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="text-[8px] uppercase tracking-wider">
                      {isPresent ? 'Pres' : isAbsent ? 'Abs' : isLate ? 'Late' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gamification streaks */}
          <div className="space-y-6">
            <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-500 mb-4 animate-bounce">
                <Flame className="h-8 w-8 fill-current" />
              </div>
              <h3 className="text-base font-bold text-[#F4F1EA]">12-Day Attendance Streak</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-xs">
                Maintain your perfect daily logins to earn the "Attendance Sentinel" badge and extra 250 XP bonus!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
