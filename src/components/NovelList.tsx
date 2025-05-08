import React from "react";
import NovelCard from "./NovelCard";
import type { NovelData } from "../types/novel";

type NovelListProps = {
  novels: NovelData[];
};

const NovelList: React.FC<NovelListProps> = ({ novels }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {novels.map((novel) => (
      <NovelCard key={novel.slug} novel={novel} />
    ))}
  </div>
);

export default NovelList;
