import Groq from 'groq-sdk';
import { fetchAllContent } from './api';
import { ASSAM_DISTRICTS } from '../utils/districts';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for browser usage
});

export const getSilaResponse = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[], extraContext: string = '') => {
  try {
    // 1. Fetch all content to use as context
    const data = await fetchAllContent();
    const contentContext = data.map((item: any) => 
      `District: ${item.district}\nCategory: ${item.category}\nTitle: ${item.title}\nDescription: ${item.description}`
    ).join('\n\n');

    const districtsList = ASSAM_DISTRICTS.join(', ');

    const systemPrompt = {
      role: 'system' as const,
      content: `You are "Sila", a friendly and knowledgeable AI travel assistant for Assam, India. 
      Your knowledge is based on the following cultural content, blogs, and stories from our website:
      
      ${contentContext}

      List of all districts in Assam: ${districtsList}

      ${extraContext}

      Guidelines:
      - Answer questions based on the provided content. 
      - If you don't know something from the provided content, use your general knowledge about Assam but state that it's based on general travel info.
      - Help users plan trips to different districts of Assam.
      - If asked about nearby places, suggest locations within the same district or neighboring districts.
      - Keep your tone warm, welcoming, and helpful, reflecting the spirit of Assamese hospitality.
      - Always mention the name of the district when providing information.
      - "Sila" means "rock" or "stone" in Assamese, symbolizing the strength and ancient heritage of the land.
      - If the user is currently on a district page (which will be mentioned in the context), prioritize information about that district.`
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...messages],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Oops! I'm having a little trouble right now. Please try again later.";
  }
};
