import { useEffect } from 'react';
import { useStore } from '../store';
import { darkTokens, lightTokens } from '../theme';

export function useTheme() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  useEffect(() => {
    const tokens = theme === 'dark' ? darkTokens : lightTokens;
    const root = document.querySelector('.scout-crawler-root') as HTMLElement | null;
    if (!root) return;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return { theme, toggleTheme };
}
