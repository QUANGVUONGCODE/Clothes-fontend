import { useEffect, useRef, useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (disabled) return;
  }, [disabled]);

  const submit = () => {
    const text = value;
    if (!text.trim()) return;
    onSend?.(text);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="p-3 border-t border-stone-200 dark:border-stone-700">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 input-base"
          placeholder="Nhập câu hỏi... (VD: quần legging, phí ship, đổi trả...)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={submit}
          disabled={disabled}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

