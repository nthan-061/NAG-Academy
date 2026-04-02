import { MessageCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { AulaHeader } from './AulaHeader'
import { AulaPlayer } from './AulaPlayer'
import { AulaTabs } from './AulaTabs'
import { AulaSummaryPanel } from './AulaSummaryPanel'
import { AulaChatPanel } from './AulaChatPanel'
import { AulaNotesPanel } from './AulaNotesPanel'
import { useAula } from '../hooks/useAula'

export function AulaScreen() {
  const { id } = useParams<{ id: string }>()
  const {
    data,
    userId,
    loading,
    tab,
    setTab,
    chatInput,
    setChatInput,
    chatMessages,
    chatLoading,
    togglingProgress,
    handleSendChat,
    handleToggleAssistida,
  } = useAula(id)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] pl-0 pt-16 md:pl-[236px]">
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-6 px-4 py-6 md:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,380px)]">
          <div className="flex flex-col gap-4">
            <div className="aspect-video animate-pulse rounded-3xl bg-[#E8ECF2]" />
            <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-[#E8ECF2]" />
          </div>
          <div className="min-h-[520px] animate-pulse rounded-3xl bg-[#E8ECF2]" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] pl-0 pt-16 md:pl-[236px]">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1480px] items-center justify-center px-4 py-10 md:px-6">
          <p className="text-sm text-[#6B7280]">Aula nao encontrada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(46,95,212,0.08),transparent_28%),linear-gradient(180deg,#f8faff_0%,#f5f6fa_100%)] pl-0 pt-16 md:pl-[236px]">
      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-6 px-4 py-4 md:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,380px)]">
        <div className="flex min-w-0 flex-col gap-6">
          <AulaPlayer youtubeId={data.aula.youtube_id} title={data.aula.titulo} />
          <AulaHeader
            data={data}
            userId={userId}
            togglingProgress={togglingProgress}
            onToggleAssistida={handleToggleAssistida}
          />
        </div>

        <Card
          className="min-h-[70vh] min-w-0 overflow-hidden border border-[#E8ECF2] bg-white/95 backdrop-blur-[12px] xl:sticky xl:top-[88px] xl:max-h-[calc(100vh-112px)] xl:min-h-[calc(100vh-112px)]"
          padding="0"
        >
          <AulaTabs currentTab={tab} onChange={setTab} showNotes={!!userId} />

          <div className="flex min-h-0 flex-1 flex-col">
            {tab === 'resumo' && <AulaSummaryPanel aula={data.aula} />}

            {tab === 'chat' && (
              <AulaChatPanel
                aulaTitle={data.aula.titulo}
                messages={chatMessages}
                input={chatInput}
                loading={chatLoading}
                onInputChange={setChatInput}
                onSend={handleSendChat}
              />
            )}

            {tab === 'notas' && (
              <AulaNotesPanel aulaId={data.aula.id} userId={userId} />
            )}

            {!userId && tab === 'notas' && (
              <div className="flex flex-1 items-center justify-center gap-2 px-6 py-10 text-center text-sm text-[#9CA3AF]">
                <MessageCircle size={16} />
                <span>Area de notas disponivel somente para usuarios autenticados.</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
