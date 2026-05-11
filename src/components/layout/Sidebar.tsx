import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Building2, BarChart3, FileText, Settings,
  Shield, ShieldCheck, Database, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const navTop = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/engagements', label: 'Engagements', icon: Briefcase },
  { to: '/clients', label: 'Clients', icon: Building2 },
  { to: '/benchmarking', label: 'Benchmarking', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const navBottom = [
  { to: '/frameworks', label: 'Frameworks', icon: Database },
  { to: '/ai-studio', label: 'AI Studio', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-navy-700/60 bg-navy-900/60 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-navy-700/60">
        <div className="relative">
          <ShieldCheck className="text-accent-400" size={26} strokeWidth={2.2} />
          <div className="absolute -inset-2 bg-accent-500/20 blur-xl rounded-full -z-10" />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-white leading-none">LB CyberMAP</div>
          <div className="text-[9px] tracking-[0.16em] uppercase text-slate-400 mt-1 leading-tight">Cyber Maturity<br/>Assessment Platform</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto">
        <div className="px-2 mb-2 h-section">Workspace</div>
        {navTop.map((n) => (
          <SideLink key={n.to} {...n} />
        ))}

        <div className="px-2 mt-6 mb-2 h-section">Library</div>
        {navBottom.map((n) => (
          <SideLink key={n.to} {...n} />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-navy-700/60">
        <div className="rounded-lg border border-accent-500/30 bg-accent-500/5 px-3 py-3">
          <div className="flex items-center gap-2 text-accent-300 mb-1.5">
            <Shield size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Internal Build</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hosted locally for the assessment team. Client data never leaves the secure VLAN.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SideLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: any; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-accent-500/10 text-white border border-accent-500/30 shadow-glow'
            : 'text-slate-400 hover:text-white hover:bg-navy-700/40 border border-transparent',
        )
      }
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}
