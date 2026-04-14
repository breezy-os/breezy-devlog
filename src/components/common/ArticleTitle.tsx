

type Props = {
  title: string;
  date: string;
};

export default function ArticleTitle({ title, date }: Props) {
  return (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
      <h1 style={{ flex: '1' }}>{title}</h1>
      <div style={{ color: 'var(--foreground40)', fontStyle: 'italic' }}>{date}</div>
    </div>
  );
}
