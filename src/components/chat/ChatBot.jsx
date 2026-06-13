import { useChatbot } from '../../hooks/useChatbot';
import ChatWindow from './ChatWindow';

export default function ChatBot() {
  const {
    isOpen,
    toggleOpen,
    reset,
    messages,
    isTyping,
    error,
    canSend,
    send,
    chatEndRef,
  } = useChatbot();

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {isOpen ? (
        <div className="mb-3">
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            error={error}
            disabled={!canSend}
            onSend={send}
            endRef={chatEndRef}
            onClose={() => {
              toggleOpen();
            }}
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              onClick={reset}
            >
              Reset hội thoại
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="w-14 h-14 rounded-full bg-violet-600 text-white shadow-2xl flex items-center justify-center hover:bg-violet-700 transition"
        onClick={toggleOpen}
        aria-label="Open chatbot"
      >
        <span className="text-lg">💬</span>
      </button>
    </div>
  );
}

