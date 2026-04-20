"use client";

import { useEffect, useState } from "react";
import NavTopLevel from "./NavTopLevel";
import SvgBurger from "../ui/svgs/SvgBurger";
import { usePathname } from "next/navigation";

type Props = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export default function NavNarrow({ theme, setTheme }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // Closes the nav whenever the URL changes
  useEffect(() => { setNavOpen(false); }, [pathname]);

  return (
    <div className="nav-narrow">
      <div style={{ position: 'absolute', right: '10px', marginTop: '10px', zIndex: 10 }} onClick={() => setNavOpen(!navOpen)}><SvgBurger /></div>
      {navOpen && (
        <div style={{ width: '100vw', height: '100vh', background: 'var(--background)' }}>
          <NavTopLevel theme={theme} setTheme={setTheme} />
        </div>
    )}
    </div>
  );
}
