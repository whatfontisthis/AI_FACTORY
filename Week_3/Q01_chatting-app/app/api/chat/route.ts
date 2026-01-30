// app/api/chat/route.ts
// Gemini AI streaming chat endpoint per spec.md

import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { saveMessage } from '@/lib/supabase';

export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  session_id: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatRequest;
    const { messages, session_id } = body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages is required and must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!session_id || typeof session_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate GOOGLE_GENERATIVE_AI_API_KEY is set
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: google('gemini-3-flash-preview'),
      system: `Speak Korean. Be professional and concise. No emojis.`,
      messages,
      onFinish: async ({ text }) => {
        // Save assistant message to Supabase after streaming completes
        try {
          await saveMessage({
            content: text,
            role: 'assistant',
            session_id,
          });
        } catch (saveError) {
          console.error('Failed to save message to Supabase:', saveError);
        }
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error('Streaming error:', error);
        if (error instanceof Error) {
          return error.message;
        }
        return 'An error occurred during streaming';
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
