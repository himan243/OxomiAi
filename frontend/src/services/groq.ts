import { fetchRecentContent } from './api';

export const getSilaResponse = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[], extraContext: string = '') => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error("VITE_GROQ_API_KEY missing");
      return "Sila is not configured correctly. Please add the Groq API key.";
    }

    // 1. Fetch only 5 most recent items to stay within token limits
    const recentData = await fetchRecentContent(5);
    const contentContext = recentData.map((item: any) => 
      `${item.district}: ${item.title} - ${item.description.substring(0, 100)}...`
    ).join('\n');

    const systemPrompt = {
      role: 'system' as const,
      content: `You are "Sila", a friendly AI guide for Assam, India. 
      Context: ${contentContext}
      User Context: ${extraContext}
      Rules: Be warm, mention the district, keep answers concise. If unsure, use general knowledge about Assam.`
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [systemPrompt, ...messages],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 512,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", response.status, errorText);
      return "I'm having a bit of trouble connecting right now.";
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Chat API Error:", error);
    return "Oops! I'm having a little trouble right now. Please try again later.";
  }
};
