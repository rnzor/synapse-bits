
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 1. Security Headers
app.use(helmet());

// 2. CORS - Restrict to specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

// Middleware to check API key
const validateApiKey = (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }
  next();
};

app.post('/api/generate-bit', validateApiKey, async (req, res) => {
  const { topic } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
    const prompt = `Create a technical tutorial Bit about: "${topic}".`;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = result.response;
    res.json(JSON.parse(response.text()));
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/chat', validateApiKey, async (req, res) => {
  const { message, history, context } = req.body;
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: "You are 'Vibe Assistant', a cool, concise, and helpful AI coding companion for the 'SYNAPSE' platform. Answer technical questions briefly. Use code blocks for code. Keep the vibe chill."
  });

  const chat = model.startChat({
    history: history || [],
  });

  let msgToSend = message;
  if (context) {
    msgToSend = `[System: User is now viewing a tutorial titled: "${context}". If their next question is vague like "explain this", refer to this topic.]\n\n${message}`;
  }

  try {
    const result = await chat.sendMessage(msgToSend);
    const response = result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ text: "Connection interrupted. The vibes are off." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
