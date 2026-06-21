import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Calendar, Award, LogOut, X, Users, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockStudents } from '../../services/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape, click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Search filter options
  const routes = [
    { name: 'Dashboard Home', path: '/dashboard', icon: Home, category: 'Navigation' },
    { name: 'Smart Attendance Grid', path: '/attendance', icon: Calendar, category: 'Navigation' },
    { name: 'Homework Hub', path: '/homework', icon: BookOpen, category: 'Navigation' },
    { name: 'Gradebook & Exams', path: '/grades', icon: Award, category: 'Navigation' },
    { name: 'AI Topic Explainer', path: '/ai?tab=explainer', icon: Sparkles, category: 'AI Tools' },
    { name: 'AI Exam Paper Generator', path: '/ai?tab=papers', icon: Sparkles, category: 'AI Tools' },
    { name: 'Student Risk Detector', path: '/ai?tab=risk', icon: Sparkles, category: 'AI Tools' },
    { name: 'Parent Report Generator', path: '/ai?tab=parent-report', icon: Sparkles, category: 'AI Tools' },
    { name: 'School Health Analytics', path: '/ai?tab=school-health', icon: Sparkles, category: 'AI Tools' }
  ];

  // Actions
  const actions = [
    { 
      name: 'Log Out Session', 
      action: async () => {
        await logout();
        navigate('/login');
        onClose();
      }, 
      icon: LogOut, 
      category: 'Actions' 
    }
  ];

  // Map students for quick navigation/profile viewing in search
  const students = mockStudents
    .filter(s => s.school_id === user?.school_id)
    .map(s => ({
      name: `Student: ${s.student_id} — Alex Mercer`, // Hardcoded name expansion for mock search
      id: s.id,
      category: 'Directory'
    }));

  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] p-4 backdrop-blur-xs"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#C5A880]/30 bg-[#222E28] shadow-2xl transition-all"
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-[#2C3E35] px-4 py-3">
          <Search className="h-5 w-5 text-[#C5A880]" />
          <input
            type="text"
            placeholder="Type a command or search students..."
            className="ml-3 flex-1 bg-transparent text-sm text-[#F4F1EA] outline-none placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="rounded p-1 hover:bg-[#2C3E35] text-[#C5A880]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredRoutes.length === 0 && filteredStudents.length === 0 && filteredActions.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-400">
              No results found for "{query}"
            </div>
          )}

          {/* Navigation Category */}
          {filteredRoutes.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#C5A880] uppercase">
                Pages
              </div>
              <div className="space-y-1">
                {filteredRoutes.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(r.path)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#F4F1EA] hover:bg-[#1E3F20]/50"
                  >
                    <r.icon className="h-4 w-4 text-[#C5A880]" />
                    <span>{r.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Directory Category */}
          {filteredStudents.length > 0 && (
            <div className="mt-3">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#C5A880] uppercase">
                Students
              </div>
              <div className="space-y-1">
                {filteredStudents.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(`/grades?studentId=${s.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#F4F1EA] hover:bg-[#1E3F20]/50"
                  >
                    <Users className="h-4 w-4 text-sky-400" />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions Category */}
          {filteredActions.length > 0 && (
            <div className="mt-3">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#C5A880] uppercase">
                System Actions
              </div>
              <div className="space-y-1">
                {filteredActions.map((a, idx) => (
                  <button
                    key={idx}
                    onClick={a.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-950/40"
                  >
                    <a.icon className="h-4 w-4 text-red-400" />
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex justify-between border-t border-[#2C3E35] bg-[#121A17] px-4 py-2 text-[10px] text-gray-400">
          <span>Search for students, pages, or options</span>
          <span className="flex gap-2">
            <span><kbd className="rounded bg-[#2C3E35] px-1.5 py-0.5 text-xs text-[#F4F1EA]">ESC</kbd> close</span>
            <span><kbd className="rounded bg-[#2C3E35] px-1.5 py-0.5 text-xs text-[#F4F1EA]">↵</kbd> select</span>
          </span>
        </div>
      </div>
    </div>
  );
};
