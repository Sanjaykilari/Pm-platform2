export const generateDeepSeekResponse = async (messages, contextData) => {
  const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!API_KEY) {
    throw new Error('DeepSeek API Key is missing. Please check your .env.local file.');
  }

  // Inject context as a system prompt
  let systemMessage = {
    role: 'system',
    content: `You are an expert Project Management AI Assistant for the 'Aura PPM' enterprise platform.
    Your job is to answer questions, summarize data, and provide helpful insights based on the current context the user is looking at.
    Please format your response in plain text or simple markdown. Be concise and professional.
    
    CURRENT CONTEXT DATA:
    ${JSON.stringify(contextData, null, 2)}`
  };

  const payload = {
    model: 'deepseek-chat',
    messages: [systemMessage, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  };

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to fetch response from DeepSeek API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    throw error;
  }
};
