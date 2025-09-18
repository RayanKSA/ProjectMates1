
import { GoogleGenAI } from "@google/genai";
import type { User } from '../types';

const API_KEY = process.env.API_KEY;

// Conditionally initialize the AI client only if the API key exists.
// This prevents a crash if the API_KEY is not set in the environment.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("Gemini API key not found or is invalid. AI features will be disabled.");
}

export const generateBio = async (user: User): Promise<string> => {
  if (!ai) {
    return Promise.resolve("AI features are disabled. Please provide a valid API key to enable them.");
  }

  const prompt = `
    Based on the following profile of a university student, write a short, enthusiastic, and professional "About Me" bio for a platform where they are looking for teammates for a graduation project.
    The bio should be around 3-4 sentences. Highlight their passion, key skills, and what they are looking for in a team.

    - Name: ${user.name}
    - Major: ${user.title}
    - Academic Interests: ${user.interests.join(', ')}
    - Key Skills: ${user.skills.join(', ')}
    - Desired Role/Contribution: Seeking roles related to ${user.interests[0]} development and research.

    Generate only the bio text, without any introductory phrases like "Here is the bio:".
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating bio with Gemini API:", error);
    return "There was an error generating the bio. Please try again later.";
  }
};
