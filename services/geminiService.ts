
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Bit, QuizQuestion } from "../types";

// Initialize the client. API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean Markdown code blocks from JSON responses
const cleanJSON = (text: string | undefined): string => {
  if (!text) return "{}";
  return text.replace(/```json|```/g, '').trim();
};

/**
 * Generates a structured "Bit" (tutorial) based on a user prompt.
 */
export const generateBitContent = async (topic: string): Promise<Partial<Bit>> => {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    You are an expert technical instructor for "SYNAPSE", a futuristic learning platform.
    Your goal is to generate concise, high-impact technical tutorials (Bits) based on a topic.
    The audience is developers and network engineers.
    Style:
    - Title: Catchy and technical.
    - Summary: One sentence hook.
    - Content: Clear, step-by-step explanation (keep it under 150 words).
    - Code Snippet: A highly relevant, working example.
    - Difficulty: Assess accurately based on the topic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Create a technical tutorial Bit about: "${topic}".`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            language: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["title", "summary", "content", "codeSnippet", "language", "difficulty", "tags"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(cleanJSON(response.text));
      return data;
    } else {
      throw new Error("No content generated");
    }

  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Gemini Generation Error:", error);
    }
    throw new Error("Failed to generate content. Please try again.");
  }
};

/**
 * Uses Gemini to suggest related topics based on current search.
 */
export const suggestTopics = async (query: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Suggest 3 trending, short technical topics related to "${query}" for a developer tutorial site. Return only a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        return JSON.parse(cleanJSON(response.text) || "[]");
    } catch (e) {
        return [];
    }
}

/**
 * Generates a random advanced topic for inspiration.
 */
export const generateRandomTopic = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Give me one interesting, specific, and advanced technical topic for a developer tutorial. Just the topic name, nothing else. Examples: 'Rust Ownership', 'Kubernetes Sidecars', 'React Concurrent Mode'.",
        });
        return response.text?.trim() || "Advanced TypeScript Patterns";
    } catch (e) {
        return "Docker Networking";
    }
};

/**
 * Simplifies text content to an ELI5 level using Gemini.
 */
export const simplifyBitContent = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Explain the following technical concept to a 5-year-old. Keep it under 100 words and use analogies: "${text}"`,
        });
        return response.text || text;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Simplification error:", error);
        }
        return text;
    }
};

/**
 * Generates a Mermaid.js diagram definition from content.
 */
export const generateBitDiagram = async (title: string, content: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `
                Act as a senior technical illustrator. Create a Mermaid.js diagram to visually explain the concept: "${title}".
                Context from tutorial: "${content}".
                
                Guidelines:
                1. **Diagram Type**: 
                   - Default to 'graph TD' or 'graph LR'. 
                   - Use 'sequenceDiagram' only for interactions.
                   - Use 'stateDiagram-v2' for state machines.
                
                2. **STRICT SYNTAX RULES (To prevent rendering errors)**:
                   - **Node IDs**: Use simple alphanumeric IDs like N1, N2, Start, End. No spaces or special chars in IDs.
                   - **Labels**: **ALWAYS** enclose ALL text inside nodes in double quotes. 
                     - CORRECT: N1["CIDR /24 Prefix"]
                     - INCORRECT: N1[CIDR /24 Prefix]
                   - **Shapes**: Use ONLY rectangular nodes \`["Label"]\` or rounded nodes \`("Label")\`. 
                     - **DO NOT** use trapezoids \`[/.../]\`, rhombuses \`{...}\`, or asymmetric shapes. They break easily with technical text.
                   - **Edges**: Use simple arrows \`-->\` or labeled arrows \`-- "Label" -->\`.
                
                3. **Styling**:
                   - Append this exact styling at the end of the graph (only for 'graph' type):
                     \`classDef default fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#e2e8f0,rx:5px,ry:5px;\`
                     \`classDef accent fill:#4338ca,stroke:#818cf8,stroke-width:2px,color:#fff,rx:5px,ry:5px;\`
                     \`classDef start fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff,rx:5px,ry:5px;\`
                     \`classDef end fill:#881337,stroke:#f43f5e,stroke-width:2px,color:#fff,rx:5px,ry:5px;\`
                   - Apply \`:::start\`, \`:::end\`, or \`:::accent\` to relevant nodes using the triple colon syntax. Example: \`N1["Start"]:::start\`
                
                4. **Output**:
                   - Return ONLY the raw Mermaid code. No markdown code blocks.
            `,
        });
        
        let code = response.text || "";
        // Clean up if the model adds markdown
        code = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
        return code;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Diagram generation error", error);
        }
        return "";
    }
};

