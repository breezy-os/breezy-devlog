"use client";

import { useEffect, useState } from "react";

import "./globals.css";
import NavTopLevel from "@/components/layout/NavTopLevel";
import Footer from "@/components/layout/Footer";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const setPreferredTheme = (choice: 'light' | 'dark') => {
    localStorage.setItem('theme',  choice);
    setTheme(choice);
  };

  useEffect(() => {
    const preferredTheme = localStorage.getItem('theme') === 'light' ? 'light'
      : localStorage.getItem('theme') === 'dark' ? 'dark'
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(preferredTheme);
  }, []);

  return (
    <html data-theme={theme}>
      <title>Breezy Devlog</title>
      <body style={{ display: 'flex' }}>
        <NavTopLevel setTheme={(choice) => setPreferredTheme(choice)} theme={theme} />

        <div style={{ minHeight: '100vh', flex: '1', overflowY: 'auto' }}>
          <article style={{ minHeight: 'calc(100vh - var(--footer-height))'}} >
            {children}
          </article>

          <Footer theme={theme} />
        </div>
      </body>
    </html>
  );
}
