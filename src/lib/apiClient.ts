const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

function getAuthHeaders(): Record<string, string> {
  const userId = localStorage.getItem('userId');
  return userId ? { 'x-user-id': userId } : {};
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error (${response.status}): ${text}`)
  }

  return (await response.json()) as TResponse
}

export const apiClient = {
  get: <TResponse>(path: string) => request<TResponse>(path),
  post: <TResponse, TBody = unknown>(path: string, body: TBody) =>
    request<TResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <TResponse, TBody = unknown>(path: string, body: TBody) =>
    request<TResponse>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  patch: <TResponse, TBody = unknown>(path: string, body: TBody) =>
    request<TResponse>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: <TResponse>(path: string) =>
    request<TResponse>(path, {
      method: 'DELETE',
    }),
}

