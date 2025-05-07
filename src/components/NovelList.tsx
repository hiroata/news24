import React from "react";
import { NovelCard } from "./NovelCard";

type Novel = {
  id: string;
  title: string;
  tags: string[];
  summary: string;
  imageUrl?: string;
  audioUrl?: string;
};

type NovelListProps = {
  novels: Novel[];
};

const NovelList: React.FC<NovelListProps> = ({ novels }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {novels.map((novel) => (
      <NovelCard
        key={novel.id}
        {...novel}
        imageUrl={novel.imageUrl || "/images/dummy-panel01.webp"}
        audioUrl={novel.audioUrl || "/audio/dummy-ja.mp3"}
      />
    ))}
  </div>
);

export default NovelList;
