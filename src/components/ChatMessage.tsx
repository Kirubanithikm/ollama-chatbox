import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface MessageProps {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const ChatMessage = ({ sender, text, timestamp }: MessageProps) => {
  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy text.'));
  };

  return (
    <div className={`flex flex-col ${sender === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          sender === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 prose dark:prose-invert'
        }`}
      >
        {sender === 'user' ? (
          text
        ) : (
          <div className="flex flex-col">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
            <Button
              variant="ghost"
              size="sm"
              className="self-end mt-2 h-auto p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => handleCopyMessage(text)}
              title="Copy message"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <span className={`text-xs mt-1 ${sender === 'user' ? 'text-gray-600 dark:text-gray-400 mr-1' : 'text-gray-500 dark:text-gray-400 ml-1'}`}>
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {new Date(timestamp).toLocaleDateString()}
      </span>
    </div>
  );
};

export default ChatMessage;