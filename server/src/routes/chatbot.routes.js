const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

router.post('/', requireAuth, async (req, res) => {
  const { message } = req.body;
  const API_KEY = process.env.AI_GATEWAY_API_KEY;

  if (!API_KEY) {
    console.error("Chatbot Error: AI_GATEWAY_API_KEY is missing in .env");
    return res.status(500).json({ error: "AI Gateway Key not configured" });
  }

  try {
    const systemPrompt = `You are the KalakarKatta AI Assistant. 
    KalakarKatta is a platform for artists, creators, and professionals to showcase their work, find jobs, and join events.
    Be helpful, creative, and professional. 
    If asked about the platform, explain its features (Portfolio, Jobs, Events, Community).
    Always encourage artists to share their work.`;

    // Using fetch (available in Node 18+)
    // If you are using Venture AI Gateway, use: https://api.vck.ai/v1/chat/completions
    // Otherwise, standard OpenAI URL: https://api.openai.com/v1/chat/completions
    const API_URL = API_KEY.startsWith('vck_') 
      ? 'https://api.vck.ai/v1/chat/completions' 
      : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway Error (${response.status}):`, errorText);
      return res.status(response.status).json({ error: "AI service returned an error" });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
       console.error("AI Gateway Unexpected Response:", data);
       return res.status(500).json({ error: "AI service returned an empty response" });
    }

    const aiMessage = data.choices[0].message.content;
    res.json({ response: aiMessage });

  } catch (error) {
    console.error("Chatbot Exception:", error);
    res.status(500).json({ error: "Failed to connect to AI assistant" });
  }
});

module.exports = router;
