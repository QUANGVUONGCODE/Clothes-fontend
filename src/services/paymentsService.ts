const API_BASE = '/shopclothes/api/v1';

export async function getPaymentMethods() {
  return fetch(`${API_BASE}/payments`, {
    method: 'GET',
    headers: {
      'Accept-Language': 'vi',
    },
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.message || 'Failed to fetch payment methods';
      throw new Error(msg);
    }
    return data;
  });
}

// Tạo URL VNPAY: backend endpoint/payload bạn cần khớp theo contract thực tế.
// Hiện tại để theo yêu cầu UI: chỉ cần gửi amount/bankCode/language.
export async function createVnPayPaymentUrl(payload: {
  amount: number;
  bankCode?: string;
  language?: string;
  [key: string]: any;
}) {
  const token = localStorage.getItem('auth_token');

  // Endpoint đúng theo backend của bạn.
  return fetch(`${API_BASE}/payments/create_payment_url`, {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'vi',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.message || 'Failed to create VNPAY payment url';
      throw new Error(msg);
    }
    return data;
  });
}

export async function getPaymentResult(txnRef: string) {
  const token = localStorage.getItem('auth_token');
  return fetch(`${API_BASE}/payments/result/${txnRef}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'Accept-Language': 'vi',
    },
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.message || 'Failed to fetch payment result';
      throw new Error(msg);
    }
    return data;
  });
}

