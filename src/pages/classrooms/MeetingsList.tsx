import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { mockMeetings } from '../../services/mockData';
import type { Meeting } from '../../types';

export const MeetingsList: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<'Zoom' | 'Google Meet'>('Google Meet');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('45');

  const isTeacher = user?.role === 'teacher' || user?.role === 'school_admin';

  useEffect(() => {
    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    try {
      const meets = await api.getMeetings('section-10a');
      setMeetings(meets);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    const newMeet: Meeting = {
      id: `meet-${Date.now()}`,
      school_id: user.school_id || 'school-alabaster',
      section_id: 'section-10a',
      subject_id: 'subj-math',
      teacher_id: user.id,
      title,
      join_url: platform === 'Zoom' ? 'https://zoom.us/j/9876543210' : 'https://meet.google.com/xyz-pdqr-lmn',
      platform,
      scheduled_at: scheduledAt,
      duration_minutes: Number(duration),
      is_live: false
    };
    mockMeetings.push(newMeet);
    setShowForm(false);
    setTitle('');
    loadMeetings();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Virtual Live Classrooms</h2>
          <p className="text-xs text-gray-500">Schedule and connect to distance learning channels</p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#1E3F20] text-white hover:bg-[#28532C] px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Session</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400 text-xs">
            No live classroom sessions scheduled.
          </div>
        ) : (
          meetings.map((meet) => {
            const isLive = new Date(meet.scheduled_at).getTime() <= Date.now() + 15 * 60 * 1000; // mock live state
            return (
              <div 
                key={meet.id} 
                className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                {isLive && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}

                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    meet.platform === 'Zoom' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {meet.platform}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 mt-2">{meet.title}</h3>
                  <div className="flex flex-col gap-2 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(meet.scheduled_at).toLocaleDateString()} at {new Date(meet.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {meet.duration_minutes} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold">Teacher ID: {meet.teacher_id.substring(0, 8)}</span>
                  <a
                    href={meet.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3F20] text-[#F4F1EA] hover:bg-[#28532C] text-xs font-bold rounded-lg transition-all"
                  >
                    <span>Join Class</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 relative">
            <button 
              onClick={() => setShowForm(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-sans">Schedule Live Classroom</h3>
            <form onSubmit={handleSchedule} className="space-y-4 text-xs text-gray-700">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 outline-none focus:border-[#1E3F20]"
                  placeholder="e.g. Algebraic Factoring Live Review"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3F20] text-white hover:bg-[#28532C] font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                Schedule Live Channel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
