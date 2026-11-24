"use client";

import { useEffect } from "react";

export default function ScrollReveals() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio < 0.1) continue;
        observer.unobserve(entry.target);
        if (!entry.target.contains(document.activeElement)) {
          entry.target.setAttribute("data-reveal", "played");
        }
      }
    }, { threshold: 0.1 });

    for (const element of document.querySelectorAll("[data-reveal]")) {
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
