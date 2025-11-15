// utils/handleApiError.ts

type AxiosLikeError = {
  isAxiosError?: boolean;
  response?: {
    data?: { message?: string | string[] };
    statusText?: string;
  };
};

export function handleApiError(error: unknown, prefix?: string): string {
  const axiosError = error as AxiosLikeError;

  if (axiosError?.isAxiosError) {
    // Prefer a normalized userMessage attached by the api interceptor
    const msgFromUser = (axiosError as any).userMessage as string | undefined;
    const messageData = axiosError.response?.data?.message;

    let msg = '';

    if (msgFromUser) {
      msg = msgFromUser;
    } else if (messageData) {
      msg = Array.isArray(messageData) ? messageData.join(', ') : String(messageData);
    } else {
      msg = axiosError.response?.statusText || 'Erro desconhecido do servidor';
    }

    return prefix ? `${prefix}: ${msg}` : msg;
  }

  return prefix ? `${prefix}: Erro desconhecido` : 'Erro desconhecido';
}
