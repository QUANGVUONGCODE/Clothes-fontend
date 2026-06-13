import { apiClient } from '../utils/apiClient';

const API_BASE = "/shopclothes/api/v1";

export async function getUserOrders(userId: number) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE}/orders/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'vi',
    },
  });

  if (!response.ok) {
    throw new Error("Không lấy được đơn hàng");
  }

  const data = await response.json();
  return data?.result || [];
}

export async function getOrderDetails(orderId: number) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE}/order-details/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'vi',
    },
  });

  if (!response.ok) {
    throw new Error("Không lấy được chi tiết đơn hàng");
  }

  const data = await response.json();
  return data?.result || null;
}

export async function cancelOrder(orderId: number) {
  return apiClient(`${API_BASE}/orders/${orderId}`, {
    method: 'DELETE',
  });
}



