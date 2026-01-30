// app/api/messages/route.ts
// Messages CRUD endpoints per spec.md

import { NextRequest, NextResponse } from 'next/server';
import { getMessagesBySession, saveMessage } from '@/lib/supabase';
import type { InsertMessage } from '@/types/database';

/**
 * GET /api/messages?session_id=xxx
 * Fetch all messages for a given session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    console.log('[API GET /api/messages] session_id:', sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { data: null, error: 'session_id query parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await getMessagesBySession(sessionId);

    console.log('[API GET /api/messages] Retrieved messages:', data?.length || 0);
    console.log('[API GET /api/messages] Messages:', JSON.stringify(data, null, 2));

    if (error) {
      console.error('[API GET /api/messages] Error:', error);
      return NextResponse.json(
        { data: null, error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { data: null, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Save a new message (typically user messages)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as InsertMessage;

    console.log('[API POST /api/messages] Received:', {
      content: body.content?.slice(0, 50),
      role: body.role,
      session_id: body.session_id,
    });

    // Validate required fields
    if (!body.content || typeof body.content !== 'string') {
      console.error('[API POST /api/messages] Validation failed: content');
      return NextResponse.json(
        { data: null, error: 'content is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.role || !['user', 'assistant'].includes(body.role)) {
      console.error('[API POST /api/messages] Validation failed: role =', body.role);
      return NextResponse.json(
        { data: null, error: "role is required and must be 'user' or 'assistant'" },
        { status: 400 }
      );
    }

    if (!body.session_id || typeof body.session_id !== 'string') {
      console.error('[API POST /api/messages] Validation failed: session_id');
      return NextResponse.json(
        { data: null, error: 'session_id is required and must be a string' },
        { status: 400 }
      );
    }

    const { data, error } = await saveMessage({
      content: body.content,
      role: body.role,
      session_id: body.session_id,
    });

    console.log('[API POST /api/messages] Save result:', { data, error });

    if (error) {
      console.error('[API POST /api/messages] Save error:', error);
      return NextResponse.json(
        { data: null, error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { data: null, error: errorMessage },
      { status: 500 }
    );
  }
}
