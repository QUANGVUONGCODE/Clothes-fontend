import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

export default function ChatWindow({
  messages,
  isTyping,
  error,
  onSend,
  disabled,
  endRef,
  onClose,
}) {
  return (
    <div className="flex flex-col h-[520px] w-[92vw] max-w-[420px] md:max-w-[460px] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <div>
            <div className="font-semibold text-sm">NOVA Bot</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">Tư vấn nhanh, trả lời tự nhiên</div>
          </div>
        </div>
        <button
          type="button"
          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          onClick={onClose}
          aria-label="Close chatbot"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-stone-500 dark:text-stone-400 text-sm px-2">
            Nhắn tin để được gợi ý sản phẩm, outfit, tình trạng đơn hàng, phí ship, đổi trả và thanh toán VNPay.
          </div>
        ) : null}

        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} content={m.content} />
        ))}

        {isTyping ? (
          <div className="flex justify-start">
            <div className="max-w-[86%] rounded-2xl bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-100">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2">Đang trả lời...</span>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="text-danger text-xs bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
            {error}
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <div className="bg-white dark:bg-stone-900">
        <ChatInput onSend={onSend} disabled={disabled} />
      </div>
    </div>
  );
}

