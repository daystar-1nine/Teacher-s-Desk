import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, Calendar, BookOpen, Award, 
  Video, ShieldCheck, ArrowRight, Play, Plus, Minus, Check, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive states
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Sparkles,
      title: 'AI Teaching Assistant & Explainer',
      desc: 'Generate comprehensive topic explanations, student risk assessments, and classroom feedback with Gemini 2.5.'
    },
    {
      icon: BookOpen,
      title: 'Unified Homework Hub',
      desc: 'Create, distribute, and grade assignments. Students submit files and receive targeted score reports.'
    },
    {
      icon: Calendar,
      title: 'Smart Attendance Grid',
      desc: 'Mark attendances in bulk. Keep track of daily streaks, automatic levels, and gamified XP rewards.'
    },
    {
      icon: Award,
      title: 'Weighted Exams & Gradebook',
      desc: 'Manage grades, calculate GPAs, and plot historical progress trends with built-in analytics.'
    },
    {
      icon: Video,
      title: 'Virtual Live Classrooms',
      desc: 'Integrate Google Meet and Zoom directly to schedule sessions and join live events.'
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tenant Isolation',
      desc: 'Keep institution-level data strictly protected through school_id filters and Supabase Row Level Security (RLS).'
    }
  ];

  const pricing = [
    {
      name: 'Academy Basic',
      monthlyPrice: 49,
      annualPrice: 39,
      desc: 'Perfect for small tutorial centers and single classes.',
      features: ['Up to 50 Students', 'Core Homework Hub', 'Basic Smart Attendance', 'Secure School Portal']
    },
    {
      name: 'Alabaster Enterprise',
      monthlyPrice: 199,
      annualPrice: 159,
      desc: 'Full operational suite for schools and academies.',
      features: ['Unlimited Students', 'Advanced Gradebooks', 'Gemini 2.5 AI Assistant', 'Zoom / Meet Scheduler', 'Executive Health Analytics', 'Priority Email Support']
    }
  ];

  const faqs = [
    {
      question: 'How is student data isolated between schools?',
      answer: 'Our database uses a multi-tenant isolation pattern. Every table incorporates a school_id foreign key, and Supabase Row Level Security (RLS) policies intercept every query, ensuring users can only read or write records belonging to their authenticated tenant.'
    },
    {
      question: 'What happens if the Gemini AI API limits are exceeded?',
      answer: 'Teacher\'s Desk AI implements an offline fallback architecture. If the API key is missing or calls are throttled, a local deterministic mock engine generates styled, high-quality structured JSON templates so your classroom operations never halt.'
    },
    {
      question: 'Can parents log in to track their child\'s progress?',
      answer: 'Yes! The platform supports Student, Parent, Teacher, School Admin, and Super Admin roles. Parents linking to a child\'s profile see a tailored dashboard highlighting GPA averages, streaks, earned badges, and teacher comments.'
    },
    {
      question: 'How does the student risk detector calculate alerts?',
      answer: 'The detector aggregates three vectors: attendance percentage, recent quiz marks, and missing homework counts. It computes a unified risk index and outputs suggested interventions, such as parent conferences or tutoring.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#222E28] font-sans selection:bg-[#C5A880] selection:text-[#222E28] scroll-smooth">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#1E3F20] flex items-center justify-center border border-[#C5A880]/30 shadow-xs">
              <Sparkles className="h-5 w-5 text-[#C5A880]" />
            </div>
            <div>
              <span className="font-bold text-sm leading-tight tracking-wider text-[#222E28] block">TEACHER'S DESK</span>
              <span className="text-[9px] text-[#C5A880] uppercase tracking-widest font-semibold block">AI OS</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-600">
            <a href="#features" className="hover:text-[#1E3F20] hover:underline transition-all underline-offset-4">Features</a>
            <a href="#dashboard-mock" className="hover:text-[#1E3F20] hover:underline transition-all underline-offset-4">Interface</a>
            <a href="#pricing" className="hover:text-[#1E3F20] hover:underline transition-all underline-offset-4">Pricing</a>
            <a href="#faqs" className="hover:text-[#1E3F20] hover:underline transition-all underline-offset-4">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3F20] hover:bg-[#28532C] text-[#F4F1EA] text-xs font-bold rounded-lg transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-gray-600 hover:text-[#1E3F20] transition-all px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-[#C5A880] hover:bg-[#E2C799] text-[#222E28] text-xs font-bold rounded-lg border border-[#C5A880]/30 shadow-xs transition-all cursor-pointer"
                >
                  Register School
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E3F20]/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold bg-[#1E3F20]/10 text-[#1E3F20] border border-[#1E3F20]/25 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-[#C5A880]" />
              <span>Next-Gen Academic Operating System</span>
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-[#222E28]">
              Empower classrooms with <span className="text-[#1E3F20] bg-gradient-to-r from-[#1E3F20] to-[#2C3E35] bg-clip-text text-transparent">Gemini AI</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Teacher's Desk AI merges school ERP databases, LMS platforms, smart bulk attendances, gamified level engines, and AI teaching co-pilots into one premium academic console.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1E3F20] text-white hover:bg-[#28532C] font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Enter Platform Console
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1E3F20] text-white hover:bg-[#28532C] font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Launch Free Sandbox</span>
                    <ArrowRight className="h-4.5 w-4.5 text-[#C5A880]" />
                  </button>
                  <a 
                    href="#dashboard-mock"
                    className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 bg-white hover:bg-gray-50 font-bold text-sm rounded-xl transition-all text-gray-700 text-center flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Explore Interface</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Interactive Dashboard Mockup Showcase */}
      <section id="dashboard-mock" className="py-12 bg-gradient-to-b from-[#F4F1EA] to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-gray-800">State of the Art Dashboard</h2>
            <p className="text-xs text-gray-500 mt-1">Explore the Alabaster Academy deep forest style theme</p>
          </div>

          <div className="relative rounded-2xl border border-[#C5A880]/30 shadow-2xl overflow-hidden bg-white/80 p-2 lg:p-4 backdrop-blur-md hover:scale-[1.01] transition-all duration-500">
            <img 
              src="/hero_dashboard_mockup.png" 
              alt="Teacher's Desk AI UI Screenshot" 
              className="w-full h-auto rounded-xl shadow-lg border border-gray-100 object-cover" 
            />
            {/* Features highlighting indicators */}
            <div className="absolute inset-0 bg-transparent flex flex-col justify-end p-6">
              <div className="bg-[#222E28]/95 border border-[#C5A880]/30 rounded-xl p-4 max-w-md shadow-2xl backdrop-blur-md self-start text-xs">
                <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider block mb-1">Interactive Interface Highlight</span>
                <p className="text-white font-medium">
                  Dynamic widgets render charts, attendance streaks, active classes, and AI detector cards immediately based on active roles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222E28]">Unified Management Features</h2>
            <p className="text-xs text-gray-500">Everything needed to run modern multi-tenant classrooms smoothly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 hover:shadow-lg transition-all group hover:-translate-y-1 duration-300">
                <div className="h-10 w-10 bg-[#1E3F20]/10 rounded-xl flex items-center justify-center text-[#1E3F20] mb-4 group-hover:bg-[#1E3F20] group-hover:text-[#F4F1EA] transition-all">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Toggle */}
      <section id="pricing" className="py-20 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222E28]">SaaS Pricing Plans</h2>
            <p className="text-xs text-gray-500">Pick a package tailored for your school's parameters</p>
            
            {/* Toggle bar */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-bold ${!isAnnual ? 'text-[#1E3F20]' : 'text-gray-400'}`}>Monthly Billing</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 rounded-full bg-[#1E3F20] p-1 flex items-center transition-all cursor-pointer relative"
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-all shadow-xs ${
                    isAnnual ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isAnnual ? 'text-[#1E3F20]' : 'text-gray-400'}`}>
                <span>Annual Billing</span>
                <span className="text-[9px] bg-red-100 border border-red-200 text-red-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {pricing.map((plan, idx) => {
              const isEnterprise = plan.name.includes('Enterprise');
              const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              
              return (
                <div 
                  key={idx} 
                  className={`p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                    isEnterprise 
                      ? 'bg-[#222E28] text-white border-[#C5A880]/30 shadow-xl' 
                      : 'bg-white text-gray-800 border-gray-200 shadow-xs'
                  }`}
                >
                  <div>
                    <h3 className={`text-base font-bold uppercase tracking-wider ${isEnterprise ? 'text-[#C5A880]' : 'text-[#1E3F20]'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-2 ${isEnterprise ? 'text-gray-300' : 'text-gray-500'}`}>{plan.desc}</p>
                    
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">${currentPrice}</span>
                      <span className={`text-xs ${isEnterprise ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
                    </div>

                    <ul className="mt-8 space-y-3.5">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-3 text-xs">
                          <Check className={`h-4.5 w-4.5 shrink-0 ${isEnterprise ? 'text-[#C5A880]' : 'text-[#1E3F20]'}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => navigate('/login')}
                    className={`mt-8 w-full py-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isEnterprise 
                        ? 'bg-[#C5A880] text-[#222E28] border-[#C5A880] hover:bg-[#E2C799]' 
                        : 'bg-[#1E3F20] text-white border-[#1E3F20] hover:bg-[#28532C]'
                    }`}
                  >
                    Select Plan & Register
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faqs" className="py-20 bg-white border-t border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222E28]">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500">Find answers to architectural and technical inquiries</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-[#FAF9F6]/40">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4.5 w-4.5 text-[#C5A880]" />
                      <span>{faq.question}</span>
                    </span>
                    <span className="text-gray-400 text-lg">{isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest block mb-2">Success Stories</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222E28] leading-tight">
                Empowering administrators and teachers worldwide
              </h2>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed max-w-md">
                Hear how Alabaster Academy scaled up their operational efficiency and student grade outputs within 6 months of transitioning to Teacher's Desk AI.
              </p>
              <div className="mt-8 flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-[#1E3F20]">94%</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Attendance streaks</p>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div>
                  <p className="text-2xl font-bold text-[#1E3F20]">3x</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Faster test paper gen</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4 h-12 w-12 text-[#C5A880]/20 font-serif text-6xl leading-none">“</div>
              <p className="text-xs text-gray-600 italic leading-relaxed relative z-10">
                "Teacher's Desk AI has completely reimagined how we mark attendance and assess risk. The Gemini Topic Explainer creates instant resources, and the RLS multi-tenant sandbox lets our faculty work without data spill concerns."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#1E3F20] text-white flex items-center justify-center font-bold text-xs border border-[#C5A880]/30">
                  AP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Arthur Pendleton</h4>
                  <p className="text-[9px] text-gray-400">Headmaster, Alabaster Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="bg-[#222E28] text-white py-12 border-t border-[#C5A880]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F4F1EA]">Start Transforming Your Institution Today</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Provision isolated databases and unlock Gemini 2.5 Flash academic assistance interfaces instantly.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#C5A880] text-[#222E28] hover:bg-[#E2C799] font-bold text-xs rounded-lg border border-[#C5A880]/30 transition-all cursor-pointer"
          >
            Launch Sandbox Console
          </button>
          <div className="pt-8 border-t border-[#2C3E35] text-[10px] text-gray-500">
            &copy; {new Date().getFullYear()} Teacher's Desk AI. Built for elite schools and educators. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
