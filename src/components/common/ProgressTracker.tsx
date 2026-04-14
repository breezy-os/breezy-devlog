
type Props = {
  title: string;
  progress: number; // Percent, [0-100]
  items: {
    status: 'todo' | 'inprogress' | 'done';
    name: string;
    description?: string;
  }[];
};

function getStatusEmoji(status: Props['items'][0]['status']) {
  switch (status) {
    case 'todo': return '❌';
    case 'inprogress': return '👉';
    case 'done': return '✅';
  }
}

export default function ProgressTracker({ title, progress, items }: Props) {
  return (
    <div style={{
      background: 'var(--foreground05)',
      borderRadius: '12px',
      border: '1px solid var(--foreground10)',
    }}>
      <h2 style={{ margin: '12px', fontSize: '16px' }}>{ title }</h2>

      { items.length > 0 && (<>
        <div style={{
          background: 'var(--foreground10)',
          height: '5px',
        }}><div style={{
          background: 'var(--green)',
          height: '5px',
          width: progress + "%",
        }}></div></div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(i => (
            <p key={i.name} style={{
              lineHeight: '18px',
              color: 'var(--foreground)',
              paddingLeft: '32px',
              textIndent: '-32px',
            }}>
              {getStatusEmoji(i.status)} {i.name} {i.description && <span style={{ color: 'var(--foreground40)', fontStyle: 'italic' }}>- {i.description}</span>}
            </p>
          ))}
        </div>
      </>)}
    </div>
  );
}