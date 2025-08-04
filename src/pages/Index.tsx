import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep Input for now if needed elsewhere, but we'll use Textarea for chat
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/Auth/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // Assuming ISO string from backend
}

const Index = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama2');
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [showOllamaErrorDetails, setShowOllamaErrorDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Change to HTMLTextAreaElement

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isLoading && !isInitialLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, isInitialLoading, messages]);

  useEffect(() => {
    const fetchChatHistoryAndModels = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      setIsInitialLoading(true);
      setOllamaError(null);
      try {
        const historyData = await api('/chat/history', {
          method: 'GET',
          token: token,
        });
        setMessages(historyData.messages);

        const modelsData = await api('/chat/models', {
          method: 'GET',
          token: token,
        });
        if (modelsData.models && modelsData.models.length > 0) {
          setAvailableModels(modelsData.models);
          if (!modelsData.models.includes('llama2')) {
            setSelectedModel(modelsData.models[0]);
          }
        } else {
          setOllamaError('No Ollama models found. Please ensure Ollama is running and models are downloaded. Also, verify VITE_BACKEND_URL and OLLAMA_API_URL are set correctly in your .env files.');
          toast.info('No Ollama models found. Please ensure Ollama is running and models are downloaded.');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setOllamaError(error.message || 'Failed to load chat history or models. Check your backend connection and Ollama setup.');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchChatHistoryAndModels();
  }, [token, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isInitialLoading) return;

    const userMessage: Message = { sender: 'user', text: input.trim(), timestamp: new Date().toISOString() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setOllamaError(null);

    try {
      const response = await api('/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.text, model: selectedModel }),
        token: token || undefined,
      });

      const aiMessage: Message = { sender: 'ai', text: response.response, timestamp: new Date().toISOString() };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.message || 'Could not get a response.';
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: `Error: ${errorMessage}`, timestamp: new Date().toISOString() }]);
      setOllamaError(`Failed to get response: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear your chat history? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await api('/chat/history', {
          method: 'DELETE',
          token: token || undefined,
        });
        setMessages([]);
        toast.success('Chat history cleared successfully!');
      } catch (error) {
        console.error('Error clearing chat history:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setOllamaError(null);
    toast.info('Started a new chat session.');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading || isInitialLoading || availableModels.length === 0}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.length > 0 ? (
              availableModels.map((modelName) => (
                <SelectItem key={modelName} value={modelName}>
                  {modelName}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-models" disabled>No models available</SelectItem>
            )}
          </SelectContent>
        </Select>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleNewChat} disabled={isLoading || isInitialLoading}>
            New Chat
          </Button>
          <Button variant="destructive" onClick={handleClearChat} disabled={isLoading || isInitialLoading || messages.length === 0}>
            Clear Chat
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-inner mb-4">
        <div className="flex flex-col space-y-4">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 mt-10">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading chat history and available models...</p>
            </div>
          ) : ollamaError ? (
            <div className="text-center text-red-500 dark:text-red-400 mt-10 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="font-semibold mb-2">
                Ollama Connection Error: <span className="font-normal">{ollamaError.split('.')[0]}.</span>
              </p>
              <Button
                variant="link"
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 h-auto p-0"
                onClick={() => setShowOllamaErrorDetails(!showOllamaErrorDetails)}
              >
                {showOllamaErrorDetails ? (
                  <>
                    Hide Details <ChevronUp className="ml-1 h-4 w-4 inline" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="ml-1 h-4 w-4 inline" />
                  </>
                )}
              </Button>
              {showOllamaErrorDetails && (
                <p className="mt-2 text-sm text-left">
                  Please ensure Ollama is running and models are downloaded. Also, verify your backend's `.env` file has `OLLAMA_API_URL` set (e.g., `http://localhost:11434`) and your frontend's `.env` has `VITE_BACKEND_URL` set (e.g., `http://localhost:5000/api`).
                </p>
              )}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Start a conversation with Ollama!
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                text={msg.text}
                timestamp={msg.timestamp}
              />
            ))
          )}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Textarea // Changed from Input to Textarea
          ref={inputRef}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 resize-none" // Added resize-none to prevent manual resizing
          disabled={isLoading || isInitialLoading || availableModels.length === 0 || ollamaError !== null}
          rows={1} // Start with 1 row, will expand with content
          onInput={(e) => { // Auto-resize textarea based on content
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
          }}
        />
        <Button type="submit" disabled={isLoading || isInitialLoading || availableModels.length === 0 || ollamaError !== null}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </>
  );
};

export default Index;