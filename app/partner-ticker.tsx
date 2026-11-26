"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Partner = { name: string; logo: string };

function PartnerList({ partners, duplicate = false }: { partners: Partner[]; duplicate?: boolean }) {
  return (
    <ul className="partner-list" aria-hidden={duplicate || undefined} role="list">
      {partners.map(({ name, logo }) => (
        <li key={name}>
          {logo ? (
            <Image src={logo} alt={name} width={132} height={38} loading="eager" unoptimized />
          ) : (
            <span>{name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function PartnerTicker({ title, partners }: { title: string; partners: Partner[] }) {
  const section = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const windowElement = windowRef.current;
    const list = windowElement?.querySelector<HTMLElement>(".partner-list");
    if (!windowElement || !list || !partners.length) return;
    const update = () => {
      const width = list.getBoundingClientRect().width;
      if (width) setCopies(Math.max(2, Math.ceil(windowElement.clientWidth / width) + 1));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(windowElement);
    observer.observe(list);
    return () => observer.disconnect();
  }, [partners]);

  useEffect(() => {
    if (!section.current) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="partner-ticker" ref={section} aria-labelledby="partner-ticker-title" data-running={visible}>
      <div className="wrap partner-bar">
        <h2 id="partner-ticker-title">{title}</h2>
        <div className="partner-window" ref={windowRef}>
          <div className="partner-track">
            {Array.from({ length: copies }, (_, index) => (
              <PartnerList key={index} partners={partners} duplicate={index > 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
