import { getToken, refreshToken } from './User';

const TOKEN_KEY = 'auth_token';

function buildHeaders(token: string | null, isFormData = false) {
  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function clearSessionAndRedirect() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user_response');
  localStorage.removeItem('user_role');
  globalThis.location.href = '/login';
}

async function executeRequest(url: string, options: RequestInit, token: string | null) {
  const isFormData = options.body instanceof FormData;
  return fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(token, isFormData),
      ...(options.headers ?? {}),
    },
  });
}

export async function apiClient(url: string, options: RequestInit = {}): Promise<any> {
  let token = getToken();
  let res = await executeRequest(url, options, token);

  // Token hết hạn → thử refresh 1 lần
  if (res.status === 401) {
    const newToken = await refreshToken();

    if (!newToken) {
      clearSessionAndRedirect();
      throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
    }

    token = newToken;
    res = await executeRequest(url, options, token);

    // Vẫn 401 sau khi refresh → kick ra login
    if (res.status === 401) {
      clearSessionAndRedirect();
      throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
    }
  }

  if (!res.ok) {
    throw new Error(`Lỗi API ${res.status}: ${url}`);
  }

  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(data.message ?? `Lỗi nghiệp vụ: ${JSON.stringify(data)}`);
  }

  return data.result;
}
