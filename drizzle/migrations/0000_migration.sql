CREATE TABLE public.council_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Nova conversa',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.council_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.council_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sdk_id text NOT NULL,
  role text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, sdk_id)
);
CREATE INDEX ON public.council_messages(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.council_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.council_messages TO authenticated;
GRANT ALL ON public.council_threads TO service_role;
GRANT ALL ON public.council_messages TO service_role;
ALTER TABLE public.council_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads" ON public.council_threads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own messages" ON public.council_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.council_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));