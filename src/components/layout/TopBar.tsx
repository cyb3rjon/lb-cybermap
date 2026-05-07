import { Search, Bell, Plus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const currentUser = useStore((s) => s.users.find((u) => u.id === s.currentUserId)!);
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-navy-700/60 bg-navy-900/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="hidden lg:inline">Workspace</span>
        <span className="hidden lg:inline text-slate-600">/</span>
        <span className="font-semibold text-slate-200">Assessment Team — EMEA</span>
      </div>

      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search engagements, clients, controls…"
            className="w-full rounded-lg border border-navy-700/70 bg-navy-900/60 pl-9 pr-12 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline rounded border border-navy-600 bg-navy-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/engagements/new">
          <Button size="sm" iconLeft={<Plus size={15} />}>New engagement</Button>
        </Link>

        <button className="relative rounded-lg p-2 text-slate-400 hover:text-white hover:bg-navy-700/50 transition">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-navy-900" />
        </button>

        <div className="ml-1 flex items-center gap-2 pl-3 border-l border-navy-700/60">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-medium text-slate-100 leading-tight">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 leading-tight">{currentUser.role}</div>
          </div>
          <Avatar initials={currentUser.initials} colour={currentUser.avatarColour} />
        </div>
      </div>
    </header>
  );
}
