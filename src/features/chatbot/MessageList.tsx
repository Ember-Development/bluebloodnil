import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import './chatbot.css';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isTyping, messagesEndRef }: MessageListProps) {
  return (
    <div className="chatbot-messages">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isTyping && (
        <div className="chatbot-typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

