"use client";

import './codeblock.css';

import { useMemo } from 'react';

import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import glsl from 'highlight.js/lib/languages/glsl';
hljs.registerLanguage('c', c);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('glsl', glsl);

type Props = {
  code: string;
  lang: 'c' | 'bash' | 'shell' | 'glsl';
};

export default function CodeBlock({ code, lang }: Props) {
  const html = useMemo(() => {
    return hljs.highlight(code, {language:lang}).value;
  }, [code, lang]);

  return (
    <pre style={{ overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: html }} />
  )
}
