import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const HOST = '0.0.0.0';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  context?: {
    activeSection?: string;
    sectionName?: string;
    simulationState?: Record<string, any>;
  };
  language?: 'vi' | 'en';
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chat endpoint
  app.post('/api/chat', async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
    try {
      const { messages, context, language = 'vi' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({
          error: 'INVALID_REQUEST',
          message: language === 'vi' ? 'Dữ liệu tin nhắn không hợp lệ.' : 'Invalid messages array in request body.',
        });
        return;
      }

      const lastUserMessage = messages[messages.length - 1];
      if (!lastUserMessage || !lastUserMessage.text || typeof lastUserMessage.text !== 'string' || !lastUserMessage.text.trim()) {
        res.status(400).json({
          error: 'EMPTY_MESSAGE',
          message: language === 'vi' ? 'Nội dung câu hỏi không được để trống.' : 'Question content cannot be empty.',
        });
        return;
      }

      let ai: GoogleGenAI;
      try {
        ai = getAiClient();
      } catch (err: any) {
        console.error('[AI Chat] Missing API Key configuration');
        res.status(503).json({
          error: 'MISSING_API_KEY',
          message:
            language === 'vi'
              ? 'Chưa cấu hình GEMINI_API_KEY trong môi trường máy chủ. Vui lòng thiết lập API key để sử dụng trợ lý.'
              : 'GEMINI_API_KEY is not configured in the server environment. Please configure your API key to use the assistant.',
        });
        return;
      }

      // Build pedagogical system instruction
      const isVietnamese = language === 'vi';
      const systemInstruction = `You are a friendly, encouraging, and clear Educational AI Teaching Assistant for an interactive Blockchain Elearning laboratory platform (Nền tảng Học tập & Mô phỏng Trực quan Blockchain).

Primary Educational Mission:
- Help learners (beginners, university students, and curious self-learners) understand Blockchain and Cryptography fundamentals easily without requiring a deep Computer Science background.
- Core topics: Blockchain, Block, Hash, SHA-256, Avalanche Effect, Merkle Tree & Merkle Root, Previous Hash, Nonce, Difficulty, Proof of Work (PoW), Proof of Stake (PoS), Validator, Stake / ETH đặt cọc, Block reward / Phần thưởng, Slashing / Tịch thu tiền cọc, Fork, Consensus / Đồng thuận, Transactions / Giao dịch, Mempool, Digital Signatures (ECDSA / secp256k1).

Pedagogical Communication Rules:
1. Explain simply first: Start with an intuitive, jargon-free explanation.
2. Real-world analogy: Provide a concrete, everyday analogy when helpful (e.g. digital fingerprint for hash, lottery ticket for nonce in PoW, lottery ticket wheel proportional to deposit for PoS).
3. Connect to the user's current visual simulation: If the user provides context about their current section, refer to what they are observing on their screen.
4. Depth on demand: Keep initial answers concise (2 to 4 short paragraphs or bullet points). Only dive into deep math/cryptography formulas if explicitly requested.
5. STRICT TERMINOLOGY CONSISTENCY FOR PROOF OF STAKE:
   - "Validator" -> Validator
   - "Stake" -> "ETH đặt cọc" (in VI) / "Staked ETH" (in EN)
   - "Select block solver / validator selection" -> "Chọn người giải khối" (in VI) / "Select block solver" (in EN)
   - "Block solver / proposer" -> "Người giải khối" (in VI) / "Block solver" (in EN)
   - "Slashing" -> "Tịch thu một phần tiền đặt cọc do gian lận" (in VI) / "Slashing (penalty for fraudulent block)" (in EN)
   - "Block reward" -> "Phần thưởng giải khối" (in VI) / "Block reward" (in EN)
   - NEVER use "người ghi sổ", "đại biểu", "người xác nhận", or "người đề xuất" when referring to the PoS solver role.
6. LANGUAGE DISCIPLINE:
   - Current target language is: ${isVietnamese ? 'Vietnamese (Tiếng Việt)' : 'English'}.
   - ${
     isVietnamese
       ? 'Respond completely in natural, fluent Vietnamese. Do NOT clutter explanations with unnecessary English words in parentheses unless it is an established acronym (e.g., SHA-256, PoW, PoS, ETH).'
       : 'Respond in clean, natural English using standard Blockchain terms.'
   }
7. DO NOT hallucinate simulation values that are not in the provided context. If asked about specific numbers or participants, use the given context accurately.`;

      // Build context description
      let contextNote = '';
      if (context) {
        const parts: string[] = [];
        if (context.activeSection) parts.push(`Current section ID: ${context.activeSection}`);
        if (context.sectionName) parts.push(`Current section title: ${context.sectionName}`);
        if (context.simulationState && Object.keys(context.simulationState).length > 0) {
          parts.push(`Current interactive simulation state: ${JSON.stringify(context.simulationState)}`);
        }
        if (parts.length > 0) {
          contextNote = `\n\n[Current App Context for the user's active screen]:\n${parts.join('\n')}\n`;
        }
      }

      // Convert conversation history (limit to last 8 turns for efficiency)
      const recentMessages = messages.slice(-8);
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      recentMessages.forEach((msg, idx) => {
        const isLast = idx === recentMessages.length - 1;
        const text = isLast && contextNote ? `${msg.text}${contextNote}` : msg.text;
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text }],
        });
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || '';

      if (!replyText.trim()) {
        throw new Error('Empty response received from Gemini model');
      }

      res.json({
        reply: replyText,
        model: 'gemini-3.7-flash',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[AI Chat] Request failed:', error?.message || error);
      const isVietnamese = req.body?.language === 'vi';
      res.status(500).json({
        error: 'AI_SERVICE_ERROR',
        message:
          isVietnamese
            ? 'Không thể kết nối với trợ lý lúc này. Vui lòng thử lại.'
            : 'Unable to connect to the assistant at this time. Please try again.',
      });
    }
  });

  // Setup Vite middleware in dev mode, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Server] Blockchain Elearning Server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup failure:', err);
  process.exit(1);
});
