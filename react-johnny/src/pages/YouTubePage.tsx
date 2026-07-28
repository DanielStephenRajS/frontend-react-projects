import { useState } from "react";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export const YouTubePage = () => {
  useDocumentMeta("YouTube", "Watch tutorials and tackle tips from Johnny Fishing Tackle.");

  const videos = catalogRepository.getYouTubeVideos();
  const [selectedId, setSelectedId] = useState(videos[0]?.id ?? "");
  const selectedVideo = videos.find((video) => video.id === selectedId) ?? videos[0];
  const selectedVideoUrl = selectedVideo ? `https://www.youtube.com/watch?v=${selectedVideo.youtubeId}` : "#";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl text-slate-900">YouTube Channel</h1>
        <p className="mt-1 text-sm text-slate-600">Hey anglers, Dive into the world of fishing excitement with Johnny Fishing Tackle and Sports Fishing Entertainment!</p>
      </section>

      {selectedVideo ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <iframe
            title={selectedVideo.title}
            src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
            className="h-[280px] w-full md:h-[460px]"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="p-4">
            <h2 className="text-xl font-semibold text-slate-900">{selectedVideo.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{selectedVideo.description}</p>
            <a
              href={selectedVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Open on YouTube
            </a>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setSelectedId(video.id)}
            className={`overflow-hidden rounded-xl border bg-white text-left transition ${
              selectedId === video.id ? "border-emerald-500" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <img src={video.thumbnail} alt={video.title} loading="lazy" className="h-44 w-full object-cover" />
            <div className="p-3">
              <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-slate-900">{video.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{video.description}</p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};
