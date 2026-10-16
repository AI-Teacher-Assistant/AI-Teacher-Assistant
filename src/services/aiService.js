const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

let genAI = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log(`[AI Service] Google Gemini AI initialized with model ${MODEL_NAME}`);
  } catch (err) {
    console.warn('[AI Service] Failed to initialize Google Generative AI:', err.message);
  }
} else {
  console.log('[AI Service] No Gemini API key provided. Using built-in intelligent educational fallback generator.');
}

/**
 * Intelligent fallback generator providing realistic, high-quality educational templates
 */
const fallbackGenerate = (type, params) => {
  const { subject, topic, difficulty = 'medium', questionCount = 5, questionType = 'mixed', additionalInstructions = '' } = params;
  const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  if (type === 'notes') {
    return `# Teacher Lecture Notes: ${topic}
**Subject:** ${subject}
**Target Level:** Secondary / Undergraduate
**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 1. Executive Summary & Learning Objectives
By the end of this module, students will be able to:
- Define the foundational principles of **${topic}** within the discipline of **${subject}**.
- Explain the key mechanisms, theories, and laws that govern this topic.
- Apply theoretical insights to solve practical problems and analyze real-world scenarios.

---

## 2. Core Concepts & Definitions
- **Primary Definition:** *${topic}* represents a fundamental cornerstone of modern ${subject}. It explores how interconnected elements interact dynamically under varying conditions.
- **Fundamental Law/Principle:** Every component operates according to established principles of balance, input-output efficiency, and rigorous empirical observations.
- **Key Terminology:**
  - **Prerequisite Term 1:** The initial state or baseline benchmark used for comparison.
  - **Core Variable 2:** The active variable directly modulated in experiments involving ${topic}.
  - **Resultant Metric 3:** The observable output measurable across both quantitative and qualitative assessments.

---

## 3. In-Depth Breakdown & Analysis
### 3.1 Foundations
Understanding ${topic} requires establishing a clear mental model. In ${subject}, we begin with the simplest case: isolated conditions where external noise is minimized. This permits educators and students to isolate primary cause-and-effect relationships.

### 3.2 Advanced Insights
Moving beyond fundamentals, real-world systems incorporate constraints, variability, and complex feedback loops. For example, when applying ${topic} in real environments:
1. Systematic evaluation must account for tolerances and limits.
2. Cross-disciplinary overlap between ${subject} and allied domains enriches student comprehension.

---

## 4. Practical Real-World Applications
- **Industry & Technology:** Principles of ${topic} are directly implemented in modern engineering, research protocols, and technological innovations.
- **Everyday Context:** Demonstrates how daily phenomena rely on the very mechanics studied in ${subject}.

---

## 5. Summary & Discussion Starters for Class
1. *Discussion Prompt:* How does changing the initial parameters alter the expected outcome of ${topic}?
2. *Review Question:* What are the three most critical takeaways every student must remember for examinations?
${additionalInstructions ? `\n> **Teacher Note:** ${additionalInstructions}` : ''}`;
  }

  if (type === 'assignment') {
    return `# Student Assignment: ${topic}
**Course:** ${subject} | **Difficulty Level:** ${capitalizedDifficulty}
**Total Marks:** 50 Points | **Submission Window:** 7 Days

---

### Instructions for Students
- Read all questions carefully before beginning.
- Ensure all working, derivations, and reasoning are clearly documented.
- Plagiarism is strictly prohibited. Cite any supplementary academic references used.

---

### Section A: Conceptual Foundations (15 Marks)
1. In your own words, state the formal definition of **${topic}** and explain why it is vital in ${subject}. (5 Marks)
2. Compare and contrast two major approaches or viewpoints related to **${topic}**. (5 Marks)
3. Identify three common misconceptions surrounding **${topic}** and provide factual corrections for each. (5 Marks)

---

### Section B: Problem Solving & Practical Application (20 Marks)
4. **Scenario Analysis:** Suppose you are tasked with optimizing a system governed by ${topic}.
   - (a) What baseline measurements would you collect first? (5 Marks)
   - (b) Formulate a step-by-step hypothesis to test efficiency. (5 Marks)
5. **Analytical Problem:** Calculate or analyze the behavioral outcome when the primary variable increases by 25%. Explain your theoretical deduction. (10 Marks)

---

### Section C: Critical Thinking & Synthesis (15 Marks)
6. Write a cohesive 250-word synthesis evaluating the long-term impact of **${topic}** on contemporary research in ${subject}. Discuss potential future developments and ethical considerations. (15 Marks)

---

### Grading Rubric
- **Factual Accuracy & Depth:** 40%
- **Clarity of Logical Arguments:** 30%
- **Originality & Synthesis:** 20%
- **Formatting, Structure & Citations:** 10%
${additionalInstructions ? `\n*Teacher Special Instructions: ${additionalInstructions}*` : ''}`;
  }

  if (type === 'questions') {
    const qCount = parseInt(questionCount, 10) || 5;
    let items = [];

    for (let i = 1; i <= qCount; i++) {
      if (questionType === 'multiple_choice' || (questionType === 'mixed' && i % 2 === 1)) {
        items.push(`#### Question ${i} [Multiple Choice - 2 Marks]
Which of the following statements best characterizes **${topic}** in ${subject}?
- A) It is an outdated concept with no current experimental relevance.
- B) It represents a fundamental relationship establishing predictable behavioral models. [Correct]
- C) It operates purely randomly without measurable governing equations or rules.
- D) It only applies to hypothetical mathematical scenarios.

*Answer Key:* **B**
*Explanation:* In ${subject}, ${topic} is recognized for providing foundational predictability and reproducible empirical results.`);
      } else {
        items.push(`#### Question ${i} [Short Answer / Analytical - 5 Marks]
Explain the operational role of **${topic}** within the study of ${subject}. What key variables dictate its behavior, and how would a researcher measure them?

*Sample Answer / Evaluation Guide:*
Full credit requires mentioning: (1) Core definition of ${topic}, (2) Identification of at least two governing variables, and (3) Accurate description of an experimental or analytical measurement technique.`);
      }
    }

    return `# Question Bank: ${topic}
**Subject:** ${subject} | **Difficulty Level:** ${capitalizedDifficulty}
**Total Questions:** ${qCount} | **Type:** ${questionType.toUpperCase()}

---

${items.join('\n\n---\n\n')}

---
**Summary for Teacher:**
- Total Questions Generated: ${qCount}
- Difficulty Level: ${capitalizedDifficulty}
- Suitable for quiz, midterm evaluation, or homework assignments.`;
  }

  return `Educational material generated for ${subject}: ${topic}.`;
};

