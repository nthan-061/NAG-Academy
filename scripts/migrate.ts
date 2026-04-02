/**
 * Executa todas as migrations do NAG Academy no Supabase
 *
 * Uso:
 *   DB_PASSWORD=sua_senha npx tsx scripts/migrate.ts
 *
 * A senha fica em: Supabase Dashboard > Settings > Database > Database password
 */
import pg from 'pg'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'

const { Client } = pg

const PROJECT_REF = 'qifhlragrnqiscocabyv'
const DB_PASSWORD = process.env.DB_PASSWORD

if (!DB_PASSWORD) {
  console.error('❌  Variável DB_PASSWORD não definida.')
  console.error('   Uso: DB_PASSWORD=sua_senha npx tsx scripts/migrate.ts')
  process.exit(1)
}

const client = new Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

const BASE_SQL = `
-- Perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trilhas de estudo
CREATE TABLE IF NOT EXISTS trilhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  nivel TEXT CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  thumbnail_url TEXT,
  categoria TEXT,
  ordem INTEGER DEFAULT 0,
  publicada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Módulos dentro de trilhas
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id UUID REFERENCES trilhas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aulas dentro de módulos
CREATE TABLE IF NOT EXISTS aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  transcricao TEXT,
  resumo TEXT,
  topicos JSONB DEFAULT '[]',
  duracao_segundos INTEGER,
  thumbnail_url TEXT,
  ordem INTEGER NOT NULL,
  processada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perguntas do quiz (geradas por IA)
CREATE TABLE IF NOT EXISTS quiz_perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL,
  resposta_correta INTEGER NOT NULL,
  explicacao TEXT NOT NULL,
  topico TEXT,
  dificuldade TEXT CHECK (dificuldade IN ('facil', 'medio', 'dificil')) DEFAULT 'medio',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso do usuário por aula
CREATE TABLE IF NOT EXISTS user_progresso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE,
  assistida BOOLEAN DEFAULT false,
  quiz_completado BOOLEAN DEFAULT false,
  acertos INTEGER DEFAULT 0,
  total_perguntas INTEGER DEFAULT 0,
  percentual_acerto NUMERIC(5,2),
  xp_ganho INTEGER DEFAULT 0,
  notas TEXT,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, aula_id)
);

ALTER TABLE user_progresso
ADD COLUMN IF NOT EXISTS notas TEXT;

-- Respostas individuais do quiz
CREATE TABLE IF NOT EXISTS user_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pergunta_id UUID REFERENCES quiz_perguntas(id) ON DELETE CASCADE,
  resposta_escolhida INTEGER NOT NULL,
  correta BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards com SM-2
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pergunta_id UUID REFERENCES quiz_perguntas(id),
  frente TEXT NOT NULL,
  verso TEXT NOT NULL,
  topico TEXT,
  intervalo_dias INTEGER DEFAULT 1,
  facilidade NUMERIC(3,2) DEFAULT 2.50,
  repeticoes INTEGER DEFAULT 0,
  proxima_revisao DATE DEFAULT CURRENT_DATE,
  ultima_revisao DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score de domínio por tema
CREATE TABLE IF NOT EXISTS user_dominio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topico TEXT NOT NULL,
  acertos INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  percentual NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topico)
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dominio ENABLE ROW LEVEL SECURITY;
ALTER TABLE trilhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_perguntas ENABLE ROW LEVEL SECURITY;

-- Policies (DROP antes de recriar para idempotência)
DO $$ BEGIN
  DROP POLICY IF EXISTS "users own profile" ON profiles;
  DROP POLICY IF EXISTS "users own progress" ON user_progresso;
  DROP POLICY IF EXISTS "users own answers" ON user_respostas;
  DROP POLICY IF EXISTS "users own flashcards" ON flashcards;
  DROP POLICY IF EXISTS "users own dominio" ON user_dominio;
  DROP POLICY IF EXISTS "trilhas public read" ON trilhas;
  DROP POLICY IF EXISTS "modulos public read" ON modulos;
  DROP POLICY IF EXISTS "aulas public read" ON aulas;
  DROP POLICY IF EXISTS "quiz public read" ON quiz_perguntas;
END $$;

CREATE POLICY "users own profile"    ON profiles        FOR ALL USING (auth.uid() = id);
CREATE POLICY "users own progress"   ON user_progresso  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own answers"    ON user_respostas  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own flashcards" ON flashcards      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own dominio"    ON user_dominio    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "trilhas public read"  ON trilhas         FOR SELECT USING (publicada = true);
CREATE POLICY "modulos public read"  ON modulos         FOR SELECT USING (true);
CREATE POLICY "aulas public read"    ON aulas           FOR SELECT USING (true);
CREATE POLICY "quiz public read"     ON quiz_perguntas  FOR SELECT USING (true);

-- Trigger para criar perfil ao registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations')
const migrationsSql = readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'))
  .join('\n\n')

const SQL = `${BASE_SQL}\n\n${migrationsSql}`

async function migrate() {
  console.log('Conectando ao Supabase...')
  await client.connect()
  console.log('✓ Conectado')

  try {
    console.log('Executando migrations...')
    await client.query(SQL)
    console.log('✓ Todas as tabelas criadas com sucesso!')
    console.log('')
    console.log('Tabelas criadas:')
    const result = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    )
    result.rows.forEach((r) => console.log(`  ✓ ${r.tablename}`))
  } finally {
    await client.end()
  }
}

migrate().catch((err) => {
  console.error('❌ Erro:', err.message)
  process.exit(1)
})
