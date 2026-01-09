import React, { useState } from 'react';
import { IconPalette } from './Icons';

interface Theme {
  name: string;
  bg: string;
  text: string;
  string: string;
  comment: string;
  keyword: string;
  number: string;
  function: string;
}

const THEMES: Record<string, Theme> = {
  vibe: {
    name: 'Vibe',
    bg: 'bg-transparent',
    text: 'text-slate-200',
    string: 'text-emerald-400',
    comment: 'text-slate-500 italic',
    keyword: 'text-purple-400 font-bold',
    number: 'text-orange-400',
    function: 'text-blue-400'
  },
  dracula: {
    name: 'Dracula',
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    string: 'text-[#f1fa8c]', 
    comment: 'text-[#6272a4] italic',
    keyword: 'text-[#ff79c6] font-bold', 
    number: 'text-[#bd93f9]', 
    function: 'text-[#50fa7b]'
  },
  githubDark: {
    name: 'GitHub Dark',
    bg: 'bg-[#0d1117]',
    text: 'text-[#c9d1d9]',
    string: 'text-[#a5d6ff]',
    comment: 'text-[#8b949e] italic',
    keyword: 'text-[#ff7b72] font-bold',
    number: 'text-[#79c0ff]',
    function: 'text-[#d2a8ff]'
  },
  oneDark: {
    name: 'One Dark',
    bg: 'bg-[#282c34]',
    text: 'text-[#abb2bf]',
    string: 'text-[#98c379]',
    comment: 'text-[#5c6370] italic',
    keyword: 'text-[#c678dd] font-bold',
    number: 'text-[#d19a66]',
    function: 'text-[#61afef]'
  }
};

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  className?: string;
  showThemeSwitcher?: boolean;
}

const SimpleSyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language, className, showThemeSwitcher = false }) => {
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('vibe');
  const theme = THEMES[themeKey];

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const currentIndex = keys.indexOf(themeKey as string);
    const nextIndex = (currentIndex + 1) % keys.length;
    setThemeKey(keys[nextIndex]);
  };
  
  const highlightCode = (input: string) => {
    if (!input) return "";

    const tokens: string[] = [];
    
    // Helper to safely store a token
    const save = (content: string, type: string) => {
        // Escape content to prevent XSS from the code itself
        const safeContent = content
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
         
        tokens.push(`<span class="${type}">${safeContent}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
    };

    let processed = input; 

    // 1. Strings (Capture raw quotes)
    processed = processed.replace(/(".*?"|'.*?'|`.*?`)/g, (match) => 
        save(match, theme.string)
    );

    // 2. Comments
    processed = processed.replace(/(\/\/.*$|#.*$)/gm, (match) => 
        save(match, theme.comment)
    );

    // 3. Keywords
    // Use word boundaries \b to avoid matching inside other words or tokens (tokens use underscores)
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|from|class|interface|type|export|default|async|await|try|catch|def|print|extends|implements|public|private|protected|new|this|super|void|int|float|bool|string)\b/g;
    processed = processed.replace(keywords, (match) => 
        // Ensure we aren't matching inside a token placeholder (which has caps/numbers)
        match.startsWith('__TOKEN') ? match : save(match, theme.keyword)
    );

    // 4. Numbers
    processed = processed.replace(/\b(\d+)\b/g, (match) => 
         match.startsWith('__TOKEN') ? match : save(match, theme.number)
    );

    // 5. Function calls (lookahead for opening paren)
    processed = processed.replace(/(\w+)(?=\()/g, (match) => 
         match.startsWith('__TOKEN') ? match : save(match, theme.function)
    );

    // Final Assembly: Split by tokens, escape the raw parts, and re-inject tokens
    const parts = processed.split(/(__TOKEN_\d+__)/);
    return parts.map(part => {
        if (part.startsWith('__TOKEN_')) {
            const index = parseInt(part.match(/\d+/)![0]);
            return tokens[index] || part;
        } else {
            // Escape the raw code that wasn't highlighted
            return part
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
        }
    }).join('');
  };

  return (
    <div className={`relative group/code rounded-lg transition-colors duration-300 overflow-hidden ${theme.bg}`}>
        {showThemeSwitcher && (
            <button 
                onClick={cycleTheme}
                className="absolute top-2 right-2 z-10 flex items-center space-x-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs text-slate-400 hover:text-white transition-all opacity-0 group-hover/code:opacity-100"
                title={`Current Theme: ${theme.name}`}
            >
                <IconPalette className="w-3 h-3" />
                <span>{theme.name}</span>
            </button>
        )}
        <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${theme.text} ${className}`}>
            <code 
                className={`language-${language}`} 
                dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
            />
        </pre>
    </div>
  );
};

export default SimpleSyntaxHighlighter;