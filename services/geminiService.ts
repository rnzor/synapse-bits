
import { Bit, QuizQuestion } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Generates a structured "Bit" (tutorial) based on a user prompt.
 */
export const generateBitContent = async (topic: string): Promise<Partial<Bit>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-bit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) throw new Error("Failed to generate content");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to generate content. Please try again.");
  }
};

/**
 * Chat service using local proxy
 */
export const getChatResponse = async (message: string, context?: string): Promise<{text: string}> => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context })
        });

        if (!response.ok) throw new Error("Connection interrupted");
        return await response.json();
    } catch (error) {
        return { text: "Connection interrupted. The vibes are off." };
    }
};

// ... other services can be proxied similarly or kept as mocks for now
export const suggestTopics = async (_query: string): Promise<string[]> => {
    return ["Rust Ownership", "WebAssembly", "CRDTs"];
}

export const generateRandomTopic = async (): Promise<string> => {
    return "Advanced TypeScript Patterns";
};

export const simplifyBitContent = async (_text: string): Promise<string> => {
    return _text; // Placeholder
};

export const generateBitDiagram = async (_title: string, _content: string): Promise<string> => {
    return ""; // Placeholder
};

export const generateQuiz = async (_content: string, title: string): Promise<QuizQuestion> => {
    return {
        question: `Understanding ${title}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is a placeholder quiz."
    };
};

export const executeCode = async (_code: string, _language: string): Promise<string> => {
    return "Code execution output placeholder.";
}
