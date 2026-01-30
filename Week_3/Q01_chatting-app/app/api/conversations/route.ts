// app/api/conversations/route.ts
// API routes for managing conversations

import { getConversations, createConversation, updateConversation, deleteConversation } from '@/lib/supabase';

export async function GET() {
  try {
    const result = await getConversations();
    return Response.json(result);
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return Response.json(
      { data: null, error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, title } = body;

    if (!session_id) {
      return Response.json(
        { data: null, error: 'session_id is required' },
        { status: 400 }
      );
    }

    const result = await createConversation({ session_id, title });
    return Response.json(result);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return Response.json(
      { data: null, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { session_id, title } = body;

    if (!session_id || !title) {
      return Response.json(
        { data: null, error: 'session_id and title are required' },
        { status: 400 }
      );
    }

    const result = await updateConversation(session_id, title);
    return Response.json(result);
  } catch (error) {
    console.error('Failed to update conversation:', error);
    return Response.json(
      { data: null, error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return Response.json(
        { success: false, error: 'session_id is required' },
        { status: 400 }
      );
    }

    const result = await deleteConversation(session_id);
    return Response.json(result);
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return Response.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
