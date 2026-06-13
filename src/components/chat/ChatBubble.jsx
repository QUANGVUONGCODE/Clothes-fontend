export default function ChatBubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? 'max-w-[86%] rounded-2xl rounded-tr-md bg-violet-600 text-white px-4 py-2 shadow'
            : 'max-w-[86%] rounded-2xl rounded-tl-md bg-stone-100 text-stone-900 px-4 py-2 shadow dark:bg-stone-800 dark:text-stone-100'
        }
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</div>
      </div>
    </div>
  );
}

