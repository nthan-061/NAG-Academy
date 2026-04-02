interface AulaPlayerProps {
  youtubeId: string
  title: string
}

export function AulaPlayer({ youtubeId, title }: AulaPlayerProps) {
  return (
    <div className="overflow-hidden rounded-[24px] bg-[#0D1B3E] shadow-[0_18px_50px_rgba(10,22,40,0.14)]">
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </div>
  )
}
