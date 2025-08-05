import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
// Removed useAuth, api, useNavigate
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const Index = () => {
  // Removed token, navigate
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
    if (inputRef.current && !isLoading && !isInitialLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, isInitialLoading, messages]);

  useEffect(() => {
    // Placeholder for future Supabase/Ollama integration
    setIsInitialLoading(false);
    setOllamaError('Chat functionality is currently disabled. Please set up Supabase and Ollama integration.');
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error('Chat functionality is not yet implemented with Supabase.');
  };

  const handleClearChat = async () => {
    toast.error('Chat functionality is not yet implemented with Supabase.');
  };

  const handleNewChat = () => {
    setMessages([]);
    setOllamaError(null);
    toast.info('Started a new chat session (placeholder).');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={true}> {/* Disabled for now */}
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-models" disabled>No models available</SelectItem>
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
              <p>Loading...</p>
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
              Start a conversation with Ollama! (Supabase integration pending)
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
          disabled={true} // Disabled for now
          rows={1}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
          }}
        />
        <Button type="submit" disabled={true}> {/* Disabled for now */}
          Send
        </Button>
      </form>
    </>
  );
};

export default Index;