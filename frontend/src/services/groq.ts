import { fetchRecentContent, fetchDistrictContent, fetchAllContent } from './api';

export const getSilaResponse = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[], districtId: string | null = null) => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error("VITE_GROQ_API_KEY missing");
      return "Sila is not configured correctly. Please add the Groq API key.";
    }

    // 1. Fetch relevant content
    let contextItems: any[] = [];
    
    // If we have a districtId, prioritize that content
    if (districtId) {
      const districtData = await fetchDistrictContent(districtId);
      contextItems = [...districtData];
    }

    // Also fetch the 5 most recent global items to ensure variety
    const recentData = await fetchRecentContent(5);
    
    // Merge and deduplicate by ID
    const allData = [...contextItems, ...recentData];
    const uniqueItems = Array.from(new Map(allData.map(item => [item.id || item.title, item])).values());
    
    // Limit to 8 items total to save tokens
    const finalItems = uniqueItems.slice(0, 8);
    const contentContext = finalItems.map((item: any) => 
      `${item.district}: ${item.title} - ${item.description.substring(0, 120)}...`
    ).join('\n');

    // 2. Fetch all districts/titles for "global awareness" (very compact)
    const allApproved = await fetchAllContent();
    const coverageMap = allApproved.reduce((acc: any, item: any) => {
      acc[item.district] = (acc[item.district] || 0) + 1;
      return acc;
    }, {});
    const coverageInfo = Object.entries(coverageMap)
      .map(([dist, count]) => `${dist}(${count} stories)`)
      .join(', ');

    const systemPrompt = {
      role: 'system' as const,
      content: `You are "Sila", an AI travel guide for OxomiAi. 
      Available Stories: ${coverageInfo}
      Detailed Context: ${contentContext}
      Current Page: ${districtId || 'Home'}
      Rules: Be warm, mention the district. If asked about a district not in 'Detailed Context' but in 'Available Stories', tell them we have content there and invite them to visit that district's page. Keep answers concise.`
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
