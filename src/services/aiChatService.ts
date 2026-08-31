export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

export interface SendChatOptions {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    activeSection?: string;
    sectionName?: string;
    simulationState?: Record<string, any>;
  };
  language: 'vi' | 'en';
}

export interface ChatResponse {
  reply: string;
  model: string;
  timestamp: string;
}

export async function sendChatMessage(options: SendChatOptions): Promise<string> {
  const { messages, context, language } = options;

  // Format messages for server API (mapping 'assistant' to 'model')
  const payloadMessages = messages.map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    text: m.content,
  }));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: payloadMessages,
      context,
      language,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const defaultMsg =
      language === 'vi'
        ? 'Không thể kết nối với trợ lý lúc này. Vui lòng thử lại.'
        : 'Unable to connect to the assistant at this time. Please try again.';
    throw new Error(data?.message || defaultMsg);
  }

  if (!data?.reply) {
    throw new Error(
      language === 'vi'
        ? 'Không nhận được câu trả lời từ trợ lý.'
        : 'No response received from the assistant.'
    );
  }

  return data.reply;
}
