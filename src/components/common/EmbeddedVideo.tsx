"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  videoSlug: string;
};

function randomColor() {
  return Math.floor(Math.random() * 360);
}

const corners = [
  { x: 10, y: 10 },
  { x: 90, y: 10 },
  { x: 90, y: 90 },
  { x: 10, y: 90 },
];

export default function EmbeddedVideo({ videoSlug }: Props) {
  const [gradients, setGradients] = useState<{ x: number; y: number; hue: number }[]>([]);
  const backgroundString = useMemo(() => {
    const opacity = '50%';
    const saturation = '80';
    const lightness = '60';

    const bgs = gradients.map(g => {
      return `radial-gradient(circle at top ${g.y}% left ${g.x}%, hsla(${g.hue} ${saturation} ${lightness} / ${opacity}) 0, transparent 45%)`;
    })
    return bgs.join(',');
  }, [gradients]);

  useEffect(() => {
    const baseColor = randomColor();
    let grads = corners.map((p, i) => ({
      ...p,
      tx: corners[(i+1) % 4].x,
      ty: corners[(i+1) % 4].y,
      i,
      hue: (baseColor + i*100) % 360,
    }));

    const stepTo = (v: number, tv: number) => v + ((tv > v)
        ?  Math.min(tv - v, 1)
        : -Math.min(v - tv, 1));
    const updateGradients = () => {
      grads = grads.map((g, _, a) => {
        const newLoc = { x: stepTo(g.x, g.tx), y: stepTo(g.y, g.ty) };
        const reachedDestination = newLoc.x === g.tx && newLoc.y === g.ty;
        const targetLoc = reachedDestination
          ? { tx: corners[(g.i+1) % 4].x, ty: corners[(g.i+1) % 4].y, i: g.i+1 % 4 }
          : { tx: g.tx,                   ty: g.ty,                   i: g.i       };
        return { ...newLoc, ...targetLoc, hue: (g.hue + 2) % 360 };
      });
      setGradients(grads);
    }
    updateGradients();
    const interval = setInterval(() => updateGradients(), 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '5px', margin: '40px auto', width: '100%', maxWidth: '560px', aspectRatio: '560 / 319', position: 'relative' }}>
      <div style={{ position: 'absolute', margin: '-5px', borderRadius: '8px', width: '100%', height: '100%', background: backgroundString, filter: 'blur(8px)' }} />
      <iframe
        style={{ display: 'block', background: 'black', boxShadow: '0px 4px 8px 0px rgba(0,0,0,0.5)', borderRadius: '8px', opacity: 1, position: 'relative', zIndex: 2 }}
        width="100%"
        height="100%"
        src={"https://www.youtube-nocookie.com/embed/" + videoSlug}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
}