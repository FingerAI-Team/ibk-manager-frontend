type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

export async function fetchWithAuth<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // 필요한 경우 인증 토큰 추가
    // 'Authorization': `Bearer ${getToken()}`
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
} 