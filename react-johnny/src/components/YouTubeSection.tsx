import { useState } from "react";
import { Link } from "react-router-dom";
import type { YouTubeVideo } from "../types";

interface YouTubeSectionProps {
  videos: YouTubeVideo[];
}

const getEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

export const YouTubeSection = ({ videos }: YouTubeSectionProps) => {
  const [selected, setSelected] = useState<YouTubeVideo | null>(videos[0] ?? null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-3xl text-slate-900">YouTube Tutorials</h2>
        <Link to="/youtube" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Browse Videos
        </Link>
      </div>

      {selected ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200">
          <iframe
            title={selected.title}
            src={getEmbedUrl(selected.youtubeId)}
            className="h-64 w-full md:h-96"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        {videos.slice(0, 3).map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setSelected(video)}
            className="overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-emerald-400"
          >
            <img src={video.thumbnail} alt={video.title} loading="lazy" className="h-32 w-full object-cover" />
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{video.title}</p>
              <p className="mt-1 text-xs text-slate-500">{video.channelName}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
