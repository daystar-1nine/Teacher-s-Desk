// supabase/functions/gemini-ai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY environment secret on Edge container." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    let prompt = "";
    if (action === "explain-topic") {
      const { subject, topic, difficulty } = payload;
      prompt = `
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
    } else if (action === "generate-paper") {
      const { grade, subject, duration, topic, difficulty, customInstructions } = payload;
      prompt = `
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
    } else if (action === "detect-risk") {
      const { attendanceRate, averageGrade, missingHomeworkCount, studentName } = payload;
      prompt = `
        Analyze this student's risk profile:
        Name: ${studentName}
        Attendance Rate: ${attendanceRate}%
        Average Grade Score: ${averageGrade}%
        Missing Homeworks: ${missingHomeworkCount}

        Respond strictly with a JSON object:
        {
          "studentName": "${studentName}",
          "riskScore": 75,
          "riskLevel": "High",
          "attendanceTrend": "Declining",
          "gradeTrend": "Stagnant",
          "missingHomework": ${missingHomeworkCount},
          "alerts": ["Alert 1", "Alert 2"],
          "interventions": ["Action 1", "Action 2"]
        }
      `;
    } else if (action === "parent-report") {
      const { studentName, attendanceRate, gpa, homeworkCompletion, strengths, weaknesses } = payload;
      prompt = `
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
    } else if (action === "school-health") {
      const { avgAttendance, activeTeachers, engagementScore, gradeDist } = payload;
      prompt = `
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
    } else {
      return new Response(JSON.stringify({ error: "Invalid action parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Post query to Gemini API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
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

    return new Response(text, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
