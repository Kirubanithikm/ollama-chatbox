import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

export const api = async (endpoint: string, options?: RequestOptions) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.token) {
    headers['x-auth-token'] = options.token;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
    toast.error(errorData.message || 'An error occurred');
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
};