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
  <div>
    {novels.map((novel) => (
      <NovelCard key={novel.id} {...novel} />
    ))}
  </div>
);

export default NovelList;
