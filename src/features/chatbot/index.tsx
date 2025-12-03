import { useChatbot } from '../../contexts/ChatbotContext';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotWindow } from './ChatbotWindow';
import './chatbot.css';

export function Chatbot() {
  const { isOpen, toggleChatbot, closeChatbot } = useChatbot();

  return (
    <>
      <ChatbotButton onClick={toggleChatbot} isOpen={isOpen} />
      <ChatbotWindow isOpen={isOpen} onClose={closeChatbot} />
    </>
  );
}

