import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm for GitHub Flavored Markdown

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // Assuming ISO string from backend
}

const Index = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama2'); // Default model
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme(); // Use theme hook

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatHistoryAndModels = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        // Fetch chat history
        const historyData = await api('/chat/history', {
          method: 'GET',
          token: token,
        });
        setMessages(historyData.messages);

        // Fetch available models
        const modelsData = await api('/chat/models', {
          method: 'GET',
          token: token,
        });
        if (modelsData.models && modelsData.models.length > 0) {
          setAvailableModels(modelsData.models);
          // Set default model to the first available if 'llama2' is not present
          if (!modelsData.models.includes('llama2')) {
            setSelectedModel(modelsData.models[0]);
          }
        } else {
          toast.info('No Ollama models found. Please ensure Ollama is running and models are downloaded.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load chat history or models.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistoryAndModels();
  }, [token]); // Fetch history and models when token changes (on login)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input.trim(), timestamp: new Date().toISOString() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api('/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.text, model: selectedModel }), // Use selected model
        token: token || undefined,
      });

      const aiMessage: Message = { sender: 'ai', text: response.response, timestamp: new Date().toISOString() };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // The api utility already shows a toast for errors, so no need to duplicate
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: 'Error: Could not get a response.', timestamp: new Date().toISOString() }]);
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
        setMessages([]); // Clear messages from state
        toast.success('Chat history cleared successfully!');
      } catch (error) {
        console.error('Error clearing chat history:', error);
        toast.error('Failed to clear chat history.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ollama Chat</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-300">Welcome, {user?.username}!</span>
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
            <Label htmlFor="dark-mode">Dark Mode</Label>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
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
          <Button variant="destructive" onClick={handleClearChat} disabled={isLoading || messages.length === 0}>
            Clear Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-inner mb-4">
          <div className="flex flex-col space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                Loading chat history and models...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                Start a conversation with Ollama!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 prose dark:prose-invert' // Added prose classes
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      msg.text
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading || availableModels.length === 0}
          />
          <Button type="submit" disabled={isLoading || availableModels.length === 0}>
            Send
          </Button>
        </form>
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;