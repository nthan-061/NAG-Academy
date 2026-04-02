CREATE TABLE IF NOT EXISTS public.mentor_user_context (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal TEXT,
  experience_level TEXT CHECK (experience_level IN ('nenhuma', 'iniciante', 'intermediaria', 'avancada')),
  use_case TEXT CHECK (use_case IN ('uso-proprio', 'profissional', 'cliente', 'equipe')),
  ad_budget_range TEXT,
  prior_experience TEXT,
  declared_challenges TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mentor_chat_messages_user_id_created_at_idx
ON public.mentor_chat_messages (user_id, created_at DESC);

ALTER TABLE public.mentor_user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "users manage own mentor context" ON public.mentor_user_context;
  DROP POLICY IF EXISTS "admins manage mentor context" ON public.mentor_user_context;
  DROP POLICY IF EXISTS "users manage own mentor chat" ON public.mentor_chat_messages;
  DROP POLICY IF EXISTS "admins manage mentor chat" ON public.mentor_chat_messages;
END $$;

CREATE POLICY "users manage own mentor context"
ON public.mentor_user_context
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins manage mentor context"
ON public.mentor_user_context
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "users manage own mentor chat"
ON public.mentor_chat_messages
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins manage mentor chat"
ON public.mentor_chat_messages
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
