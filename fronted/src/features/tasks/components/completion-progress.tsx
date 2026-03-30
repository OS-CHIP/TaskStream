
type Props = {
  value?: number
  className?: string
}

export function CompletionProgress({ value = 0, className }: Props) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  return (
    <div className={['flex items-center gap-2', className || ''].join(' ')}>
      <div
        style={{
          width: 80,
          height: 6,
          backgroundColor: 'rgb(229, 231, 235)',
          borderRadius: 9999,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: 'rgb(59, 130, 246)'
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: 'rgb(107, 114, 128)' }}>{pct}%</span>
    </div>
  )
}
