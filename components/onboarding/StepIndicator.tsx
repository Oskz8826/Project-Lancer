interface Props {
  current: number
  total: number
}

export default function StepIndicator({ current, total }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            height: '3px',
            flex: 1,
            borderRadius: '2px',
            backgroundColor: i < current ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
            transition: 'background-color 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
