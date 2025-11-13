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
    const messageData = axiosError.response?.data?.message;

    let msg = '';

    if (messageData) {
      msg = Array.isArray(messageData)
        ? messageData.join(', ')
        : String(messageData);
    } else {
      msg = axiosError.response?.statusText || 'Erro desconhecido do servidor';
    }

    return prefix ? `${prefix}: ${msg}` : msg;
  }

  return prefix ? `${prefix}: Erro desconhecido` : 'Erro desconhecido';
}
