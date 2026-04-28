
import { em } from '@/app/utils';
import './footer.css';

type Props = {
  theme: 'light' | 'dark';
};

export default function Footer({ theme }: Props) {
  return (
    <footer style={{
      height: 'var(--footer-height)',
      textAlign: 'center',
      background: 'var(--foreground10)',
      borderTop: '1px solid var(--foreground20)',
      color: 'var(--forground50)',
      boxShadow: `inset 0 4px 4px rgba(0,0,0,${theme === 'light' ? '0.15' : '0.25'})`,
    }}>
      <div className="footer-contents">
        <p>A huge <span style={{ fontWeight: 'bold' }}>THANK YOU</span> to all supporters of the project {em('🙏')}</p>
        <p>If you spot an error on the page, or if you have any questions or feedback, please email me at breezy@zenittini.dev</p>
        <p>Copyright {new Date().getFullYear()} by Ben Zenittini</p>
      </div>
    </footer>
  );
}
