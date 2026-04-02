ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL OR role NOT IN ('user', 'admin');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT role
      FROM public.profiles
      WHERE id = COALESCE(target_user_id, auth.uid())
      LIMIT 1
    ),
    'user'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role(COALESCE(target_user_id, auth.uid())) = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  target_user_id UUID,
  action_name TEXT,
  action_context JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (user_id, action, context)
  VALUES (target_user_id, action_name, COALESCE(action_context, '{}'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.log_admin_action(UUID, TEXT, JSONB) TO authenticated;

DO $$
BEGIN
  DROP POLICY IF EXISTS "users own profile" ON public.profiles;
  DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
  DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
  DROP POLICY IF EXISTS "admins manage profiles" ON public.profiles;

  DROP POLICY IF EXISTS "users own progress" ON public.user_progresso;
  DROP POLICY IF EXISTS "users own answers" ON public.user_respostas;
  DROP POLICY IF EXISTS "users own flashcards" ON public.flashcards;
  DROP POLICY IF EXISTS "users own dominio" ON public.user_dominio;
  DROP POLICY IF EXISTS "users manage own progress" ON public.user_progresso;
  DROP POLICY IF EXISTS "users manage own answers" ON public.user_respostas;
  DROP POLICY IF EXISTS "users manage own flashcards" ON public.flashcards;
  DROP POLICY IF EXISTS "users manage own dominio" ON public.user_dominio;
  DROP POLICY IF EXISTS "admins manage user_progresso" ON public.user_progresso;
  DROP POLICY IF EXISTS "admins manage user_respostas" ON public.user_respostas;
  DROP POLICY IF EXISTS "admins manage flashcards" ON public.flashcards;
  DROP POLICY IF EXISTS "admins manage user_dominio" ON public.user_dominio;

  DROP POLICY IF EXISTS "trilhas public read" ON public.trilhas;
  DROP POLICY IF EXISTS "modulos public read" ON public.modulos;
  DROP POLICY IF EXISTS "aulas public read" ON public.aulas;
  DROP POLICY IF EXISTS "quiz public read" ON public.quiz_perguntas;
  DROP POLICY IF EXISTS "published trilhas read" ON public.trilhas;
  DROP POLICY IF EXISTS "published modulos read" ON public.modulos;
  DROP POLICY IF EXISTS "published aulas read" ON public.aulas;
  DROP POLICY IF EXISTS "published quiz read" ON public.quiz_perguntas;
  DROP POLICY IF EXISTS "admins manage trilhas" ON public.trilhas;
  DROP POLICY IF EXISTS "admins manage modulos" ON public.modulos;
  DROP POLICY IF EXISTS "admins manage aulas" ON public.aulas;
  DROP POLICY IF EXISTS "admins manage quiz_perguntas" ON public.quiz_perguntas;

  DROP POLICY IF EXISTS "admins read audit logs" ON public.admin_audit_logs;
  DROP POLICY IF EXISTS "admins insert audit logs" ON public.admin_audit_logs;
END $$;

CREATE POLICY "profiles self read"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles self update"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_user_role(auth.uid())
);

CREATE POLICY "admins manage profiles"
ON public.profiles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "users manage own progress"
ON public.user_progresso
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users manage own answers"
ON public.user_respostas
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users manage own flashcards"
ON public.flashcards
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users manage own dominio"
ON public.user_dominio
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins manage user_progresso"
ON public.user_progresso
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins manage user_respostas"
ON public.user_respostas
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins manage flashcards"
ON public.flashcards
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins manage user_dominio"
ON public.user_dominio
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "published trilhas read"
ON public.trilhas
FOR SELECT
USING (publicada = true OR public.is_admin());

CREATE POLICY "published modulos read"
ON public.modulos
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.trilhas
    WHERE trilhas.id = modulos.trilha_id
      AND trilhas.publicada = true
  )
);

CREATE POLICY "published aulas read"
ON public.aulas
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.modulos
    JOIN public.trilhas ON trilhas.id = modulos.trilha_id
    WHERE modulos.id = aulas.modulo_id
      AND trilhas.publicada = true
  )
);

CREATE POLICY "published quiz read"
ON public.quiz_perguntas
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.aulas
    JOIN public.modulos ON modulos.id = aulas.modulo_id
    JOIN public.trilhas ON trilhas.id = modulos.trilha_id
    WHERE aulas.id = quiz_perguntas.aula_id
      AND trilhas.publicada = true
  )
);

CREATE POLICY "admins manage trilhas"
ON public.trilhas
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins manage modulos"
ON public.modulos
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins manage aulas"
ON public.aulas
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins manage quiz_perguntas"
ON public.quiz_perguntas
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admins read audit logs"
ON public.admin_audit_logs
FOR SELECT
USING (public.is_admin());

CREATE POLICY "admins insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = COALESCE(public.profiles.role, EXCLUDED.role, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
