import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Menu, X, Bell, Search, LogOut, Calendar, BookOpen, 
  Award, Video, Sparkles, Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CommandPalette } from '../features/search/CommandPalette';
import { api } from '../services/api';
import type { Notification } from '../types';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      api.getNotifications(user.id).then(setNotifications).catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['student', 'teacher', 'school_admin', 'super_admin'] },
    { name: 'Attendance', path: '/attendance', icon: Calendar, roles: ['student', 'teacher', 'school_admin'] },
    { name: 'Homework Hub', path: '/homework', icon: BookOpen, roles: ['student', 'teacher'] },
    { name: 'Grades & Exams', path: '/grades', icon: Award, roles: ['student', 'teacher', 'school_admin'] },
    { name: 'Live Classrooms', path: '/classrooms', icon: Video, roles: ['student', 'teacher'] },
    { name: 'AI Cockpit', path: '/ai', icon: Sparkles, roles: ['student', 'teacher', 'school_admin', 'super_admin'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));
  const unreadNotifs = notifications.filter(n => !n.is_read);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-900/60 text-purple-200 border border-purple-500/30';
      case 'school_admin': return 'bg-amber-900/60 text-amber-200 border border-amber-500/30';
      case 'teacher': return 'bg-emerald-950 text-emerald-200 border border-emerald-500/30';
      default: return 'bg-blue-950 text-blue-200 border border-blue-500/30';
    }
  };

  const formatRole = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'school_admin') return 'School Admin';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA]">
      {/* Search Command Palette */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#222E28] border-r border-[#C5A880]/20 text-[#F4F1EA]">
        {/* Header Branding */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-[#2C3E35]">
          <div className="h-8 w-8 rounded bg-[#1E3F20] flex items-center justify-center border border-[#C5A880]/30">
            <Sparkles className="h-4 w-4 text-[#C5A880]" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-wider text-[#F4F1EA]">TEACHER'S DESK</h1>
            <span className="text-[10px] text-[#C5A880] uppercase tracking-widest font-semibold">AI Operating System</span>
          </div>
        </div>

        {/* Tenant (School) Info */}
        {user?.school_id && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-[#1A2421] border border-[#C5A880]/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#2C3E35] flex items-center justify-center text-xs font-bold text-[#C5A880]">
              AA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-[#F4F1EA]">Alabaster Academy</p>
              <span className="text-[9px] text-gray-400">School ID: {user.school_id.substring(0, 8)}</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#1E3F20] text-[#F4F1EA] border-l-4 border-[#C5A880] shadow-sm shadow-[#1E3F20]/50' 
                    : 'text-gray-300 hover:bg-[#2C3E35] hover:text-[#F4F1EA]'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#C5A880]' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-[#2C3E35] bg-[#1A2421]">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
              alt="Avatar"
              className="h-9 w-9 rounded-full bg-[#2C3E35] border border-[#C5A880]/30"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#F4F1EA] truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'Signing in...'}
              </p>
              <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded-full font-bold uppercase mt-0.5 ${getRoleBadgeColor(user?.role || 'student')}`}>
                {user ? formatRole(user.role) : ''}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-red-300 bg-[#2C3E35]/40 border border-red-950/20 hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile Navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="relative w-64 flex flex-col bg-[#222E28] text-[#F4F1EA] border-r border-[#C5A880]/20 p-5">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-[#2C3E35] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 pb-6 border-b border-[#2C3E35] mt-2">
              <Sparkles className="h-5 w-5 text-[#C5A880]" />
              <span className="font-bold text-sm text-[#F4F1EA] tracking-wider">TEACHER'S DESK</span>
            </div>

            <nav className="flex-1 space-y-1 mt-6">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive 
                        ? 'bg-[#1E3F20] text-[#F4F1EA]' 
                        : 'text-gray-300 hover:bg-[#2C3E35]'
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 text-gray-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#2C3E35] bg-[#1A2421] -mx-5 -mb-5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={user?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                  alt="Avatar"
                  className="h-9 w-9 rounded-full bg-[#2C3E35]"
                />
                <div>
                  <p className="text-xs font-bold text-[#F4F1EA]">{user?.first_name} {user?.last_name}</p>
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded-full font-bold uppercase mt-0.5 ${getRoleBadgeColor(user?.role || 'student')}`}>
                    {user ? formatRole(user.role) : ''}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-red-300 bg-[#2C3E35]/40 hover:bg-red-950/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#FFAF1EA] border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Search trigger */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-xs text-gray-500 w-64 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <span>Search...</span>
              <kbd className="ml-auto rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-mono">Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Realtime Alert Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                )}
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <button 
                        onClick={() => {
                          if (user) api.markNotificationsRead(user.id).then(() => setNotifications([]));
                        }}
                        className="text-[10px] text-[#1E3F20] font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${!n.is_read ? 'bg-amber-50/20' : ''}`}>
                          <p className="text-xs font-bold text-gray-800">{n.title}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-gray-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Toggle */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <img 
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                alt="Avatar"
                className="h-8 w-8 rounded-full border border-gray-200"
              />
              <span className="hidden sm:inline text-xs font-semibold text-gray-700">
                {user?.first_name}
              </span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
