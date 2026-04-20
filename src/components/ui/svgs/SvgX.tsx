

type Props = {
  w?: number;
  h?: number;
};

const color = "var(--foreground75)";

export default function SvgYoutube({ w = 24, h = 24 }: Props) {
  return (
    <svg width={w} height={h} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.9902 24L14.6818 10.2412L23.3662 0H20.3434L13.3391 8.26338L7.75139 0H0.134154L9.10646 13.2628L0 24H3.02277L10.4505 15.2394L16.3803 24H24H23.9902ZM6.75569 1.92985L20.3815 22.0702H17.3698L3.74154 1.92985H6.75323H6.75569Z" fill={color} />
    </svg>
  );
}