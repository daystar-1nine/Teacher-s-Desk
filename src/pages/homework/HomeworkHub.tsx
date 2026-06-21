import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Calendar, Award, Upload, X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { mockSubjects } from '../../services/mockData';
import type { Homework, HomeworkSubmission } from '../../types';

export const HomeworkHub: React.FC = () => {
  const { user } = useAuth();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<HomeworkSubmission | null>(null);

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubject, setNewSubject] = useState(mockSubjects[0].id);
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('100');

  // Submit form
  const [submitText, setSubmitText] = useState('');
  const [submitFile, setSubmitFile] = useState('math-assignment.pdf');

  // Grading form
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const isTeacher = user?.role === 'teacher' || user?.role === 'school_admin';

  useEffect(() => {
    loadHomeworkData();
  }, [user]);

  const loadHomeworkData = async () => {
    try {
      const hw = await api.getHomework('section-10a');
      setHomeworkList(hw);
      if (selectedHw) {
        const subs = await api.getHomeworkSubmissions(selectedHw.id);
        setSubmissions(subs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectHomework = async (hw: Homework) => {
    setSelectedHw(hw);
    setSelectedSub(null);
    try {
      const subs = await api.getHomeworkSubmissions(hw.id);
      setSubmissions(subs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.createHomework({
        school_id: user.school_id || 'school-alabaster',
        section_id: 'section-10a',
        subject_id: newSubject,
        teacher_id: user.id,
        title: newTitle,
        description: newDesc,
        due_date: new Date(newDueDate).toISOString(),
        max_marks: Number(newMaxMarks),
        attachment_urls: []
      });
      setShowCreateForm(false);
      setNewTitle('');
      setNewDesc('');
      await loadHomeworkData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedHw) return;
    try {
      await api.submitHomework(
        selectedHw.id,
        user.id,
        submitText,
        submitFile ? [`https://example.com/uploads/${submitFile}`] : []
      );
      setSubmitText('');
      await handleSelectHomework(selectedHw);
      await loadHomeworkData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSub || !selectedHw) return;
    try {
      await api.gradeSubmission(
        selectedSub.id,
        Number(gradeMarks),
        gradeFeedback,
        user.id
      );
      setSelectedSub(null);
      await handleSelectHomework(selectedHw);
      await loadHomeworkData();
    } catch (err) {
      console.error(err);
    }
  };

  // Find active student submission if current user is a student
  const mySubmission = selectedHw 
    ? submissions.find(s => s.student_id === user?.id) 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Homework Hub</h2>
          <p className="text-xs text-gray-500">Assign, submit and grade homework worksheets</p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-[#1E3F20] text-white hover:bg-[#28532C] px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list: Homework list */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Assigned tasks</h3>
            <div className="space-y-3">
              {homeworkList.map((hw) => {
                const isSelected = selectedHw?.id === hw.id;
                return (
                  <button
                    key={hw.id}
                    onClick={() => handleSelectHomework(hw)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all hover:border-[#1E3F20]/30 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#1E3F20]/5 border-[#1E3F20] shadow-xs' 
                        : 'bg-[#FAF9F6] border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700 uppercase">
                        {hw.subject?.name}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 mt-2">{hw.title}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Right Detail view panel */}
        <div className="lg:col-span-2">
          {selectedHw ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest block mb-1">
                  {selectedHw.subject?.name}
                </span>
                <h3 className="text-base font-bold text-gray-800">{selectedHw.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{selectedHw.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(selectedHw.due_date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span>Marks: {selectedHw.max_marks} Max</span>
                  </div>
                </div>
              </div>

              {/* Contextual panel: Teacher sees submissions / Student submits */}
              {isTeacher ? (
                // TEACHER VIEW: Submissions List
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Student Submissions</h4>
                  <div className="space-y-2">
                    {submissions.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-400">
                        No submissions yet.
                      </div>
                    ) : (
                      submissions.map((sub) => {
                        const studentName = sub.student_id === 'user-student-alex' ? 'Alex Mercer' : 'Lily Chen';
                        return (
                          <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-100">
                            <div>
                              <h5 className="text-xs font-bold text-gray-800">{studentName}</h5>
                              <p className="text-[10px] text-gray-400">
                                Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {sub.status === 'graded' ? (
                                <span className="text-xs font-bold text-[#1E3F20] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Graded: {sub.marks_obtained}/{selectedHw.max_marks}
                                </span>
                              ) : (
                                <button
                                  onClick={() => { setSelectedSub(sub); setGradeMarks(String(selectedHw.max_marks)); }}
                                  className="text-xs font-bold text-[#222E28] bg-[#C5A880] hover:bg-[#E2C799] px-3 py-1 rounded transition-all cursor-pointer"
                                >
                                  Grade Submission
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                // STUDENT VIEW: Submission Form or Feedback
                <div className="space-y-4">
                  {mySubmission ? (
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-gray-800">Your Submission</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          mySubmission.status === 'graded' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {mySubmission.status === 'graded' ? 'Graded' : 'Submitted'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                        {mySubmission.submission_text}
                      </p>

                      {/* Display grading feedback */}
                      {mySubmission.status === 'graded' && (
                        <div className="p-3.5 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">
                              Teacher Feedback
                            </span>
                            <span className="text-xs font-bold text-[#1E3F20]">
                              Score: {mySubmission.marks_obtained}/{selectedHw.max_marks}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium">"{mySubmission.feedback}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Submission form
                    <form onSubmit={handleStudentSubmit} className="space-y-4 bg-[#FAF9F6] p-4 rounded-xl border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-800">Upload Homework Solution</h4>
                      <div>
                        <textarea
                          required
                          rows={4}
                          value={submitText}
                          onChange={(e) => setSubmitText(e.target.value)}
                          placeholder="Write your explanation or note to the teacher here..."
                          className="w-full text-xs p-3 rounded-lg bg-white border border-gray-300 outline-none focus:border-[#1E3F20]"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Upload className="h-4.5 w-4.5 text-gray-400" />
                        <input
                          type="text"
                          value={submitFile}
                          onChange={(e) => setSubmitFile(e.target.value)}
                          placeholder="filename.pdf"
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white outline-none focus:border-[#1E3F20]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#1E3F20] text-white hover:bg-[#28532C] font-bold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        Submit Assignment
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[40vh] border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 bg-white">
              <div className="p-4">
                <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-xs">Select a homework task from the column to see details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE HOMEWORK MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Create Homework Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 outline-none focus:border-[#1E3F20]"
                  placeholder="e.g. Linear Graphs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 outline-none focus:border-[#1E3F20]"
                  placeholder="Problem details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  >
                    {mockSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3F20] text-white hover:bg-[#28532C] rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Publish Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GRADE SUBMISSION MODAL */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 relative">
            <button 
              onClick={() => setSelectedSub(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Grade Homework Submission</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
              <p className="font-bold">Student Explanation:</p>
              <p className="mt-1">"{selectedSub.submission_text}"</p>
              {selectedSub.file_urls && selectedSub.file_urls.length > 0 && (
                <a href="#" className="inline-block mt-2 font-semibold text-[#1E3F20] hover:underline">
                  📄 View Attachment ({selectedSub.file_urls[0].split('/').pop()})
                </a>
              )}
            </div>
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  required
                  max={selectedHw?.max_marks || 100}
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                  placeholder={`Max: ${selectedHw?.max_marks || 100}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Feedback Comments</label>
                <textarea
                  required
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300"
                  placeholder="Feedback..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#C5A880] text-[#222E28] hover:bg-[#E2C799] font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                Submit Score
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
