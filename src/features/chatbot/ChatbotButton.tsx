import './chatbot.css';

interface ChatbotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatbotButton({ onClick, isOpen }: ChatbotButtonProps) {
  return (
    <button
      className={`chatbot-button ${isOpen ? 'chatbot-button-open' : ''}`}
      onClick={onClick}
      aria-label="Open chatbot"
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}