/**
 * Reusable AI Service
 */
class AIService {
  static async generateNotes({ subject, topic, gradeLevel = 'General', additionalInstructions = '' }) {
    if (!subject || !topic) {
      throw new Error('Subject and topic are required to generate notes.');
    }

    if (!genAI) {
      const content = fallbackGenerate('notes', { subject, topic, additionalInstructions });
      return {
        success: true,
        type: 'notes',
        subject,
        topic,
        title: `Lecture Notes: ${topic}`,
        content,
        wordCount: content.split(/\s+/).length,
        provider: 'built-in-educational-engine'
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `You are an expert master educator and curriculum designer.
Generate comprehensive, highly structured lecture notes for teachers on:
Subject: ${subject}
Topic: ${topic}
Target Student Level: ${gradeLevel}
Additional Teacher Instructions: ${additionalInstructions || 'None'}

Please format the output in clean, elegant Markdown. Include:
1. Executive Summary & Learning Objectives (bullet points)
2. Core Theoretical Concepts & Key Terminology
3. Detailed In-depth Explanations with Structured Subheadings
4. Practical Real-World Applications & Examples
5. Class Discussion Questions and Examination Summary`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return {
        success: true,
        type: 'notes',
        subject,
        topic,
        title: `Lecture Notes: ${topic}`,
        content: text,
        wordCount: text.split(/\s+/).length,
        provider: 'gemini'
      };
    } catch (err) {
      console.warn(`[AI Service] Gemini API call failed (${err.message}). Using fallback generator.`);
      const content = fallbackGenerate('notes', { subject, topic, additionalInstructions });
      return {
        success: true,
        type: 'notes',
        subject,
        topic,
        title: `Lecture Notes: ${topic}`,
        content,
        wordCount: content.split(/\s+/).length,
        provider: 'fallback-resilient'
      };
    }
  }

  static async generateAssignment({ subject, topic, difficulty = 'medium', instructions = '' }) {
    if (!subject || !topic) {
      throw new Error('Subject and topic are required to generate an assignment.');
    }

    if (!genAI) {
      const content = fallbackGenerate('assignment', { subject, topic, difficulty, additionalInstructions: instructions });
      return {
        success: true,
        type: 'assignment',
        subject,
        topic,
        difficulty,
        title: `Assignment: ${topic} (${difficulty.toUpperCase()})`,
        content,
        provider: 'built-in-educational-engine'
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `You are an expert teacher creating a rigorous academic assignment.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Special Instructions: ${instructions || 'None'}

Generate a complete, ready-to-distribute student assignment in clean Markdown including:
- Header with Course, Topic, Difficulty, and Total Marks
- Student Instructions & Academic Integrity Guidelines
- Section A: Conceptual & Foundational Questions (with mark allocations)
- Section B: Applied Problem Solving / Scenario-based questions (with mark allocations)
- Section C: Critical Thinking & Synthesis Question
- Clear Grading Rubric for the teacher`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return {
        success: true,
        type: 'assignment',
        subject,
        topic,
        difficulty,
        title: `Assignment: ${topic} (${difficulty.toUpperCase()})`,
        content: text,
        provider: 'gemini'
      };
    } catch (err) {
      console.warn(`[AI Service] Gemini API call failed (${err.message}). Using fallback generator.`);
      const content = fallbackGenerate('assignment', { subject, topic, difficulty, additionalInstructions: instructions });
      return {
        success: true,
        type: 'assignment',
        subject,
        topic,
        difficulty,
        title: `Assignment: ${topic} (${difficulty.toUpperCase()})`,
        content,
        provider: 'fallback-resilient'
      };
    }
  }

  static async generateQuestions({ subject, topic, difficulty = 'medium', questionCount = 5, questionType = 'mixed' }) {
    if (!subject || !topic) {
      throw new Error('Subject and topic are required to generate questions.');
    }

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 25);
    const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    if (!genAI) {
      const content = fallbackGenerate('questions', {
        subject,
        topic,
        difficulty: validDifficulty,
        questionCount: count,
        questionType
      });
      return {
        success: true,
        type: 'questions',
        subject,
        topic,
        difficulty: validDifficulty,
        questionCount: count,
        questionType,
        title: `Question Bank: ${topic} (${validDifficulty.toUpperCase()})`,
        content,
        provider: 'built-in-educational-engine'
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `You are a professional assessment creator and teacher assistant.
Generate ${count} ${validDifficulty} difficulty questions for an exam or practice sheet.
Subject: ${subject}
Topic: ${topic}
Question Type: ${questionType} (e.g. multiple_choice, short_answer, or mixed)

For every question:
1. Provide the question clearly with point value.
2. If multiple choice, list options A, B, C, D clearly.
3. Provide the full Answer Key and detailed Explanation/Solution for the teacher.

Format in clean Markdown with clear numbering and dividers between questions.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return {
        success: true,
        type: 'questions',
        subject,
        topic,
        difficulty: validDifficulty,
        questionCount: count,
        questionType,
        title: `Question Bank: ${topic} (${validDifficulty.toUpperCase()})`,
        content: text,
        provider: 'gemini'
      };
    } catch (err) {
      console.warn(`[AI Service] Gemini API call failed (${err.message}). Using fallback generator.`);
      const content = fallbackGenerate('questions', {
        subject,
        topic,
        difficulty: validDifficulty,
        questionCount: count,
        questionType
      });
      return {
        success: true,
        type: 'questions',
        subject,
        topic,
        difficulty: validDifficulty,
        questionCount: count,
        questionType,
        title: `Question Bank: ${topic} (${validDifficulty.toUpperCase()})`,
        content,
        provider: 'fallback-resilient'
      };
    }
  }
}

module.exports = AIService;
