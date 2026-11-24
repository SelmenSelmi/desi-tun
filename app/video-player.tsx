"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

type VideoPlayerProps = {
  file: string;
  poster: string;
  labelId: string;
  title: string;
  shape: string;
};

export default function VideoPlayer({ file, poster, labelId, title, shape }: VideoPlayerProps) {
  const player = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  async function play() {
    const video = player.current;
    if (!video) return;

    try {
      await video.play();
      video.focus({ preventScroll: true });
    } catch {
      // Leave the native controls available if the browser blocks playback.
      setStarted(true);
      video.focus({ preventScroll: true });
    }
  }

  return (
    <div className={`video-stage ${shape}`}>
      <video ref={player} controls playsInline preload="none" poster={`/media/${poster}`}
        aria-labelledby={labelId} onPlay={() => setStarted(true)}>
        <source src={`/media/${file}`} type="video/mp4" />
        <a href={`/media/${file}`}>Télécharger la vidéo</a>
      </video>
      {!started && (
        <button type="button" className="film-play" onClick={play} aria-label={`Lire la vidéo « ${title} »`}>
          <Play size={25} fill="currentColor" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
