// src/utils/TokenManager.ts
import { getToken, refreshToken } from './User';

const INTROSPECT_URL = 'http://localhost:8080/shopclothes/api/v1/auth/introspect';

export const checkAndRefreshToken = async (): Promise<string | null> => {
    const token = getToken();

    if (!token) {
        console.error('No token found');
        return null;
    }

    const isValid = await checkTokenValidity(token);

    if (!isValid) {
        console.log('Token expired or invalid, refreshing...');
        const newToken = await refreshToken();

        if (!newToken) {
            console.error('Refresh token failed');
            return null;
        }

        return newToken;
    }

    console.log('Token is valid');
    return token;
};

// Hàm kiểm tra token còn hợp lệ không
const checkTokenValidity = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(INTROSPECT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            console.error('Introspect request failed:', response.status);
            return false;
        }

        const data = await response.json();

        return data?.code === 0 && data?.result?.valid === true;
    } catch (error) {
        console.error('Error checking token validity:', error);
        return false;
    }
};