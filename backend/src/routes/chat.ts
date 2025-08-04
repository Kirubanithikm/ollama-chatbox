import { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import fetch from 'node-fetch';

const router = Router();

// Extend Request to include user and body for chat
interface ChatRequest extends Request {
  user?: {
    id: string;
    role: 'user' | 'admin' | 'super_admin';
  };
  body: {
    model: string;
    prompt: string;
  };
}

// Chat message route
router.post('/message', auth, async (req: ChatRequest, res: Response) => {
  const { model, prompt } = req.body;
  // Default Ollama URL, can be overridden by environment variable
  const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate'; 

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const response = await fetch(ollamaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama2', // Default to llama2 if no model is provided
        prompt: prompt,
        stream: false, // For simplicity, get the full response at once
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      return res.status(response.status).json({ message: `Ollama API error: ${errorText}` });
    }

    const data = await response.json();
    res.json({ response: data.response }); // Assuming Ollama returns { response: "..." }

  } catch (error: any) {
    console.error('Error communicating with Ollama:', error.message);
    res.status(500).json({ message: 'Failed to communicate with Ollama API' });
  }
});

export default router;