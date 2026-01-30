# Q1 Chat Application - Technical Specification

> **Version**: 1.0.0
> **Last Updated**: 2026-01-28
> **Status**: Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Routes](#4-api-routes)
5. [UI Components](#5-ui-components)
6. [Environment Variables](#6-environment-variables)
7. [Security & RLS Policies](#7-security--rls-policies)

---

## 1. Overview

Q1은 Gemini AI를 활용한 실시간 채팅 애플리케이션입니다. 사용자는 AI와 대화하며, 모든 메시지는 Supabase에 저장됩니다.

### 1.1 Core Features

- AI 채팅: Gemini API를 통한 스트리밍 응답
- 메시지 저장: Supabase PostgreSQL에 대화 내역 저장
- 실시간 UI: 스트리밍 텍스트 렌더링

### 1.2 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Vercel AI SDK  │────▶│   Gemini API    │
│   (Frontend)    │     │  (API Routes)   │     │   (Streaming)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         └─────────────▶│    Supabase     │
                        │  (PostgreSQL)   │
                        └─────────────────┘
```

---

## 2. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | Latest |
| AI | Google Gemini API | gemini-1.5-flash |
| AI SDK | Vercel AI SDK | 4.x |
| State Management | React Hooks | - |

### 2.1 Required Dependencies

```json
{
  "dependencies": {
    "@ai-sdk/google": "^1.0.0",
    "ai": "^4.0.0",
    "@supabase/supabase-js": "^2.45.0"
  }
}
```

---

## 3. Database Schema

### 3.1 Table: `messages`

메시지 테이블은 모든 채팅 메시지를 저장합니다.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | 메시지 고유 식별자 |
| `content` | `text` | NOT NULL | 메시지 내용 |
| `role` | `text` | NOT NULL, CHECK (role IN ('user', 'assistant')) | 발신자 역할 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | 생성 시각 |
| `session_id` | `text` | NOT NULL | 대화 세션 식별자 |

### 3.2 SQL Migration

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL
);

-- Create index for faster session queries
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### 3.3 TypeScript Types

```typescript
// types/database.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  session_id: string;
}

export interface InsertMessage {
  content: string;
  role: 'user' | 'assistant';
  session_id: string;
}
```

---

## 4. API Routes

### 4.1 POST `/api/chat`

Gemini AI와의 스트리밍 채팅을 처리합니다.

#### Request

```typescript
// Request Body
interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  session_id: string;
}
```

#### Response

- **Content-Type**: `text/event-stream`
- **Format**: Vercel AI SDK 스트리밍 응답

#### Implementation

```typescript
// app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, session_id } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages,
    onFinish: async ({ text }) => {
      // Save assistant message to Supabase
      await saveMessage({
        content: text,
        role: 'assistant',
        session_id,
      });
    },
  });

  return result.toDataStreamResponse();
}
```

### 4.2 GET `/api/messages`

세션의 메시지 목록을 조회합니다.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | 대화 세션 식별자 |

#### Response

```typescript
interface MessagesResponse {
  data: Message[];
  error: string | null;
}
```

### 4.3 POST `/api/messages`

새 메시지를 저장합니다 (사용자 메시지 저장용).

#### Request Body

```typescript
interface SaveMessageRequest {
  content: string;
  role: 'user' | 'assistant';
  session_id: string;
}
```

#### Response

```typescript
interface SaveMessageResponse {
  data: Message | null;
  error: string | null;
}
```

---

## 5. UI Components

### 5.1 Component Tree

```
app/
├── page.tsx              # ChatPage (메인 채팅 페이지)
└── components/
    ├── chat/
    │   ├── ChatContainer.tsx    # 채팅 컨테이너
    │   ├── MessageList.tsx      # 메시지 목록
    │   ├── MessageItem.tsx      # 개별 메시지
    │   ├── MessageInput.tsx     # 메시지 입력창
    │   └── LoadingIndicator.tsx # 로딩 상태
    └── ui/
        └── Button.tsx           # 공통 버튼
```

### 5.2 Component Specifications

#### 5.2.1 `ChatContainer`

채팅 UI의 최상위 컨테이너입니다.

```typescript
interface ChatContainerProps {
  sessionId: string;
}
```

**Responsibilities:**
- 메시지 상태 관리
- Vercel AI SDK `useChat` 훅 사용
- 자식 컴포넌트에 props 전달

#### 5.2.2 `MessageList`

메시지 목록을 렌더링합니다.

```typescript
interface MessageListProps {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>;
  isLoading: boolean;
}
```

**Responsibilities:**
- 메시지 목록 스크롤 관리
- 새 메시지 시 자동 스크롤
- 빈 상태 UI 표시

#### 5.2.3 `MessageItem`

개별 메시지를 렌더링합니다.

```typescript
interface MessageItemProps {
  role: 'user' | 'assistant';
  content: string;
}
```

**Styling:**
- User 메시지: 우측 정렬, 파란색 배경
- Assistant 메시지: 좌측 정렬, 회색 배경
- Markdown 렌더링 지원 (선택적)

#### 5.2.4 `MessageInput`

메시지 입력창입니다.

```typescript
interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}
```

**Features:**
- Textarea 자동 높이 조절
- Enter 키로 전송 (Shift+Enter는 줄바꿈)
- 로딩 중 비활성화
- 전송 버튼

#### 5.2.5 `LoadingIndicator`

AI 응답 대기 중 로딩 상태를 표시합니다.

```typescript
interface LoadingIndicatorProps {
  // No props required
}
```

**Visual:**
- 점 3개 애니메이션 (typing indicator)
- "AI가 답변을 작성 중입니다..." 텍스트

---

## 6. Environment Variables

### 6.1 Required Variables

```env
# .env.local

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### 6.2 Variable Descriptions

| Variable | Public | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase 익명 키 (RLS 보호) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini API 키 (서버 전용) |

### 6.3 Example File

```env
# .env.example (commit this file)

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

---

## 7. Security & RLS Policies

### 7.1 Row Level Security (RLS)

messages 테이블에 대한 RLS 정책입니다.

#### 7.1.1 Public Access Policy (MVP)

MVP 단계에서는 인증 없이 세션 기반으로 메시지에 접근합니다.

```sql
-- Allow anyone to read messages (MVP - no auth)
CREATE POLICY "Allow public read access"
  ON messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages (MVP - no auth)
CREATE POLICY "Allow public insert access"
  ON messages
  FOR INSERT
  WITH CHECK (true);
```

> **Note**: 프로덕션에서는 Supabase Auth를 통한 사용자 인증과 `user_id` 컬럼 추가를 권장합니다.

### 7.2 Future Auth Integration

향후 인증 추가 시 스키마 변경:

```sql
-- Add user_id column
ALTER TABLE messages ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Appendix

### A. File Structure (Final)

```
q1/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   └── messages/
│   │       └── route.ts
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── LoadingIndicator.tsx
│   │   └── ui/
│   │       └── Button.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   └── supabase.ts
├── types/
│   └── database.ts
├── docs/
│   └── spec.md
├── .env.local
├── .env.example
└── package.json
```

### B. Session ID Generation

클라이언트에서 세션 ID 생성:

```typescript
// lib/session.ts
export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();

  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}
```

### C. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-28 | 1.0.0 | Initial specification |

---

*This document serves as the single source of truth for the Q1 chat application. All implementations must adhere to these specifications.*
