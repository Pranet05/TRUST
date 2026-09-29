import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitchProps {
  collapsed?: boolean;
  className?: string;
}

export default function ThemeSwitch({ collapsed = false, className = '' }: ThemeSwitchProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={!isDark}
      aria-label="Toggle light and dark mode"
      className={`group relative flex items-center gap-2.5 p-2 rounded-xl transition-all border border-nerv-700/25 bg-nerv-900/60 hover:bg-nerv-800/80 hover:border-accent-500/40 text-text-secondary hover:text-text-primary ${
        collapsed ? 'justify-center w-10 h-10 p-0' : 'w-full justify-between'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="relative size-6 rounded-lg bg-nerv-950/80 flex items-center justify-center border border-nerv-700/30 overflow-hidden text-accent-400 group-hover:scale-105 transition-transform">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-accent-400 animate-fade-in" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-fade-in" />
          )}
        </div>
        {!collapsed && (
          <span className="text-xs font-semibold tracking-wide">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="flex items-center gap-1.5">
          <span className="text-[0.6rem] text-accent-400 font-mono font-medium">
            {isDark ? 'CRIMSON' : 'LIGHT'}
          </span>
          <div
            className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
              isDark ? 'bg-nerv-950 border border-nerv-700/50' : 'bg-accent-500'
            }`}
          >
            <div
              className={`size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out transform ${
                isDark ? 'translate-x-0.5' : 'translate-x-4'
              }`}
            />
          </div>
        </div>
      )}
    </button>
  );
}
