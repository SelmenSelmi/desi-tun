"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const partners = [
  { name: "Decathlon", logo: "decathlon.webp" },
  { name: "Banana Moon", logo: "banana-moon.webp" },
  { name: "Odeclas", logo: "odeclas.webp" },
  { name: "Newsport" },
  { name: "Active Sport" },
  { name: "Quick Send" },
];

function PartnerList({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="partner-list" aria-hidden={duplicate || undefined} role="list">
      {partners.map(({ name, logo }) => (
        <li key={name}>
          {logo ? (
            <Image src={`/images/partners/${logo}`} alt={name} width={132} height={38} loading="eager" unoptimized />
          ) : (
            <span>{name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function PartnerTicker() {
  const section = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
        <h2 id="partner-ticker-title">Nos partenaires</h2>
        <div className="partner-window">
          <div className="partner-track">
            <PartnerList />
            <PartnerList duplicate />
          </div>
        </div>
      </div>
    </section>
  );
}
