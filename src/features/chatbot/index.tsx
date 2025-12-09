import { useLocation } from "react-router-dom";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useAuth } from "../../contexts/AuthContext";
import { ChatbotButton } from "./ChatbotButton";
import { ChatbotWindow } from "./ChatbotWindow";
import "./chatbot.css";

export function Chatbot() {
  const { isOpen, toggleChatbot, closeChatbot } = useChatbot();
  const { isGuest } = useAuth();
  const location = useLocation();

  // Hide chatbot on these pages or for guests
  const hiddenPaths = ["/", "/login", "/onboarding"];
  const shouldHide = hiddenPaths.includes(location.pathname) || isGuest;

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <ChatbotButton onClick={toggleChatbot} isOpen={isOpen} />
      <ChatbotWindow isOpen={isOpen} onClose={closeChatbot} />
    </>
  );
}
