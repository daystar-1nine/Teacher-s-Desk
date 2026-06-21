import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockProfiles } from '../../services/mockData';

export const AdminLogin: React.FC = () => {
  const { login, error, clearError, isMock } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  const handleSandboxSelect = async (selectedEmail: string) => {
    setSubmitting(true);
    const success = await login(selectedEmail, 'TemporaryPassword123!');
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121A17] px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-950/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E3F20]/20 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-purple-950 flex items-center justify-center border border-purple-500/30 shadow-lg">
            <Lock className="h-6 w-6 text-purple-300" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F4F1EA]">
            Admin Control Center
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Teacher's Desk AI — Restricted Portal
          </p>
        </div>

        <div className="bg-[#1A2421]/95 border border-purple-900/35 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-200 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-[#2C3E35]/50 border border-purple-900/20 text-[#F4F1EA] text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                placeholder="admin@alabaster.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-[#2C3E35]/50 border border-purple-900/20 text-[#F4F1EA] text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-purple-500/30 rounded-lg text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Verifying Admin...' : 'Enter System'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Sandbox Demo Helper */}
          {isMock && (
            <div className="mt-8 pt-6 border-t border-[#2C3E35]">
              <div className="flex items-center gap-2 text-xs text-purple-300 font-bold mb-3 uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Sandbox Logins</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {mockProfiles
                  .filter(p => p.role === 'super_admin' || p.role === 'school_admin')
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSandboxSelect(p.email)}
                      className="text-left px-3 py-2 rounded bg-[#2C3E35]/30 border border-purple-900/10 hover:border-purple-500/30 text-gray-300 hover:text-white transition-all cursor-pointer truncate"
                    >
                      <p className="font-bold truncate">{p.first_name} {p.last_name}</p>
                      <span className="text-[9px] uppercase opacity-75 font-semibold text-purple-300">
                        {p.role === 'super_admin' ? 'Super Admin' : 'School Admin'}
                      </span>
                    </button>
                  ))
                }
              </div>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-xs text-gray-400 hover:text-purple-300 underline">
                  Back to Standard Portal (/login)
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
