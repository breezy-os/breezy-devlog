"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import NavDevlog from "./NavDevlog";
import NavNotes from "./NavNotes";

import BreezyLogo from "../ui/svgs/BreezyLogo";
import SvgSun from "../ui/svgs/SvgSun";
import SvgMoon from "../ui/svgs/SvgMoon";

type Props = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

function randomColor() {
  return Math.floor(Math.random() * 360);
}
function randomPercent(index?: number, itemCount?: number) {
  const range = (index != undefined && itemCount != undefined)
    ? { min: (index/itemCount), max: (index+1)/itemCount }
    : { min: 0, max: 1 };
  return Math.floor(100 * (range.min + (Math.random()*(range.max - range.min))));
}

export default function NavTopLevel({ theme, setTheme }: Props) {

  const pageType = usePathname().split("/").filter(p => p)[0];

  const pageHighlight = useRef<HTMLDivElement | null>(null);
  const updateHighlight = (newTop: number, height: number) => {
    if (pageHighlight.current) {
      const padding = 4;
      pageHighlight.current.style.height = Math.floor(height + padding*2) + 'px';
      pageHighlight.current.style.top = Math.floor(newTop - padding) + 'px';
      pageHighlight.current.style.opacity = '0.1';
    }
  }

  const pageTypeLink = useRef<HTMLAnchorElement | null>(null);
  const pageTypeUnderline = useRef<HTMLDivElement | null>(null);

  // Whenever the selected page type changes (notes <--> devlog), slide the underline to the
  // appropriate selection. ...this is done quite terribly, but it meets our needs. I don't
  // recommend using this code for anything that actually matters.
  useEffect(() => {
    if (pageTypeLink.current == null) return;
    if (pageTypeUnderline.current == null) return;

    const targetBB = pageTypeLink.current.getBoundingClientRect();
    const parentWidth = pageTypeLink.current.parentElement?.clientWidth ?? 0;
    const leftTarget = Math.floor(targetBB.left) + 'px';
    const rightTarget = Math.floor(parentWidth - targetBB.right) + 'px';
    const topTarget = Math.floor(targetBB.bottom) + 'px';

    // If moving right, delay sliding the leftern point.
    // If moving left, delay the rightern point.
    if (pageType === 'devlog') {
      setTimeout(() => {
        if (pageTypeUnderline.current) {
          pageTypeUnderline.current.style.left = leftTarget;
        }
      }, 100);
      pageTypeUnderline.current.style.right = rightTarget;
      pageTypeUnderline.current.style.top = topTarget;

    } else {
      setTimeout(() => {
        if (pageTypeUnderline.current) {
          pageTypeUnderline.current.style.right = rightTarget;
        }
      }, 100);
      pageTypeUnderline.current.style.left = leftTarget;
      pageTypeUnderline.current.style.top = topTarget;
    }

    // We delay making the line visible so the initial render/position isn't animated onto the screen.
    setTimeout(() => {
      if (pageTypeUnderline.current) {
        pageTypeUnderline.current.style.opacity = '1';
      }
    }, 300);
  }, [pageTypeUnderline, pageTypeLink, pageType]);

  // Disco Gradients
  const [gradients, setGradients] = useState<{ x: number; y: number; hue: number }[]>([]);
  const backgroundString = useMemo(() => {
    const opacity = theme === 'light' ? '30%' : '30%'
    const saturation = theme === 'light' ? '60' : '60'
    const lightness = theme === 'light' ? '67' : '33'

    const bgs = gradients.map(g => {
      return `radial-gradient(circle at top ${g.y}% left ${g.x}%, hsla(${g.hue} ${saturation} ${lightness} / ${opacity}) 0, transparent 70%)`;
    })
    bgs.push(theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(1,1,1,0.05)');
    return bgs.join(',');
  }, [gradients, theme]);

  // Yeah, yeah ... useEffect is terrible for this. setInterval is even worse. This is a very low-stakes project,
  // so I'm opting for simple over correct/reliable.
  useEffect(() => {
    const baseColor = randomColor();
    let grads = [
      baseColor % 360,
      (baseColor + 100) % 360,
      (baseColor + 200) % 360,
      (baseColor + 300) % 360,
    ].map((hue, i, a) => ({
      x: randomPercent(),  y: randomPercent(i, a.length),  // Current x/y coordinates
      tx: randomPercent(), ty: randomPercent(),       // Target x/y coordinates
      i, hue,
    }));
    const stepTo = (v: number, tv: number) => v + ((tv > v)
        ?  Math.min(tv - v, 0.2)
        : -Math.min(v - tv, 0.2));
    const updateGradients = () => {
      grads = grads.map((g, _, a) => ({
        x: stepTo(g.x, g.tx),
        y: stepTo(g.y, g.ty),
        tx: Math.abs(g.x - g.tx) > 1 ? g.tx : randomPercent(),
        ty: Math.abs(g.y - g.ty) > 1 ? g.ty : randomPercent(g.i, a.length),
        i: g.i,
        hue: (g.hue + 2) % 360,
      }));
      setGradients(grads);
    }
    updateGradients();
    setInterval(() => updateGradients(), 500);
  }, []);

  return (
    <nav className="nav-top-level" style={{ background: backgroundString }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <BreezyLogo />
      </div>

      {/* Page Type Selector */}
      <nav style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link href="/notes"
          ref={pageType === 'notes' ? pageTypeLink : null}
          style={pageType === 'notes' ? { fontWeight: 'bold' } : {}}
          >Notes</Link>
        /
        <Link href="/devlog"
          ref={pageType === 'devlog' ? pageTypeLink : null}
          style={pageType === 'devlog' ? { fontWeight: 'bold' } : {}}
          >Devlog</Link>
      </nav>
      <div className="nav-underline" ref={pageTypeUnderline} />

      {/* Nav Links */}
      <div style={{ margin: '35px 30px', flex: '1 0', overflowY: 'auto' }}>
        {pageType === 'notes' ? (
          <NavNotes pageChanged={updateHighlight} />
        ) : (
          <NavDevlog pageChanged={updateHighlight} />
        )}
      </div>
      <div className="nav-page-highlight" ref={pageHighlight} />

      {/* Theme Selector */}
      <div style={{ display: 'flex', position: 'relative', alignItems: 'center', height: '36px', marginBottom: '15px' }}>
        <div style={{ flex: '1', textAlign: 'center', cursor: 'pointer' }} onClick={() => setTheme('light')}>
          <SvgSun opacity={theme === 'light' ? 0.8 : 0.4} />
        </div>

        <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--foreground)', opacity: '0.2' }} />

        <div style={{ flex: '1', textAlign: 'center', cursor: 'pointer' }} onClick={() => setTheme('dark')}>
          <SvgMoon opacity={theme === 'dark' ? 0.8 : 0.4} />
        </div>
      </div>
    </nav>
  );
}
