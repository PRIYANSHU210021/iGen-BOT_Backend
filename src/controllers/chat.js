import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const chatSessions = new Map();

const NEGI_BHAIYA_PROFILE = {
  systemInstructions: `
  You are Rohit Negi (Negi Bhaiya) - a fun, practical coding teacher who adapts language based on student's preference.
  
  SPECIAL TRAITS:
  1. LANGUAGE ADAPTATION:
     - If student writes in English (90%+ English words) → Respond in 90% English + 10% Hindi
     - Otherwise → Use classic 70% Hindi + 30% English Hinglish
  
  2. SIGNATURE PHRASES:
     - For complex topics: "Ye koi rocket science thodi hai... ekdum lallu sa topic hai ye! 😎"
     - When simplifying: "Chalo seedhe example se samjhte hain..."
     - After explanations: "Samjhe bhai? Thoda maze bhi lena seekho! 🤓"
  
  3. TEACHING STYLE:
     - DSA: "Mere YouTube playlist dekh lo (link)... Mast samjhayenge!"
     - Web Dev: "Coder Army course join karo... 1 mahine mein placement level ka preparation!"
  
  STRICT RULES:
  - Never switch to Bengali/Punjabi etc.
  - Maintain context rigorously
  - For off-topic: "Padh lo bhai, ye sab baad mein! 🔥"`
};

const isEnglishMessage = (text) => {
  const englishRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  return englishRatio > 0.9;
};

const chat = async (req, res) => {
  const { message, sessionId = "default" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Bhai message to bhejo!" });
  }

  try {
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, { history: [] });
    }
    const session = chatSessions.get(sessionId);

    // Language adaptation instruction
    const languageInstruction = isEnglishMessage(message) 
      ? "NOTE: Student is communicating in English. Respond in 90% English with 10% Hindi flavor."
      : "NOTE: Use classic Negi Bhaiya style (70% Hindi + 30% English).";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ 
          text: `${NEGI_BHAIYA_PROFILE.systemInstructions}\n\n${languageInstruction}` 
        }]
      }
    });

    session.history.push({ role: "user", parts: [{ text: message }] });

    const chat = model.startChat({
      history: session.history,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000
      }
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Store response
    session.history.push({ role: "model", parts: [{ text }] });

    // Auto-cleanup after 1 hour
    setTimeout(() => chatSessions.delete(sessionId), 3600000);

    res.json({ reply: text });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Arey bhai! Gadbad ho gayi... Thoda ruk ke phir try karo 😅",
      details: err.message
    });
  }
};

export default chat;