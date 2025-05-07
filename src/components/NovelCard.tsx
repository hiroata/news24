import React from "react";

type NovelCardProps = {
  title: string;
  tags: string[];
  summary: string;
  imageUrl?: string;
  audioUrl?: string;
};

export const NovelCard: React.FC<NovelCardProps> = ({ title, tags, summary, imageUrl, audioUrl }) => (
  <div className="border rounded-lg p-4 mb-6 bg-white">
    {imageUrl && <img src={imageUrl} alt={title} className="mb-3 w-full h-48 object-cover rounded border" />}
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <div className="mb-2 flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-2">#{tag}</span>
      ))}
    </div>
    <p className="mb-3 text-gray-700 line-clamp-3">{summary}</p>
    {audioUrl && (
      <audio controls src={audioUrl} className="w-full mt-2">
        お使いのブラウザはaudio要素に対応していません。
      </audio>
    )}
  </div>
);
