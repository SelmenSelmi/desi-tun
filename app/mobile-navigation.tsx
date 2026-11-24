"use client";

import { Menu } from "lucide-react";
import { useRef } from "react";

export default function MobileNavigation({ links }: { links: [string, string][] }) {
  const menu = useRef<HTMLDetailsElement>(null);

  return (
    <details className="mobile-nav" ref={menu}>
      <summary aria-label="Menu de navigation"><Menu size={24} aria-hidden="true" /></summary>
      <nav aria-label="Navigation mobile">
        {links.map(([name, href]) => (
          <a key={href} href={href} onClick={() => menu.current?.removeAttribute("open")}>{name}</a>
        ))}
      </nav>
    </details>
  );
}
