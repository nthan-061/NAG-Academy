import { useEffect, useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, ShieldAlert, Star, Flame, Zap, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import type { Trilha, Modulo } from '@/types'

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
  const [ordem, setOrdem] = useState('1')
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
        body: JSON.stringify({ youtube_url: url, modulo_id: moduloId, ordem: parseInt(ordem, 10) }),
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
        setOrdem('1')
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

      <Input
        label="Ordem na trilha"
        type="number"
        min="1"
        value={ordem}
        onChange={(e) => setOrdem(e.target.value)}
      />

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
  const [toast, setToast] = useState<ToastMsg | null>(null)

  async function load() {
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from('trilhas').select('*').order('ordem'),
      supabase.from('modulos').select('*').order('ordem'),
    ])
    setTrilhas(t ?? [])
    setModulos(m ?? [])
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
    const { error } = await supabase.from('trilhas').delete().eq('id', id)
    if (error) {
      showToast({ ok: false, msg: 'Erro ao deletar trilha.' })
    } else {
      await load()
      showToast({ ok: true, msg: 'Trilha deletada.' })
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
              {expanded && modulosDaTrilha.length > 0 && (
                <div style={{ borderTop: '1px solid #E8ECF2', backgroundColor: '#F9FAFB', padding: '8px 16px' }}>
                  {modulosDaTrilha.map((m, i) => (
                    <div
                      key={m.id}
                      style={{
                        fontSize: '13px', color: '#6B7280', padding: '6px 0',
                        borderBottom: i < modulosDaTrilha.length - 1 ? '1px solid #E8ECF2' : 'none',
                      }}
                    >
                      {i + 1}. {m.titulo}
                    </div>
                  ))}
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
