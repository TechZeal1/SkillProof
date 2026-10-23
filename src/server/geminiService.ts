import { GoogleGenAI, Type } from '@google/genai';
import { Challenge, Submission, Assessment, AssessmentCriterionResult } from '../types/index.ts';

// Server-side initialization per Gemini API guide
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface EvaluationInput {
  submission: Submission;
  challenge: Challenge;
}

export async function evaluateSubmissionWithAI(
  input: EvaluationInput
): Promise<Assessment> {
  const { submission, challenge } = input;

  if (!aiClient) {
    throw new Error(
      'Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is configured in your environment secrets to run live AI assessments.'
    );
  }

  // Compile evidence text
  let evidenceText = '';
  if (submission.submission_type === 'code' && submission.source_code) {
    // Limit to reasonable size (e.g. 30,000 characters)
    evidenceText = `[Pasted Source Code]:\n\`\`\`\n${submission.source_code.slice(0, 30000)}\n\`\`\``;
  } else if (submission.submission_type === 'github_repo' && submission.repository_url) {
    evidenceText = `[Public GitHub Repository URL]: ${submission.repository_url}\n`;
    if (submission.source_code) {
      evidenceText += `[Retrieved / Attached Files]:\n\`\`\`\n${submission.source_code.slice(0, 30000)}\n\`\`\``;
    }
  } else if (submission.submission_type === 'live_url' && submission.project_url) {
    evidenceText = `[Live Project URL]: ${submission.project_url}\n`;
    if (submission.source_code) {
      evidenceText += `[Code Excerpt]:\n\`\`\`\n${submission.source_code.slice(0, 30000)}\n\`\`\``;
    }
  }

  if (submission.explanation && submission.explanation.trim()) {
    evidenceText += `\n\n[Student Architectural Approach & Explanation]:\n${submission.explanation.slice(0, 5000)}`;
  }

  if (!evidenceText.trim()) {
    throw new Error('No inspectable code evidence or explanation was provided in this submission.');
  }

  // Construct Rubric criteria specification
  const rubricSpec = challenge.rubric.criteria.map((c, idx) => ({
    criterion_id: c.id,
    name: c.name,
    description: c.description,
    max_score: c.max_score,
    weight: c.weight
  }));

  const systemInstruction = `You are the lead academic evaluator for SkillProof, an evidence-based skill verification platform.
Your objective: Rigorously evaluate the student's submission against the challenge's requirements, acceptance criteria, and published rubric.

CRITICAL ASSESSMENT RULES:
1. Proof, not claims: Inspect ONLY what is visible in the provided code and explanation. Never invent code, frameworks, or features not present.
2. Direct quoted evidence: For every rubric criterion, quote or cite specific lines, selectors, or logic from the submission as "evidence".
3. Honest scoring: Score each criterion strictly between 0 and max_score. A score of 0 should be given if a required capability was completely skipped.
4. Static inspection: State clearly in limitations that this evaluation is based on static code inspection and does not run arbitrary execution in an isolated sandbox.
5. Constructive feedback: In "feedback", explain what worked and what specific fixes are needed to achieve full points on the next attempt.
6. Math consistency: The overall_score MUST be an integer equal to the sum of all individual criterion scores.`;

  const promptContent = `
CHALLENGE: ${challenge.title}
DIFFICULTY: ${challenge.difficulty}
REQUIREMENTS:
${challenge.requirements.map(r => `- ${r}`).join('\n')}

ACCEPTANCE CRITERIA:
${challenge.acceptance_criteria.map(a => `- ${a}`).join('\n')}

PUBLISHED RUBRIC (Total 100 points):
${rubricSpec.map(c => `• [${c.criterion_id}] "${c.name}" (Max ${c.max_score} pts): ${c.description}`).join('\n')}

STUDENT SUBMISSION EVIDENCE:
${evidenceText}

Evaluate this submission now and return a strictly formatted JSON object matching the required schema.`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for consistent rubric grading
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_score: {
              type: Type.INTEGER,
              description: 'Total score between 0 and 100 (sum of all criteria scores)'
            },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion_id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  score: { type: Type.INTEGER, description: 'Score awarded for this criterion' },
                  max_score: { type: Type.INTEGER, description: 'Maximum possible score' },
                  evidence: { type: Type.STRING, description: 'Direct quoted code or evidence from the submission' },
                  feedback: { type: Type.STRING, description: 'Specific diagnostic feedback for improvement' }
                },
                required: ['criterion_id', 'name', 'score', 'max_score', 'evidence', 'feedback']
              }
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key positive aspects and best practices demonstrated'
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'High-priority actionable fixes for the next attempt'
            },
            limitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Boundaries of what could not be inspected (e.g. runtime rendering)'
            }
          },
          required: ['overall_score', 'criteria', 'strengths', 'improvements', 'limitations']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Model returned an empty assessment response.');
    }

    const parsed = JSON.parse(text);

    // Validate and enforce math consistency
    const sanitizedCriteria: AssessmentCriterionResult[] = challenge.rubric.criteria.map(c => {
      const match = parsed.criteria?.find(
        (pc: any) => pc.criterion_id === c.id || pc.name?.toLowerCase() === c.name.toLowerCase()
      );
      const score = Math.max(0, Math.min(c.max_score, Math.round(Number(match?.score ?? 0))));
      return {
        criterion_id: c.id,
        name: c.name,
        score,
        max_score: c.max_score,
        evidence: match?.evidence || 'No specific evidence identified in submission for this criterion.',
        feedback: match?.feedback || 'Review challenge requirements for this criterion.'
      };
    });

    const sumScore = sanitizedCriteria.reduce((acc, c) => acc + c.score, 0);
    const overallScore = Math.max(0, Math.min(100, sumScore));

    const assessment: Assessment = {
      id: 'asmt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      submission_id: submission.id,
      challenge_id: challenge.id,
      student_id: submission.student_id,
      model_identifier: 'gemini-3.8-flash',
      overall_score: overallScore,
      criteria: sanitizedCriteria,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 
        ? parsed.strengths 
        : ['Demonstrates effort on the task.'],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 
        ? parsed.improvements 
        : ['Refer to the published rubric criteria for improvement areas.'],
      limitations: Array.isArray(parsed.limitations) && parsed.limitations.length > 0 
        ? parsed.limitations 
        : ['Automated rubric-based AST evaluation without runtime sandbox execution.'],
      assessment_status: overallScore >= 75 ? 'passed' : 'needs_work',
      generated_at: new Date().toISOString()
    };

    return assessment;
  } catch (err: any) {
    console.error('Gemini evaluation error:', err);
    throw new Error(`AI Evaluation failed: ${err.message || 'Unknown error occurred while contacting AI service.'}`);
  }
}
