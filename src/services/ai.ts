import { supabase, isMockMode } from './supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Toggles whether we run real Gemini queries or immediate smart mock responses
export const isAiOffline = !GEMINI_API_KEY || GEMINI_API_KEY.includes('Placeholder');

// Types for AI returns
export interface TopicExplanation {
  definition: string;
  explanation: string;
  examples: string[];
  realWorldApplications: string[];
  historicalContext: string;
  diagramDescription: string;
  examTips: string[];
  keyTakeaways: string[];
}

export interface QuestionPaper {
  title: string;
  subject: string;
  grade: string;
  duration: string;
  sectionA: { question: string; options: string[]; answer: string }[]; // MCQs
  sectionB: { question: string; answerKey: string }[]; // Short Answers
  sectionC: { question: string; rubrics: string }[]; // Long Answers
}

export interface RiskAnalysis {
  studentId: string;
  studentName: string;
  riskScore: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  attendanceTrend: string;
  gradeTrend: string;
  missingHomework: number;
  alerts: string[];
  interventions: string[];
}

export interface ParentReport {
  studentName: string;
  attendanceRate: string;
  gpa: string;
  homeworkCompletion: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SchoolHealthReport {
  averageAttendance: string;
  gradeDistribution: { grade: string; count: number }[];
  teacherActivity: string;
  engagementScore: number;
  platformUsage: { label: string; value: number }[];
  summaryInsights: string[];
}

async function queryEdgeFunction(action: string, payload: any): Promise<any> {
  const { data, error } = await supabase.functions.invoke('gemini-ai', {
    body: { action, payload }
  });
  if (error) throw new Error(error.message || 'Edge Function execution failed');
  return data;
}

// REST call helper to Gemini
async function queryGemini(prompt: string, schema?: any): Promise<string> {
  if (isAiOffline) {
    throw new Error('Gemini API operating offline or unconfigured.');
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: schema ? "application/json" : "text/plain",
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini.');
  }
  return text;
}

export const aiService = {
  // 1. TOPIC EXPLAINER
  explainTopic: async (subject: string, topic: string, difficulty: 'Beginner' | 'Intermediate' | 'Exam Focused'): Promise<TopicExplanation> => {
    const prompt = `
      You are an elite educational assistant. Explain the following academic topic:
      Subject: ${subject}
      Topic: ${topic}
      Difficulty/Target: ${difficulty}

      Respond strictly with a JSON object. Do not include markdown code block syntax (like \`\`\`json). The JSON must exactly match this structure:
      {
        "definition": "Clear, precise academic definition.",
        "explanation": "Detailed explanation tailored for a ${difficulty} student.",
        "examples": ["Example 1", "Example 2"],
        "realWorldApplications": ["Application 1", "Application 2"],
        "historicalContext": "Brief historical background or discovery context.",
        "diagramDescription": "A textual description of how to draw a diagram illustrating this concept.",
        "examTips": ["Exam Tip 1", "Exam Tip 2"],
        "keyTakeaways": ["Takeaway 1", "Takeaway 2"]
      }
    `;

    if (!isMockMode) {
      try {
        return await queryEdgeFunction('explain-topic', { subject, topic, difficulty });
      } catch (err) {
        console.warn('aiService.explainTopic: Edge Function failed, falling back to client-side query.', err);
      }
    }

    try {
      if (isAiOffline) {
        throw new Error('Offline fallback mode triggered');
      }
      const responseText = await queryGemini(prompt);
      return JSON.parse(responseText);
    } catch (e) {
      console.warn('aiService.explainTopic: falling back to offline generator.', e);
      
      // Curated academic topic database
      const key = topic.toLowerCase().trim();
      if (key.includes('quadratic')) {
        return {
          definition: "A quadratic equation is a second-degree algebraic equation of the form ax² + bx + c = 0, where x represents a variable, and a, b, and c are constants with a ≠ 0.",
          explanation: `This topic covers quadratic functions which represent curves called parabolas. Tailored for a ${difficulty} student, we focus on resolving the roots (zeros) where the parabola intersects the x-axis using factoring, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.`,
          examples: [
            "Solve x² - 5x + 6 = 0: factors to (x-2)(x-3) = 0, yielding roots x = 2 and x = 3.",
            "Solve 2x² - 8 = 0: gives x² = 4, yielding roots x = 2 and x = -2."
          ],
          realWorldApplications: [
            "Trajectory dynamics: calculating the flight path of a thrown ball or rocket launch.",
            "Revenue optimization: modeling profit curves to determine optimal price points."
          ],
          historicalContext: "First systematically studied by ancient Babylonian clay-tablet writers around 2000 BC. Later formalized with algebraic symbols by Persian mathematician Al-Khwarizmi in 820 AD.",
          diagramDescription: "A coordinate grid showing a symmetrical U-shaped parabola opening upwards, reaching its vertex in quadrant IV and crossing the x-axis at root points x=2 and x=3.",
          examTips: [
            "Calculate the discriminant (b² - 4ac) first to determine if roots are real, repeated, or complex.",
            "Always check your answers by substituting the solved roots back into the original quadratic equation."
          ],
          keyTakeaways: [
            "Quadratic equations always yield exactly two roots.",
            "The coefficient 'a' dictates whether the parabola opens upwards (positive) or downwards (negative)."
          ]
        };
      } else if (key.includes('photosynthesis')) {
        return {
          definition: "Photosynthesis is the biochemical process by which green plants, algae, and some bacteria convert light energy into chemical energy, synthesizing glucose from carbon dioxide and water while releasing oxygen as a byproduct.",
          explanation: `Tailored for a ${difficulty} student: Photosynthesis takes place inside chloroplasts. Light-dependent reactions occur in the thylakoid membranes (converting solar rays to ATP/NADPH), while light-independent reactions (Calvin Cycle) occur in the stroma to assimilate carbon. The balanced formula is 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.`,
          examples: [
            "Deciduous trees absorbing carbon dioxide to build leaf mass and cellulose structure.",
            "Cyanobacteria in marine environments generating massive oxygen percentages for global biomes."
          ],
          realWorldApplications: [
            "Countering greenhouse emissions by acting as massive carbon dioxide sinks.",
            "Providing the core biomass fuel driving terrestrial food chains."
          ],
          historicalContext: "Mapped out by Jan Ingenhousz in 1779 who proved sunlight triggers oxygen release. Later, Melvin Calvin mapped carbon reduction steps in 1948.",
          diagramDescription: "A plant leaf diagram with sunlight arrows pointing down, CO2 entering stomata pores, H2O absorbed via root nodes, and O2 exiting into the atmosphere.",
          examTips: [
            "Distinguish clearly between the location of the light reactions (thylakoids) and the Calvin Cycle (stroma).",
            "Remember that water is split during photolysis to provide electrons, releasing oxygen gas."
          ],
          keyTakeaways: [
            "Chlorophyll pigments capture solar energy at blue and red absorption peaks.",
            "Photosynthesis converts solar energy to chemical energy (glucose)."
          ]
        };
      } else if (key.includes('newton') || key.includes('motion') || key.includes('force')) {
        return {
          definition: "Newton's Laws of Motion are three fundamental physical laws formulated by Sir Isaac Newton that describe the mathematical relationship between forces acting on an object and its resulting motion.",
          explanation: `Tailored for a ${difficulty} student: 1st Law (Inertia) states objects resist changes in velocity. 2nd Law defines force as mass times acceleration (F = ma). 3rd Law (Action-Reaction) asserts all forces exist in matched opposite pairs: when Object A pushes B, B pushes A with equal magnitude.`,
          examples: [
            "A passenger sliding forward when a moving bus brakes suddenly (Inertia).",
            "A rocket launching upward because high-speed gas is exhaust-pushed downward (Action-Reaction)."
          ],
          realWorldApplications: [
            "Design of crash crumple zones and seatbelt recoil mechanisms in cars.",
            "Calculating orbit corrections for planetary spacecraft and satellites."
          ],
          historicalContext: "Published in Sir Isaac Newton's masterwork 'Philosophiae Naturalis Principia Mathematica' in 1687, forming the base of classical mechanics.",
          diagramDescription: "A block on a horizontal plane showing vector arrows: force of gravity acting downward, normal support force acting upward, push force right, and friction resisting left.",
          examTips: [
            "Always draw a complete Free Body Diagram (FBD) detailing all force vectors before writing equations.",
            "Friction force always acts parallel to the contact surface and opposite to the direction of motion."
          ],
          keyTakeaways: [
            "Unbalanced net force causes acceleration, not velocity.",
            "Forces act on different objects in action-reaction pairs, meaning they never cancel each other out on a single object."
          ]
        };
      }

      // Default dynamic fallback if custom topic is entered
      return {
        definition: `${topic} is a key concept in ${subject} concerned with the structure, behavior, and relationships between components.`,
        explanation: `This topic covers how elements interact under specific rules. In ${difficulty} level, we focus on understanding the primary formulas, the implications of state changes, and resolving common problem templates step by step.`,
        examples: [
          `Primary application case of ${topic} under controlled variables.`,
          `Secondary case showcasing variance when parameters are scaled.`
        ],
        realWorldApplications: [
          `Engineering frameworks and structural designs relating to ${topic}.`,
          `Statistical models utilized in financial systems forecasting.`
        ],
        historicalContext: `Developed in the mid-19th century by pioneering researchers trying to systematize observations in natural sciences.`,
        diagramDescription: `A coordinate grid or flowchart showcasing input streams entering a transformation block, resulting in stable outputs.`,
        examTips: [
          "Always check units and double-check your initial state conditions before applying equations.",
          "State the naming conventions and key theorems you are invoking for full working credits."
        ],
        keyTakeaways: [
          `Understands core relationships between variable inputs in ${topic}.`,
          `Ready to solve multi-step problems in exam conditions.`
        ]
      };
    }
  },

  // 2. QUESTION PAPER GENERATOR
  generateQuestionPaper: async (
    grade: string, 
    subject: string, 
    duration: string, 
    topic: string, 
    difficulty: string,
    customInstructions?: string
  ): Promise<QuestionPaper> => {
    const prompt = `
      You are a Principal Examiner. Generate a full question paper with the following settings:
      Grade: ${grade}
      Subject: ${subject}
      Duration: ${duration}
      Topic: ${topic}
      Difficulty: ${difficulty}
      Custom Instructions: ${customInstructions || 'None'}

      Respond strictly with a JSON object (no markdown wrapping). Match this structure:
      {
        "title": "Exam Title",
        "subject": "${subject}",
        "grade": "${grade}",
        "duration": "${duration}",
        "sectionA": [
          { "question": "Question 1?", "options": ["A", "B", "C", "D"], "answer": "A" }
        ],
        "sectionB": [
          { "question": "Short Answer Question 1?", "answerKey": "Key points for grading" }
        ],
        "sectionC": [
          { "question": "Long Essay Question 1?", "rubrics": "Criteria for full points" }
        ]
      }
    `;

    if (!isMockMode) {
      try {
        return await queryEdgeFunction('generate-paper', { grade, subject, duration, topic, difficulty, customInstructions });
      } catch (err) {
        console.warn('aiService.generateQuestionPaper: Edge Function failed, using fallback.', err);
      }
    }

    try {
      if (isAiOffline) throw new Error('Offline fallback');
      const responseText = await queryGemini(prompt);
      return JSON.parse(responseText);
    } catch (e) {
      console.warn('aiService.generateQuestionPaper: falling back to offline generator.', e);
      
      const key = topic.toLowerCase().trim();
      if (key.includes('quadratic')) {
        return {
          title: `${subject} Assessment: Quadratic Equations & Parabolas`,
          subject,
          grade,
          duration,
          sectionA: [
            { question: "What is the discriminant of the quadratic equation x² - 6x + 9 = 0?", options: ["A) 0", "B) 9", "C) -18", "D) 36"], answer: "A) 0" },
            { question: "Which coordinate represents the vertex of the parabola y = (x - 2)² + 3?", options: ["A) (2, 3)", "B) (-2, 3)", "C) (2, -3)", "D) (0, 3)"], answer: "A) (2, 3)" }
          ],
          sectionB: [
            { question: "Solve the quadratic equation x² - 5x + 6 = 0 by factoring. Show all steps.", answerKey: "Factor as (x-2)(x-3) = 0. Therefore, roots are x = 2 and x = 3." },
            { question: "Use the quadratic formula to find the roots of x² - 4x + 1 = 0.", answerKey: "Using x = [-b ± √(b²-4ac)] / 2a: roots are x = 2 ± √3." }
          ],
          sectionC: [
            { question: "Explain the visual and algebraic significance of a negative discriminant in ax² + bx + c = 0. Detail how this affects the graph of the parabola.", rubrics: "4 points for explaining complex roots; 4 points for graphing shape (never crosses x-axis); 2 points for referencing the discriminant term." }
          ]
        };
      } else if (key.includes('photosynthesis')) {
        return {
          title: `${subject} Assessment: Light Reactions & Carbon Assimilation`,
          subject,
          grade,
          duration,
          sectionA: [
            { question: "Which chloroplast sub-structure hosts the light-dependent reactions?", options: ["A) Stroma matrix", "B) Outer lipid wall", "C) Thylakoid membrane", "D) Cytoplasm"], answer: "C) Thylakoid membrane" },
            { question: "Which chemical compound is the primary carbon donor for glucose synthesis in the Calvin Cycle?", options: ["A) Oxygen gas", "B) G3P phosphate", "C) Carbon dioxide gas", "D) Water molecules"], answer: "C) Carbon dioxide gas" }
          ],
          sectionB: [
            { question: "Write the balanced chemical equation representing the assimilation of glucose via photosynthesis.", answerKey: "6CO2 + 6H2O + light energy -> C6H12O6 + 6O2." },
            { question: "Briefly explain photolysis and its purpose in light-dependent reactions.", answerKey: "Splitting of water molecules (2H2O -> 4H+ + O2 + 4e-) to replace electrons lost in Photosystem II." }
          ],
          sectionC: [
            { question: "Compare and contrast the thylakoid light-dependent reactions with the stroma Calvin Cycle. Focus on inputs, outputs, locations, and energy transitions.", rubrics: "4 points for light reactions details; 4 points for Calvin cycle; 2 points for highlighting their interdependent relationship (ATP/NADPH recycling)." }
          ]
        };
      } else if (key.includes('newton') || key.includes('motion') || key.includes('force')) {
        return {
          title: `${subject} Assessment: Laws of Motion & Force Vectors`,
          subject,
          grade,
          duration,
          sectionA: [
            { question: "Which physical law explains why passengers slide forward during sudden deceleration?", options: ["A) Newton's 2nd Law", "B) Newton's 1st Law (Inertia)", "C) Newton's 3rd Law", "D) Law of Friction"], answer: "B) Newton's 1st Law (Inertia)" },
            { question: "A net force of 20 N acts on an object of mass 4 kg. What acceleration is generated?", options: ["A) 5 m/s²", "B) 80 m/s²", "C) 0.2 m/s²", "D) 16 m/s²"], answer: "A) 5 m/s²" }
          ],
          sectionB: [
            { question: "State Newton's Third Law of Motion and outline a practical action-reaction pair in engineering.", answerKey: "For every action, there is an equal and opposite reaction. Example: Rocket exhaust gas pushing down forces the rocket hull upward." },
            { question: "Explain the difference between mass and weight in the context of gravitational forces.", answerKey: "Mass is the scalar measure of inertia (kg); weight is the vector force of gravity acting on mass (W = mg)." }
          ],
          sectionC: [
            { question: "Analyze how Newton's Second Law governs vehicle safety designs, specifically focusing on crumple zones and seatbelt recoil delay timers.", rubrics: "4 points for force/impact time relation (F = dp/dt); 4 points for kinetic energy dispersal; 2 points for engineering application examples." }
          ]
        };
      }

      // Generic fallback if topic is custom
      return {
        title: `${subject} Mid-Term Assessment: ${topic}`,
        subject,
        grade,
        duration,
        sectionA: [
          { question: `Which of the following best represents the fundamental theorem of ${topic}?`, options: ['Option A: Linear ratio model', 'Option B: Exponential expansion', 'Option C: Constant entropy state', 'Option D: Inverse variance'], answer: 'Option A: Linear ratio model' },
          { question: `Under standard conditions, how does scaling the input affect the core coefficient in ${topic}?`, options: ['It doubles', 'It drops to zero', 'It remains invariant', 'It changes quadratically'], answer: 'It remains invariant' }
        ],
        sectionB: [
          { question: `Derive the secondary formula for ${topic} and explain the physical significance of the constant parameter.`, answerKey: 'Formula should show coefficient relations. Constant signifies system friction or base resistance.' },
          { question: `Detail one historical anomaly that challenged the classical model of ${topic} and how it was resolved.`, answerKey: 'Mentions the anomaly from 1894 and the addition of the correction factors.' }
        ],
        sectionC: [
          { question: `Formulate a comprehensive case study explaining how ${topic} governs modern architectural mechanics. Illustrate with a detailed mathematical proof.`, rubrics: '5 points for correct formula derivation; 3 points for structural layout description; 2 points for naming assumptions.' }
        ]
      };
    }
  },

  // 3. STUDENT RISK DETECTOR
  detectStudentRisk: async (
    attendanceRate: number, 
    averageGrade: number, 
    missingHomeworkCount: number,
    studentName: string
  ): Promise<RiskAnalysis> => {
    const prompt = `
      Analyze this student's risk profile:
      Name: ${studentName}
      Attendance Rate: ${attendanceRate}%
      Average Grade Score: ${averageGrade}%
      Missing Homeworks: ${missingHomeworkCount}

      Respond strictly with a JSON object:
      {
        "studentName": "${studentName}",
        "riskScore": 75, // 0 to 100
        "riskLevel": "High", // Low, Medium, High
        "attendanceTrend": "Declining",
        "gradeTrend": "Stagnant",
        "missingHomework": ${missingHomeworkCount},
        "alerts": ["Alert 1", "Alert 2"],
        "interventions": ["Action 1", "Action 2"]
      }
    `;

    if (!isMockMode) {
      try {
        return await queryEdgeFunction('detect-risk', { attendanceRate, averageGrade, missingHomeworkCount, studentName });
      } catch (err) {
        console.warn('aiService.detectStudentRisk: Edge Function failed, using fallback.', err);
      }
    }

    try {
      if (isAiOffline) throw new Error('Offline fallback');
      const responseText = await queryGemini(prompt);
      return JSON.parse(responseText);
    } catch (e) {
      // Calculate risk scores deterministically
      let riskScore = 0;
      if (attendanceRate < 85) riskScore += 40;
      if (averageGrade < 70) riskScore += 35;
      if (missingHomeworkCount > 2) riskScore += 25;

      const riskLevel = riskScore > 70 ? 'High' : riskScore > 35 ? 'Medium' : 'Low';
      const alerts: string[] = [];
      const interventions: string[] = [];

      if (attendanceRate < 85) {
        alerts.push(`Attendance is at ${attendanceRate}%, falling below the school's 90% threshold.`);
        interventions.push('Schedule parent-teacher conference to address attendance gaps.');
      }
      if (averageGrade < 70) {
        alerts.push(`Average grade score has slipped to ${averageGrade}%.`);
        interventions.push('Enroll in school-provided tutoring / math remedial sessions.');
      }
      if (missingHomeworkCount > 0) {
        alerts.push(`Has ${missingHomeworkCount} missing or late homework submissions.`);
        interventions.push('Request homework hub catch-up plan during study hall hours.');
      }

      if (alerts.length === 0) {
        alerts.push('Student is demonstrating stellar performance and attendance.');
        interventions.push('Encourage entry into advanced curriculum / peer mentoring.');
      }

      return {
        studentId: 'stub-id',
        studentName,
        riskScore,
        riskLevel,
        attendanceTrend: attendanceRate < 85 ? 'Declining' : 'Stable',
        gradeTrend: averageGrade < 70 ? 'Slipping' : 'Improving',
        missingHomework: missingHomeworkCount,
        alerts,
        interventions
      };
    }
  },

  // 4. PARENT REPORT GENERATOR
  generateParentReport: async (
    studentName: string,
    attendanceRate: number,
    gpa: number,
    homeworkCompletion: string,
    strengths: string[],
    weaknesses: string[]
  ): Promise<ParentReport> => {
    const prompt = `
      Generate a parent-friendly progress report card summary for:
      Student: ${studentName}
      Attendance: ${attendanceRate}%
      GPA: ${gpa}/4.0
      Homework Completion Rate: ${homeworkCompletion}
      Known Strengths: ${strengths.join(', ')}
      Known Weaknesses: ${weaknesses.join(', ')}

      Respond strictly with a JSON object:
      {
        "studentName": "${studentName}",
        "attendanceRate": "${attendanceRate}%",
        "gpa": "${gpa}/4.0",
        "homeworkCompletion": "${homeworkCompletion}",
        "strengths": ["Strength 1"],
        "weaknesses": ["Weakness 1"],
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      }
    `;

    if (!isMockMode) {
      try {
        return await queryEdgeFunction('parent-report', { studentName, attendanceRate, gpa, homeworkCompletion, strengths, weaknesses });
      } catch (err) {
        console.warn('aiService.generateParentReport: Edge Function failed, using fallback.', err);
      }
    }

    try {
      if (isAiOffline) throw new Error('Offline fallback');
      const responseText = await queryGemini(prompt);
      return JSON.parse(responseText);
    } catch (e) {
      return {
        studentName,
        attendanceRate: `${attendanceRate}%`,
        gpa: `${gpa.toFixed(2)}/4.0`,
        homeworkCompletion,
        strengths: strengths.length > 0 ? strengths : ['Analytical thinking', 'Classroom participation'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['Time management on exams', 'Punctuality'],
        recommendations: [
          'Set aside 45 minutes daily for reviewing homework feedbacks.',
          'Schedule regular math review slots before weekly quiz days.'
        ]
      };
    }
  },

  // 5. SCHOOL HEALTH REPORT
  generateSchoolHealthReport: async (
    avgAttendance: number,
    gradeDist: { grade: string; count: number }[],
    activeTeachers: number,
    engagementScore: number
  ): Promise<SchoolHealthReport> => {
    const prompt = `
      You are a School Consultant. Synthesize this school data into an executive health summary:
      Average Attendance Rate: ${avgAttendance}%
      Active Teacher Count: ${activeTeachers}
      Platform Engagement Score: ${engagementScore}/100
      Grade Distribution: ${JSON.stringify(gradeDist)}

      Respond strictly with a JSON object:
      {
        "averageAttendance": "${avgAttendance}%",
        "gradeDistribution": ${JSON.stringify(gradeDist)},
        "teacherActivity": "${activeTeachers} active instructors entering marks regularly.",
        "engagementScore": ${engagementScore},
        "platformUsage": [
          { "label": "Homework Hub", "value": 75 },
          { "label": "Live Classrooms", "value": 45 },
          { "label": "AI Topic Explainer", "value": 90 }
        ],
        "summaryInsights": [
          "Attendance is stable at high percentage levels.",
          "Strong platform engagement with high utilization of AI tools."
        ]
      }
    `;

    if (!isMockMode) {
      try {
        return await queryEdgeFunction('school-health', { avgAttendance, gradeDist, activeTeachers, engagementScore });
      } catch (err) {
        console.warn('aiService.generateSchoolHealthReport: Edge Function failed, using fallback.', err);
      }
    }

    try {
      if (isAiOffline) throw new Error('Offline fallback');
      const responseText = await queryGemini(prompt);
      return JSON.parse(responseText);
    } catch (e) {
      return {
        averageAttendance: `${avgAttendance.toFixed(1)}%`,
        gradeDistribution: gradeDist,
        teacherActivity: `${activeTeachers} instructors active in the last 7 days.`,
        engagementScore,
        platformUsage: [
          { label: 'Homework Hub', value: 85 },
          { label: 'Live Classrooms', value: 40 },
          { label: 'AI Explainer', value: 92 },
          { label: 'Gradebook', value: 78 }
        ],
        summaryInsights: [
          `Institutional attendance is excellent at ${avgAttendance}%, reflecting high student engagement.`,
          `AI Explainer is the most active platform module (92% usage), followed closely by the Homework Hub.`,
          `Grade distribution shows a healthy curve skewed towards performance tiers, though extra monitoring is advised for Grade D/F populations.`
        ]
      };
    }
  }
};