/**
 * Generates a quiz question based on the content.
 */
export const generateQuiz = async (content: string, title: string): Promise<QuizQuestion> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a single multiple-choice question to test understanding of this topic: "${title}". Content: "${content}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Array of 4 possible answers"
                        },
                        correctAnswer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
                        explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" }
                    },
                    required: ["question", "options", "correctAnswer", "explanation"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(cleanJSON(response.text));
        }
        throw new Error("Failed to generate quiz");
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Quiz Generation Error:", error);
        }
        throw new Error("Failed to generate quiz. Please try again.");
    }
};

/**
 * Generates speech audio from text using Gemini TTS.
 */
export const generateBitAudio = async (text: string): Promise<string | undefined> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        // Return base64 string directly
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("TTS Generation Error:", error);
        }
        throw new Error("Failed to generate audio. Please try again.");
    }
}

/**
 * Simulates code execution by asking the AI to predict the output.
 */
export const executeCode = async (code: string, language: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `
                Act as a code runner/interpreter for ${language}.
                Execute the following code mentally and return the output (stdout) or any errors that would occur.
                
                Code:
                \`\`\`${language}
                ${code}
                \`\`\`
                
                Rules:
                - If it's just a snippet (like CSS or partial JS), describe what it does briefly or show the computed value.
                - If it's a script, show the console output.
                - Keep it concise (max 5 lines).
                - Do NOT wrap in markdown blocks. Just return the raw text output.
            `,
        });
        return response.text?.trim() || "No output generated.";
    } catch (error) {
        return "Error executing code: Neural Link Severed.";
    }
}

/**
 * Helper to play base64 audio.
 */
export const playAudioContent = async (base64Audio: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    
    // Decode base64 to array buffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create AudioBuffer
    const decodePcmData = (data: Uint8Array, ctx: AudioContext): AudioBuffer => {
        const pcm16 = new Int16Array(data.buffer);
        const frameCount = pcm16.length; 
        const buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < frameCount; i++) {
            // Convert int16 to float32
            channelData[i] = pcm16[i] / 32768.0;
        }
        return buffer;
    };

    const audioBuffer = decodePcmData(bytes, audioContext);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return source; // Return source to allow stopping if needed
};

// --- Chat Service ---

let chatSession: Chat | null = null;
let currentContextId: string | null = null;

export const getChatResponse = async (message: string, context?: string): Promise<{text: string, sources?: {uri: string, title: string}[]}> => {
    if (!chatSession) {
        chatSession = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are 'Vibe Assistant', a cool, concise, and helpful AI coding companion for the 'SYNAPSE' platform. Answer technical questions briefly. Use code blocks for code. Keep the vibe chill.",
                tools: [{googleSearch: {}}],
            }
        });
    }

    // Context Injection: If the user is viewing a bit, we notify the model.
    // We only send this system-like message when the context changes to avoid spamming the history.
    let msgToSend = message;
    if (context && context !== currentContextId) {
        msgToSend = `[System: User is now viewing a tutorial titled: "${context}". If their next question is vague like "explain this", refer to this topic.]\n\n${message}`;
        currentContextId = context;
    }

    try {
        const response = await chatSession.sendMessage({ message: msgToSend });
        
        // Extract grounding sources if available
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web)
            .map((web: any) => ({ uri: web.uri, title: web.title }));

        return {
            text: response.text || "I'm meditating on that... try again.",
            sources: sources
        };
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Chat Error:", error);
        }
        return { text: "Connection interrupted. The vibes are off." };
    }
};
