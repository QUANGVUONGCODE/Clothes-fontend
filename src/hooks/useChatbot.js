import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '../services/chatbotService';

function randomId(prefix = 'sec') {
  // short, UI-friendly
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeNow() {
  return new Date().toISOString();
}

/**
 * useChatbot
 * - Keeps conversation messages
 * - Maintains sessionId from backend
 * - Generates sectionId random per widget mount
 */
export function useChatbot() {
  const [messages, setMessages] = useState(() => []);
  const [sessionId, setSessionId] = useState('');
  const [sectionId] = useState(() => randomId('sec'));

  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

  const toggleOpen = useCallback(() => setIsOpen((v) => !v), []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages, isTyping, scrollToBottom]);

  const reset = useCallback(() => {
    setMessages([]);
    setSessionId('');
    setError(null);
  }, []);

  const send = useCallback(
    async (text) => {
      const trimmed = (text ?? '').trim();
      if (!trimmed) return;

      setError(null);

      const userMessage = {
        id: randomId('msg'),
        role: 'user',
        content: trimmed,
        createdAt: safeNow(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setIsLoading(true);

      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const data = await sendChatMessage({
          message: trimmed,
          sessionId,
          sectionId,
        });

        const assistantContent = data?.response ?? '';
        const nextSessionId = data?.sessionId ?? sessionId;

        if (nextSessionId) setSessionId(nextSessionId);

        const assistantMessage = {
          id: randomId('msg'),
          role: 'assistant',
          content: assistantContent,
          createdAt: safeNow(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (e) {
        const msg = e?.message || 'Something went wrong';
        setError(msg);
        const assistantMessage = {
          id: randomId('msg'),
          role: 'assistant',
          content: `Xin lỗi, hiện tại em chưa trả lời được. ${msg}`,
          createdAt: safeNow(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsTyping(false);
        setIsLoading(false);
      }
    },
    [sectionId, sessionId],
  );

  const canSend = useMemo(() => !isLoading, [isLoading]);

  return {
    isOpen,
    toggleOpen,
    reset,
    messages,
    sessionId,
    sectionId,
    isTyping,
    isLoading,
    error,
    canSend,
    send,
    chatEndRef,
  };
}

