-- ==============================================================================
-- TONIMALUCO C.I - CRIAÇÃO DAS TABELAS DO CONSELHO COM RLS
-- ==============================================================================

-- 1. Tabela de Conversas / Threads do Conselho
CREATE TABLE IF NOT EXISTS public.council_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.council_threads ENABLE ROW LEVEL SECURITY;

-- Policies para council_threads
CREATE POLICY "Users can manage own threads"
ON public.council_threads
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Tabela de Mensagens do Conselho
CREATE TABLE IF NOT EXISTS public.council_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.council_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sdk_id TEXT NOT NULL,
    role TEXT NOT NULL,
    parts JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (thread_id, sdk_id)
);

-- Ativar RLS
ALTER TABLE public.council_messages ENABLE ROW LEVEL SECURITY;

-- Policies para council_messages
CREATE POLICY "Users can manage own messages"
ON public.council_messages
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Índices para performance de busca por thread e usuário
CREATE INDEX IF NOT EXISTS idx_council_threads_user_id ON public.council_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_council_messages_thread_id ON public.council_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_council_messages_user_id ON public.council_messages(user_id);
