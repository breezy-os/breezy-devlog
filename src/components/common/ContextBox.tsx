
import "./contextbox.css";

type Props = {
  children: React.JSX.Element | React.JSX.Element[];
  type: 'quote' | 'error' | 'info' | 'note';
};

export default function ContextBox({ children, type }: Props) {

  return (
    <div className={'context-box ' + type}>
      <div className="line" />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  )
}
