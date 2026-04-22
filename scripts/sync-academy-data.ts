import pg from 'pg'

const { Client } = pg

type SourceProjectRef = 'qifhlragrnqiscocabyv' | 'puvgidaqfkvbnqyddlrh'

const SOURCE_PROJECT_REF = 'qifhlragrnqiscocabyv' as SourceProjectRef
const TARGET_PROJECT_REF = 'puvgidaqfkvbnqyddlrh' as SourceProjectRef
const DB_PASSWORD = process.env.DB_PASSWORD?.trim()

if (!DB_PASSWORD) {
  console.error('Variavel DB_PASSWORD nao definida.')
  process.exit(1)
}

function createDbClient(projectRef: string) {
  return new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
  })
}

async function getTableColumns(client: pg.Client, tableName: string) {
  const result = await client.query<{ column_name: string; data_type: string }>(
    `
      select column_name, data_type
      from information_schema.columns
      where table_schema = 'public' and table_name = $1
      order by ordinal_position
    `,
    [tableName]
  )

  return result.rows
}

async function selectRows(client: pg.Client, tableName: string, columns: string[]) {
  const result = await client.query(`select ${columns.join(', ')} from public.${tableName}`)
  return result.rows
}

async function upsertRows(
  client: pg.Client,
  tableName: string,
  columns: string[],
  conflictColumns: string[],
  rows: Record<string, unknown>[]
) {
  if (!rows.length) return

  const placeholdersPerRow = columns.length
  const values: unknown[] = []
  const placeholders = rows.map((row, rowIndex) => {
    const offset = rowIndex * placeholdersPerRow
    const rowPlaceholders = columns.map((column, columnIndex) => {
      values.push(row[column])
      return `$${offset + columnIndex + 1}`
    })

    return `(${rowPlaceholders.join(', ')})`
  })

  const updatableColumns = columns.filter(
    (column) => !conflictColumns.includes(column) && column !== 'id'
  )

  const updateClause = updatableColumns.length
    ? `do update set ${updatableColumns
        .map((column) => `${column} = excluded.${column}`)
        .join(', ')}`
    : 'do nothing'

  await client.query(
    `
      insert into public.${tableName} (${columns.join(', ')})
      values ${placeholders.join(', ')}
      on conflict (${conflictColumns.join(', ')}) ${updateClause}
    `,
    values
  )
}

function remapUserId<T extends Record<string, unknown>>(row: T, userIdMap: Map<string, string>) {
  if (typeof row.user_id === 'string') {
    const nextUserId = userIdMap.get(row.user_id)
    if (!nextUserId) {
      throw new Error(`Usuario de origem sem correspondencia no destino: ${row.user_id}`)
    }
    row.user_id = nextUserId
  }

  if (typeof row.id === 'string' && row.__tableName === 'profiles') {
    const nextProfileId = userIdMap.get(row.id)
    if (!nextProfileId) {
      throw new Error(`Perfil de origem sem correspondencia no destino: ${row.id}`)
    }
    row.id = nextProfileId
  }

  return row
}

function serializeJsonColumns<T extends Record<string, unknown>>(
  row: T,
  jsonColumns: Set<string>
) {
  for (const column of jsonColumns) {
    const value = row[column]
    if (value !== null && value !== undefined) {
      row[column] = JSON.stringify(value)
    }
  }

  return row
}

