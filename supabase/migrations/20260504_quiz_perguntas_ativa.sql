ALTER TABLE public.quiz_perguntas
ADD COLUMN IF NOT EXISTS ativa BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS quiz_perguntas_aula_ativa_idx
  ON public.quiz_perguntas (aula_id, ativa);
