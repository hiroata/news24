import React from "react";
import TagList from "./TagList";
import Link from "next/link";
import { AudioPlayer } from "./AudioPlayer";
import type { NovelData } from "../types/novel";

interface NovelCardProps {
  novel: NovelData;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel }) => (
  <div className="border-2 border-pink-200 rounded-lg p-4 mb-6 bg-white shadow-md hover:shadow-xl transition-shadow duration-300 hover:scale-105 transform hover:border-pink-400">
    <Link href={`/novels/${novel.slug}`}>
      <h2 className="text-xl font-bold mb-2 hover:text-pink-600 transition-colors">{novel.title}</h2>
    </Link>
    <div className="mb-2">
      <TagList tags={novel.tags} size="sm" />
    </div>
    <p className="mb-3 text-gray-700 line-clamp-3">{novel.excerpt}</p>
    {novel.audioUrl && <AudioPlayer src={novel.audioUrl} />}
    <div className="mt-4 flex justify-end">
      <Link href={`/novels/${novel.slug}`} className="inline-block bg-pink-500 text-white px-4 py-1 rounded hover:bg-pink-600 transition-colors text-sm font-semibold shadow">
        続きを読む
      </Link>
    </div>
  </div>
);

export default NovelCard;
