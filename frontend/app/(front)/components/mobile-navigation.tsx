"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, Menu, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "../utils/actor.utils";

interface MobileNavigationProps {
  items: { href: string; label: string; Icon: LucideIcon; active: boolean }[];
  avatarSrc?: string;
  userName: string;
  onProfile: () => void;
  onLogout: () => void;
}

export default function MobileNavigation({ items, avatarSrc, userName, onProfile }: MobileNavigationProps) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!expanded) return;
    const handlePointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [expanded]);

  const itemStyle = (index: number) => ({
    transform: expanded ? "translateY(0) scale(1)" : "translateY(1rem) scale(0.92)",
    opacity: expanded ? 1 : 0,
    transitionDelay: expanded ? `${index * 35}ms` : "0ms",
  });
  const itemClass = "flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-popover-foreground shadow-md transition-[transform,opacity] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none";
  const iconClass = "flex size-9 shrink-0 items-center justify-center rounded-full";
  const close = () => setExpanded(false);

  return (
    <div ref={root} className="fixed left-4 z-40 md:hidden" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>
      <Button
        ref={trigger}
        size="icon"
        className="size-11 rounded-full shadow-lg ring-1"
        aria-label={expanded ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      <nav
        id={panelId}
        aria-label="Điều hướng di động"
        aria-hidden={!expanded}
        inert={!expanded}
        className={`absolute bottom-14 left-0 flex max-h-[calc(100dvh-6rem-env(safe-area-inset-bottom,0))] w-max max-w-[calc(100vw-2rem)] flex-col items-start gap-2 overscroll-contain p-1 ${expanded ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button type="button" aria-label={`Tài khoản ${userName}`} title={userName} className={itemClass} style={itemStyle(0)} onClick={() => { close(); onProfile(); }}>
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={avatarSrc} alt="" />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </button>
        {items.map(({ href, label, Icon, active }, index) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`${itemClass} ${active ? "font-medium text-primary ring-primary/40" : ""}`}
            style={itemStyle(index + 1)}
            onClick={close}
          >
            <span className={`${iconClass} ${active ? "bg-primary/10" : ""}`}><Icon className="size-4" /></span>
          </Link>
        ))}
        <Link href="/dashboard/notification" aria-label="Thông báo" title="Thông báo" className={itemClass} style={itemStyle(items.length + 1)} onClick={close}>
          <span className={iconClass}><Bell className="size-4" /></span>
        </Link>
      </nav>
    </div>
  );
}
