"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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
  const [track, setTrack] = useState({ copies: 2, distance: 0 });
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [motion, setMotion] = useState<"play" | "pause">();
  const playing = motion ? motion === "play" : !reduced;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const windowElement = windowRef.current;
    const list = windowElement?.querySelector<HTMLElement>(".partner-list");
    if (!windowElement || !list || !partners.length) return;
    const update = () => {
      const width = list.getBoundingClientRect().width;
      if (!width) return;
      const copies = Math.max(2, Math.ceil(windowElement.clientWidth / width) + 1);
      setTrack((current) => current.copies === copies && current.distance === width ? current : { copies, distance: width });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(windowElement);
    observer.observe(list);
    return () => observer.disconnect();
  }, [partners, playing]);

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
    <section className="partner-ticker" ref={section} aria-labelledby="partner-ticker-title" data-motion={motion}
      data-running={visible && playing && track.distance > 0}>
      <div className="wrap partner-bar">
        <h2 id="partner-ticker-title">{title}</h2>
        <div className="partner-window" ref={windowRef}>
          <div className="partner-track" style={{
            "--partner-distance": `${track.distance}px`,
            "--partner-duration": `${Math.max(1, track.distance / 60)}s`,
          } as CSSProperties}>
            {Array.from({ length: track.copies }, (_, index) => (
              <PartnerList key={index} partners={partners} duplicate={index > 0} />
            ))}
          </div>
        </div>
        {partners.length > 0 && (
          <button type="button" className="partner-motion" onClick={() => setMotion(playing ? "pause" : "play")}
            aria-label={playing ? "Mettre le défilement en pause" : "Lancer le défilement"}
            title={playing ? "Mettre le défilement en pause" : "Lancer le défilement"}>
            {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          </button>
        )}
      </div>
    </section>
  );
}
