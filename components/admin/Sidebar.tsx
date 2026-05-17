"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bed,
  Newspaper,
  ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Tag,
  ChevronRight,
  CalendarCheck,
  Building2,
  Images,
  Trophy,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",              label: "Dashboard",     Icon: LayoutDashboard, exact: true },
  { href: "/admin/hebergements",  label: "Hébergements",  Icon: Bed },
  { href: "/admin/actualites",    label: "Actualités",    Icon: Newspaper },
  { href: "/admin/reservations",  label: "Réservations",  Icon: CalendarCheck },
  { href: "/admin/medias",       label: "Médias",        Icon: Images },
  { href: "/admin/galerie",      label: "Galerie",       Icon: ImageIcon },
  { href: "/admin/avis",         label: "Avis clients",  Icon: MessageSquare },
  { href: "/admin/ahf",          label: "Hôtels AHF",    Icon: Building2 },
  { href: "/admin/offres",       label: "Offres",        Icon: Tag },
  { href: "/admin/fidelite",     label: "Fidélité",      Icon: Trophy },
  { href: "/admin/reductions",   label: "Réductions",    Icon: Ticket },
  { href: "/admin/parametres",   label: "Paramètres",    Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/8">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-dark text-base leading-none select-none">R</span>
          </div>
          <div>
            <div className="font-display text-[0.95rem] leading-none text-white">Rihanala Admin</div>
            <div className="text-gold text-[9px] tracking-widest uppercase mt-0.5">Back-office</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150",
                isActive
                  ? "bg-white/12 text-white font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/6"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/6 transition-colors duration-150 w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
