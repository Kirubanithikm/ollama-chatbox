import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout"; // Import the new Layout component

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
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama2'); // Default model
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input field

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to focus the input field
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]); // Focus when loading stops or messages change (after sending)

  useEffect(() => {
    const fetchChatHistoryAndModels = async () => {
      if (!token) {
        navigate('/login'); // Redirect if no token
        return;
      }
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
  }, [token, navigate]); // Added navigate to dependency array

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
        body: JSON.stringify({ prompt: userMessage.text, model: selectedModel }),
        token: token || undefined,
      });

      const aiMessage: Message = { sender: 'ai', text: response.response, timestamp: new Date().toISOString() };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
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
        setMessages([]);
        toast.success('Chat history cleared successfully!');
      } catch (error) {
        console.error('Error clearing chat history:', error);
        toast.error('Failed to clear chat history.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    toast.info('Started a new chat session.');
  };

  return (
    <Layout> {/* Use the new Layout component */}
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
        <div className="space-x-2">
          <Button variant="outline" onClick={handleNewChat} disabled={isLoading}>
            New Chat
          </Button>
          <Button variant="destructive" onClick={handleClearChat} disabled={isLoading || messages.length === 0}>
            Clear Chat
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-inner mb-4">
        <div className="flex flex-col space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 mt-10">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading chat history and models...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Start a conversation with Ollama!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 prose dark:prose-invert'
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
                <span className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-600 dark:text-gray-400 mr-1' : 'text-gray-500 dark:text-gray-400 ml-1'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {new Date(msg.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          ref={inputRef} // Attach the ref to the input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          disabled={isLoading || availableModels.length === 0}
        />
        <Button type="submit" disabled={isLoading || availableModels.length === 0}>
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
    </Layout>
  );
};

export default Index;