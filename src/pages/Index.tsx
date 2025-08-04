import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const fetchChatHistory = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const data = await api('/chat/history', {
          method: 'GET',
          token: token,
        });
        setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Failed to load chat history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [token]); // Fetch history when token changes (on login)

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
        body: JSON.stringify({ prompt: userMessage.text, model: 'llama2' }),
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
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <ScrollArea className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-inner mb-4">
          <div className="flex flex-col space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                Loading chat history...
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
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && messages.length > 0 && ( // Show typing indicator only when sending new message
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
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;