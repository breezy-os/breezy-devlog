

type Props = {
  w?: number;
  h?: number;
};

const color = "var(--foreground40)";

export default function SvgBurger({ w = 24, h = 24 }: Props) {
  return (
    <svg width={w} height={h} viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="22" height="3" rx="1.5" fill={color} />
      <rect y="7" width="22" height="3" rx="1.5" fill={color}/>
      <rect y="14" width="22" height="3" rx="1.5" fill={color}/>
    </svg>
  );
}