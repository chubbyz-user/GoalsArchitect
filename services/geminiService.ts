import { GoogleGenAI } from "@google/genai";
import { Duration, GeneratedPlan, GeneratedTask } from "../types";

// Browser builds (Vite) don't provide `process.env`. Use `import.meta.env` for Vite
// and allow a global fallback if the key is injected some other way.
const getApiKey = (): string => {
  // Prefer Vite env variable `VITE_API_KEY`.
  const key = (import.meta as any)?.env?.VITE_API_KEY || (globalThis as any)?.__GOOGLE_API_KEY__;
  if (!key) {
    throw new Error(
      'Missing API key for Gemini: set `VITE_API_KEY` in your env or provide a runtime global `__GOOGLE_API_KEY__`'
    );
  }
  return key;
};

let aiInstance: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiInstance;
};

// Helper to extract JSON from markdown code blocks or raw text
const cleanJson = (text: string): string => {
  try {
    // Remove markdown code blocks (handle various formats like ```json, ```, etc.)
    let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "");
    
    // Locate the first { or [ and the last } or ]
    const firstOpen = cleaned.search(/[\{\[]/);
    const lastClose = cleaned.search(/[\}\]][^}\]]*$/);
    
    if (firstOpen !== -1 && lastClose !== -1) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    
    // Attempt to remove citation markers like [1], [2] which might appear if grounding is used
    // incorrectly by the model.
    cleaned = cleaned.replace(/\[\d+\]/g, ""); 
    cleaned = cleaned.replace(/\[Source\]/g, "");
    
    return cleaned;
  } catch (e) {
    return text;
  }
};

export const generatePlan = async (goal: string, duration: Duration): Promise<GeneratedPlan> => {
  const prompt = `
    Goal: ${goal}
    Duration: ${duration}
    
    You are an expert productivity coach. Create a detailed, actionable step-by-step plan.
    
    CRITICAL INSTRUCTION:
    You MUST output the result as a raw, valid JSON string.
    
    Rules for JSON generation:
    1. Do NOT include any conversational text, preamble, or postscript.
    2. Do NOT use Markdown formatting (no \`\`\`json blocks).
    3. Do NOT include citation markers (like [1], [Source]) in the JSON strings or structure.
    4. Ensure every property key and string value is double-quoted.
    5. Ensure all key-value pairs and array items are separated by commas.
    6. No trailing commas allowed.
    
    Structure the JSON exactly like this:
    {
      "planTitle": "string",
      "overview": "string",
      "days": [
        {
          "dayNumber": number,
          "dayLabel": "string",
          "theme": "string",
          "tasks": [
            {
              "description": "string",
              "videoLink": "string (optional)"
            }
          ]
        }
      ]
    }

    Requirements:
    1. The plan must strictly cover the duration of ${duration}.
    2. Tasks should be concrete actions.
    3. LEARNING RESOURCES:
       - Use Google Search to ensure the plan is based on up-to-date and accurate information.
       - If a task involves learning a new skill, concept, or tool, you MUST provide a YouTube Search URL.
       - Do NOT try to find a specific video ID (as they often break or expire). 
       - Instead, construct a dynamic search URL for the most relevant query.
       - Format: "https://www.youtube.com/results?search_query=" + [concise, highly relevant search terms separated by +]
       - Example: "https://www.youtube.com/results?search_query=how+to+perform+deadlift+correctly"
       - Put this URL in the "videoLink" field.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // We use googleSearch to ensure the advice/steps generated are accurate,
        // even though we are constructing the YouTube link manually.
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }

    const cleanedText = cleanJson(text);
    
    try {
      return JSON.parse(cleanedText) as GeneratedPlan;
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      console.error("Cleaned text:", cleanedText);
      throw new Error("Failed to parse the AI plan. Please try again.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate plan. Please try again.");
  }
};

export const breakDownTask = async (taskDescription: string): Promise<GeneratedTask[]> => {
  const prompt = `
    I have a task: "${taskDescription}".
    
    Please break this task down into 2 to 5 smaller, more specific, and actionable sub-steps.
    
    CRITICAL INSTRUCTION:
    Output ONLY a valid JSON array of objects. No markdown. No conversational text.
    
    Structure:
    [
      {
        "description": "Step 1 description",
        "videoLink": "https://www.youtube.com/results?search_query=..." (Optional, if the step requires a tutorial)
      },
      ...
    ]
  `;

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");

    const cleanedText = cleanJson(text);
    const parsed = JSON.parse(cleanedText);
    
    if (Array.isArray(parsed)) {
      return parsed as GeneratedTask[];
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.tasks)) {
       // Fallback if the AI wraps the array in an object
       return parsed.tasks as GeneratedTask[];
    } else {
       throw new Error("AI response was not a valid task list");
    }

  } catch (error: any) {
    console.error("Gemini Break Down Error:", error);
    throw new Error("Failed to break down task.");
  }
};