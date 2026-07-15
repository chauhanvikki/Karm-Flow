import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for the ATS Score
export interface ATSScore {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionFlags: {
    hasContactInfo: boolean;
    hasSkillsSection: boolean;
    hasExperienceSection: boolean;
    hasEducationSection: boolean;
  };
  summary: string;
  scoredBy: 'gemini' | 'keyword-fallback';
  scoredAt: Date;
}

// Curated list of common skills for the fallback engine
const FALLBACK_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node', 'node.js', 'express', 'python', 'django', 'flask',
  'java', 'spring', 'c++', 'c#', '.net', 'ruby', 'rails', 'php', 'laravel', 'go', 'rust',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'gitlab', 'agile', 'scrum', 'kanban',
  'html', 'css', 'sass', 'tailwind', 'vue', 'angular', 'svelte', 'graphql', 'rest', 'api',
  'linux', 'unix', 'bash', 'shell', 'terraform', 'ansible', 'jenkins', 'circleci', 'travis',
  'machine learning', 'ai', 'data science', 'pandas', 'numpy', 'scikit-learn', 'tensorflow',
  'pytorch', 'keras', 'nlp', 'computer vision', 'data engineering', 'spark', 'hadoop', 'kafka',
  'project management', 'leadership', 'communication', 'problem solving', 'teamwork'
];

/**
 * Primary Scoring Engine using Gemini 2.0 Flash
 */
const scoreWithGemini = async (resumeText: string, jobDescription: string): Promise<ATSScore | null> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const geminiDisabled = process.env.GEMINI_DISABLE === 'true';
  if (!apiKey || geminiDisabled) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
You are an expert ATS (Applicant Tracking System).
Score how well the candidate's resume matches the job description.

Job Description:
${jobDescription}

Resume Text:
${resumeText}

Return ONLY valid JSON matching this exact shape (no markdown, no preamble):
{
  "matchScore": number (0-100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "sectionFlags": {
    "hasContactInfo": boolean,
    "hasSkillsSection": boolean,
    "hasExperienceSection": boolean,
    "hasEducationSection": boolean
  },
  "summary": string (one encouraging, plain-language sentence)
}
`;

  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 8000);
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
  
  const apiCallPromise = model.generateContent(prompt).then(result => {
    const response = result.response.text();
    const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    return JSON.parse(jsonStr);
  });

  try {
    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    if (!result) {
      console.warn('Gemini ATS scoring timed out.');
      return null;
    }

    return {
      matchScore: Number(result.matchScore) || 0,
      matchedKeywords: result.matchedKeywords || [],
      missingKeywords: result.missingKeywords || [],
      sectionFlags: {
        hasContactInfo: Boolean(result.sectionFlags?.hasContactInfo),
        hasSkillsSection: Boolean(result.sectionFlags?.hasSkillsSection),
        hasExperienceSection: Boolean(result.sectionFlags?.hasExperienceSection),
        hasEducationSection: Boolean(result.sectionFlags?.hasEducationSection),
      },
      summary: result.summary || 'Resume analyzed successfully.',
      scoredBy: 'gemini',
      scoredAt: new Date()
    };
  } catch (error: any) {
    const isQuotaError = error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('Too Many Requests');
    if (isQuotaError) {
      console.error('Gemini ATS scoring failed due to quota limits. Falling back to keyword scoring.', {
        status: error?.status,
        message: error?.message,
        details: error?.errorDetails || error
      });
    } else {
      console.error('Gemini ATS scoring failed:', error);
    }
    return null;
  }
};

/**
 * Fallback Scoring Engine using regex and keyword matching
 */
const scoreWithFallback = (resumeText: string, jobDescription: string): ATSScore => {
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  // Extract which fallback keywords are actually mentioned in the JD
  const expectedKeywords = FALLBACK_KEYWORDS.filter(kw => jdLower.includes(kw));
  
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  expectedKeywords.forEach(kw => {
    if (resumeLower.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordRatio = expectedKeywords.length > 0 
    ? matchedKeywords.length / expectedKeywords.length 
    : 1;

  // Check section flags via regex
  const hasContactInfo = /[\w.-]+@[\w.-]+\.\w+/.test(resumeLower) || /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeLower);
  const hasSkillsSection = /\bskills\b|\btechnologies\b|\bcore competencies\b/i.test(resumeLower);
  const hasExperienceSection = /\bexperience\b|\bwork history\b|\bemployment\b/i.test(resumeLower);
  const hasEducationSection = /\beducation\b|\bacademic\b|\bdegree\b/i.test(resumeLower);

  const sectionsMet = [hasContactInfo, hasSkillsSection, hasExperienceSection, hasEducationSection].filter(Boolean).length;
  const sectionRatio = sectionsMet / 4;

  // Calculate matchScore
  let matchScore = Math.round((keywordRatio * 70) + (sectionRatio * 30));
  if (matchScore > 100) matchScore = 100;

  // Generate summary
  let summary = 'We analyzed your resume for this role.';
  if (matchScore >= 70) {
    summary = 'Great match! Your resume highlights many of the key skills we are looking for.';
  } else if (matchScore >= 40) {
    summary = 'Good start. Consider highlighting a few more specific tools from the job description.';
  } else {
    summary = 'Your resume was reviewed. Be sure to tailor your experience to the job description keywords.';
  }

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    sectionFlags: {
      hasContactInfo,
      hasSkillsSection,
      hasExperienceSection,
      hasEducationSection
    },
    summary,
    scoredBy: 'keyword-fallback',
    scoredAt: new Date()
  };
};

/**
 * Main ATS Scoring Service
 * Attempts Gemini first, falls back to keyword matching if it fails or times out.
 * Never throws an error.
 */
export const scoreApplication = async (resumeText: string, jobDescription: string): Promise<ATSScore> => {
  if (!resumeText.trim()) {
    return scoreWithFallback('', jobDescription); // empty resume returns low score
  }

  const geminiScore = await scoreWithGemini(resumeText, jobDescription);
  if (geminiScore) {
    return geminiScore;
  }

  console.log('Using ATS fallback scoring engine.');
  return scoreWithFallback(resumeText, jobDescription);
};
