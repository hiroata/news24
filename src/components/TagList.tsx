import React from "react";

type TagListProps = {
  tags: string[];
  onClickTag?: (tag: string) => void;
};

export const TagList: React.FC<TagListProps> = ({ tags, onClickTag }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map(tag => (
      <button
        key={tag}
        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
        onClick={() => onClickTag?.(tag)}
      >
        #{tag}
      </button>
    ))}
  </div>
);
