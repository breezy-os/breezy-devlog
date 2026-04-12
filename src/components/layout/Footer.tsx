
import './footer.css';

type Props = {
  theme: 'light' | 'dark';
};

export default function Footer({ theme }: Props) {
  return (
    <footer style={{
      height: 'var(--footer-height)',
      textAlign: 'center',
      background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.1)',
      borderTop: theme === 'light' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255, 255, 255, 0.2)',
      color: theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.5)',
      boxShadow: `inset 0 4px 4px rgba(0,0,0,${theme === 'light' ? '0.15' : '0.25'})`,
    }}>
      <div className="footer-contents">
        <p>A huge <span style={{ fontWeight: 'bold', color: theme === 'light' ? 'rgba(0,0,0,0.75)' : 'rgba(255, 255, 255, 0.75)' }}>THANK YOU</span> to all supporters of the project</p>
        <p>If you spot an error on the page, or if you have any questions or feedback, please email me at breezy@zenittini.dev</p>
        <p>Copyright {new Date().getFullYear()} by Ben Zenittini</p>
      </div>
    </footer>
  );
}
