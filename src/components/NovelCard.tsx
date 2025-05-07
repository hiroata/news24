import React from "react";
import TagList from "./TagList";
import Link from "next/link";
import { AudioPlayer } from "./AudioPlayer";
import { NovelData } from "../lib/novels";

interface NovelCardProps {
  novel: NovelData;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel }) => (
  <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm hover:shadow-md transition-shadow">
    {/* 画像は今後拡張可 */}
    <Link href={`/novels/${novel.slug}`}>
      <h2 className="text-xl font-bold mb-2 hover:text-pink-600 transition-colors">{novel.title}</h2>
    </Link>
    <div className="mb-2">
      <TagList tags={novel.tags} size="sm" />
    </div>
    <p className="mb-3 text-gray-700 line-clamp-3">{novel.excerpt}</p>
    {novel.audioUrl && <AudioPlayer src={novel.audioUrl} />}
  </div>
);

export default NovelCard;
