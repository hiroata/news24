import React from "react";

type NovelCardProps = {
  title: string;
  tags: string[];
  summary: string;
  imageUrl?: string;
  audioUrl?: string;
};

export const NovelCard: React.FC<NovelCardProps> = ({ title, tags, summary, imageUrl, audioUrl }) => (
  <div className="border rounded p-4 mb-4 bg-white">
    {imageUrl && <img src={imageUrl} alt={title} className="mb-2 w-full h-48 object-cover" />}
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <div className="mb-2">
      {tags.map(tag => (
        <span key={tag} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-2">#{tag}</span>
      ))}
    </div>
    <p className="mb-2 text-gray-700">{summary}</p>
    {audioUrl && (
      <audio controls src={audioUrl} className="w-full">
        お使いのブラウザはaudio要素に対応していません。
      </audio>
    )}
  </div>
);
