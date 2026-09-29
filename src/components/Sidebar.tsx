import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  History as HistoryIcon,
  FlaskConical,
  ShieldCheck,
  Info,
  Radio,
  CloudSun,
  X,
} from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/heatmap', icon: Flame, label: 'Bust Heat Map' },
  { to: '/error-memory', icon: HistoryIcon, label: 'Error Memory' },
  { to: '/replay-lab', icon: FlaskConical, label: 'Replay Lab' },
  { to: '/validation', icon: ShieldCheck, label: 'Validation' },
  { to: '/weather-suite', icon: CloudSun, label: 'Weather Suite' },
  { to: '/about', icon: Info, label: 'About' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-nerv-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-nerv-900/90 backdrop-blur-xl border-r border-nerv-700/20 z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary tracking-tight">
                NERV-TRUST
              </h1>
              <p className="text-[0.6rem] text-text-muted font-medium tracking-wider uppercase">
                Reliability Intelligence
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-nerv-800 text-text-muted hover:text-text-primary md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      {/* Demo badge */}
      <div className="px-6 pb-5">
        <div className="badge badge-demo text-[0.6rem]">
          <span className="status-dot" style={{ background: 'var(--color-accent-400)', width: 5, height: 5 }} />
          Prototype • Demo Data
        </div>
      </div>

      <div className="divider !my-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Switch & Footer */}
      <div className="p-4 border-t border-nerv-700/15 space-y-3">
        <ThemeSwitch />
        <p className="text-[0.65rem] text-text-muted leading-relaxed">
          NWP Reliability & Error Intelligence for Indian Meteorological Decision Support
        </p>
      </div>
    </aside>
    </>
  );
}
