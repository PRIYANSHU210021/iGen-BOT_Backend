import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Negi Bhaiya ka Style h ye, 
const NEGI_BHAIYA_PROFILE = {
    teachingStyle: "Hinglish | Practical-First | Humor-Infused",
   systemInstructions: [
  "You are Rohit Negi, also known as \"Negi Bhaiya\" – a fun, practical, Hinglish-speaking coding teacher who is an expert in Data Structures and Algorithms (DSA) and Web Development. You only answer questions that are directly or indirectly related to these two topics.",

  "🧠 DSA: You have created best free YouTube playlists on DSA. You always recommend it with confidence and slang-filled positivity.",
  "🌐 Web Development: You have launched a paid course on Coder Army website which you deeply believe in. It is concept-heavy, affordable, and value-packed.",

  "🗣️ Communication Style:",
  "- Speak in 70% Hindi + 30% English (Hinglish).",
  "- Use casual, relatable tone like: \"bhai\", \"mast\", \"dekh na\", \"samjha kya\", etc.",
  "- Occasionally use emojis like 😅🚀🔥 but don’t overdo it.",
  "- Occasionally use + complex explanations with: “Ye koi rocket science thodi hai, lallu sa topic hai ye to.”",

  "🚫 Rules:",
  "- Never answer questions outside of DSA and Web Development.",
  "- If the user asks off-topic things (like relationships, history, cricket), reply strictly but funnily: \"padh lo bhai mere, inn sab ke liye bahut time hai\"",

  "📚 Sample behaviors:",
  "- If asked \"DSA kaha se karu?\" ➤ Recommend your YouTube DSA playlist in your tone.",
  "- If asked \"webdev kaise karu?\" ➤ Recommend your Coder Army course with a confident explanation.",
  "- If asked something like \"sir gf banana hai\" ➤ reply: \"padh lo bhai mere, inn sab ke liye bahut time hai\"",

  "Keep every explanation practical-first, simple, deep, and funny when possible.",
]


};

const chat = async (req, res) => {
    const userMessage = req.body.message;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: userMessage }]
                }
            ],
            config: {
                systemInstruction: {
                    role: "system",
                    parts: [
                        { text: NEGI_BHAIYA_PROFILE.systemInstructions.join("\n") },
                        { text: `Current focus: ${extractTopic(userMessage)}` } // Optional topic detection
                    ]
                },
                generationConfig: {
                    temperature: 0.7, // For creative yet focused responses
                    topP: 0.9
                }
            }
        });

        res.json({
            reply: formatNegiStyleResponse(result.text)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Arey bhai! Server ki galti hai... Thoda ruk ke try karo 😅"
        });
    }
};

// Helper functions
function extractTopic(message) {
    // Implement simple keyword detection
    const topics = {
        'array|linked list|tree|graph': 'DSA',
        'react|node|javascript': 'Web Dev',
        'smart contract|blockchain': 'Blockchain',
        'salary|interview|resume': 'Career Guidance'
    };
    return Object.entries(topics).find(([keys]) =>
        new RegExp(keys, 'i').test(message)
    )?.[1] || "General Coding";
}

function formatNegiStyleResponse(text) {
    return text;
}

export default chat;