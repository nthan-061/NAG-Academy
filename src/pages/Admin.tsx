import { useEffect, useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, ShieldAlert, Star, Flame, Zap, ChevronDown, ChevronUp, CheckCircle, XCircle, Pencil, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import type { Trilha, Modulo, Aula } from '@/types'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string

type Aba = 'aulas' | 'trilhas' | 'usuarios'

interface UserRow {
  id: string
  full_name: string | null
  xp: number
  streak_days: number
  last_activity_date: string | null
  created_at: string
  email?: string
}

interface ToastMsg { ok: boolean; msg: string }

type AulasPorModuloMap = Record<string, Aula[]>

function Toast({ toast, onClose }: { toast: ToastMsg; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', bottom: '16px', right: '16px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 18px', borderRadius: '10px',
        backgroundColor: toast.ok ? '#F0FDF4' : '#FEF2F2',
        border: `1px solid ${toast.ok ? '#BBF7D0' : '#FECACA'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        fontSize: '14px', fontWeight: 500,
        color: toast.ok ? '#16A34A' : '#DC2626',
        maxWidth: '360px',
      }}
    >
      {toast.ok
        ? <CheckCircle size={18} />
        : <XCircle size={18} />
      }
      {toast.msg}
    </div>
  )
}

// ---------- Select field helper ----------
function SelectField({
  label, value, onChange, disabled, children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1F2E' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%', padding: '10px 14px',
          border: '1.5px solid #E8ECF2', borderRadius: '8px',
          fontSize: '14px', color: '#1A1F2E', backgroundColor: '#FFFFFF',
          outline: 'none', fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
        onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
        onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
      >
        {children}
      </select>
    </div>
  )
}

// ---------- Aba Adicionar Aula ----------
function AbaAdicionarAula() {
  const [url, setUrl] = useState('')
  const [trilhaId, setTrilhaId] = useState('')
  const [moduloId, setModuloId] = useState('')
  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(false)
  const [etapa, setEtapa] = useState('')
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    supabase.from('trilhas').select('*').order('ordem').then(({ data }) => {
      setTrilhas(data ?? [])
    })
  }, [])

  useEffect(() => {
    if (!trilhaId) { setModulos([]); setModuloId(''); return }
    supabase.from('modulos').select('*').eq('trilha_id', trilhaId).order('ordem').then(({ data }) => {
      setModulos(data ?? [])
      setModuloId('')
    })
  }, [trilhaId])

  async function processar() {
    if (!url || !moduloId) return
    setLoading(true)
    setResultado(null)

    try {
      setEtapa('Buscando transcrição...')
      const { data: ultimaAulaData } = await supabase
        .from('aulas')
        .select('ordem')
        .eq('modulo_id', moduloId)
        .order('ordem', { ascending: false })
        .limit(1)
        .maybeSingle()

      const proximaOrdem = (ultimaAulaData?.ordem ?? 0) + 1
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setResultado({ ok: false, msg: 'Sua sessao expirou. Faca login novamente.' })
        return
      }

      const res = await fetch('/api/processar-aula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ youtube_url: url, modulo_id: moduloId, ordem: proximaOrdem }),
      })

      // Try to parse JSON; if it fails, surface the raw response text as the error
      let json: { success?: boolean; perguntas_count?: number; error?: string }
      try {
        json = await res.json()
      } catch {
        const text = await res.text().catch(() => `HTTP ${res.status}`)
        setResultado({ ok: false, msg: `Resposta inválida do servidor (${res.status}): ${text.slice(0, 200)}` })
        return
      }

      if (!json.success) {
        setResultado({ ok: false, msg: json.error ?? 'Erro ao processar a aula.' })
      } else {
        setResultado({ ok: true, msg: `Aula adicionada com ${json.perguntas_count} perguntas geradas!` })
        setUrl('')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setResultado({ ok: false, msg: `Erro de conexão: ${msg}` })
    } finally {
      setEtapa('')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Input
        label="URL do YouTube"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <SelectField label="Trilha" value={trilhaId} onChange={setTrilhaId}>
        <option value="">Selecionar trilha</option>
        {trilhas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
      </SelectField>

      <SelectField label="Módulo" value={moduloId} onChange={setModuloId} disabled={!trilhaId}>
        <option value="">Selecionar módulo</option>
        {modulos.map((m) => <option key={m.id} value={m.id}>{m.titulo}</option>)}
      </SelectField>

      <div
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: '#F8FBFF',
          border: '1px solid #D8E1F2',
          color: '#6B7280',
          fontSize: '13px',
          lineHeight: 1.6,
        }}
      >
        A nova aula sera adicionada automaticamente no final do modulo selecionado.
      </div>

      {loading && etapa && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', padding: '12px 16px', borderRadius: '8px',
          backgroundColor: '#EBF0FA', color: '#2E5FD4',
        }}>
          <span style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          {etapa}
        </div>
      )}

      {resultado && (
        <div style={{
          fontSize: '14px', padding: '12px 16px', borderRadius: '8px', fontWeight: 500,
          backgroundColor: resultado.ok ? '#F0FDF4' : '#FEF2F2',
          color: resultado.ok ? '#16A34A' : '#DC2626',
        }}>
          {resultado.msg}
        </div>
      )}

      {(() => {
        const podeProcessar = !!url.trim() && !!moduloId && !loading
        return (
          <button
            onClick={podeProcessar ? processar : undefined}
            disabled={!podeProcessar}
            style={{
              width: '100%', height: '44px', borderRadius: '8px', border: 'none',
              backgroundColor: podeProcessar ? '#0D1B3E' : '#E8ECF2',
              color: podeProcessar ? '#FFFFFF' : '#9CA3AF',
              fontSize: '14px', fontWeight: 500,
              cursor: podeProcessar ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (podeProcessar) e.currentTarget.style.backgroundColor = '#1E3A6E' }}
            onMouseLeave={(e) => { if (podeProcessar) e.currentTarget.style.backgroundColor = '#0D1B3E' }}
          >
            {loading
              ? <><span style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Processando...</>
              : <><Zap size={16} strokeWidth={1.5} /> Processar com IA</>
            }
          </button>
        )
      })()}
    </div>
  )
}

// ---------- Aba Gerenciar Trilhas ----------
function AbaGerenciarTrilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante')
  const [thumbnail, setThumbnail] = useState('')
  const [thumbnailNome, setThumbnailNome] = useState('')
  const [thumbnailLoading, setThumbnailLoading] = useState(false)
  const [moduloTitulo, setModuloTitulo] = useState('')
  const [moduloTrilhaId, setModuloTrilhaId] = useState('')
  const [loadingTrilha, setLoadingTrilha] = useState(false)
  const [loadingModulo, setLoadingModulo] = useState(false)
  const [expandedTrilha, setExpandedTrilha] = useState<string | null>(null)
  const [editingModuloId, setEditingModuloId] = useState<string | null>(null)
  const [aulasEmEdicao, setAulasEmEdicao] = useState<AulasPorModuloMap>({})
  const [draggingAulaId, setDraggingAulaId] = useState<string | null>(null)
  const [savingAulas, setSavingAulas] = useState(false)
  const [editingTrilhaId, setEditingTrilhaId] = useState<string | null>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editCategoria, setEditCategoria] = useState('')
  const [editNivel, setEditNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante')
  const [editThumbnail, setEditThumbnail] = useState('')
  const [editThumbnailNome, setEditThumbnailNome] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [toast, setToast] = useState<ToastMsg | null>(null)

  async function load() {
    const [{ data: t }, { data: m }, { data: a }] = await Promise.all([
      supabase.from('trilhas').select('*').order('ordem'),
      supabase.from('modulos').select('*').order('ordem'),
      supabase.from('aulas').select('*').order('ordem'),
    ])
    setTrilhas(t ?? [])
    setModulos(m ?? [])
    setAulas(a ?? [])
  }

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [])

  function showToast(msg: ToastMsg) {
    setToast(msg)
  }

  async function handleThumbnailUpload(file: File | null) {
    if (!file) return

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
    const tamanhoMaximo = 1.5 * 1024 * 1024

    if (!tiposPermitidos.includes(file.type)) {
      showToast({ ok: false, msg: 'Use uma imagem JPG, PNG ou WEBP.' })
      return
    }

    if (file.size > tamanhoMaximo) {
      showToast({ ok: false, msg: 'A thumb deve ter no maximo 1,5 MB.' })
      return
    }

    setThumbnailLoading(true)

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'))
        reader.readAsDataURL(file)
      })

      setThumbnail(dataUrl)
      setThumbnailNome(file.name)
      showToast({ ok: true, msg: 'Thumb carregada com sucesso.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar imagem.'
      showToast({ ok: false, msg: message })
    } finally {
      setThumbnailLoading(false)
    }
  }

  async function criarTrilha() {
    if (!titulo) return
    setLoadingTrilha(true)
    const { error } = await supabase.from('trilhas').insert({
      titulo, descricao: descricao || null, nivel,
      categoria: categoria || null,
      thumbnail_url: thumbnail || null,
      ordem: trilhas.length + 1,
    })
    if (error) {
      showToast({ ok: false, msg: `Erro ao criar trilha: ${error.message}` })
    } else {
      setTitulo(''); setDescricao(''); setThumbnail(''); setThumbnailNome(''); setCategoria('')
      await load()
      showToast({ ok: true, msg: 'Trilha criada com sucesso!' })
    }
    setLoadingTrilha(false)
  }

  function iniciarEdicao(trilha: Trilha) {
    setEditingTrilhaId(trilha.id)
    setEditTitulo(trilha.titulo)
    setEditDescricao(trilha.descricao ?? '')
    setEditCategoria(trilha.categoria ?? '')
    setEditNivel(trilha.nivel)
    setEditThumbnail(trilha.thumbnail_url ?? '')
    setEditThumbnailNome(trilha.thumbnail_url ? 'Imagem atual' : '')
  }

  function cancelarEdicao() {
    setEditingTrilhaId(null)
    setEditTitulo('')
    setEditDescricao('')
    setEditCategoria('')
    setEditNivel('iniciante')
    setEditThumbnail('')
    setEditThumbnailNome('')
  }

  async function handleEditThumbnailUpload(file: File | null) {
    if (!file) return

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
    const tamanhoMaximo = 1.5 * 1024 * 1024

    if (!tiposPermitidos.includes(file.type)) {
      showToast({ ok: false, msg: 'Use uma imagem JPG, PNG ou WEBP.' })
      return
    }

    if (file.size > tamanhoMaximo) {
      showToast({ ok: false, msg: 'A thumb deve ter no maximo 1,5 MB.' })
      return
    }

    setThumbnailLoading(true)

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'))
        reader.readAsDataURL(file)
      })

      setEditThumbnail(dataUrl)
      setEditThumbnailNome(file.name)
      showToast({ ok: true, msg: 'Nova thumb carregada.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar imagem.'
      showToast({ ok: false, msg: message })
    } finally {
      setThumbnailLoading(false)
    }
  }

  async function salvarEdicaoTrilha() {
    if (!editingTrilhaId || !editTitulo.trim()) return
    setSavingEdit(true)

    const { error } = await supabase
      .from('trilhas')
      .update({
        titulo: editTitulo.trim(),
        descricao: editDescricao.trim() || null,
        categoria: editCategoria.trim() || null,
        nivel: editNivel,
        thumbnail_url: editThumbnail || null,
      })
      .eq('id', editingTrilhaId)

    if (error) {
      showToast({ ok: false, msg: `Erro ao salvar trilha: ${error.message}` })
    } else {
      await load()
      cancelarEdicao()
      showToast({ ok: true, msg: 'Trilha atualizada com sucesso.' })
    }

    setSavingEdit(false)
  }

  async function criarModulo() {
    if (!moduloTitulo || !moduloTrilhaId) return
    setLoadingModulo(true)
    const qtd = modulos.filter((m) => m.trilha_id === moduloTrilhaId).length
    const { error } = await supabase.from('modulos').insert({
      titulo: moduloTitulo, trilha_id: moduloTrilhaId, ordem: qtd + 1,
    })
    if (error) {
      showToast({ ok: false, msg: `Erro ao criar módulo: ${error.message}` })
    } else {
      setModuloTitulo('')
      await load()
      showToast({ ok: true, msg: 'Módulo criado com sucesso!' })
    }
    setLoadingModulo(false)
  }

  function iniciarEdicaoModulo(moduloId: string) {
    const aulasDoModulo = aulas
      .filter((aula) => aula.modulo_id === moduloId)
      .sort((a, b) => a.ordem - b.ordem)

    setEditingModuloId(moduloId)
    setAulasEmEdicao((prev) => ({ ...prev, [moduloId]: aulasDoModulo }))
  }

  function cancelarEdicaoModulo() {
    setEditingModuloId(null)
    setDraggingAulaId(null)
  }

  async function salvarOrdemAulas() {
    if (!editingModuloId) return

    const aulasDoModulo = aulasEmEdicao[editingModuloId] ?? []
    setSavingAulas(true)

    const updates = aulasDoModulo.map((aula, index) => ({
      id: aula.id,
      ordem: index + 1,
    }))

    const resultados = await Promise.all(
      updates.map((update) =>
        supabase.from('aulas').update({ ordem: update.ordem }).eq('id', update.id)
      )
    )

    const primeiroErro = resultados.find((resultado) => resultado.error)?.error

    if (primeiroErro) {
      showToast({ ok: false, msg: `Erro ao salvar ordem das aulas: ${primeiroErro.message}` })
    } else {
      await load()
      cancelarEdicaoModulo()
      showToast({ ok: true, msg: 'Ordem das aulas atualizada.' })
    }

    setSavingAulas(false)
  }

  function moverAulaNoModulo(moduloId: string, origemId: string, destinoId: string) {
    if (origemId === destinoId) return

    setAulasEmEdicao((prev) => {
      const listaAtual = prev[moduloId] ?? []
      const origemIndex = listaAtual.findIndex((aula) => aula.id === origemId)
      const destinoIndex = listaAtual.findIndex((aula) => aula.id === destinoId)

      if (origemIndex === -1 || destinoIndex === -1) return prev

      const novaLista = [...listaAtual]
      const [item] = novaLista.splice(origemIndex, 1)
      novaLista.splice(destinoIndex, 0, item)

      return { ...prev, [moduloId]: novaLista }
    })
  }

  async function togglePublicada(t: Trilha) {
    const { error } = await supabase.from('trilhas').update({ publicada: !t.publicada }).eq('id', t.id)
    if (error) {
      showToast({ ok: false, msg: 'Erro ao atualizar trilha.' })
    } else {
      setTrilhas((prev) => prev.map((x) => x.id === t.id ? { ...x, publicada: !x.publicada } : x))
    }
  }

  async function deletarTrilha(id: string) {
    if (!confirm('Deletar esta trilha e todos os seus módulos e aulas?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      showToast({ ok: false, msg: 'Sua sessao expirou. Faca login novamente.' })
      return
    }

    try {
      const res = await fetch('/api/deletar-trilha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ trilha_id: id }),
      })

      const json = await res.json().catch(() => ({ error: 'Falha ao processar resposta do servidor.' }))

      if (!res.ok) {
        showToast({ ok: false, msg: json.error ?? 'Erro ao deletar trilha.' })
        return
      }

      await load()
      showToast({ ok: true, msg: 'Trilha deletada.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro de conexao.'
      showToast({ ok: false, msg: message })
    }
  }

  const sectionCard: React.CSSProperties = {
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    border: '1px solid #E8ECF2',
    padding: '32px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Nova trilha */}
      <div style={sectionCard}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 20px 0' }}>Nova trilha</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <SelectField label="Nível" value={nivel} onChange={(v) => setNivel(v as typeof nivel)}>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </SelectField>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input label="Categoria (ex: Marketing, Vendas)" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1F2E' }}>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Descrição da trilha..."
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                border: '1.5px solid #E8ECF2', borderRadius: '8px',
                fontSize: '14px', color: '#1A1F2E', backgroundColor: '#FFFFFF',
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#2E5FD4' }}
              onBlur={(e) => { e.target.style.borderColor = '#E8ECF2' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1F2E' }}>Thumbnail da trilha</label>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Ideal: proporcao 16:9. Recomendado 1280 x 720 px.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '16px',
                border: '1.5px solid #E8ECF2',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label
                  htmlFor="trilha-thumbnail-upload"
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    border: '1px solid #D8E1F2',
                    backgroundColor: '#F8FBFF',
                    color: '#0D1B3E',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: thumbnailLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    opacity: thumbnailLoading ? 0.6 : 1,
                  }}
                >
                  {thumbnailLoading ? 'Carregando imagem...' : 'Escolher imagem'}
                </label>
                <input
                  id="trilha-thumbnail-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    void handleThumbnailUpload(file)
                    e.currentTarget.value = ''
                  }}
                />

                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {thumbnailNome || 'Nenhuma imagem selecionada'}
                </span>

                {thumbnail && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail('')
                      setThumbnailNome('')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Remover imagem
                  </button>
                )}
              </div>

              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                Formatos aceitos: JPG, PNG e WEBP. Tamanho maximo: 1,5 MB.
              </p>

              {thumbnail && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    aspectRatio: '16 / 9',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E8ECF2',
                    backgroundColor: '#F5F6FA',
                  }}
                >
                  <img
                    src={thumbnail}
                    alt="Preview da thumb"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
            </div>
          </div>
          {(() => {
            const pode = !!titulo && !loadingTrilha
            return (
              <button
                onClick={pode ? criarTrilha : undefined}
                disabled={!pode}
                style={{
                  width: '100%', height: '44px', borderRadius: '8px', border: 'none',
                  backgroundColor: pode ? '#0D1B3E' : '#E8ECF2',
                  color: pode ? '#FFFFFF' : '#9CA3AF',
                  fontSize: '14px', fontWeight: 500, cursor: pode ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'inherit', transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => { if (pode) e.currentTarget.style.backgroundColor = '#1E3A6E' }}
                onMouseLeave={(e) => { if (pode) e.currentTarget.style.backgroundColor = '#0D1B3E' }}
              >
                {loadingTrilha
                  ? <><span style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Criando...</>
                  : <><Plus size={16} strokeWidth={1.5} /> Criar trilha</>
                }
              </button>
            )
          })()}
        </div>
      </div>

      {/* Novo módulo */}
      <div style={sectionCard}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 20px 0' }}>Novo módulo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <Input label="Título do módulo" value={moduloTitulo} onChange={(e) => setModuloTitulo(e.target.value)} />
          <SelectField label="Trilha" value={moduloTrilhaId} onChange={setModuloTrilhaId}>
            <option value="">Selecionar trilha</option>
            {trilhas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
          </SelectField>
        </div>
        {(() => {
          const pode = !!moduloTitulo && !!moduloTrilhaId && !loadingModulo
          return (
            <button
              onClick={pode ? criarModulo : undefined}
              disabled={!pode}
              style={{
                width: '100%', height: '44px', borderRadius: '8px', border: 'none',
                backgroundColor: pode ? '#0D1B3E' : '#E8ECF2',
                color: pode ? '#FFFFFF' : '#9CA3AF',
                fontSize: '14px', fontWeight: 500, cursor: pode ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: 'inherit', transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { if (pode) e.currentTarget.style.backgroundColor = '#1E3A6E' }}
              onMouseLeave={(e) => { if (pode) e.currentTarget.style.backgroundColor = '#0D1B3E' }}
            >
              {loadingModulo
                ? <><span style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Criando...</>
                : <><Plus size={16} strokeWidth={1.5} /> Criar módulo</>
              }
            </button>
          )
        })()}
      </div>

      {/* Lista de trilhas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F2E', margin: '0 0 4px 0' }}>
          Trilhas ({trilhas.length})
        </h3>
        {trilhas.map((t) => {
          const modulosDaTrilha = modulos.filter((m) => m.trilha_id === t.id)
          const expanded = expandedTrilha === t.id
          return (
            <div
              key={t.id}
              style={{ borderRadius: '10px', border: '1px solid #E8ECF2', overflow: 'hidden', backgroundColor: '#FFFFFF' }}
            >
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1F2E', margin: '0 0 2px 0' }}>
                    {t.titulo}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                    {modulosDaTrilha.length} módulo{modulosDaTrilha.length !== 1 ? 's' : ''} · {t.nivel}
                    {t.categoria ? ` · ${t.categoria}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => iniciarEdicao(t)}
                    title="Editar trilha"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                  >
                    <Pencil size={16} style={{ color: '#2E5FD4' }} />
                  </button>
                  {modulosDaTrilha.length > 0 && (
                    <button
                      onClick={() => setExpandedTrilha(expanded ? null : t.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', color: '#2E5FD4', fontWeight: 500,
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 6px',
                      }}
                    >
                      Ver módulos {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                  <button
                    onClick={() => togglePublicada(t)}
                    title={t.publicada ? 'Despublicar' : 'Publicar'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                  >
                    {t.publicada
                      ? <ToggleRight size={24} style={{ color: '#16A34A' }} />
                      : <ToggleLeft size={24} style={{ color: '#9CA3AF' }} />
                    }
                  </button>
                  <button
                    onClick={() => deletarTrilha(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                  >
                    <Trash2 size={18} style={{ color: '#DC2626' }} />
                  </button>
                </div>
              </div>
              {editingTrilhaId === t.id && (
                <div style={{ borderTop: '1px solid #E8ECF2', backgroundColor: '#F9FAFB', padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <Input label="Titulo" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} />
                    <SelectField label="Nivel" value={editNivel} onChange={(v) => setEditNivel(v as typeof editNivel)}>
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediario</option>
                      <option value="avancado">Avancado</option>
                    </SelectField>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input label="Categoria" value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1F2E' }}>Descricao</label>
                      <textarea
                        value={editDescricao}
                        onChange={(e) => setEditDescricao(e.target.value)}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          boxSizing: 'border-box',
                          border: '1.5px solid #E8ECF2',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#1A1F2E',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1F2E' }}>Thumbnail da trilha</label>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                        Ideal: proporcao 16:9. Recomendado 1280 x 720 px.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label
                          htmlFor={`editar-thumbnail-${t.id}`}
                          style={{
                            height: '40px',
                            padding: '0 16px',
                            borderRadius: '10px',
                            border: '1px solid #D8E1F2',
                            backgroundColor: '#FFFFFF',
                            color: '#0D1B3E',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: thumbnailLoading ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            opacity: thumbnailLoading ? 0.6 : 1,
                          }}
                        >
                          {thumbnailLoading ? 'Carregando imagem...' : 'Trocar imagem'}
                        </label>
                        <input
                          id={`editar-thumbnail-${t.id}`}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            void handleEditThumbnailUpload(file)
                            e.currentTarget.value = ''
                          }}
                        />
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                          {editThumbnailNome || 'Nenhuma imagem selecionada'}
                        </span>
                        {editThumbnail && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditThumbnail('')
                              setEditThumbnailNome('')
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#DC2626',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Remover imagem
                          </button>
                        )}
                      </div>
                      {editThumbnail && (
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '320px',
                            aspectRatio: '16 / 9',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            border: '1px solid #E8ECF2',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <img
                            src={editThumbnail}
                            alt="Preview da thumb"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => { void salvarEdicaoTrilha() }}
                        disabled={!editTitulo.trim() || savingEdit}
                        style={{
                          height: '42px',
                          padding: '0 16px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#0D1B3E',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: !editTitulo.trim() || savingEdit ? 'not-allowed' : 'pointer',
                          opacity: !editTitulo.trim() || savingEdit ? 0.6 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Save size={15} strokeWidth={1.6} />
                        {savingEdit ? 'Salvando...' : 'Salvar alteracoes'}
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        disabled={savingEdit}
                        style={{
                          height: '42px',
                          padding: '0 16px',
                          borderRadius: '10px',
                          border: '1px solid #D8E1F2',
                          backgroundColor: '#FFFFFF',
                          color: '#6B7280',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: savingEdit ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <X size={15} strokeWidth={1.6} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {expanded && modulosDaTrilha.length > 0 && (
                <div style={{ borderTop: '1px solid #E8ECF2', backgroundColor: '#F9FAFB', padding: '10px 16px' }}>
                  {modulosDaTrilha.map((m, i) => {
                    const moduloEmEdicao = editingModuloId === m.id
                    const aulasDoModulo = moduloEmEdicao
                      ? (aulasEmEdicao[m.id] ?? [])
                      : aulas
                        .filter((aula) => aula.modulo_id === m.id)
                        .sort((a, b) => a.ordem - b.ordem)

                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: '10px 0',
                          borderBottom: i < modulosDaTrilha.length - 1 ? '1px solid #E8ECF2' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
                            {i + 1}. {m.titulo}
                          </div>
                          <button
                            type="button"
                            onClick={() => (moduloEmEdicao ? cancelarEdicaoModulo() : iniciarEdicaoModulo(m.id))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2E5FD4',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              padding: 0,
                            }}
                          >
                            {moduloEmEdicao ? 'Fechar edicao' : 'Editar aulas'}
                          </button>
                        </div>

                        {aulasDoModulo.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            {aulasDoModulo.map((aula) => (
                              <div
                                key={aula.id}
                                draggable={moduloEmEdicao}
                                onDragStart={() => {
                                  if (!moduloEmEdicao) return
                                  setDraggingAulaId(aula.id)
                                }}
                                onDragOver={(e) => {
                                  if (!moduloEmEdicao || !draggingAulaId) return
                                  e.preventDefault()
                                }}
                                onDrop={(e) => {
                                  if (!moduloEmEdicao || !draggingAulaId) return
                                  e.preventDefault()
                                  moverAulaNoModulo(m.id, draggingAulaId, aula.id)
                                  setDraggingAulaId(null)
                                }}
                                onDragEnd={() => setDraggingAulaId(null)}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: moduloEmEdicao ? '44px minmax(0, 1fr)' : 'minmax(0, 1fr)',
                                  gap: '12px',
                                  alignItems: 'center',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  backgroundColor: draggingAulaId === aula.id ? '#EDF3FF' : '#FFFFFF',
                                  border: '1px solid #E8ECF2',
                                  cursor: moduloEmEdicao ? 'grab' : 'default',
                                }}
                              >
                                {moduloEmEdicao && (
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '40px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '8px',
                                      border: '1px solid #D8E1F2',
                                      fontSize: '13px',
                                      color: '#1A1F2E',
                                      backgroundColor: '#F8FBFF',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ::
                                  </div>
                                )}
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontSize: '13px', color: '#1A1F2E', margin: 0, fontWeight: 500 }}>
                                    {aula.titulo}
                                  </p>
                                  {moduloEmEdicao ? (
                                    <p style={{ fontSize: '12px', color: '#2E5FD4', margin: '4px 0 0 0' }}>
                                      Segure e arraste para reorganizar
                                    </p>
                                  ) : (
                                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0 0' }}>
                                      Ordem atual: {aula.ordem}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}

                            {moduloEmEdicao && (
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => { void salvarOrdemAulas() }}
                                  disabled={savingAulas}
                                  style={{
                                    height: '38px',
                                    padding: '0 14px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#0D1B3E',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: savingAulas ? 'not-allowed' : 'pointer',
                                    opacity: savingAulas ? 0.6 : 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                  }}
                                >
                                  <Save size={14} strokeWidth={1.6} />
                                  {savingAulas ? 'Salvando...' : 'Salvar ordem'}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelarEdicaoModulo}
                                  disabled={savingAulas}
                                  style={{
                                    height: '38px',
                                    padding: '0 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #D8E1F2',
                                    backgroundColor: '#FFFFFF',
                                    color: '#6B7280',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: savingAulas ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                  }}
                                >
                                  <X size={14} strokeWidth={1.6} />
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {trilhas.length === 0 && (
          <p style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>
            Nenhuma trilha criada ainda.
          </p>
        )}
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// ---------- Aba Usuários ----------
function AbaUsuarios() {
  const [usuarios, setUsuarios] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').order('xp', { ascending: false }).then(({ data }) => {
      setUsuarios(data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Carregando...</div>

  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E8ECF2' }}>
      <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#F5F6FA' }}>
          <tr>
            {['Nome', 'XP', 'Streak', 'Última atividade'].map((h) => (
              <th key={h} style={{
                textAlign: 'left', padding: '10px 16px',
                fontSize: '12px', fontWeight: 600, color: '#9CA3AF',
                borderBottom: '1px solid #E8ECF2',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, i) => (
            <tr
              key={u.id}
              style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F5F6FA' }}
            >
              <td style={{ padding: '10px 16px', fontWeight: 500, color: '#1A1F2E', borderTop: '1px solid #E8ECF2' }}>
                {u.full_name ?? '—'}
              </td>
              <td style={{ padding: '10px 16px', borderTop: '1px solid #E8ECF2' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706' }}>
                  <Star size={14} strokeWidth={1.5} />
                  {u.xp} XP
                </span>
              </td>
              <td style={{ padding: '10px 16px', borderTop: '1px solid #E8ECF2' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706' }}>
                  <Flame size={14} strokeWidth={1.5} />
                  {u.streak_days}
                </span>
              </td>
              <td style={{ padding: '10px 16px', fontSize: '12px', color: '#9CA3AF', borderTop: '1px solid #E8ECF2' }}>
                {u.last_activity_date ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Página Admin ----------
export function Admin({ userEmail }: { userEmail: string }) {
  const [aba, setAba] = useState<Aba>('aulas')

  if (userEmail !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <ShieldAlert size={48} style={{ color: '#DC2626' }} />
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1F2E', margin: 0 }}>
          Acesso restrito
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    )
  }

  const ABAS: { key: Aba; label: string }[] = [
    { key: 'aulas',    label: 'Adicionar Aula' },
    { key: 'trilhas',  label: 'Gerenciar Trilhas' },
    { key: 'usuarios', label: 'Usuários' },
  ]

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1F2E', margin: '0 0 32px 0' }}>
        Painel Administrativo
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {ABAS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            style={{
              height: '40px', padding: '0 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              ...(aba === key
                ? { backgroundColor: '#0D1B3E', color: '#FFFFFF', border: 'none' }
                : { backgroundColor: '#FFFFFF', color: '#6B7280', border: '1px solid #E8ECF2' }),
            }}
            onMouseEnter={(e) => {
              if (aba !== key) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F5F6FA'
            }}
            onMouseLeave={(e) => {
              if (aba !== key) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8ECF2', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {aba === 'aulas'    && <AbaAdicionarAula />}
        {aba === 'trilhas'  && <AbaGerenciarTrilhas />}
        {aba === 'usuarios' && <AbaUsuarios />}
      </div>
    </div>
  )
}
