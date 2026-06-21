import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, UserCheck, ShieldAlert, 
  Printer, RefreshCw, CheckCircle, TrendingDown, TrendingUp,
  Download, Share2, Eye, EyeOff, Trophy
} from 'lucide-react';
import { aiService } from '../../services/ai';
import type { 
  TopicExplanation, QuestionPaper, RiskAnalysis, 
  ParentReport, SchoolHealthReport 
} from '../../services/ai';
import { mockStudents } from '../../services/mockData';

export const AiCockpit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explainer' | 'papers' | 'risk' | 'parent-report' | 'school-health'>('explainer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Toasts state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Topic Explainer State
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Exam Focused'>('Intermediate');
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  
  // Interactive Explainer Practice Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // 2. Question Paper State
  const [paperGrade, setPaperGrade] = useState('Grade 10');
  const [paperSubject, setPaperSubject] = useState('Mathematics');
  const [paperDuration, setPaperDuration] = useState('90 Minutes');
  const [paperTopic, setPaperTopic] = useState('Quadratic Factoring & Graphing');
  const [paperDiff, setPaperDiff] = useState('Medium');
  const [paperInstruct, setPaperInstruct] = useState('Focus on multi-step solving.');
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);

  // 3. Risk Detector State
  const [selectedStudentId, setSelectedStudentId] = useState(mockStudents[0].id);
  const [riskProfile, setRiskProfile] = useState<RiskAnalysis | null>(null);
  // Risk Interventions checkboxes
  const [interventionsChecked, setInterventionsChecked] = useState<Record<number, boolean>>({});

  // 4. Parent Report State
  const [parentReportStudentId, setParentReportStudentId] = useState(mockStudents[0].id);
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);

  // 5. School Health State
  const [healthReport, setHealthReport] = useState<SchoolHealthReport | null>(null);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    setShowQuiz(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    try {
      const data = await aiService.explainTopic(subject, topic, difficulty);
      setExplanation(data);
    } catch (e: any) {
      setError(e.message || 'Failed to explain topic.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Interactive Practice Quiz on Explainer Topic
  const handleGenerateQuiz = () => {
    setShowQuiz(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
  };

  const handleSubmitQuiz = () => {
    if (!explanation) return;
    let score = 0;
    // Mock check: Q1 correct is 0, Q2 is 2, Q3 is 1
    if (selectedAnswers[0] === 0) score += 1;
    if (selectedAnswers[1] === 2) score += 1;
    if (selectedAnswers[2] === 1) score += 1;
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score === 3) {
      triggerToast('Perfect Score! Earned 150 XP and "Quiz Master" progress streak! 🏆');
    } else {
      triggerToast(`Quiz Submitted! You scored ${score}/3. Keep practicing!`);
    }
  };

  const handleGeneratePaper = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.generateQuestionPaper(
        paperGrade, paperSubject, paperDuration, paperTopic, paperDiff, paperInstruct
      );
      setPaper(data);
    } catch (e: any) {
      setError(e.message || 'Failed to generate question paper.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessRisk = async () => {
    setLoading(true);
    setError(null);
    setInterventionsChecked({});
    try {
      const student = mockStudents.find(s => s.id === selectedStudentId);
      if (!student) return;
      
      const name = selectedStudentId === 'user-student-alex' 
        ? 'Alex Mercer' 
        : selectedStudentId === 'user-student-lily' 
        ? 'Lily Chen' 
        : 'Jordan Sparks';
        
      const attendanceRate = selectedStudentId === 'user-student-jordan' ? 78 : selectedStudentId === 'user-student-alex' ? 92 : 98;
      const averageGrade = selectedStudentId === 'user-student-jordan' ? 58 : selectedStudentId === 'user-student-alex' ? 84 : 96;
      const missingHw = selectedStudentId === 'user-student-jordan' ? 4 : selectedStudentId === 'user-student-alex' ? 0 : 0;

      const data = await aiService.detectStudentRisk(attendanceRate, averageGrade, missingHw, name);
      setRiskProfile(data);
    } catch (e: any) {
      setError(e.message || 'Failed to assess student risk.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployInterventions = () => {
    if (!riskProfile) return;
    const activeInterventions = Object.keys(interventionsChecked)
      .filter(k => interventionsChecked[Number(k)])
      .map(k => riskProfile.interventions[Number(k)]);

    if (activeInterventions.length === 0) {
      triggerToast('Please select at least one intervention to deploy.');
      return;
    }
    triggerToast(`Successfully deployed ${activeInterventions.length} intervention actions to student portal! Alert sent to parents. ✉️`);
  };

  const handleGenerateParentReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const student = mockStudents.find(s => s.id === parentReportStudentId);
      if (!student) return;
      
      const name = parentReportStudentId === 'user-student-alex' 
        ? 'Alex Mercer' 
        : parentReportStudentId === 'user-student-lily' 
        ? 'Lily Chen' 
        : 'Jordan Sparks';

      const attendanceRate = parentReportStudentId === 'user-student-jordan' ? 78 : parentReportStudentId === 'user-student-alex' ? 92 : 98;
      const avgGrade = parentReportStudentId === 'user-student-jordan' ? 58 : parentReportStudentId === 'user-student-alex' ? 84 : 96;
      
      const data = await aiService.generateParentReport(
        name,
        attendanceRate,
        (avgGrade / 100) * 4,
        parentReportStudentId === 'user-student-jordan' ? '50% Complete' : '100% Complete',
        parentReportStudentId === 'user-student-lily' ? ['Science projects', 'Algebraic speed'] : ['Oral presentations'],
        parentReportStudentId === 'user-student-jordan' ? ['Factoring formula recall', 'Punctuality'] : ['Geometry layout']
      );
      setParentReport(data);
    } catch (e: any) {
      setError(e.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareReport = () => {
    if (!parentReport) return;
    triggerToast(`Report summary securely dispatched to the parent portal email for ${parentReport.studentName}. 📤`);
  };

  const handleGenerateHealthReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.generateSchoolHealthReport(
        94.2,
        [
          { grade: 'Grade A', count: 45 },
          { grade: 'Grade B', count: 35 },
          { grade: 'Grade C', count: 12 },
          { grade: 'Grade D/F', count: 8 }
        ],
        28,
        88
      );
      setHealthReport(data);
    } catch (e: any) {
      setError(e.message || 'Failed to generate health report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    triggerToast('Downloading metrics report as school_health_audit.csv... 📊');
  };

  const handlePrint = () => {
    window.print();
  };

  // Mock practice quiz questions corresponding to topic
  const practiceQuiz = [
    {
      q: `What is the core mathematical purpose of studying ${topic}?`,
      opts: [`To solve values for unknown variables matching boundary states`, `To plot linear lines only`, `To map historical dates`, `To measure weight scales`],
      correct: 0
    },
    {
      q: `How does difficulty setting affect problem working rules?`,
      opts: [`Rules become completely randomized`, `Equations change physics parameters`, `Steps require multi-layered proofs and theorem verification`, `No calculations are required`],
      correct: 2
    },
    {
      q: `Which parameter signifies the maximum limits in a system function?`,
      opts: [`Minimum constant`, `Inflexion boundary index`, `The peak coefficient`, `Average variance`],
      correct: 1
    }
  ];

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#222E28] border border-[#C5A880] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in">
          <Sparkles className="h-5 w-5 text-[#C5A880] shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C5A880]" />
            <span>AI Assistive Cockpit</span>
          </h2>
          <p className="text-xs text-gray-500">Access Gemini 2.5 generative intelligence features</p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {(['explainer', 'papers', 'risk', 'parent-report', 'school-health'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(null); }}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 cursor-pointer transition-all ${
              activeTab === tab ? 'border-[#1E3F20] text-[#1E3F20]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'explainer' && '1. Topic Explainer'}
            {tab === 'papers' && '2. Paper Generator'}
            {tab === 'risk' && '3. Risk Detector'}
            {tab === 'parent-report' && '4. Parent Report'}
            {tab === 'school-health' && '5. School Health'}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {/* TAB CONTENT CARDS */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs min-h-[40vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <RefreshCw className="h-8 w-8 text-[#1E3F20] animate-spin" />
            <p className="text-xs font-bold text-gray-600">Querying Gemini 2.5 Engine...</p>
          </div>
        ) : (
          <>
            {/* 1. TOPIC EXPLAINER TAB */}
            {activeTab === 'explainer' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white">
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">General Science</option>
                      <option value="History">World History</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Topic</label>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white">
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Exam Focused">Exam Focused Prep</option>
                    </select>
                  </div>
                  <button onClick={handleExplain} className="md:col-span-4 py-2 bg-[#1E3F20] text-white hover:bg-[#28532C] rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <Sparkles className="h-4 w-4" />
                    <span>Explain Topic</span>
                  </button>
                </div>

                {explanation && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Explanations */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FAF9F6] border border-[#C5A880]/30 shadow-xs space-y-6">
                      <div className="border-b border-[#C5A880]/20 pb-4 flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-gray-800">{topic}</h3>
                          <p className="text-xs font-semibold text-[#C5A880] mt-0.5">{subject} • {difficulty} Explanation</p>
                        </div>
                        <button 
                          onClick={handleGenerateQuiz}
                          className="flex items-center gap-1 bg-[#1E3F20] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:bg-[#28532C] cursor-pointer shadow-xs"
                        >
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Start Practice Quiz</span>
                        </button>
                      </div>

                      <div className="space-y-4 text-xs text-gray-700">
                        <div>
                          <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-1">Definition</h4>
                          <p className="bg-white p-3 rounded-lg border border-gray-100 italic">"{explanation.definition}"</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-1">Detailed Explanation</h4>
                          <p className="leading-relaxed bg-white p-3 rounded-lg border border-gray-100">{explanation.explanation}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-1">Examples</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {explanation.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-1">Real-World Applications</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {explanation.realWorldApplications.map((ap, i) => <li key={i}>{ap}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/20 rounded-lg">
                          <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-1">Exam Tips</h4>
                          <ul className="list-decimal pl-4 space-y-1 font-semibold text-[#1E3F20]">
                            {explanation.examTips.map((tip, i) => <li key={i}>{tip}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Quiz Section */}
                    <div className="space-y-6">
                      {showQuiz && (
                        <div className="bg-[#222E28] rounded-2xl p-5 text-white border border-[#C5A880]/30 shadow-lg space-y-4">
                          <h4 className="text-xs font-bold text-[#C5A880] uppercase tracking-wider border-b border-[#2C3E35] pb-2 flex items-center gap-2">
                            <Trophy className="h-4.5 w-4.5" />
                            <span>Topic Practice Quiz</span>
                          </h4>
                          
                          <div className="space-y-4 text-xs">
                            {practiceQuiz.map((quiz, qIdx) => (
                              <div key={qIdx} className="space-y-2">
                                <p className="font-semibold text-gray-300">{qIdx + 1}. {quiz.q}</p>
                                <div className="space-y-1">
                                  {quiz.opts.map((opt, oIdx) => {
                                    const isSelected = selectedAnswers[qIdx] === oIdx;
                                    const isCorrect = quiz.correct === oIdx;
                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        disabled={quizSubmitted}
                                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                                        className={`w-full text-left p-2 rounded transition-all cursor-pointer ${
                                          isSelected 
                                            ? 'bg-[#C5A880] text-[#222E28] font-bold' 
                                            : 'bg-[#2C3E35] hover:bg-[#2C3E35]/70 text-gray-300'
                                        } ${
                                          quizSubmitted && isCorrect 
                                            ? 'border border-emerald-400 bg-emerald-950/40 text-emerald-300' 
                                            : ''
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            {!quizSubmitted ? (
                              <button
                                onClick={handleSubmitQuiz}
                                className="w-full py-2 bg-[#C5A880] text-[#222E28] font-bold rounded-lg transition-all hover:bg-[#E2C799] cursor-pointer"
                              >
                                Submit Answers
                              </button>
                            ) : (
                              <div className="p-3 bg-[#121A17] rounded-lg border border-[#C5A880]/20 text-center font-bold">
                                Score: {quizScore}/3 correct!
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. QUESTION PAPER GENERATOR TAB */}
            {activeTab === 'papers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Grade</label>
                    <input type="text" value={paperGrade} onChange={e => setPaperGrade(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Subject</label>
                    <input type="text" value={paperSubject} onChange={e => setPaperSubject(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Duration</label>
                    <input type="text" value={paperDuration} onChange={e => setPaperDuration(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Assessment Topic</label>
                    <input type="text" value={paperTopic} onChange={e => setPaperTopic(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Difficulty</label>
                    <select value={paperDiff} onChange={e => setPaperDiff(e.target.value)} className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Custom Instructions</label>
                    <textarea value={paperInstruct} onChange={e => setPaperInstruct(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white outline-none" rows={2} />
                  </div>
                  <button onClick={handleGeneratePaper} className="md:col-span-3 py-2 bg-[#1E3F20] text-white hover:bg-[#28532C] rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Question Paper</span>
                  </button>
                </div>

                {paper && (
                  <div className="p-6 rounded-2xl bg-white border border-gray-300 shadow-lg space-y-6 text-xs text-gray-700 printable-area">
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                      <div className="text-left">
                        <h2 className="text-base font-bold uppercase tracking-wider text-gray-900">{paper.title}</h2>
                        <p className="font-semibold text-gray-600 mt-1">{paper.subject} — {paper.grade}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Allocated Duration: {paper.duration} • Marks: 100 Max</p>
                      </div>
                      <button
                        onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-all cursor-pointer print:hidden"
                      >
                        {showAnswerKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span>{showAnswerKeys ? 'Hide Answer Keys' : 'Show Answer Keys'}</span>
                      </button>
                    </div>

                    {/* Section A */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-1 uppercase">Section A: Multiple Choice Questions</h3>
                      {paper.sectionA.map((q, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-semibold">Q{idx + 1}. {q.question}</p>
                          <div className="grid grid-cols-2 gap-2 pl-4 text-gray-500">
                            {q.options.map((opt, oIdx) => <p key={oIdx}>{opt}</p>)}
                          </div>
                          {showAnswerKeys && (
                            <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">
                              Correct Answer: {q.answer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Section B */}
                    <div className="space-y-3 pt-4">
                      <h3 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-1 uppercase">Section B: Short Answer Questions</h3>
                      {paper.sectionB.map((q, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-semibold">Q{idx + 1}. {q.question}</p>
                          {showAnswerKeys && (
                            <p className="text-[10px] text-[#C5A880] font-bold bg-[#C5A880]/10 px-2 py-0.5 rounded inline-block mt-1">
                              Grading Key: {q.answerKey}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Section C */}
                    <div className="space-y-3 pt-4">
                      <h3 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-1 uppercase">Section C: Long Essay Questions</h3>
                      {paper.sectionC.map((q, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="font-semibold">Q{idx + 1}. {q.question}</p>
                          {showAnswerKeys && (
                            <p className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded inline-block mt-1">
                              Point Rubrics: {q.rubrics}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer print action */}
                    <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 print:hidden">
                      <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all cursor-pointer animate-pulse">
                        <Printer className="h-4 w-4" />
                        <span>Print / Export PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. STUDENT RISK DETECTOR TAB */}
            {activeTab === 'risk' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Select Student to Analyze</label>
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white">
                      {mockStudents.map(s => {
                        const name = s.id === 'user-student-alex' ? 'Alex Mercer' : s.id === 'user-student-lily' ? 'Lily Chen' : 'Jordan Sparks';
                        return <option key={s.id} value={s.id}>{name} ({s.student_id})</option>;
                      })}
                    </select>
                  </div>
                  <button onClick={handleAssessRisk} className="py-2.5 px-4 bg-red-950 text-white hover:bg-red-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-5">
                    <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
                    <span>Run AI Risk Diagnostic</span>
                  </button>
                </div>

                {riskProfile && (
                  <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-red-500/25 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">Academic Risk Profile: {riskProfile.studentName}</h3>
                        <p className="text-[10px] text-gray-400">Analysis run using active class records</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        riskProfile.riskLevel === 'High' 
                          ? 'bg-red-100 text-red-800 border-red-500/30' 
                          : riskProfile.riskLevel === 'Medium' 
                          ? 'bg-amber-100 text-amber-800 border-amber-500/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-500/30'
                      }`}>
                        {riskProfile.riskLevel} Risk (Score: {riskProfile.riskScore})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Left: Risk Score SVG circular gauge */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">AI Risk Score</span>
                        <div className="relative h-28 w-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="46" stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                            <circle 
                              cx="56" 
                              cy="56" 
                              r="46" 
                              stroke={riskProfile.riskLevel === 'High' ? '#EF4444' : riskProfile.riskLevel === 'Medium' ? '#F59E0B' : '#10B981'} 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray="289"
                              strokeDashoffset={289 - (289 * riskProfile.riskScore) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-xl font-extrabold text-gray-800">{riskProfile.riskScore}%</span>
                        </div>
                      </div>

                      {/* Right: Risk Trends */}
                      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <p className="text-gray-400 font-bold uppercase text-[9px]">Attendance Trend</p>
                          <p className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-1.5">
                            {riskProfile.attendanceTrend === 'Declining' ? <TrendingDown className="h-4 w-4 text-red-500" /> : <TrendingUp className="h-4 w-4 text-emerald-500" />}
                            <span>{riskProfile.attendanceTrend}</span>
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <p className="text-gray-400 font-bold uppercase text-[9px]">Grade Progress</p>
                          <p className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-1.5">
                            {riskProfile.gradeTrend === 'Slipping' ? <TrendingDown className="h-4 w-4 text-red-500" /> : <TrendingUp className="h-4 w-4 text-emerald-500" />}
                            <span>{riskProfile.gradeTrend}</span>
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <p className="text-gray-400 font-bold uppercase text-[9px]">Missing Homeworks</p>
                          <p className="text-sm font-bold text-gray-800 mt-1">{riskProfile.missingHomework} items</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700 pt-2">
                      <div>
                        <h4 className="font-bold text-red-800 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Identified Warning Alerts</span>
                        </h4>
                        <ul className="list-disc pl-4 space-y-1.5">
                          {riskProfile.alerts.map((al, i) => <li key={i}>{al}</li>)}
                        </ul>
                      </div>

                      {/* Interactive Intervention Dispatcher */}
                      <div>
                        <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          <span>Select Interventions to Deploy</span>
                        </h4>
                        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100">
                          {riskProfile.interventions.map((inte, i) => (
                            <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!!interventionsChecked[i]} 
                                onChange={(e) => setInterventionsChecked({ ...interventionsChecked, [i]: e.target.checked })}
                                className="mt-0.5 accent-[#1E3F20]" 
                              />
                              <span>{inte}</span>
                            </label>
                          ))}
                          <button
                            onClick={handleDeployInterventions}
                            className="w-full mt-3 py-1.5 bg-[#1E3F20] text-white hover:bg-[#28532C] font-bold text-[10px] rounded transition-all cursor-pointer"
                          >
                            Deploy Selected Interventions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. PARENT REPORT TAB */}
            {activeTab === 'parent-report' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Select Student</label>
                    <select value={parentReportStudentId} onChange={e => setParentReportStudentId(e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded bg-white">
                      {mockStudents.map(s => {
                        const name = s.id === 'user-student-alex' ? 'Alex Mercer' : s.id === 'user-student-lily' ? 'Lily Chen' : 'Jordan Sparks';
                        return <option key={s.id} value={s.id}>{name} ({s.student_id})</option>;
                      })}
                    </select>
                  </div>
                  <button onClick={handleGenerateParentReport} className="py-2.5 px-4 bg-[#1E3F20] text-white hover:bg-[#28532C] rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-5">
                    <UserCheck className="h-4.5 w-4.5 text-[#C5A880]" />
                    <span>Compile Progress Summary</span>
                  </button>
                </div>

                {parentReport && (
                  <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#C5A880]/30 shadow-xs space-y-6 text-xs text-gray-700">
                    <div className="flex justify-between items-center border-b border-[#C5A880]/20 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">Child Progress Report Summary</h3>
                        <p className="text-xs text-gray-500 mt-1">Student name: {parentReport.studentName} • Grade 10A</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShareReport}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#C5A880]/30 hover:bg-white text-gray-700 font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Dispatch to Parent</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Attendance Rate</p>
                        <p className="text-sm font-bold text-[#1E3F20] mt-1">{parentReport.attendanceRate}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Calculated GPA</p>
                        <p className="text-sm font-bold text-[#1E3F20] mt-1">{parentReport.gpa}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Homework Completion</p>
                        <p className="text-sm font-bold text-[#1E3F20] mt-1">{parentReport.homeworkCompletion}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div>
                        <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Strengths</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {parentReport.strengths.map((st, i) => <li key={i}>{st}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Focus Areas</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {parentReport.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/20">
                      <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-1">Recommendations for home</h4>
                      <ul className="list-decimal pl-4 space-y-1 font-medium">
                        {parentReport.recommendations.map((re, i) => <li key={i}>{re}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. SCHOOL HEALTH REPORT TAB */}
            {activeTab === 'school-health' && (
              <div className="space-y-6">
                <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-gray-800">Generate Institutional Health Audit</h3>
                    <p className="text-[10px] text-gray-500">Run macro analytics scan over school database</p>
                  </div>
                  <button onClick={handleGenerateHealthReport} className="py-2 px-4 bg-[#222E28] hover:bg-[#121A17] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <Sparkles className="h-4.5 w-4.5 text-[#C5A880]" />
                    <span>Run Health Diagnostic</span>
                  </button>
                </div>

                {healthReport && (
                  <div className="p-6 rounded-2xl bg-white border border-[#C5A880]/20 shadow-xs space-y-6 text-xs text-gray-700">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">Executive Institution Summary</h3>
                        <p className="text-xs text-gray-500 mt-1">Tenant isolation ID: school-alabaster • Real-time metrics</p>
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Mean Attendance</p>
                        <p className="text-base font-bold text-gray-800 mt-1">{healthReport.averageAttendance}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Engagement Score</p>
                        <p className="text-base font-bold text-gray-800 mt-1">{healthReport.engagementScore} / 100</p>
                      </div>
                      <div className="bg-gray-50 md:col-span-2 p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Faculty Audit Status</p>
                        <p className="text-xs font-semibold text-gray-800 mt-1">{healthReport.teacherActivity}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-3">Module Engagement Rates</h4>
                      <div className="space-y-3">
                        {healthReport.platformUsage.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between font-medium">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-[#1E3F20] h-2 rounded-full" style={{ width: `${item.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200">
                      <h4 className="font-bold text-[#1E3F20] uppercase tracking-wider text-[10px] mb-2">Executive strategic insights</h4>
                      <ul className="list-disc pl-4 space-y-1.5 font-medium">
                        {healthReport.summaryInsights.map((ins, i) => <li key={i}>{ins}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
