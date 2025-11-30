// OpenRouter API integration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function sendChatMessage(
  messages: Message[],
  paperTitle: string,
  pdfContent?: string
): Promise<ChatResponse> {
  // Build context with PDF content if available
  let contextSection = '';
  if (pdfContent && pdfContent.trim()) {
    contextSection = `

=== PAPER CONTENT ===
The following is the extracted text content from the paper "${paperTitle}". Use this to answer questions about specific problems, concepts, and formulas mentioned in the paper:

${pdfContent}

=== END OF PAPER CONTENT ===
`;
  }

  const systemPrompt: Message = {
    role: 'system',
    content: `You are an expert IIT JEE tutor and study assistant. You are helping a student who is viewing the paper: "${paperTitle}".
${contextSection}
Your role is to:
- Help explain concepts, formulas, and problem-solving techniques related to JEE Advanced
- When the student asks about specific questions (e.g., "Question 1", "Q.2", etc.), refer to the actual content from the paper above
- Provide clear, step-by-step explanations and solutions
- Reference relevant physics, chemistry, and mathematics concepts
- Be encouraging and supportive
- Keep responses concise but thorough
- Use proper formatting for mathematical expressions

When explaining solutions:
1. First, identify what the question is asking
2. List the relevant concepts and formulas
3. Show the step-by-step solution process
4. Highlight key insights and common mistakes to avoid

If the student asks about a specific question from the paper, you have access to the full paper content above - use it to provide accurate, helpful guidance.`
  };

  const allMessages = [systemPrompt, ...messages];

  try {
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'IIT Archive Study Assistant'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: allMessages,
        max_tokens: 1024,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      return {
        success: false,
        message: '',
        error: errorData.error?.message || `API error: ${response.status}`
      };
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return {
      success: true,
      message: assistantMessage
    };
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return {
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'Failed to connect to AI service'
    };
  }
}

