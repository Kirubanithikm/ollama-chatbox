import { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import fetch from 'node-fetch';
import ChatSession, { IMessage } from '../models/Chat';

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
  const userId = req.user?.id;
  const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate'; 

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Save user message
    let chatSession = await ChatSession.findOne({ userId });
    if (!chatSession) {
      chatSession = new ChatSession({ userId, messages: [] });
    }
    chatSession.messages.push({ sender: 'user', text: prompt, timestamp: new Date() } as IMessage);
    await chatSession.save();

    const response = await fetch(ollamaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama2',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      // If Ollama fails, still save an error message from AI
      chatSession.messages.push({ sender: 'ai', text: `Error: Ollama API failed - ${errorText}`, timestamp: new Date() } as IMessage);
      await chatSession.save();
      return res.status(response.status).json({ message: `Ollama API error: ${errorText}` });
    }

    const data = await response.json();
    const aiResponseText = data.response;

    // Save AI message
    chatSession.messages.push({ sender: 'ai', text: aiResponseText, timestamp: new Date() } as IMessage);
    await chatSession.save();

    res.json({ response: aiResponseText });

  } catch (error: any) {
    console.error('Error communicating with Ollama or saving chat:', error.message);
    res.status(500).json({ message: 'Failed to communicate with Ollama API or save chat history' });
  }
});

// Get chat history route
router.get('/history', auth, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const chatSession = await ChatSession.findOne({ userId }).select('messages');
    if (!chatSession) {
      return res.json({ messages: [] }); // Return empty array if no history
    }
    res.json({ messages: chatSession.messages });
  } catch (error: any) {
    console.error('Error fetching chat history:', error.message);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// Get available Ollama models
router.get('/models', auth, async (req: Request, res: Response) => {
  const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/tags'; // Ollama API endpoint for models

  try {
    const response = await fetch(ollamaApiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API models error:', errorText);
      return res.status(response.status).json({ message: `Failed to fetch models from Ollama: ${errorText}` });
    }
    const data = await response.json();
    // Ollama /api/tags returns { models: [{ name: "model:tag", ... }] }
    const models = data.models.map((m: { name: string }) => m.name);
    res.json({ models });
  } catch (error: any) {
    console.error('Error fetching Ollama models:', error.message);
    res.status(500).json({ message: 'Failed to fetch Ollama models' });
  }
});

// Clear chat history route
router.delete('/history', auth, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const result = await ChatSession.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No chat history found for this user.' });
    }
    res.json({ message: 'Chat history cleared successfully.' });
  } catch (error: any) {
    console.error('Error clearing chat history:', error.message);
    res.status(500).json({ message: 'Failed to clear chat history.' });
  }
});

export default router;