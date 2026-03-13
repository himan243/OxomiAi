import { fetchRecentContent, fetchDistrictContent, fetchAllContent } from './api';
import { ASSAM_DISTRICTS } from '../utils/districts';

export const getSilaResponse = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[], currentDistrictId: string | null = null) => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error("VITE_GROQ_API_KEY missing");
      return "Sila is not configured correctly. Please add the Groq API key.";
    }

    // 1. Detect if the user is asking about a specific district (if not already on a district page)
    let targetDistrictId = currentDistrictId;
    
    if (!targetDistrictId) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content.toLowerCase() || '';
      const mentionedDistrict = ASSAM_DISTRICTS.find(d => lastUserMessage.includes(d.toLowerCase()));
      if (mentionedDistrict) {
        targetDistrictId = mentionedDistrict;
      }
    }

    // 2. Fetch relevant content
    let contextItems: any[] = [];
    
    // If we have a target district, fetch its content
    if (targetDistrictId) {
      const districtData = await fetchDistrictContent(targetDistrictId);
      contextItems = [...districtData];
    }

    // Also fetch the 3 most recent global items for variety (reduced from 5 to save tokens)
    const recentData = await fetchRecentContent(3);
    
    // Merge and deduplicate
    const allData = [...contextItems, ...recentData];
    const uniqueItems = Array.from(new Map(allData.map(item => [item.id || item.title, item])).values());
    
    // Limit to 6 items total for maximum reliability/speed
    const finalItems = uniqueItems.slice(0, 6);
    const contentContext = finalItems.map((item: any) => 
      `${item.district}: ${item.title} - ${item.description.substring(0, 150)}...`
    ).join('\n\n');

    // 3. Compact coverage info
    const allApproved = await fetchAllContent();
    const coverageMap = allApproved.reduce((acc: any, item: any) => {
      acc[item.district] = (acc[item.district] || 0) + 1;
      return acc;
    }, {});
    const coverageInfo = Object.entries(coverageMap)
      .map(([dist, count]) => `${dist}(${count})`)
      .join(', ');

    const systemPrompt = {
      role: 'system' as const,
      content: `You are "Sila", the AI travel guide for OxomiAi. 
      Website Coverage: ${coverageInfo}
      Detailed Stories:
      ${contentContext}
      
      User is interested in: ${targetDistrictId || 'General Assam'}
      
      Rules:
      - Use the 'Detailed Stories' to provide specific heritage info. 
      - If a district is in 'Website Coverage' but NOT in 'Detailed Stories', tell the user we have content there and encourage them to explore it.
      - Keep answers warm and concise.`
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
