const API_BASE = '/shopclothes/api/v1';

/**
 * Call backend chatbot endpoint.
 * Backend: permitall() => không cần JWT.
 *
 * POST /shopclothes/api/v1/chat
 * body: { message: string, sessionId?: string }
 */
export async function sendChatMessage({ message, sessionId }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'vi',
    },
    body: JSON.stringify({
      message,
      sessionId,
    }),
  });


  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || 'Failed to call chatbot';
    throw new Error(msg);
  }

  // expected: { response: string, sessionId: string }
  return data;
}