async function main() {
  const source = createDbClient(SOURCE_PROJECT_REF)
  const target = createDbClient(TARGET_PROJECT_REF)

  await source.connect()
  await target.connect()

  try {
    const sourceUsersResult = await source.query<{ id: string; email: string | null }>(
      'select id, email from auth.users'
    )
    const targetUsersResult = await target.query<{ id: string; email: string | null }>(
      'select id, email from auth.users'
    )

    const targetUserIdByEmail = new Map(
      targetUsersResult.rows
        .filter((row) => row.email)
        .map((row) => [row.email!.trim().toLowerCase(), row.id])
    )

    const userIdMap = new Map<string, string>()

    for (const sourceUser of sourceUsersResult.rows) {
      const normalizedEmail = sourceUser.email?.trim().toLowerCase()
      if (!normalizedEmail) continue

      const targetUserId = targetUserIdByEmail.get(normalizedEmail)
      if (!targetUserId) {
        throw new Error(`Usuario ${normalizedEmail} nao existe no projeto de destino.`)
      }

      userIdMap.set(sourceUser.id, targetUserId)
    }

    const tableColumns = {
      profiles: await getTableColumns(target, 'profiles'),
      trilhas: await getTableColumns(target, 'trilhas'),
      modulos: await getTableColumns(target, 'modulos'),
      aulas: await getTableColumns(target, 'aulas'),
      quiz_perguntas: await getTableColumns(target, 'quiz_perguntas'),
      user_progresso: await getTableColumns(target, 'user_progresso'),
      user_respostas: await getTableColumns(target, 'user_respostas'),
      flashcards: await getTableColumns(target, 'flashcards'),
      user_dominio: await getTableColumns(target, 'user_dominio'),
      user_reflexoes: await getTableColumns(target, 'user_reflexoes'),
    }

    const columnNames = Object.fromEntries(
      Object.entries(tableColumns).map(([tableName, columns]) => [
        tableName,
        columns.map((column) => column.column_name),
      ])
    ) as Record<keyof typeof tableColumns, string[]>

    const jsonColumns = Object.fromEntries(
      Object.entries(tableColumns).map(([tableName, columns]) => [
        tableName,
        new Set(
          columns.filter((column) => column.data_type === 'jsonb').map((column) => column.column_name)
        ),
      ])
    ) as Record<keyof typeof tableColumns, Set<string>>

    const sourceProfiles = (await selectRows(source, 'profiles', columnNames.profiles.filter((c) => c !== 'role')))
      .map((row) => remapUserId({ ...row, __tableName: 'profiles', role: 'admin' }, userIdMap))
      .map(({ __tableName, ...row }) => row)

    const sourceTrilhas = (await selectRows(source, 'trilhas', columnNames.trilhas)).map((row) =>
      serializeJsonColumns({ ...row }, jsonColumns.trilhas)
    )
    const sourceModulos = (await selectRows(source, 'modulos', columnNames.modulos)).map((row) =>
      serializeJsonColumns({ ...row }, jsonColumns.modulos)
    )
    const sourceAulas = (await selectRows(source, 'aulas', columnNames.aulas)).map((row) =>
      serializeJsonColumns({ ...row }, jsonColumns.aulas)
    )
    const sourceQuizPerguntas = (await selectRows(source, 'quiz_perguntas', columnNames.quiz_perguntas)).map((row) =>
      serializeJsonColumns({ ...row }, jsonColumns.quiz_perguntas)
    )
    const sourceUserProgresso = (await selectRows(source, 'user_progresso', columnNames.user_progresso)).map(
      (row) => remapUserId({ ...row }, userIdMap)
    )
    const sourceUserRespostas = (await selectRows(source, 'user_respostas', columnNames.user_respostas)).map(
      (row) => remapUserId({ ...row }, userIdMap)
    )
    const sourceFlashcards = (await selectRows(source, 'flashcards', columnNames.flashcards)).map((row) =>
      remapUserId({ ...row }, userIdMap)
    )
    const sourceUserDominio = (await selectRows(source, 'user_dominio', columnNames.user_dominio)).map((row) =>
      remapUserId({ ...row }, userIdMap)
    )
    const sourceUserReflexoes = (await selectRows(source, 'user_reflexoes', columnNames.user_reflexoes)).map((row) =>
      serializeJsonColumns(remapUserId({ ...row }, userIdMap), jsonColumns.user_reflexoes)
    )

    await target.query('begin')

    await upsertRows(target, 'profiles', columnNames.profiles, ['id'], sourceProfiles)
    await upsertRows(target, 'trilhas', columnNames.trilhas, ['id'], sourceTrilhas)
    await upsertRows(target, 'modulos', columnNames.modulos, ['id'], sourceModulos)
    await upsertRows(target, 'aulas', columnNames.aulas, ['id'], sourceAulas)
    await upsertRows(target, 'quiz_perguntas', columnNames.quiz_perguntas, ['id'], sourceQuizPerguntas)
    await upsertRows(target, 'user_progresso', columnNames.user_progresso, ['id'], sourceUserProgresso)
    await upsertRows(target, 'user_respostas', columnNames.user_respostas, ['id'], sourceUserRespostas)
    await upsertRows(target, 'flashcards', columnNames.flashcards, ['id'], sourceFlashcards)
    await upsertRows(target, 'user_dominio', columnNames.user_dominio, ['id'], sourceUserDominio)
    await upsertRows(target, 'user_reflexoes', columnNames.user_reflexoes, ['id'], sourceUserReflexoes)

    await target.query('commit')

    const summary = {
      profiles: sourceProfiles.length,
      trilhas: sourceTrilhas.length,
      modulos: sourceModulos.length,
      aulas: sourceAulas.length,
      quiz_perguntas: sourceQuizPerguntas.length,
      user_progresso: sourceUserProgresso.length,
      user_respostas: sourceUserRespostas.length,
      flashcards: sourceFlashcards.length,
      user_dominio: sourceUserDominio.length,
      user_reflexoes: sourceUserReflexoes.length,
    }

    console.log(JSON.stringify(summary, null, 2))
  } catch (error) {
    try {
      await target.query('rollback')
    } catch {}

    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exitCode = 1
  } finally {
    await source.end()
    await target.end()
  }
}

main()
