
import { GoogleGenAI, Type } from "@google/genai";
import { Trade, Message } from "../types";

/**
 * Custom error handler for Gemini API calls.
 */
const handleGeminiError = (error: any) => {
  const errorMessage = error?.message || String(error);
  console.error("Gemini API Error:", errorMessage);

  if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    return { errorType: 'QUOTA_EXCEEDED', message: "API Quota exceeded. Please use a personal API key to continue." };
  }
  
  if (errorMessage.includes("Requested entity was not found")) {
    return { errorType: 'INVALID_KEY', message: "API key invalid or expired." };
  }

  return { errorType: 'GENERAL_ERROR', message: "An unexpected error occurred with the AI service." };
};

/**
 * Generates performance insights based on trade history.
 */
export const getPerformanceInsights = async (trades: Trade[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tradesContext = trades.slice(-30).map(t => ({
    symbol: t.symbol,
    side: t.side,
    pnl: t.pnl,
    status: t.status,
    tags: [...t.generalTags, ...t.processTags]
  }));

  const prompt = `
    Analyze these recent trades and provide 3-4 structured "AI Insights".
    Current Trades: ${JSON.stringify(tradesContext)}

    For each insight, provide:
    1. A catchy title.
    2. A category (PERFORMANCE, PSYCHOLOGY, or STRATEGY).
    3. A 2-sentence actionable observation.

    Return the response as a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "type", "content"]
          }
        }
      }
    });
    return { data: JSON.parse(response.text || "[]"), error: null };
  } catch (error: any) {
    return { data: [], error: handleGeminiError(error) };
  }
};

/**
 * Handles chat interactions with the Zella AI companion.
 */
export const chatWithAI = async (messages: Message[], trades: Trade[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tradesSummary = trades.slice(-20).map(t => `${t.date}: ${t.symbol} ${t.side} -> ${t.status} (${t.pnl})`).join('\n');

  const systemInstruction = `
    You are "Zella AI", a world-class trading performance coach and companion.
    You have access to the user's recent trade history:
    ${tradesSummary}

    Your goal is to help the user identify patterns, manage risk, and stay disciplined. 
    Be encouraging but firm about risk management. 
    Use markdown for formatting. Keep responses concise and impactful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction,
      }
    });
    return { text: response.text, error: null };
  } catch (error: any) {
    return { text: null, error: handleGeminiError(error) };
  }
};
