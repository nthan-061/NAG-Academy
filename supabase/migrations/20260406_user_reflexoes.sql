-- Migration: user_reflexoes
-- Stores post-quiz written reflection evaluations.
-- Each row represents one reflection attempt by a user for a specific aula.
-- Multiple attempts per (user, aula) are allowed so the student can retry if rejected.

CREATE TABLE IF NOT EXISTS public.user_reflexoes (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  aula_id                   UUID        NOT NULL REFERENCES public.aulas(id)    ON DELETE CASCADE,

  -- Raw reflection text and metadata
  texto                     TEXT        NOT NULL,
  word_count                INTEGER     NOT NULL CHECK (word_count >= 0),

  -- AI evaluation results
  approved                  BOOLEAN     NOT NULL,
  score                     INTEGER     NOT NULL CHECK (score >= 0 AND score <= 100),
  summary                   TEXT        NOT NULL,
  strengths                 TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  gaps                      TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  recommended_action        TEXT,
  topic_match               TEXT        CHECK (topic_match IN ('baixo', 'medio', 'alto')),
  specificity_assessment    TEXT,

  -- Structured signals for mentor/analytics reuse
  extracted_learning_signals TEXT[]     NOT NULL DEFAULT ARRAY[]::TEXT[],
  extracted_risk_signals     TEXT[]     NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- XP awarded if approved (0 if rejected)
  xp_ganho                  INTEGER     NOT NULL DEFAULT 0,

  -- Extra context (quiz result, model used, etc.)
  metadata                  JSONB       NOT NULL DEFAULT '{}'::JSONB,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for mentor queries (fetch all reflexoes for a user, or filter by aula)
CREATE INDEX IF NOT EXISTS user_reflexoes_user_id_idx
  ON public.user_reflexoes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_reflexoes_aula_id_idx
  ON public.user_reflexoes (aula_id);

-- RLS
ALTER TABLE public.user_reflexoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "users manage own reflexoes"  ON public.user_reflexoes;
  DROP POLICY IF EXISTS "admins manage reflexoes"     ON public.user_reflexoes;
END $$;

CREATE POLICY "users manage own reflexoes"
ON public.user_reflexoes
FOR ALL
USING  (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins manage reflexoes"
ON public.user_reflexoes
FOR ALL
USING  (public.is_admin())
WITH CHECK (public.is_admin());
