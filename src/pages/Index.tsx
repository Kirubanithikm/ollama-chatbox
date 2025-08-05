import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import { useAuth } from '@/context/AuthContext'; // Import useAuth

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth(); // Use auth context
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama2');
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [showOllamaErrorDetails, setShowOllamaErrorDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isLoading && !isInitialLoading && !authLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, isInitialLoading, authLoading, messages]);

  useEffect(() => {
    // Simulate loading models or check Ollama connection
    const loadModels = async () => {
      setIsInitialLoading(true);
      // In a real scenario, you'd fetch models from your backend/Ollama
      // For now, we'll just set a default and remove the error
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setAvailableModels(['llama2', 'mistral', 'gemma']); // Example models
      setSelectedModel('llama2');
      setOllamaError(null); // Clear the error now that Supabase is being integrated
      setIsInitialLoading(false);
    };

    if (!authLoading && user) { // Only load models if user is authenticated
      loadModels();
    } else if (!authLoading && !user) {
      setIsInitialLoading(false);
      setOllamaError('Please log in to use the chat functionality.');
    }
  }, [user, authLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Placeholder for actual Ollama API call via Supabase Edge Function or direct call
      // For now, simulate an AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      const aiResponse: Message = {
        sender: 'ai',
        text: `Hello ${user?.email}! You said: "${userMessage.text}". This is a placeholder response from ${selectedModel}.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from Ollama. Please try again.');
      setOllamaError('Failed to connect to Ollama. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    setMessages([]);
    toast.info('Chat cleared.');
  };

  const handleNewChat = () => {
    setMessages([]);
    setOllamaError(null);
    toast.info('Started a new chat session.');
  };

  const isChatDisabled = isLoading || isInitialLoading || !user || !!ollamaError;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isChatDisabled || availableModels.length === 0}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.length > 0 ? (
              availableModels.map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-models" disabled>No models available</SelectItem>
            )}
          </SelectContent>
        </Select>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleNewChat} disabled={isChatDisabled}>
            New Chat
          </Button>
          <Button variant="destructive" onClick={handleClearChat} disabled={isChatDisabled || messages.length === 0}>
            Clear Chat
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-inner mb-4">
        <div className="flex flex-col space-y-4">
          {authLoading || isInitialLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 mt-10">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>{authLoading ? 'Checking authentication...' : 'Loading chat...'}</p>
            </div>
          ) : ollamaError ? (
            <div className="text-center text-red-500 dark:text-red-400 mt-10 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="font-semibold mb-2">
                Chat Error: <span className="font-normal">{ollamaError.split('.')[0]}.</span>
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
                  {user ? (
                    "Please ensure Ollama is running and models are downloaded. You will need to set up a Supabase Edge Function or a separate backend to proxy requests to Ollama securely."
                  ) : (
                    "You need to be logged in to use the chat functionality. Please register or log in."
                  )}
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
        <Textarea
          ref={inputRef}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 resize-none"
          disabled={isChatDisabled}
          rows={1}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
          }}
        />
        <Button type="submit" disabled={isChatDisabled || !input.trim()}>
          Send
        </Button>
      </form>
    </>
  );
};

export default Index;