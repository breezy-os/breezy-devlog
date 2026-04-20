
type Props = {
  title: string;
  date: string;
};

export default function ArticleTitle({ title, date }: Props) {
  return (
    <div className="article-title">
      <h1 style={{ flex: '1' }}>{title}</h1>
      <div style={{ color: 'var(--foreground40)', fontStyle: 'italic' }}>{date}</div>
    </div>
  );
}
